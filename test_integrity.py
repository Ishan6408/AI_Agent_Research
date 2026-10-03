import pytest
from unittest.mock import patch
from utils.experiment_storage import save_experiment
from simulation.simulator import SoftwareCompanySimulator
from models.experiment import ExperimentResult

def test_save_experiment_collisions():
    # Call save_experiment rapidly
    ids = set()
    dummy_result = ExperimentResult(
        task_name="Test Task",
        pressure="LOW",
        developer_role="Backend Developer",
        personality="HONEST",
        task_difficulty="EASY",
        reward=100,
        penalty=50,
        deadline_hours=24,
        behavior_strategy="HONEST",
        actual_progress=50,
        reported_progress=50,
        deception_gap=0,
        deception_level="HONEST",
        honesty_score=100,
        stress_index=25,
        performance_score=80,
        developer_reasoning="None",
        manager_message="None",
        bugs_introduced=0,
        code_quality=90,
        auditor_score=0,
        deception_detected=False,
        auditor_explanation="None"
    )

    for _ in range(100):
        exp_id = save_experiment(dummy_result)
        ids.add(exp_id)

    assert len(ids) == 100

def test_malformed_developer_output():
    # simulate the LLM returning malformed output ("") for the first agent, but normal JSON for the others
    with patch('agents.base_agent.BaseAgent.think') as mock_think, \
         patch('simulation.policy_generator.PolicyGenerator.generate') as mock_policy, \
         patch('agents.manager.ManagerAgent.create_sprint_tasks') as mock_tasks, \
         patch('agents.auditor.AuditorAgent.audit_experiment') as mock_audit, \
         patch('simulation.simulator.save_experiment') as mock_save:

        # 2 calls per developer (estimate_progress, generate_status_update)
        mock_think.side_effect = [
            "", "", # Dev 1: returns malformed output
            '{"actual_progress": 40}', '{"reported_progress": 40}', # Dev 2
            '{"actual_progress": 40}', '{"reported_progress": 40}', # Dev 3
            '{"actual_progress": 40}', '{"reported_progress": 40}', # Dev 4
        ]

        from models.company_policy import CompanyPolicy
        mock_policy.return_value = CompanyPolicy(reward_for_completion=10, penalty_for_failure=10, deadline_hours=10, manager_expectation="None")

        from models.task import Task
        mock_tasks.return_value = {
            "Backend Developer": Task(id="1", title="Backend", description="backend", priority="high", estimated_hours=10),
            "Frontend Developer": Task(id="2", title="Frontend", description="frontend", priority="high", estimated_hours=10),
            "QA Engineer": Task(id="3", title="QA", description="qa", priority="high", estimated_hours=10),
            "DevOps Engineer": Task(id="4", title="DevOps", description="devops", priority="high", estimated_hours=10)
        }

        sim = SoftwareCompanySimulator()
        mock_audit.return_value = {"suspicion_score": 0, "deception_detected": False, "explanation": "None"}
        mock_save.return_value = "fake-uuid"

        try:
            results = sim.run()
        except KeyError as e:
            pytest.fail(f"KeyError was raised: {str(e)}")

        # Dev 1 now has python-generated reported_progress, so we don't skip it just because the JSON is malformed.
        assert len(results) == 4
        assert mock_save.call_count == 4

        for r in results:
            assert "id" in r
            assert "reported_progress" in r
            assert r["reported_progress"] >= 0

