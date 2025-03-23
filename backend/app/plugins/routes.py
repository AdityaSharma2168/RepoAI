from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth.utils import get_current_active_user, is_admin
from ..auth.models import User
from .models import Plugin
from .executor import plugin_executor
from ..tools.models import Tool
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import uuid
import shutil

router = APIRouter()

class PluginResponse(BaseModel):
    id: str
    name: str
    description: str
    version: str
    is_approved: bool
    is_active: bool
    repository_url: Optional[str] = None
    
    class Config:
        orm_mode = True

class PluginExecuteRequest(BaseModel):
    plugin_id: str
    method_name: str
    params: Dict[str, Any]

class PluginExecuteResponse(BaseModel):
    result: Any
    status: str

@router.get("/", response_model=List[PluginResponse])
async def get_plugins(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a list of all plugins."""
    plugins = db.query(Plugin).offset(skip).limit(limit).all()
    return plugins

@router.get("/{plugin_id}", response_model=PluginResponse)
async def get_plugin(
    plugin_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get details for a specific plugin."""
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return plugin

@router.post("/upload", response_model=PluginResponse, status_code=status.HTTP_201_CREATED)
async def upload_plugin(
    name: str = Form(...),
    description: str = Form(...),
    version: str = Form(...),
    repository_url: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a new plugin."""
    # Check if plugin with this name already exists
    existing_plugin = db.query(Plugin).filter(Plugin.name == name).first()
    if existing_plugin:
        raise HTTPException(status_code=400, detail="Plugin with this name already exists")
    
    # Validate file extension
    if not file.filename.endswith('.py'):
        raise HTTPException(status_code=400, detail="Only Python files are allowed")
    
    # Generate a unique filename
    plugin_id = str(uuid.uuid4())
    filename = f"{plugin_id}_{file.filename}"
    file_path = os.path.join(plugin_executor.plugin_dir, filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create plugin in database
    db_plugin = Plugin(
        id=plugin_id,
        name=name,
        description=description,
        version=version,
        author_id=current_user.id,
        repository_url=repository_url,
        file_path=file_path
    )
    db.add(db_plugin)
    db.commit()
    db.refresh(db_plugin)
    
    return db_plugin

@router.post("/execute", response_model=PluginExecuteResponse)
async def execute_plugin(
    request: PluginExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute a plugin with the provided parameters."""
    plugin = db.query(Plugin).filter(Plugin.id == request.plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    # Check if plugin is approved and active
    if not plugin.is_approved:
        raise HTTPException(status_code=400, detail="Plugin is not approved for use")
    
    if not plugin.is_active:
        raise HTTPException(status_code=400, detail="Plugin is not active")
    
    try:
        # Execute the plugin
        result = plugin_executor.execute(
            plugin_path=plugin.file_path,
            method_name=request.method_name,
            params=request.params,
            secure=True  # Always use secure execution for user-uploaded plugins
        )
        return {"result": result, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing plugin: {str(e)}")

@router.put("/{plugin_id}/approve", response_model=PluginResponse)
async def approve_plugin(
    plugin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)  # Only admins can approve plugins
):
    """Approve a plugin for use (admin only)."""
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    plugin.is_approved = True
    db.commit()
    db.refresh(plugin)
    return plugin

@router.put("/{plugin_id}/activate", response_model=PluginResponse)
async def activate_plugin(
    plugin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)  # Only admins can activate plugins
):
    """Activate a plugin (admin only)."""
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    if not plugin.is_approved:
        raise HTTPException(status_code=400, detail="Plugin must be approved before it can be activated")
    
    plugin.is_active = True
    db.commit()
    db.refresh(plugin)
    return plugin

@router.delete("/{plugin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plugin(
    plugin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a plugin (only the author or an admin can delete)."""
    plugin = db.query(Plugin).filter(Plugin.id == plugin_id).first()
    if plugin is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    # Check if the current user is the author or an admin
    if plugin.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this plugin")
    
    # Delete associated tools
    db.query(Tool).filter(Tool.plugin_id == plugin_id).delete()
    
    # Delete the plugin file
    if os.path.exists(plugin.file_path):
        os.remove(plugin.file_path)
    
    # Delete the plugin from the database
    db.delete(plugin)
    db.commit()
    
    return None 