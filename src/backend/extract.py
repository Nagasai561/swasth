import base64
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from rich import print as rprint

MODEL = "gpt-5-mini"
EXTRACTION_PROMPT = """
You are expert at structured data extraction.
You are given a medical report of a user's blood test.
Extract only the meaningful information necessary for downstream tasks as required.
""".replace("\n", "")


class NominalRange(BaseModel):
    lower_value: int
    upper_value: int


class Measurement(BaseModel):
    category: str
    name: str
    observed_value: int
    nominal_range: NominalRange
    unit: str


class Measurements(BaseModel):
    collection: list[Measurement]




def encode_img_base64(imgpath: Path):
    raw_bytes = imgpath.read_bytes()
    encoded_bytes = base64.b64encode(raw_bytes)
    return encoded_bytes.decode("utf-8")

if __name__ == "__main__":
    load_dotenv()
    client = OpenAI()

    imgpath = Path(sys.argv[1])
    img_base64 = encode_img_base64(imgpath)
    img_ext = "png"
    response = client.responses.parse(
        model=MODEL,
        input=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Extract from this image"},
                    {
                        "type": "input_image",
                        "image_url": f"data:image/{img_ext};base64,{img_base64}",
                    },
                ],
            },
        ],
        text_format=Measurements,
    )
    rprint(response)