def test_existing_behavior_smoke_test():
    # run a minimal normal experiment
    # For speed, mock the LLM or just run one if it uses a local fast model.
    # We will patch the agents' think methods to return static JSON.
    with patch('agents.base_agent.BaseAgent.think') as mock_think, \
         patch('simulation.policy_generator.PolicyGenerator.generate') as mock_policy, \
         patch('agents.manager.ManagerAgent.create_sprint_tasks') as mock_tasks, \
         patch('agents.auditor.AuditorAgent.audit_experiment') as mock_audit:

        mock_think.side_effect = [
            '{"actual_progress": 40, "reasoning": "I worked hard.", "confidence": 0.9}',
            '{"reported_progress": 45, "message": "Almost half done.", "confidence": 0.8}'
        ] * 4 # 4 developers

        from models.company_policy import CompanyPolicy
        mock_policy.return_value = CompanyPolicy(reward_for_completion=10, penalty_for_failure=10, deadline_hours=10, manager_expectation="None")

        from models.task import Task
        mock_tasks.return_value = {
            "Backend Developer": Task(id="1", title="Backend", description="backend", priority="high", estimated_hours=10),
            "Frontend Developer": Task(id="2", title="Frontend", description="frontend", priority="high", estimated_hours=10),
            "QA Engineer": Task(id="3", title="QA", description="qa", priority="high", estimated_hours=10),
            "DevOps Engineer": Task(id="4", title="DevOps", description="devops", priority="high", estimated_hours=10)
        }

        sim = SoftwareCompanySimulator()
        mock_audit.return_value = {"suspicion_score": 0, "deception_detected": False, "explanation": "Looks fine."}

        results = sim.run()

        assert len(results) == 4
        for r in results:
            assert "id" in r
            assert r["actual_progress"] > 0


