from pydantic import BaseModel
from typing import Optional

class RunPressureRequest(BaseModel):
    pressure: str
    runs: Optional[int] = 10

class RunAllRequest(BaseModel):
    runs: Optional[int] = 10

class RunExperimentRequest(BaseModel):
    pressure: str
