from langchain_ollama import ChatOllama


class OllamaClient:
    """
    Wrapper around the local Ollama model.
    """

    def __init__(
        self,
        model: str = "qwen2.5:7b",
        temperature: float = 0.3,
    ):
        self.llm = ChatOllama(
            model=model,
            temperature=temperature,
        )

    @property
    def model(self) -> str:
        return self.llm.model

    @property
    def temperature(self) -> float:
        return self.llm.temperature

    def invoke(self, messages):
        """
        Sends messages to the LLM and returns the response.
        """
        return self.llm.invoke(messages)