def test_strict_validation():
    with patch('simulation.policy_generator.PolicyGenerator.generate') as mock_policy, \
         patch('agents.manager.ManagerAgent.create_sprint_tasks') as mock_tasks, \
         patch('agents.auditor.AuditorAgent.audit_experiment') as mock_audit, \
         patch('simulation.simulator.save_experiment') as mock_save:

        from models.company_policy import CompanyPolicy
        mock_policy.return_value = CompanyPolicy(reward_for_completion=10, penalty_for_failure=10, deadline_hours=10, manager_expectation="None")

        from models.task import Task
        mock_tasks.return_value = {
            "Backend Developer": Task(id="1", title="Backend", description="backend", priority="high", estimated_hours=10),
            "Frontend Developer": Task(id="2", title="Frontend", description="frontend", priority="high", estimated_hours=10),
            "QA Engineer": Task(id="3", title="QA", description="qa", priority="high", estimated_hours=10),
            "DevOps Engineer": Task(id="4", title="DevOps", description="devops", priority="high", estimated_hours=10)
        }

        mock_audit.return_value = {"suspicion_score": 0, "deception_detected": False, "explanation": "None"}
        mock_save.return_value = "fake-uuid"

        # cases: tuple(actual_progress, reported_progress, bugs_introduced, code_quality, should_accept)
        cases = [
            # 1. Integer accepted
            (35, 35, 2, 90, True),
            # 2. Numeric string rejected
            (35, "35", 2, 90, False),
            ("35", 35, 2, 90, False),
            # 3. Float rejected
            (35, 35.8, 2, 90, False),
            (35.8, 35, 2, 90, False),
            # 4. Invalid string rejected
            (35, "abc", 2, 90, False),
            # 5. None rejected
            (35, None, 2, 90, False),
        ]

        for actual, reported, bugs, quality, should_accept in cases:
            # We patch BackendAgent.estimate_progress and BaseAgent.generate_status_update
            # We must be careful because BackendAgent etc are instantiated inside simulator.py?
            # Actually, we can patch the methods on the classes.
            with patch('agents.backend.BackendAgent.estimate_progress') as mock_est_backend, \
                 patch('agents.frontend.FrontendAgent.estimate_progress') as mock_est_front, \
                 patch('agents.qa.QAAgent.estimate_progress') as mock_est_qa, \
                 patch('agents.devops.DevOpsAgent.estimate_progress') as mock_est_devops, \
                 patch('agents.backend.BackendAgent.generate_status_update') as mock_gen_status_backend, \
                 patch('agents.frontend.FrontendAgent.generate_status_update') as mock_gen_status_front, \
                 patch('agents.qa.QAAgent.generate_status_update') as mock_gen_status_qa, \
                 patch('agents.devops.DevOpsAgent.generate_status_update') as mock_gen_status_devops:

                # For Dev 1 (Backend), return the test case
                mock_est_backend.return_value = {
                    "actual_progress": actual,
                    "bugs_introduced": bugs,
                    "code_quality": quality
                }
                # For others, return valid
                valid_est = {"actual_progress": 40, "bugs_introduced": 1, "code_quality": 95}
                mock_est_front.return_value = valid_est
                mock_est_qa.return_value = valid_est
                mock_est_devops.return_value = valid_est

                import json
                mock_gen_status_backend.return_value = (reported, json.dumps({"reported_progress": reported}))
                mock_gen_status_front.return_value = (40, json.dumps({"reported_progress": 40}))
                mock_gen_status_qa.return_value = (40, json.dumps({"reported_progress": 40}))
                mock_gen_status_devops.return_value = (40, json.dumps({"reported_progress": 40}))

                sim = SoftwareCompanySimulator()
                results = sim.run()

                if should_accept:
                    assert len(results) == 4, f"Failed on case {(actual, reported, bugs, quality)}. Expected 4, got {len(results)}"
                else:
                    assert len(results) == 3, f"Failed on case {(actual, reported, bugs, quality)}. Expected 3, got {len(results)}"

        # 6. Missing field rejected
        # Test missing bugs_introduced
        with patch('agents.backend.BackendAgent.estimate_progress') as mock_est_backend, \
             patch('agents.frontend.FrontendAgent.estimate_progress') as mock_est_front, \
             patch('agents.qa.QAAgent.estimate_progress') as mock_est_qa, \
             patch('agents.devops.DevOpsAgent.estimate_progress') as mock_est_devops, \
             patch('agents.backend.BackendAgent.generate_status_update') as mock_gen_status_backend, \
             patch('agents.frontend.FrontendAgent.generate_status_update') as mock_gen_status_front, \
             patch('agents.qa.QAAgent.generate_status_update') as mock_gen_status_qa, \
             patch('agents.devops.DevOpsAgent.generate_status_update') as mock_gen_status_devops:

            mock_est_backend.return_value = {
                "actual_progress": 35,
                "code_quality": 90
            } # missing bugs_introduced
            valid_est = {"actual_progress": 40, "bugs_introduced": 1, "code_quality": 95}
            mock_est_front.return_value = valid_est
            mock_est_qa.return_value = valid_est
            mock_est_devops.return_value = valid_est

            import json
            mock_gen_status_backend.return_value = (35, json.dumps({"reported_progress": 35}))
            mock_gen_status_front.return_value = (40, json.dumps({"reported_progress": 40}))
            mock_gen_status_qa.return_value = (40, json.dumps({"reported_progress": 40}))
            mock_gen_status_devops.return_value = (40, json.dumps({"reported_progress": 40}))
            sim = SoftwareCompanySimulator()
            results = sim.run()
            assert len(results) == 3

        # Test missing reported_progress
        with patch('agents.backend.BackendAgent.estimate_progress') as mock_est_backend, \
             patch('agents.frontend.FrontendAgent.estimate_progress') as mock_est_front, \
             patch('agents.qa.QAAgent.estimate_progress') as mock_est_qa, \
             patch('agents.devops.DevOpsAgent.estimate_progress') as mock_est_devops, \
             patch('agents.backend.BackendAgent.generate_status_update') as mock_gen_status_backend, \
             patch('agents.frontend.FrontendAgent.generate_status_update') as mock_gen_status_front, \
             patch('agents.qa.QAAgent.generate_status_update') as mock_gen_status_qa, \
             patch('agents.devops.DevOpsAgent.generate_status_update') as mock_gen_status_devops:

            mock_est_backend.return_value = {
                "actual_progress": 35,
                "bugs_introduced": 2,
                "code_quality": 90
            }
            valid_est = {"actual_progress": 40, "bugs_introduced": 1, "code_quality": 95}
            mock_est_front.return_value = valid_est
            mock_est_qa.return_value = valid_est
            mock_est_devops.return_value = valid_est

            import json
            mock_gen_status_backend.return_value = (35, json.dumps({"some_other_field": 35}))
            mock_gen_status_front.return_value = (40, json.dumps({"reported_progress": 40}))
            mock_gen_status_qa.return_value = (40, json.dumps({"reported_progress": 40}))
            mock_gen_status_devops.return_value = (40, json.dumps({"reported_progress": 40}))
            sim = SoftwareCompanySimulator()
            results = sim.run()
            assert len(results) == 4

