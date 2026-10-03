from fastapi import APIRouter
from backend.services import agent_service
from backend.schemas.agent import AgentResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[AgentResponse])
def get_agents():
    return agent_service.get_all_agents()

@router.get("/{role}", response_model=AgentResponse)
def get_agent(role: str):
    return agent_service.get_agent_by_role(role)
