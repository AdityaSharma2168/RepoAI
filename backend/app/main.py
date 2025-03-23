from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .auth import routes as auth_routes
from .users import routes as user_routes
from .tools import routes as tool_routes
from .plugins import routes as plugin_routes
from .database import get_db

app = FastAPI(
    title="RepoAI API",
    description="A collection of modular, ready-to-use AI tools",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user_routes.router, prefix="/api/users", tags=["Users"])
app.include_router(tool_routes.router, prefix="/api/tools", tags=["AI Tools"])
app.include_router(plugin_routes.router, prefix="/api/plugins", tags=["Plugins"])

@app.get("/")
async def root():
    return {"message": "Welcome to RepoAI API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"} 