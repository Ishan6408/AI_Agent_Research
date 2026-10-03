from abc import ABC
import random
from langchain_core.messages import SystemMessage, HumanMessage

from llm.ollama_client import OllamaClient


class BaseAgent(ABC):
    """
    Base class for all AI agents.
    """

    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.history = []
        self.llm = OllamaClient()
        self.rng = random.Random()

    def think(self, task: str) -> str:
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=task),
        ]

        response = self.llm.invoke(messages)

        return response.content