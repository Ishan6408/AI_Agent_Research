from pydantic import BaseModel
from typing import List, Optional

class AgentResponse(BaseModel):
    name: str
    role: str
    personality_options: List[str]
    behaviour_strategies: List[str]
    responsibilities: List[str]
    metrics: Optional[dict] = None
