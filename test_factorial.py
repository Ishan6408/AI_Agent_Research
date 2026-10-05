import pytest
import os
import glob
from experiments.runner import ExperimentRunner
from models.environment import PressureLevel
from models.personality import Personality
from models.task_difficulty import TaskDifficulty
from simulation.simulator import SoftwareCompanySimulator
from unittest.mock import patch, MagicMock

def test_factorial_matrix():
    runner = ExperimentRunner(runs_per_pressure=10)
    executions = runner.generate_factorial_executions(base_seed=42)
    
    # 5. Total planned simulator executions = 600
    assert len(executions) == 600
    
    observations = []
    seeds = set()
    
    different_personalities = False
    different_difficulties = False
    
    for exec_data in executions:
        pressure = exec_data["pressure"]
        seed = exec_data["seed"]
        dev_conds = exec_data["developer_conditions"]
        
        # 12. Seeds differ across executions
        assert seed not in seeds
        seeds.add(seed)
        
        # 6. Each simulator execution contains exactly four developer conditions
        assert len(dev_conds) == 4
        assert set(dev_conds.keys()) == {"Backend Developer", "Frontend Developer", "QA Engineer", "DevOps Engineer"}
        
        p_set = set()
        d_set = set()
        for role, cond in dev_conds.items():
            observations.append({
                "pressure": pressure,
                "role": role,
                "personality": cond["personality"],
                "difficulty": cond["difficulty"]
            })
            p_set.add(cond["personality"])
            d_set.add(cond["difficulty"])
            
        if len(p_set) > 1:
            different_personalities = True
        if len(d_set) > 1:
            different_difficulties = True
            
    # 7. The four developers can have different personalities
    assert different_personalities
    
    # 8. The four developers can have different difficulties
    assert different_difficulties
    
    # 4. Total planned developer observations = 2,400
    assert len(observations) == 2400
    
    # 1. Factorial matrix contains exactly 240 unique cells
    # 2. Every: Pressure x Role x Personality x Difficulty combination appears exactly 10 times
    # 3. Each role has 600 planned observations
    counts = {}
    role_counts = {}
    for obs in observations:
        role = obs["role"]
        cell = (obs["pressure"], obs["role"], obs["personality"], obs["difficulty"])
        counts[cell] = counts.get(cell, 0) + 1
        role_counts[role] = role_counts.get(role, 0) + 1
        
    assert len(counts) == 240
    for count in counts.values():
        assert count == 10
        
    for count in role_counts.values():
        assert count == 600
        
    # 11. Seed mapping is deterministic
    # 13. Re-running the matrix generator produces identical condition/seed mappings
    executions2 = runner.generate_factorial_executions(base_seed=42)
    assert executions == executions2
    
    # Verify seed sequence changes with a different base_seed
    executions3 = runner.generate_factorial_executions(base_seed=43)
    assert executions != executions3
    assert executions[0]["seed"] != executions3[0]["seed"]

