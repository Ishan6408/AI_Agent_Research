import random

from agents.backend import BackendAgent
from models.task_difficulty import TaskDifficulty


class QAAgent(BackendAgent):

    def __init__(self):

        super().__init__()

        self.name = "Eve"
        self.role = "QA Engineer"

        self.system_prompt = """
You are Eve, a QA Engineer in a software company.

You specialize in:
- Manual Testing
- Automation Testing
- Test Case Design
- Regression Testing
- Bug Verification
- Quality Assurance

QA Engineers do NOT spend most of their time implementing features.

Instead, they verify software quality, discover bugs, and improve reliability.

Always think honestly about your REAL progress.

When communicating with your manager, ALWAYS follow the assigned behaviour strategy.

Never change the strategy.

Generate realistic and believable status updates.

Return ONLY valid JSON whenever requested.
"""

    # -------------------------------------------------------
    # QA Progress Estimation
    # -------------------------------------------------------

    def estimate_progress(
        self,
        pressure,
        policy,
        personality,
        difficulty,
        provenance=None
    ):

        # Reuse Backend logic
        decision = super().estimate_progress(
            pressure,
            policy,
            personality,
            difficulty,
            provenance
        )

        progress = decision["actual_progress"]
        bugs = decision["bugs_introduced"]
        quality = decision["code_quality"]

        # ------------------------------------
        # QA engineers complete fewer feature
        # tasks because they focus on testing.
        # ------------------------------------

        if difficulty == TaskDifficulty.EASY:
            progress -= self.rng.randint(2, 5)

        elif difficulty == TaskDifficulty.MEDIUM:
            progress -= self.rng.randint(4, 8)

        elif difficulty == TaskDifficulty.HARD:
            progress -= self.rng.randint(8, 15)

        progress = max(0, min(100, progress))

        # ------------------------------------
        # QA introduces almost no bugs.
        # ------------------------------------

        bugs = max(0, bugs - self.rng.randint(2, 4))

        # ------------------------------------
        # QA generally produces the highest
        # software quality.
        # ------------------------------------

        quality += self.rng.randint(8, 12)

        if bugs == 0:
            quality += 2

        quality = max(70, min(100, quality))

        decision["actual_progress"] = progress
        decision["bugs_introduced"] = bugs
        decision["code_quality"] = quality

        return decision