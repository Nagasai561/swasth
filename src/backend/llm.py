from pathlib import Path
import json
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI
from external_data import search_blood_test_corpus

dotenv_filepath = (Path(__file__).parent / ".env").resolve()
if not dotenv_filepath.exists():
    raise FileNotFoundError(f"Could not find .env file at {dotenv_filepath}")

load_dotenv(dotenv_filepath)
llm_client = OpenAI()

SEARCH_CORPUS_TOOL_NAME = "search_blood_test_corpus"
SEARCH_CORPUS_TOOL = {
    "type": "function",
    "name": SEARCH_CORPUS_TOOL_NAME,
    "description": "Retrieve clinically relevant blood test reference passages from the indexed corpus.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "top_k": {"type": "integer", "minimum": 1, "maximum": 10, "default": 5},
        },
        "required": ["query"],
        "additionalProperties": False,
    },
}


def _run_tool_calls(response: Any) -> list[dict[str, Any]]:

    tool_outputs: list[dict[str, Any]] = []
    for item in response.output:
        if item.type != "function_call" or item.name != SEARCH_CORPUS_TOOL_NAME:
            continue

        args = json.loads(item.arguments)
        query = str(args["query"])
        top_k = int(args.get("top_k", 5))
        passages = search_blood_test_corpus(query=query, top_k=top_k)
        tool_outputs.append(
            {
                "type": "function_call_output",
                "call_id": item.call_id,
                "output": json.dumps(
                    {"results": [passage.model_dump() for passage in passages]},
                    ensure_ascii=True,
                ),
            }
        )

    return tool_outputs


def _requires_tool_calls(response: Any) -> bool:
    return any(item.type == "function_call" for item in response.output)

def get_llm_response(input: Any, use_tools: bool = False, text_format=None, model: str = "gpt-5-mini") -> Any:
    if not use_tools:
        if text_format is None:
            response = llm_client.responses.create(model=model, input=input)
            return response.output_text
        response = llm_client.responses.parse(model=model, input=input, text_format=text_format)
        return response.output_parsed

    create_kwargs = dict(model=model, tools=[SEARCH_CORPUS_TOOL], tool_choice="auto")
    if text_format is not None:
        response = llm_client.responses.parse(input=input, text_format=text_format, **create_kwargs)
    else:
        response = llm_client.responses.create(input=input, **create_kwargs)

    max_tool_rounds = 8
    for round_num in range(max_tool_rounds):
        if not _requires_tool_calls(response):
            break
        tool_outputs = _run_tool_calls(response)
        if not tool_outputs:
            break
        call_kwargs = dict(
            model=model,
            previous_response_id=response.id,
            input=tool_outputs,
            tools=[SEARCH_CORPUS_TOOL],
            tool_choice="auto",
        )
        if text_format is not None:
            response = llm_client.responses.parse(text_format=text_format, **call_kwargs)
        else:
            response = llm_client.responses.create(**call_kwargs)
    else:
        print("[WARN] Max tool rounds hit; model may still want to call tools.")

    return response.output_parsed if text_format is not None else response.output_text