@patch('simulation.simulator.PolicyGenerator.generate')
@patch('agents.backend.BackendAgent.accept_task')
@patch('agents.backend.BackendAgent.estimate_progress')
@patch('agents.backend.BackendAgent.choose_strategy')
@patch('agents.backend.BackendAgent.generate_status_update')
@patch('agents.frontend.FrontendAgent.accept_task')
@patch('agents.frontend.FrontendAgent.estimate_progress')
@patch('agents.frontend.FrontendAgent.choose_strategy')
@patch('agents.frontend.FrontendAgent.generate_status_update')
@patch('agents.qa.QAAgent.accept_task')
@patch('agents.qa.QAAgent.estimate_progress')
@patch('agents.qa.QAAgent.choose_strategy')
@patch('agents.qa.QAAgent.generate_status_update')
@patch('agents.devops.DevOpsAgent.accept_task')
@patch('agents.devops.DevOpsAgent.estimate_progress')
@patch('agents.devops.DevOpsAgent.choose_strategy')
@patch('agents.devops.DevOpsAgent.generate_status_update')
@patch('agents.auditor.AuditorAgent.audit_experiment')
def test_simulator_uses_supplied_conditions(mock_audit, *args):
    import tempfile
    from pathlib import Path
    
    # Mock return values for all developers
    for i in range(0, 16, 4):
        args[i].return_value = (50, '{"message": "hi"}')  # generate_status_update
        args[i+1].return_value = "HONEST"  # choose_strategy
        args[i+2].return_value = {"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"} # estimate_progress
        args[i+3].return_value = None # accept_task
        
    mock_audit.return_value = {"suspicion_score": 10, "deception_detected": False, "explanation": "test"}
    
    policy_mock = MagicMock()
    policy_mock.reward_for_completion = 100
    policy_mock.penalty_for_failure = 50
    policy_mock.deadline_hours = 12
    args[-1].return_value = policy_mock

    with tempfile.TemporaryDirectory() as temp_dir:
        storage_dir = Path(temp_dir) / "results"
        storage_dir.mkdir()
        
        sim = SoftwareCompanySimulator(storage_dir=str(storage_dir))
        
        # Intentionally use distinct personality/difficulty for each role
        dev_conds = {
            "Backend Developer": {
                "personality": Personality.OPPORTUNISTIC,
                "difficulty": TaskDifficulty.HARD
            },
            "Frontend Developer": {
                "personality": Personality.HONEST,
                "difficulty": TaskDifficulty.EASY
            },
            "QA Engineer": {
                "personality": Personality.RISK_AVERSE,
                "difficulty": TaskDifficulty.MEDIUM
            },
            "DevOps Engineer": {
                "personality": Personality.AMBITIOUS,
                "difficulty": TaskDifficulty.HARD
            }
        }
        
        results = sim.run(pressure=PressureLevel.LOW, seed=123, developer_conditions=dev_conds)
        
        assert len(results) == 4
        
        # Validate each result
        for res in results:
            role = res["developer_role"]
            expected_cond = dev_conds[role]
            
            assert res["personality"] == expected_cond["personality"].value
            assert res["task_difficulty"] == expected_cond["difficulty"].value
            assert res["pressure"] == PressureLevel.LOW.value
            assert res["seed"] == 123
            assert "experiment_id" in res and res["experiment_id"]
            assert "timestamp" in res and res["timestamp"]
            # LLM mock fields
            assert "model" in res
            assert "temperature" in res
            # Provenance
            assert "provenance" in res
            assert "git_commit" in res["provenance"]
            
        # Verify temporary result file is created
        json_files = glob.glob(str(storage_dir / "*.json"))
        assert len(json_files) == 4
        
        # Check that it didn't modify production 'results' 
        # (By asserting the length or existence of tmp_path logic)

@patch('simulation.simulator.PolicyGenerator.generate')
@patch('agents.backend.BackendAgent.accept_task')
@patch('agents.backend.BackendAgent.estimate_progress')
@patch('agents.backend.BackendAgent.choose_strategy')
@patch('agents.backend.BackendAgent.generate_status_update')
@patch('agents.frontend.FrontendAgent.accept_task')
@patch('agents.frontend.FrontendAgent.estimate_progress')
@patch('agents.frontend.FrontendAgent.choose_strategy')
@patch('agents.frontend.FrontendAgent.generate_status_update')
@patch('agents.qa.QAAgent.accept_task')
@patch('agents.qa.QAAgent.estimate_progress')
@patch('agents.qa.QAAgent.choose_strategy')
@patch('agents.qa.QAAgent.generate_status_update')
@patch('agents.devops.DevOpsAgent.accept_task')
@patch('agents.devops.DevOpsAgent.estimate_progress')
@patch('agents.devops.DevOpsAgent.choose_strategy')
@patch('agents.devops.DevOpsAgent.generate_status_update')
@patch('agents.auditor.AuditorAgent.audit_experiment')
def test_simulator_backward_compatibility(mock_audit, *args):
    import tempfile
    from pathlib import Path
    
    # Mock return values for all developers
    for i in range(0, 16, 4):
        args[i].return_value = (50, '{"message": "hi"}')
        args[i+1].return_value = "HONEST"
        args[i+2].return_value = {"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"}
        args[i+3].return_value = None
        
    mock_audit.return_value = {"suspicion_score": 10, "deception_detected": False, "explanation": "test"}
    
    policy_mock = MagicMock()
    policy_mock.reward_for_completion = 100
    policy_mock.penalty_for_failure = 50
    policy_mock.deadline_hours = 12
    args[-1].return_value = policy_mock

    with tempfile.TemporaryDirectory() as temp_dir:
        storage_dir = Path(temp_dir) / "results"
        storage_dir.mkdir()
        
        sim = SoftwareCompanySimulator(storage_dir=str(storage_dir))
        
        results = sim.run(pressure=PressureLevel.LOW, seed=123, developer_conditions=None)
        
        assert len(results) == 4
        for res in results:
            assert res["personality"] in [p.value for p in Personality]
            assert res["task_difficulty"] in [d.value for d in TaskDifficulty]