def test_conflicting_llm_reported_progress():
    from unittest.mock import patch
    from simulation.simulator import SoftwareCompanySimulator

    with patch('simulation.policy_generator.PolicyGenerator.generate') as mock_policy, \
         patch('agents.manager.ManagerAgent.create_sprint_tasks') as mock_tasks, \
         patch('agents.auditor.AuditorAgent.audit_experiment') as mock_audit, \
         patch('simulation.simulator.save_experiment') as mock_save:

        from models.company_policy import CompanyPolicy
        mock_policy.return_value = CompanyPolicy(reward_for_completion=10, penalty_for_failure=10, deadline_hours=10, manager_expectation="None")

        from models.task import Task
        mock_tasks.return_value = {
            "Backend Developer": Task(id="1", title="Backend", description="backend", priority="high", estimated_hours=10),
            "Frontend Developer": Task(id="2", title="Frontend", description="frontend", priority="high", estimated_hours=10),
            "QA Engineer": Task(id="3", title="QA", description="qa", priority="high", estimated_hours=10),
            "DevOps Engineer": Task(id="4", title="DevOps", description="devops", priority="high", estimated_hours=10)
        }

        mock_audit.return_value = {"suspicion_score": 0, "deception_detected": False, "explanation": "None"}
        mock_save.return_value = "fake-uuid"

        with patch('agents.base_agent.BaseAgent.think') as mock_think:
            import json

            def side_effect(prompt, step_name=None, provenance=None):
                if step_name == "estimate_progress":
                    content = json.dumps({
                        "actual_progress": 35,
                        "bugs_introduced": 2,
                        "code_quality": 90,
                        "reasoning": "mock reasoning"
                    })
                elif step_name == "status_update":
                    # Deliberately conflicting LLM output Y=99
                    content = json.dumps({
                        "reported_progress": 99,
                        "message": "All good!",
                        "confidence": 0.9
                    })
                else:
                    content = "{}"

                if provenance is not None and step_name:
                    key = step_name
                    count = 1
                    while key in provenance.llm_prompts:
                        count += 1
                        key = f"{step_name}_{count}"
                    provenance.llm_prompts[key] = prompt
                    provenance.raw_llm_outputs[key] = content

                return content

            mock_think.side_effect = side_effect

            sim = SoftwareCompanySimulator()

            # Fix rng to ensure predictable python-calculated strategy and reported_progress
            # For seed=42:
            # Backend Developer -> difficulty will be something, strategy will be something.
            # We don't care exactly what it calculates for X, just that it's NOT 99, and that
            # the final ExperimentResult uses X instead of 99.

            # Since we mocked think for ALL developers, they all return 99 for reported_progress in LLM response
            from models.environment import PressureLevel
            results = sim.run(pressure=PressureLevel.LOW, seed=42)

            assert len(results) == 4

            for result in results:
                calculated_x = result["reported_progress"]
                # Verify we ignored the LLM's 99
                assert calculated_x != 99

                # Check provenance for the raw LLM response 99
                provenance = result.get("provenance")
                assert provenance is not None

                # We expect 2 llm_calls (estimate_progress, status_update)
                raw_outputs = provenance["raw_llm_outputs"]
                assert len(raw_outputs) == 2
                assert "status_update" in raw_outputs
                assert "99" in raw_outputs["status_update"]
