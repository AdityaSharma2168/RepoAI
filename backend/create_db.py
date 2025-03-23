from app.database import Base, engine, SessionLocal
from app.auth.models import User
from app.auth.utils import get_password_hash
from app.tools.models import Tool
from app.plugins.models import Plugin

# Create database tables
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

# Add demo user
def create_demo_user():
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.username == "demo").first()
        if existing_user:
            print("Demo user already exists.")
            return

        # Create demo user
        demo_user = User(
            username="demo",
            email="demo@example.com",
            hashed_password=get_password_hash("demo"),
            is_active=True,
            is_admin=True
        )
        db.add(demo_user)
        db.commit()
        print("Demo user created.")
    except Exception as e:
        db.rollback()
        print(f"Error creating demo user: {e}")
    finally:
        db.close()

# Add core tools
def create_core_tools():
    db = SessionLocal()
    try:
        # Check if tools already exist
        existing_tools = db.query(Tool).filter(Tool.is_core == True).all()
        if existing_tools:
            print(f"{len(existing_tools)} core tools already exist.")
            return

        # Create core tools
        tools = [
            Tool(
                name="text_summarizer",
                description="Summarize long texts into concise summaries.",
                category="Text",
                is_core=True
            ),
            Tool(
                name="sentiment_analyzer",
                description="Analyze the sentiment of text as positive, negative, or neutral.",
                category="Text",
                is_core=True
            )
        ]
        db.add_all(tools)
        db.commit()
        print(f"{len(tools)} core tools created.")
    except Exception as e:
        db.rollback()
        print(f"Error creating core tools: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    create_demo_user()
    create_core_tools()
    print("Database initialization complete.") 