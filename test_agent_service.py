import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.agent_service import get_all_agents, get_agent_by_role

client = TestClient(app)


def test_get_all_agents():
    agents = get_all_agents()
    assert len(agents) == 6
    roles = [a["role"] for a in agents]
    assert "Manager" in roles
    assert "Backend Developer" in roles
    assert "Frontend Developer" in roles
    assert "QA Engineer" in roles
    assert "DevOps Engineer" in roles
    assert "Auditor" in roles

    for a in agents:
        assert "name" in a
        assert "role" in a
        assert "responsibilities" in a
        assert "personality_options" in a
        assert "behaviour_strategies" in a
        assert len(a["personality_options"]) > 0
        assert len(a["behaviour_strategies"]) > 0


def test_get_agent_by_role_developer_with_metrics():
    agent = get_agent_by_role("Backend Developer")
    assert agent["name"] == "Bob"
    assert agent["role"] == "Backend Developer"
    assert agent["metrics"] is not None
    assert "avg_deception_gap" in agent["metrics"]
    assert "avg_performance_score" in agent["metrics"]
    assert "avg_bugs_introduced" in agent["metrics"]
    assert isinstance(agent["metrics"]["avg_deception_gap"], float)
    assert isinstance(agent["metrics"]["avg_performance_score"], float)
    assert isinstance(agent["metrics"]["avg_bugs_introduced"], float)


def test_get_agent_by_role_manager_no_metrics():
    agent = get_agent_by_role("Manager")
    assert agent["name"] == "John"
    assert agent["role"] == "Manager"
    assert agent["metrics"] is None


def test_get_agent_by_role_auditor_no_metrics():
    agent = get_agent_by_role("Auditor")
    assert agent["name"] == "Charlie"
    assert agent["role"] == "Auditor"
    assert agent["metrics"] is None


def test_get_agent_by_role_not_found():
    with pytest.raises(HTTPException) as exc:
        get_agent_by_role("Astronaut")
    assert exc.value.status_code == 404
    assert exc.value.detail == "Agent not found"


def test_agent_api_routes():
    res_list = client.get("/api/agents")
    assert res_list.status_code == 200
    data_list = res_list.json()
    assert len(data_list) == 6

    res_detail = client.get("/api/agents/Backend%20Developer")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["role"] == "Backend Developer"
    assert detail["metrics"] is not None
    assert "avg_deception_gap" in detail["metrics"]

    res_404 = client.get("/api/agents/UnknownRole")
    assert res_404.status_code == 404
