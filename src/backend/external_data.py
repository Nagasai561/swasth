import os

from pinecone import Pinecone
from pydantic import BaseModel, Field

from llm import llm_client
from rag.config import DEFAULT_INDEX_NAME, DEFAULT_NAMESPACE, DEFAULT_TOP_K, EMBEDDING_MODEL


class RetrievedPassage(BaseModel):
    source_id: str
    title: str
    url: str
    text: str
    score: float = Field(description="Vector similarity score from Pinecone")


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {var_name}")
    return value


def _get_index():
    pinecone_api_key = _require_env("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME", DEFAULT_INDEX_NAME).strip() or DEFAULT_INDEX_NAME
    pc = Pinecone(api_key=pinecone_api_key)
    return pc.Index(index_name)


def _get_namespace() -> str:
    return os.getenv("PINECONE_NAMESPACE", DEFAULT_NAMESPACE).strip() or DEFAULT_NAMESPACE


def search_blood_test_corpus(query: str, top_k: int = DEFAULT_TOP_K) -> list[RetrievedPassage]:
    if top_k <= 0:
        raise ValueError("top_k must be greater than 0")

    embedding = llm_client.embeddings.create(model=EMBEDDING_MODEL, input=query).data[0].embedding
    results = _get_index().query(
        vector=embedding,
        top_k=top_k,
        namespace=_get_namespace(),
        include_metadata=True,
    )
    passages: list[RetrievedPassage] = []
    for match in results.matches:
        metadata = match.metadata or {}
        passages.append(
            RetrievedPassage(
                source_id=str(metadata.get("source_id", "")),
                title=str(metadata.get("title", "")),
                url=str(metadata.get("url", "")),
                text=str(metadata.get("text", "")),
                score=float(match.score),
            )
        )

    return passages