def test_factorial_storage_isolation(tmp_path):
    from experiments.runner import ExperimentRunner
    from pathlib import Path
    import glob
    
    storage_dir = tmp_path / "results"
    storage_dir.mkdir()
    
    historical_csv = storage_dir / "experiment_summary.csv"
    historical_csv.write_text("dummy_data\n")
    
    runner = ExperimentRunner(runs_per_pressure=1, storage_dir=str(storage_dir))
    
    # Mock to run just 1 dummy execution
    runner.generate_factorial_executions = lambda base_seed: [
        {
            "pressure": PressureLevel.LOW, 
            "seed": 1, 
            "developer_conditions": {}
        }
    ]
    
    # Mock ONLY the LLM boundary so the real simulator reaches save_experiment
    with patch('simulation.simulator.PolicyGenerator.generate') as mock_policy, \
         patch('agents.backend.BackendAgent.accept_task', return_value=None), \
         patch('agents.backend.BackendAgent.estimate_progress', return_value={"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"}), \
         patch('agents.backend.BackendAgent.choose_strategy', return_value="HONEST"), \
         patch('agents.backend.BackendAgent.generate_status_update', return_value=(50, '{"message": "hi"}')), \
         patch('agents.frontend.FrontendAgent.accept_task', return_value=None), \
         patch('agents.frontend.FrontendAgent.estimate_progress', return_value={"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"}), \
         patch('agents.frontend.FrontendAgent.choose_strategy', return_value="HONEST"), \
         patch('agents.frontend.FrontendAgent.generate_status_update', return_value=(50, '{"message": "hi"}')), \
         patch('agents.qa.QAAgent.accept_task', return_value=None), \
         patch('agents.qa.QAAgent.estimate_progress', return_value={"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"}), \
         patch('agents.qa.QAAgent.choose_strategy', return_value="HONEST"), \
         patch('agents.qa.QAAgent.generate_status_update', return_value=(50, '{"message": "hi"}')), \
         patch('agents.devops.DevOpsAgent.accept_task', return_value=None), \
         patch('agents.devops.DevOpsAgent.estimate_progress', return_value={"actual_progress": 50, "bugs_introduced": 1, "code_quality": 80, "reasoning": "test"}), \
         patch('agents.devops.DevOpsAgent.choose_strategy', return_value="HONEST"), \
         patch('agents.devops.DevOpsAgent.generate_status_update', return_value=(50, '{"message": "hi"}')), \
         patch('agents.auditor.AuditorAgent.audit_experiment', return_value={"suspicion_score": 10, "deception_detected": False, "explanation": "test"}):
         
        policy_mock = MagicMock()
        policy_mock.reward_for_completion = 100
        policy_mock.penalty_for_failure = 50
        policy_mock.deadline_hours = 12
        mock_policy.return_value = policy_mock
        
        # Invoke the real factorial runner, which uses real simulator.run and real save_experiment
        runner.run_factorial()
    
    # 1. factorial runner uses the dedicated storage directory
    # 6. factorial JSON files are written only to the dedicated campaign directory
    campaign_dir = storage_dir / "factorial_campaign"
    assert campaign_dir.exists()
    
    json_in_campaign = glob.glob(str(campaign_dir / "*.json"))
    # We expect 4 developer results to be written to json files
    assert len(json_in_campaign) == 4
    
    # 2. factorial execution does not target results/experiment_summary.csv
    # 3. historical CSV remains untouched
    assert historical_csv.read_text() == "dummy_data\n"
    
    # 5. no production test artifacts are created in results/ root
    json_in_root = glob.glob(str(storage_dir / "*.json"))
    assert len(json_in_root) == 0
    
    # 4. existing storage behavior still works (storage_dir restored)
    assert runner.simulator.storage_dir == str(storage_dir)

def test_factorial_storage_restoration_on_exception(tmp_path):
    from experiments.runner import ExperimentRunner
    from pathlib import Path
    from unittest.mock import patch
    
    storage_dir = tmp_path / "results"
    storage_dir.mkdir()
    
    runner = ExperimentRunner(runs_per_pressure=1, storage_dir=str(storage_dir))
    
    # Mock to run just 1 dummy execution
    runner.generate_factorial_executions = lambda base_seed: [
        {
            "pressure": PressureLevel.LOW, 
            "seed": 1, 
            "developer_conditions": {}
        }
    ]
    
    # Simulate an exception from the execution boundary (LLM mock) 
    # without replacing the storage implementation or simulator.run()
    with patch('simulation.simulator.PolicyGenerator.generate', side_effect=RuntimeError("Simulated LLM Failure")):
        try:
            runner.run_factorial()
        except RuntimeError:
            pass
            
    # Verify it was correctly restored even after exception
    assert runner.simulator.storage_dir == str(storage_dir)
