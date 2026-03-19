from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime
from datetime import datetime
from backend.database import Base

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(String, index=True)
    success = Column(Boolean, default=False)
    
    # We store complex dictionary/json data as text/string fields in SQLite
    plan_json = Column(Text, nullable=True)
    tool_selections_json = Column(Text, nullable=True)
    execution_results_json = Column(Text, nullable=True)
    
    monitor_feedback = Column(Text, nullable=True)
    monitor_decision = Column(String, nullable=True)
    final_output = Column(Text, nullable=True)
    
    retry_count = Column(Integer, default=0)
    execution_time_seconds = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
