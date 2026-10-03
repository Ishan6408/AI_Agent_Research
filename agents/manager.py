import random

from agents.base_agent import BaseAgent
from models.task import Task


class ManagerAgent(BaseAgent):

    def __init__(self):

        super().__init__(
            name="John",
            role="Engineering Manager",
            system_prompt="""
You are an experienced Engineering Manager.

Break large features into realistic engineering tasks.

Return valid JSON only.
"""
        )

    # -------------------------------------------------------
    # Create Sprint Tasks
    # -------------------------------------------------------

    def create_sprint_tasks(self):

        backend_tasks = [

            Task(
                id=1,
                title="Build Authentication API",
                description="Implement login and registration API using JWT.",
                priority="High",
                estimated_hours=8
            ),

            Task(
                id=2,
                title="Database Schema",
                description="Design database schema for user management.",
                priority="Medium",
                estimated_hours=6
            ),

            Task(
                id=3,
                title="Payment API",
                description="Implement payment processing endpoints.",
                priority="High",
                estimated_hours=10
            )

        ]

        frontend_tasks = [

            Task(
                id=101,
                title="Design Login UI",
                description="Create responsive login page.",
                priority="High",
                estimated_hours=4
            ),

            Task(
                id=102,
                title="Dashboard UI",
                description="Implement dashboard layout.",
                priority="Medium",
                estimated_hours=6
            ),

            Task(
                id=103,
                title="Profile Page",
                description="Develop user profile page.",
                priority="Medium",
                estimated_hours=5
            )

        ]

        qa_tasks = [

            Task(
                id=201,
                title="Login Testing",
                description="Test authentication flow.",
                priority="High",
                estimated_hours=4
            ),

            Task(
                id=202,
                title="Regression Testing",
                description="Execute regression test suite.",
                priority="Medium",
                estimated_hours=6
            ),

            Task(
                id=203,
                title="API Testing",
                description="Validate backend REST APIs.",
                priority="High",
                estimated_hours=5
            )

        ]

        devops_tasks = [

            Task(
                id=301,
                title="Docker Configuration",
                description="Containerize application.",
                priority="High",
                estimated_hours=5
            ),

            Task(
                id=302,
                title="CI/CD Pipeline",
                description="Create GitHub Actions workflow.",
                priority="High",
                estimated_hours=8
            ),

            Task(
                id=303,
                title="Monitoring Setup",
                description="Configure Prometheus and Grafana.",
                priority="Medium",
                estimated_hours=7
            )

        ]

        return {
            "Backend Developer": self.rng.choice(backend_tasks),
            "Frontend Developer": self.rng.choice(frontend_tasks),
            "QA Engineer": self.rng.choice(qa_tasks),
            "DevOps Engineer": self.rng.choice(devops_tasks)
        }