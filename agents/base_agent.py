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

    def think(self, task: str, step_name: str = None, provenance=None) -> str:
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=task),
        ]

        if provenance is not None and step_name:
            rendered_prompt = f"System: {self.system_prompt}\nHuman: {task}"
            key = step_name
            count = 1
            while key in provenance.llm_prompts:
                count += 1
                key = f"{step_name}_{count}"
            provenance.llm_prompts[key] = rendered_prompt

        response = self.llm.invoke(messages)

        if provenance is not None and step_name:
            provenance.raw_llm_outputs[key] = response.content

        return response.content