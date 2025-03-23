from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    version = Column(String)
    author_id = Column(String, ForeignKey("users.id"))
    repository_url = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False)
    file_path = Column(String)  # Path to the plugin file
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    author = relationship("User")
    tools = relationship("Tool", back_populates="plugin") 