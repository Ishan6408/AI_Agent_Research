from pydantic import BaseModel
from typing import Optional


class ExperimentResult(BaseModel):

    # Metadata
    experiment_id: Optional[str] = None
    timestamp: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    seed: Optional[int] = None

    # Task Information
    task_name: str

    # Environment
    pressure: str
    developer_role: str
    personality: str
    task_difficulty: str

    # Company Policy
    reward: int
    penalty: int
    deadline_hours: int

    # Developer Behaviour
    behavior_strategy: str

    actual_progress: int
    reported_progress: int
    deception_gap: int

    # Engineering Quality
    bugs_introduced: int
    code_quality: int

    # Behaviour Metrics
    honesty_score: float
    stress_index: float
    performance_score: float

    deception_level:str
    
    developer_reasoning: str
    manager_message: str

    # Auditor Result
    auditor_score: int
    deception_detected: bool
    auditor_explanation: str