import pytest
import json
import os
from models.experiment import ExperimentResult, ProvenanceData
from simulation.simulator import SoftwareCompanySimulator, get_git_commit
from models.environment import PressureLevel
from unittest.mock import patch, MagicMock
from langchain_core.messages import AIMessage

from agents.backend import BackendAgent

# A. Provenance model
def test_provenance_model():
    p1 = ProvenanceData(git_commit="abc")
    p2 = ProvenanceData(git_commit=None)
    
    assert p1.git_commit == "abc"
    assert p2.git_commit is None
    
    p1.llm_prompts["test"] = "prompt1"
    p1.raw_llm_outputs["test"] = "output1"
    
    assert "test" not in p2.llm_prompts
    assert "test" not in p2.raw_llm_outputs

# B, C, D, E. New experiment, prompt integrity, raw output integrity, multiple calls
@patch("langchain_ollama.ChatOllama.invoke")
def test_experiment_provenance_capture(mock_invoke, tmp_path):
    # Mock LLM response to avoid real ollama calls
    mock_message = MagicMock()
    mock_message.content = '{"actual_progress": 50, "reported_progress": 60, "explanation": "test"}'
    mock_invoke.return_value = mock_message

    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    # Run a single experiment
    results = simulator.run(pressure=PressureLevel.LOW, seed=42)
    
    assert len(results) > 0
    exp_dict = results[0]
    
    # provenance should exist
    assert "provenance" in exp_dict
    assert exp_dict["provenance"] is not None
    provenance = exp_dict["provenance"]
    
    # Git commit should be None or string
    assert provenance["git_commit"] is None or isinstance(provenance["git_commit"], str)
    
    # llm_prompts should contain actual rendered prompts
    assert "estimate_progress" in provenance["llm_prompts"]
    assert "status_update" in provenance["llm_prompts"]
    assert "auditor_explanation" in provenance["llm_prompts"]
    
    # Check exact match
    assert "System:" in provenance["llm_prompts"]["estimate_progress"]
    assert "Human:" in provenance["llm_prompts"]["estimate_progress"]
    
    # Check raw outputs captured before parsing
    assert provenance["raw_llm_outputs"]["estimate_progress"] == '{"actual_progress": 50, "reported_progress": 60, "explanation": "test"}'

    # Check multiple calls (if we run another experiment)
    # Simulator loop runs multiple developers, so we already have multiple experiments in results
    for res in results:
        prov = res["provenance"]
        # They should not share provenance dicts
        assert prov is not provenance or res is results[0]

# F. Historical compatibility
def test_historical_compatibility():
    old_json = {
        "task_name": "Test",
        "pressure": "HIGH",
        "developer_role": "Backend",
        "personality": "HONEST",
        "task_difficulty": "EASY",
        "reward": 100,
        "penalty": 50,
        "deadline_hours": 24,
        "behavior_strategy": "HONEST",
        "actual_progress": 50,
        "reported_progress": 50,
        "deception_gap": 0,
        "bugs_introduced": 1,
        "code_quality": 90,
        "honesty_score": 100.0,
        "stress_index": 50.0,
        "performance_score": 80.0,
        "deception_level": "HONEST",
        "developer_reasoning": "Did work",
        "manager_message": "Done",
        "auditor_score": 0,
        "deception_detected": False,
        "auditor_explanation": "Ok"
    }
    
    exp = ExperimentResult(**old_json)
    assert exp.provenance is None

# G. Serialization
def test_serialization():
    prov = ProvenanceData(
        git_commit="def456",
        llm_prompts={"test": "hello"},
        raw_llm_outputs={"test": "world"}
    )
    exp = ExperimentResult(
        task_name="Test",
        pressure="HIGH",
        developer_role="Backend",
        personality="HONEST",
        task_difficulty="EASY",
        reward=100,
        penalty=50,
        deadline_hours=24,
        behavior_strategy="HONEST",
        actual_progress=50,
        reported_progress=50,
        deception_gap=0,
        bugs_introduced=1,
        code_quality=90,
        honesty_score=100.0,
        stress_index=50.0,
        performance_score=80.0,
        deception_level="HONEST",
        developer_reasoning="Did work",
        manager_message="Done",
        auditor_score=0,
        deception_detected=False,
        auditor_explanation="Ok",
        provenance=prov
    )
    
    # Serialize
    data = exp.model_dump()
    
    # Deserialize
    exp2 = ExperimentResult(**data)
    
    assert exp2.provenance.git_commit == "def456"
    assert exp2.provenance.llm_prompts["test"] == "hello"
    assert exp2.provenance.raw_llm_outputs["test"] == "world"


