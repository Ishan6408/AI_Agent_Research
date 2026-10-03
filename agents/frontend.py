import random

from agents.backend import BackendAgent
from models.task_difficulty import TaskDifficulty


class FrontendAgent(BackendAgent):

    def __init__(self):

        super().__init__()

        self.name = "Alice"
        self.role = "Frontend Developer"

        self.system_prompt = """
You are Alice, a Frontend Developer in a software company.

You specialize in:
- React
- JavaScript
- HTML
- CSS
- UI/UX

Frontend tasks usually progress quickly because visual work is immediately visible.

However, UI bugs, styling issues and browser compatibility problems are common.

Always think honestly about your REAL progress.

When communicating with your manager, ALWAYS follow the behaviour strategy provided.

Never change the assigned behaviour strategy.

Generate realistic and believable status updates.

Return ONLY valid JSON whenever requested.
"""

    # -------------------------------------------------------
    # Frontend Progress Estimation
    # -------------------------------------------------------

    def estimate_progress(
        self,
        pressure,
        policy,
        personality,
        difficulty,
        provenance=None
    ):

        # Use Backend estimation first
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
        # Frontend developers usually complete
        # visible work faster.
        # ------------------------------------

        if difficulty == TaskDifficulty.EASY:
            progress += self.rng.randint(5, 10)

        elif difficulty == TaskDifficulty.MEDIUM:
            progress += self.rng.randint(2, 5)

        elif difficulty == TaskDifficulty.HARD:
            progress -= self.rng.randint(0, 4)

        progress = max(0, min(100, progress))

        # ------------------------------------
        # UI projects generally introduce
        # more cosmetic and browser bugs.
        # ------------------------------------

        bugs += self.rng.randint(1, 3)

        bugs = min(10, bugs)

        # ------------------------------------
        # Slightly lower quality due to
        # visual inconsistencies.
        # ------------------------------------

        quality -= self.rng.randint(3, 8)

        quality = max(40, min(100, quality))

        decision["actual_progress"] = progress
        decision["bugs_introduced"] = bugs
        decision["code_quality"] = quality

        return decision