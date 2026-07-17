from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

dotenv_filepath = (Path(__file__).parent / ".env").resolve()
if not dotenv_filepath.exists():
    raise FileNotFoundError(f"Could not find .env file at {dotenv_filepath}")

load_dotenv(dotenv_filepath)
llm_client = OpenAI()
