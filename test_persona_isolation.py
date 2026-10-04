import pytest
from unittest.mock import MagicMock
from agents.backend import BackendAgent
from agents.frontend import FrontendAgent
from agents.qa import QAAgent
from agents.devops import DevOpsAgent
from models.environment import PressureLevel
from simulation.policy_generator import PolicyGenerator
from models.task_difficulty import TaskDifficulty
from models.experiment import ProvenanceData

class MockResponse:
    def __init__(self, content):
        self.content = content

def create_mocked_agent(agent_class, response_content='{"reported_progress": 50, "message": "Done", "confidence": 0.9}'):
    agent = agent_class()
    # Mock LLM to avoid needing Ollama server
    agent.llm = MagicMock()
    agent.llm.invoke.return_value = MockResponse(response_content)
    return agent

@pytest.fixture
def base_args():
    pressure = PressureLevel.MEDIUM
    policy = PolicyGenerator.generate(pressure)
    difficulty = TaskDifficulty.MEDIUM
    provenance = ProvenanceData(git_commit="test_commit")
    return {
        "actual_progress": 50,
        "pressure": pressure,
        "policy": policy,
        "strategy": "HONEST",
        "difficulty": difficulty,
        "provenance": provenance
    }

def test_backend_persona(base_args):
    agent = create_mocked_agent(BackendAgent)
    agent.generate_status_update(**base_args)
    
    # Assert BaseAgent.think was reached and captured in provenance
    assert "status_update" in base_args["provenance"].llm_prompts
    prompt = base_args["provenance"].llm_prompts["status_update"]
    
    assert "You are Bob." in prompt
    assert agent.llm.invoke.called
    
def test_frontend_persona(base_args):
    agent = create_mocked_agent(FrontendAgent)
    agent.generate_status_update(**base_args)
    
    prompt = base_args["provenance"].llm_prompts["status_update"]
    assert "You are Alice." in prompt
    assert "You are Bob." not in prompt

def test_qa_persona(base_args):
    agent = create_mocked_agent(QAAgent)
    agent.generate_status_update(**base_args)
    
    prompt = base_args["provenance"].llm_prompts["status_update"]
    assert "You are Eve." in prompt
    assert "You are Bob." not in prompt

def test_devops_persona(base_args):
    agent = create_mocked_agent(DevOpsAgent)
    agent.generate_status_update(**base_args)
    
    prompt = base_args["provenance"].llm_prompts["status_update"]
    assert "You are David." in prompt
    assert "You are Bob." not in prompt

def test_reaches_base_agent_think_and_provenance_captured(base_args):
    agent = create_mocked_agent(FrontendAgent, '{"reported_progress": 42, "message": "Mocked", "confidence": 0.8}')
    
    reported, response = agent.generate_status_update(**base_args)
    
    assert "status_update" in base_args["provenance"].llm_prompts
    prompt = base_args["provenance"].llm_prompts["status_update"]
    assert "You are Alice." in prompt
    
    assert "status_update" in base_args["provenance"].raw_llm_outputs
    raw_output = base_args["provenance"].raw_llm_outputs["status_update"]
    
    assert raw_output == '{"reported_progress": 42, "message": "Mocked", "confidence": 0.8}'
    
    assert agent.llm.invoke.called
