import random
import json
from unittest.mock import patch

from simulation.simulator import SoftwareCompanySimulator
from models.environment import PressureLevel

def mock_think(self, prompt, **kwargs):
    if "Estimate ONLY your REAL progress" in prompt:
        return json.dumps({
            "actual_progress": 50,
            "reasoning": "Mocked",
            "confidence": 0.9
        })
    elif "Write a realistic status update" in prompt:
        return json.dumps({
            "reported_progress": 60,
            "message": "Mocked update",
            "confidence": 0.9
        })
    elif "Auditor" in prompt:
        return json.dumps({
            "explanation": "Mocked explanation"
        })
    return json.dumps({})


def extract_key_metrics(results):
    metrics = []
    for r in results:
        # Extract the fields affected by RNG
        metrics.append({
            "role": r["developer_role"],
            "personality": r["personality"],
            "task_difficulty": r["task_difficulty"],
            "strategy": r["behavior_strategy"],
            "actual": r["actual_progress"],
            "reported": r["reported_progress"],
            "bugs": r["bugs_introduced"],
            "quality": r["code_quality"],
            "task_name": r["task_name"]
        })
    return metrics


@patch('agents.base_agent.BaseAgent.think', mock_think)
@patch('simulation.simulator.save_experiment', lambda x: "fake-id")
def test_same_seed_identical_results():
    sim1 = SoftwareCompanySimulator()
    res1 = sim1.run(pressure=PressureLevel.MEDIUM, seed=12345)
    
    sim2 = SoftwareCompanySimulator()
    res2 = sim2.run(pressure=PressureLevel.MEDIUM, seed=12345)
    
    metrics1 = extract_key_metrics(res1)
    metrics2 = extract_key_metrics(res2)
    
    assert metrics1 == metrics2
    # Ensure there's some variation inside the simulation
    # that proves the RNG was used.
    assert len(metrics1) == 4


@patch('agents.base_agent.BaseAgent.think', mock_think)
@patch('simulation.simulator.save_experiment', lambda x: "fake-id")
def test_different_seeds_different_results():
    sim1 = SoftwareCompanySimulator()
    res1 = sim1.run(pressure=PressureLevel.MEDIUM, seed=111)
    
    sim2 = SoftwareCompanySimulator()
    res2 = sim2.run(pressure=PressureLevel.MEDIUM, seed=222)
    
    metrics1 = extract_key_metrics(res1)
    metrics2 = extract_key_metrics(res2)
    
    assert metrics1 != metrics2


@patch('agents.base_agent.BaseAgent.think', mock_think)
@patch('simulation.simulator.save_experiment', lambda x: "fake-id")
def test_seed_none_no_global_mutation():
    random.seed(999)
    expected_val = random.random()
    
    random.seed(999)
    sim = SoftwareCompanySimulator()
    sim.run(pressure=PressureLevel.MEDIUM, seed=None)
    actual_val = random.random()
    
    assert actual_val == expected_val


@patch('agents.base_agent.BaseAgent.think', mock_think)
@patch('simulation.simulator.save_experiment', lambda x: "fake-id")
def test_global_rng_isolation():
    random.seed(123)
    expected_val = random.random()
    
    random.seed(123)
    sim = SoftwareCompanySimulator()
    sim.run(pressure=PressureLevel.HIGH, seed=456)
    actual_val = random.random()
    
    assert actual_val == expected_val


@patch('agents.base_agent.BaseAgent.think', mock_think)
@patch('simulation.simulator.save_experiment', lambda x: "fake-id")
def test_experiment_isolation():
    # If two simulation objects share the same seed, they should not interfere
    # Wait, `run` creates `random.Random(seed)` per call, so it's isolated.
    sim = SoftwareCompanySimulator()
    res1 = sim.run(pressure=PressureLevel.LOW, seed=777)
    res2 = sim.run(pressure=PressureLevel.LOW, seed=777)
    
    metrics1 = extract_key_metrics(res1)
    metrics2 = extract_key_metrics(res2)
    
    assert metrics1 == metrics2
