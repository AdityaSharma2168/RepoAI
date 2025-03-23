import time
from typing import Dict, Any, List, Optional
import re
from sqlalchemy.orm import Session
from .models import Tool, ToolUsageLog
from ..auth.models import User

# This would typically use libraries like transformers, spacy, etc.
# Simplified implementations for demonstration

class TextSummarizer:
    """Summarizes text using extractive summarization."""
    
    def summarize(self, text: str, max_length: int = 100) -> str:
        """
        Summarize the input text.
        
        Args:
            text: The text to summarize
            max_length: Maximum length of the summary in characters
            
        Returns:
            A summary of the text
        """
        # In a real implementation, this would use a pre-trained model
        # Simple example just returns the first few sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        summary = ""
        
        for sentence in sentences:
            if len(summary) + len(sentence) <= max_length:
                summary += sentence + " "
            else:
                break
                
        return summary.strip()


class SentimentAnalyzer:
    """Analyzes sentiment of text."""
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of the input text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Dictionary with sentiment scores
        """
        # In a real implementation, this would use a pre-trained model
        # Simple example that counts positive and negative words
        positive_words = ["good", "great", "excellent", "happy", "positive", "wonderful", "best", "love"]
        negative_words = ["bad", "terrible", "awful", "sad", "negative", "worst", "hate", "poor"]
        
        words = text.lower().split()
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        
        total = len(words)
        score = (positive_count - negative_count) / total if total > 0 else 0
        
        # Map score to sentiment category
        if score > 0.05:
            sentiment = "positive"
        elif score < -0.05:
            sentiment = "negative"
        else:
            sentiment = "neutral"
            
        return {
            "sentiment": sentiment,
            "score": score,
            "positive_words": positive_count,
            "negative_words": negative_count,
            "confidence": abs(score) * 2  # Simple confidence metric
        }


class ToolService:
    """Service to manage and execute AI tools."""
    
    def __init__(self):
        # Register core tools
        self.tools = {
            "text_summarizer": TextSummarizer(),
            "sentiment_analyzer": SentimentAnalyzer()
        }
    
    def get_available_tools(self) -> List[str]:
        """Get a list of available tool names."""
        return list(self.tools.keys())
    
    def execute_tool(
        self, 
        tool_name: str, 
        params: Dict[str, Any], 
        db: Session, 
        user: Optional[User] = None
    ) -> Dict[str, Any]:
        """
        Execute a tool with the given parameters.
        
        Args:
            tool_name: Name of the tool to execute
            params: Parameters to pass to the tool
            db: Database session
            user: Current user (optional)
            
        Returns:
            Result of the tool execution
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")
            
        tool = self.tools[tool_name]
        start_time = time.time()
        
        try:
            # Execute the appropriate method based on the tool
            if tool_name == "text_summarizer":
                result = tool.summarize(
                    text=params.get("text", ""),
                    max_length=params.get("max_length", 100)
                )
            elif tool_name == "sentiment_analyzer":
                result = tool.analyze(text=params.get("text", ""))
            else:
                # Generic case for plugins
                result = tool.run(**params)
                
            status = "success"
            
        except Exception as e:
            result = {"error": str(e)}
            status = "error"
            
        execution_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        
        # Log the tool usage if we have a database session
        if db and tool_name:
            # Get tool from database
            db_tool = db.query(Tool).filter(Tool.name == tool_name).first()
            
            if db_tool:
                log = ToolUsageLog(
                    tool_id=db_tool.id,
                    user_id=user.id if user else None,
                    input_data=str(params),
                    output_data=str(result),
                    execution_time_ms=execution_time,
                    status=status
                )
                db.add(log)
                db.commit()
        
        return {
            "result": result,
            "execution_time_ms": execution_time,
            "status": status
        }


# Create singleton instance
tool_service = ToolService() 