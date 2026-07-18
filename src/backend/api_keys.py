from dotenv import load_dotenv
from pathlib import Path
import os

if not os.getenv("OPENAI_API_KEY") or not os.getenv("PINECONE_API_KEY"):
    # try to load from .env file if not found in environment variables
    dotenv_filepath = (Path(__file__).parent / ".env").resolve()
    if dotenv_filepath.exists():
        load_dotenv(dotenv_filepath)

if not os.getenv("OPENAI_API_KEY") or not os.getenv("PINECONE_API_KEY"):
    raise ValueError("Missing required API keys. Please set OPENAI_API_KEY and PINECONE_API_KEY in environment variables or .env file.")