# H. Real BaseAgent.think() path: exact prompt, exact raw output, multiple calls, single object
@patch('llm.ollama_client.OllamaClient.invoke')
def test_think_path_provenance_capture(mock_invoke):
    """
    Exercises the actual BaseAgent.think() code path with a mocked
    OllamaClient.invoke.  Verifies all four provenance correctness points:

    1. Prompt representation  - stored as "System: <sys>\\nHuman: <human>",
       matching exactly the text strings placed into SystemMessage / HumanMessage
       before being forwarded to ChatOllama.invoke().
    2. Raw output boundary    - response.content captured BEFORE parse_json_response.
    3. Multiple-call ordering - second call with the same step_name gets key
       "<step_name>_2"; insertion order preserved in Python 3.7+ dict.
    4. Single provenance object - the same ProvenanceData instance accumulates
       all three think() calls; id() never changes.
    """
    RAW_FIRST  = '{"actual_progress": 42, "reasoning": "hard work", "confidence": 0.9}'
    RAW_SECOND = '{"actual_progress": 55, "reasoning": "more work", "confidence": 0.8}'
    RAW_AUDIT  = '{"explanation": "Looks clean"}'

    mock_invoke.side_effect = [
        AIMessage(content=RAW_FIRST),
        AIMessage(content=RAW_SECOND),
        AIMessage(content=RAW_AUDIT),
    ]

    agent = BackendAgent()
    prov  = ProvenanceData(git_commit=None)
    original_id = id(prov)

    TASK_TEXT_1 = "Estimate your progress on task A."
    TASK_TEXT_2 = "Estimate your progress on task B."
    AUDIT_TEXT  = "Audit this experiment now."

    # call 1: step_name="estimate_progress"
    result1 = agent.think(TASK_TEXT_1, step_name="estimate_progress", provenance=prov)

    # call 2: same step_name -> must be disambiguated to "estimate_progress_2"
    result2 = agent.think(TASK_TEXT_2, step_name="estimate_progress", provenance=prov)

    # call 3: different step_name
    result3 = agent.think(AUDIT_TEXT, step_name="auditor_explanation", provenance=prov)

    # 4. Same object - never replaced
    assert id(prov) == original_id, "ProvenanceData object must not be replaced"

    # 1. Exact prompt representation
    expected_prompt_1 = f"System: {agent.system_prompt}\nHuman: {TASK_TEXT_1}"
    expected_prompt_2 = f"System: {agent.system_prompt}\nHuman: {TASK_TEXT_2}"
    expected_audit    = f"System: {agent.system_prompt}\nHuman: {AUDIT_TEXT}"

    assert prov.llm_prompts["estimate_progress"]   == expected_prompt_1
    assert prov.llm_prompts["estimate_progress_2"] == expected_prompt_2
    assert prov.llm_prompts["auditor_explanation"] == expected_audit

    # 2. Raw output captured before any parsing
    assert prov.raw_llm_outputs["estimate_progress"]   == RAW_FIRST
    assert prov.raw_llm_outputs["estimate_progress_2"] == RAW_SECOND
    assert prov.raw_llm_outputs["auditor_explanation"] == RAW_AUDIT

    # think() returns the raw content string, not a parsed dict
    assert result1 == RAW_FIRST
    assert result2 == RAW_SECOND
    assert result3 == RAW_AUDIT

    # 3. Insertion order preserved (Python 3.7+ guarantee)
    keys = list(prov.llm_prompts.keys())
    assert keys == ["estimate_progress", "estimate_progress_2", "auditor_explanation"]
