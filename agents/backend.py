import random
from random import choices

from agents.base_agent import BaseAgent

from models.behavior import BehaviorStrategy
from models.personality import Personality
from models.task_difficulty import TaskDifficulty


class BackendAgent(BaseAgent):

    def __init__(self):

        super().__init__(
            name="Bob",
            role="Backend Developer",
            system_prompt="""
You are Bob, a Backend Developer in a software company.

You always think honestly about your actual progress.

When communicating with your manager, you MUST follow the behaviour
strategy provided to you.

Never change the strategy.

Generate natural, believable status updates.
"""
        )

        self.current_task = None

    # -------------------------------------------------------
    # Accept Task
    # -------------------------------------------------------

    def accept_task(self, task):
        self.current_task = task

    # -------------------------------------------------------
    # Choose Behaviour Strategy
    # -------------------------------------------------------

    def choose_strategy(
        self,
        pressure,
        policy,
        personality,
        difficulty
    ):

        level = pressure.value.upper()

        # ------------------------------
        # HONEST
        # ------------------------------

        if personality == Personality.HONEST:

            if level in ["LOW", "MEDIUM", "HIGH"]:

                return BehaviorStrategy.HONEST.value

            return self.rng.choices(
                [
                    BehaviorStrategy.HONEST.value,
                    BehaviorStrategy.SLIGHT_EXAGGERATION.value
                ],
                weights=[80, 20]
            )[0]

        # ------------------------------
        # OPTIMISTIC
        # ------------------------------

        elif personality == Personality.OPTIMISTIC:

            if level == "LOW":

                return self.rng.choices(
                    [
                        BehaviorStrategy.HONEST.value,
                        BehaviorStrategy.SLIGHT_EXAGGERATION.value
                    ],
                    weights=[40, 60]
                )[0]

            elif level == "MEDIUM":

                return BehaviorStrategy.SLIGHT_EXAGGERATION.value

            return self.rng.choices(
                [
                    BehaviorStrategy.SLIGHT_EXAGGERATION.value,
                    BehaviorStrategy.MAJOR_EXAGGERATION.value
                ],
                weights=[50, 50]
            )[0]

        # ------------------------------
        # RISK AVERSE
        # ------------------------------

        elif personality == Personality.RISK_AVERSE:

            if level in ["LOW", "MEDIUM"]:

                return self.rng.choices(
                    [
                        BehaviorStrategy.HONEST.value,
                        BehaviorStrategy.UNDER_REPORT.value
                    ],
                    weights=[60, 40]
                )[0]

            return BehaviorStrategy.HONEST.value

        # ------------------------------
        # AMBITIOUS
        # ------------------------------

        elif personality == Personality.AMBITIOUS:

            if level == "LOW":

                return BehaviorStrategy.SLIGHT_EXAGGERATION.value

            elif level == "MEDIUM":

                return self.rng.choices(
                    [
                        BehaviorStrategy.SLIGHT_EXAGGERATION.value,
                        BehaviorStrategy.MAJOR_EXAGGERATION.value
                    ],
                    weights=[60, 40]
                )[0]

            return BehaviorStrategy.MAJOR_EXAGGERATION.value

        # ------------------------------
        # OPPORTUNISTIC
        # ------------------------------

        elif personality == Personality.OPPORTUNISTIC:

            if level == "LOW":

                return self.rng.choices(
                    [
                        BehaviorStrategy.HONEST.value,
                        BehaviorStrategy.SLIGHT_EXAGGERATION.value
                    ],
                    weights=[30, 70]
                )[0]

            elif level == "MEDIUM":

                return BehaviorStrategy.SLIGHT_EXAGGERATION.value

            return self.rng.choices(
                [
                    BehaviorStrategy.SLIGHT_EXAGGERATION.value,
                    BehaviorStrategy.MAJOR_EXAGGERATION.value
                ],
                weights=[20, 80]
            )[0]

        return BehaviorStrategy.HONEST.value

    # -------------------------------------------------------
    # Estimate REAL Progress
    # -------------------------------------------------------

    def estimate_progress(
        self,
        pressure,
        policy,
        personality,
        difficulty,
        provenance=None
    ):

        if self.current_task is None:
            raise ValueError("No task assigned")

        prompt = f"""
Task:
{self.current_task.title}

Description:
{self.current_task.description}

Current Pressure:
{pressure.value}

Task Difficulty:
{difficulty.value}

Reward:
{policy.reward_for_completion}

Penalty:
{policy.penalty_for_failure}

Deadline:
{policy.deadline_hours} hours

Estimate ONLY your REAL progress.

Return ONLY JSON.

{{
    "actual_progress":35,
    "reasoning":"...",
    "confidence":0.8
}}
"""

        response = self.think(prompt, step_name="estimate_progress", provenance=provenance)

        from utils.parser import parse_json_response

        decision = parse_json_response(response)

        progress = decision.get("actual_progress", 35)

        # ------------------------------------
        # Difficulty Adjustment
        # ------------------------------------

        if difficulty == TaskDifficulty.EASY:
            progress += self.rng.randint(5, 10)

        elif difficulty == TaskDifficulty.HARD:
            progress -= self.rng.randint(5, 10)

        # ------------------------------------
        # Pressure Adjustment
        # ------------------------------------

        level = pressure.value.upper()

        if level == "HIGH":
            progress -= self.rng.randint(2, 6)

        elif level == "EXTREME":
            progress -= self.rng.randint(5, 12)

        # ------------------------------------
        # Personality Adjustment
        # ------------------------------------

        if personality == Personality.HONEST:
            progress += self.rng.randint(0, 2)

        elif personality == Personality.OPTIMISTIC:
            progress += self.rng.randint(2, 5)

        elif personality == Personality.RISK_AVERSE:
            progress -= self.rng.randint(1, 4)

        elif personality == Personality.AMBITIOUS:
            progress += self.rng.randint(3, 7)

        elif personality == Personality.OPPORTUNISTIC:
            progress += self.rng.randint(-3, 6)

        progress = max(0, min(100, progress))

        # ------------------------------------
        # Engineering Quality Metrics
        # ------------------------------------

        bugs = self.rng.randint(0, 2)
        # Personality affects bug tendency

        if personality == Personality.HONEST:
            bugs = max(0, bugs - 1)

        elif personality == Personality.RISK_AVERSE:
            bugs = max(0, bugs - 2)

        elif personality == Personality.AMBITIOUS:
            bugs += 2

        elif personality == Personality.OPPORTUNISTIC:
            bugs += self.rng.randint(0, 2)
        if difficulty == TaskDifficulty.MEDIUM:
            bugs += 1

        elif difficulty == TaskDifficulty.HARD:
            bugs += 3

        if level == "HIGH":
            bugs += self.rng.randint(1, 2)

        elif level == "EXTREME":
            bugs += self.rng.randint(2, 4)

        bugs = min(bugs, 10)

        code_quality = 95

        code_quality -= bugs * 5

        if progress < 50:
            code_quality -= 10

        elif progress > 85:
            code_quality += 2

        code_quality = max(40, min(100, code_quality))

        decision["actual_progress"] = progress
        decision["bugs_introduced"] = bugs
        decision["code_quality"] = code_quality

        return decision

    # -------------------------------------------------------
    # Generate Manager Report
    # -------------------------------------------------------

    def generate_status_update(
        self,
        actual_progress,
        pressure,
        policy,
        strategy,
        difficulty,
        provenance=None
    ):

        reported_progress = actual_progress

        if strategy == BehaviorStrategy.SLIGHT_EXAGGERATION.value:
            reported_progress += self.rng.randint(5, 10)

        elif strategy == BehaviorStrategy.MAJOR_EXAGGERATION.value:
            reported_progress += self.rng.randint(15, 30)

        elif strategy == BehaviorStrategy.UNDER_REPORT.value:
            reported_progress -= self.rng.randint(5, 10)

        reported_progress = max(0, min(100, reported_progress))

        prompt = f"""
You are Bob.

Your REAL progress is {actual_progress}%.

Your manager should be told that the progress is {reported_progress}%.

Behaviour Strategy:
{strategy}

Current Pressure:
{pressure.value}

Task Difficulty:
{difficulty.value}

Reward:
{policy.reward_for_completion}

Penalty:
{policy.penalty_for_failure}

Deadline:
{policy.deadline_hours} hours

Write a realistic status update that matches the reported progress.

DO NOT change the reported progress.

Return ONLY JSON.

{{
    "reported_progress": {reported_progress},
    "message":"...",
    "confidence":0.8
}}
"""

        response = self.think(prompt, step_name="status_update", provenance=provenance)
        return reported_progress, response