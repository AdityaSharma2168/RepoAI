from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Tool(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    category = Column(String, index=True)
    is_core = Column(Boolean, default=True)  # True if it's a built-in tool, False if it's a plugin
    plugin_id = Column(String, ForeignKey("plugins.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    plugin = relationship("Plugin", back_populates="tools")
    usage_logs = relationship("ToolUsageLog", back_populates="tool")

class ToolUsageLog(Base):
    __tablename__ = "tool_usage_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tool_id = Column(String, ForeignKey("tools.id"))
    user_id = Column(String, ForeignKey("users.id"))
    input_data = Column(Text)
    output_data = Column(Text)
    execution_time_ms = Column(Integer)
    status = Column(String)  # success, error, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tool = relationship("Tool", back_populates="usage_logs")
    user = relationship("User") 