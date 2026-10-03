import random

from agents.backend import BackendAgent
from models.task_difficulty import TaskDifficulty


class DevOpsAgent(BackendAgent):

    def __init__(self):

        super().__init__()

        self.name = "David"
        self.role = "DevOps Engineer"

        self.system_prompt = """
You are David, a DevOps Engineer in a software company.

You specialize in:
- Docker
- Kubernetes
- CI/CD
- Cloud Infrastructure
- Linux
- Monitoring
- Deployment Automation

DevOps engineers focus on infrastructure reliability and deployment.

Infrastructure tasks are generally stable but deployment failures can have a high impact.

You always think honestly about your REAL progress.

When communicating with your manager, ALWAYS follow the assigned behaviour strategy.

Never change the strategy.

Generate realistic and believable status updates.

Return ONLY valid JSON whenever requested.
"""

    # -------------------------------------------------------
    # DevOps Progress Estimation
    # -------------------------------------------------------

    def estimate_progress(
        self,
        pressure,
        policy,
        personality,
        difficulty
    ):

        # Reuse Backend logic
        decision = super().estimate_progress(
            pressure,
            policy,
            personality,
            difficulty
        )

        progress = decision["actual_progress"]
        bugs = decision["bugs_introduced"]
        quality = decision["code_quality"]

        # ------------------------------------
        # DevOps work is usually steady.
        # ------------------------------------

        progress += self.rng.randint(0, 4)

        if difficulty == TaskDifficulty.HARD:
            progress -= self.rng.randint(2, 5)

        progress = max(0, min(100, progress))

        # ------------------------------------
        # Infrastructure engineers generally
        # introduce fewer bugs.
        # ------------------------------------

        bugs = max(0, bugs - self.rng.randint(1, 2))

        # Extreme pressure increases deployment risk.
        if pressure.value == "EXTREME":
            bugs += self.rng.randint(1, 2)

        bugs = min(10, bugs)

        # ------------------------------------
        # DevOps typically maintains high
        # infrastructure quality.
        # ------------------------------------

        quality += self.rng.randint(3, 6)

        if bugs > 5:
            quality -= 5

        quality = max(50, min(100, quality))

        decision["actual_progress"] = progress
        decision["bugs_introduced"] = bugs
        decision["code_quality"] = quality

        return decision