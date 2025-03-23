from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth.utils import get_current_active_user, is_admin
from ..auth.models import User
from .models import Tool
from .service import tool_service
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

router = APIRouter()

class ToolResponse(BaseModel):
    id: str
    name: str
    description: str
    category: str
    is_core: bool
    
    class Config:
        orm_mode = True

class ToolExecuteRequest(BaseModel):
    tool_name: str
    params: Dict[str, Any]

class ToolExecuteResponse(BaseModel):
    result: Any
    execution_time_ms: int
    status: str

@router.get("/", response_model=List[ToolResponse])
async def get_tools(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a list of all available tools."""
    tools = db.query(Tool).offset(skip).limit(limit).all()
    return tools

@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(
    tool_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get details for a specific tool."""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool

@router.post("/execute", response_model=ToolExecuteResponse)
async def execute_tool(
    request: ToolExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute a tool with the provided parameters."""
    try:
        result = tool_service.execute_tool(
            tool_name=request.tool_name,
            params=request.params,
            db=db,
            user=current_user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing tool: {str(e)}")

@router.get("/available", response_model=List[str])
async def get_available_tools(current_user: User = Depends(get_current_active_user)):
    """Get a list of available tool names."""
    return tool_service.get_available_tools()

@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(
    tool_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(is_admin)  # Only admins can delete tools
):
    """Delete a tool (admin only)."""
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if tool is None:
        raise HTTPException(status_code=404, detail="Tool not found")
    
    # Cannot delete core tools
    if tool.is_core:
        raise HTTPException(status_code=400, detail="Cannot delete core tools")
        
    db.delete(tool)
    db.commit()
    return None 