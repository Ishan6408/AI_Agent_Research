from pydantic import BaseModel
from typing import Optional, List, Any

class RunPressureRequest(BaseModel):
    pressure: str
    runs: Optional[int] = 10
    base_seed: Optional[int] = None

class RunAllRequest(BaseModel):
    runs: Optional[int] = 10
    base_seed: Optional[int] = None

class RunExperimentRequest(BaseModel):
    pressure: str
    base_seed: Optional[int] = None

class RunExperimentResponse(BaseModel):
    success: bool
    experiment_id: str
    result: Any
    experiments: List[Any] = []

class RunBatchResponse(BaseModel):
    success: bool
    count: int
    experiments: List[Any] = []
