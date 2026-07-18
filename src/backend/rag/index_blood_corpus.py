import hashlib
import os
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

from corpus import BLOOD_CORPUS_SOURCES
from config import DEFAULT_INDEX_NAME, DEFAULT_NAMESPACE, EMBEDDING_DIMENSION, EMBEDDING_MODEL

dotenv_filepath = (Path(__file__).parent.parent / ".env").resolve()
if not dotenv_filepath.exists():
    raise FileNotFoundError(f"Could not find .env file at {dotenv_filepath}")
load_dotenv(dotenv_filepath)

REQUEST_HEADERS = {
    # A descriptive UA is good practice; identifies your bot and gives
    # sites a contact point instead of looking like a generic scraper.
    "User-Agent": "BloodReportCorpusBot/1.0 (+mailto:you@example.com)"
}
REQUEST_TIMEOUT_SECONDS = 30
REQUEST_DELAY_SECONDS = 1.0  # be polite between requests to the same host
UPSERT_BATCH_SIZE = 100


def _require_env(var_name: str) -> str:
    value = os.getenv(var_name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {var_name}")
    return value


def _extract_main_content(html: str) -> str:
    """Extract the main article content, stripping nav/header/footer boilerplate.

    MedlinePlus (and most sites) repeat the same nav/footer HTML on every
    page. If we embed the whole page, every chunk from every source shares
    near-duplicate nav/footer text, which pollutes the vector space and can
    cause irrelevant matches at query time. We try common main-content
    containers first and fall back to whole-page text only if none match.
    """
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "nav", "header", "footer"]):
        tag.decompose()

    main = (
        soup.find("main")
        or soup.find(id="mainContent")
        or soup.find(id="main-content")
        or soup.find("article")
        or soup.find(attrs={"role": "main"})  # pyright: ignore[reportArgumentType]
    )
    target = main if main is not None else soup
    return " ".join(target.get_text(separator=" ").split())


def _chunk_text(text: str, chunk_size_words: int = 220, overlap_words: int = 40) -> list[str]:
    if chunk_size_words <= overlap_words:
        raise ValueError("chunk_size_words must be greater than overlap_words")
    words = text.split()
    chunks: list[str] = []
    step = chunk_size_words - overlap_words
    start = 0
    while start < len(words):
        chunk_words = words[start : start + chunk_size_words]
        if not chunk_words:
            break
        chunks.append(" ".join(chunk_words))
        start += step
    return chunks


def _stable_vector_id(source_id: str, chunk_idx: int, text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]
    return f"{source_id}-{chunk_idx}-{digest}"


def _fetch_source_text(source_url: str) -> str | None:
    try:
        response = requests.get(source_url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
    except requests.RequestException as exc:
        print(f"  [WARN] Failed to fetch {source_url}: {exc}")
        return None
    return _extract_main_content(response.text)


def _upsert_in_batches(index, vectors: list[dict], namespace: str, batch_size: int = UPSERT_BATCH_SIZE) -> None:
    for start in range(0, len(vectors), batch_size):
        batch = vectors[start : start + batch_size]
        index.upsert(vectors=batch, namespace=namespace)


def build_and_index_corpus():
    openai_api_key = _require_env("OPENAI_API_KEY")
    pinecone_api_key = _require_env("PINECONE_API_KEY")

    index_name = os.getenv("PINECONE_INDEX_NAME", DEFAULT_INDEX_NAME).strip() or DEFAULT_INDEX_NAME
    namespace = os.getenv("PINECONE_NAMESPACE", DEFAULT_NAMESPACE).strip() or DEFAULT_NAMESPACE
    cloud = os.getenv("PINECONE_CLOUD", "aws").strip() or "aws"
    region = os.getenv("PINECONE_REGION", "us-east-1").strip() or "us-east-1"

    openai_client = OpenAI(api_key=openai_api_key)
    pc = Pinecone(api_key=pinecone_api_key)

    existing_indexes = set(pc.list_indexes().names())
    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud=cloud, region=region),
        )
    index = pc.Index(index_name)

    vectors_to_upsert: list[dict] = []
    skipped_sources: list[str] = []

    for i, source in enumerate(BLOOD_CORPUS_SOURCES):
        print(f"[{i + 1}/{len(BLOOD_CORPUS_SOURCES)}] Fetching {source.source_id} ({source.url})")

        cleaned_text = _fetch_source_text(source.url)
        if not cleaned_text:
            skipped_sources.append(source.source_id)
            continue

        chunks = _chunk_text(cleaned_text)
        if not chunks:
            skipped_sources.append(source.source_id)
            continue

        try:
            embeddings = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=chunks).data
        except Exception as exc:  # OpenAI SDK raises various APIError subclasses
            print(f"  [WARN] Embedding failed for {source.source_id}: {exc}")
            skipped_sources.append(source.source_id)
            continue

        for idx, chunk in enumerate(chunks):
            vector_id = _stable_vector_id(source.source_id, idx, chunk)
            vectors_to_upsert.append(
                {
                    "id": vector_id,
                    "values": embeddings[idx].embedding,
                    "metadata": {
                        "source_id": source.source_id,
                        "title": source.title,
                        "url": source.url,
                        "chunk_index": idx,
                        "tags": list(source.tags),
                        "text": chunk,
                    },
                }
            )

        time.sleep(REQUEST_DELAY_SECONDS)

    if vectors_to_upsert:
        _upsert_in_batches(index, vectors_to_upsert, namespace)

    print(
        f"Indexed {len(vectors_to_upsert)} chunks into Pinecone "
        f"index='{index_name}' namespace='{namespace}'."
    )
    if skipped_sources:
        print(f"Skipped {len(skipped_sources)} source(s): {', '.join(skipped_sources)}")


if __name__ == "__main__":
    build_and_index_corpus()
