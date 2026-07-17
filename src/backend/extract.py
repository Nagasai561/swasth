import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
import pymupdf


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


MODEL = "gpt-5-mini"
EXTRACTION_PROMPT = """
You are expert at structured data extraction.
You are given a medical report of a user's blood test.
Extract only the meaningful information necessary for downstream tasks as required.
""".replace("\n", "")

load_dotenv()
client = OpenAI()

def encode_bytes_base64(imgbytes: bytes):
    encoded_bytes = base64.b64encode(imgbytes)
    return encoded_bytes.decode("utf-8")

def get_data_from_imgbytes(imgbytes: bytes, img_ext: str) -> Measurements | None:
    img_base64 = encode_bytes_base64(imgbytes)
    response = client.responses.parse(
        model=MODEL,
        input=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            {  # pyright: ignore[reportArgumentType]
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Extract data from this image"},
                    {
                        "type": "input_image",
                        "image_url": f"data:image/{img_ext};base64,{img_base64}",
                    },
                ],
            },
        ],
        text_format=Measurements,
    )

    return response.output_parsed

if __name__ == "__main__":
    from rich import print as rprint

    filepath = Path(sys.argv[1])
    img_ext = 'png'
    if filepath.suffix == '.pdf':
        doc = pymupdf.open(filepath)
        imgbytes_container: list[bytes] = []
        for page in doc:
            pix = page.get_pixmap()
            bytes = pix.tobytes(img_ext)
            imgbytes_container.append(bytes)

    # filepath.suffix.lower() gives us extension, prepended with '.'
    elif (img_ext := filepath.suffix.lower()[1:]) in ['jpeg', 'png', 'jpg']:
        imgbytes_container = [filepath.read_bytes()]

    else:
        print("Unsupported filetype")
        exit(1)

    extracted_data = Measurements(collection=[])
    for imgbytes in imgbytes_container:
        extracted_page_data = get_data_from_imgbytes(imgbytes, img_ext)
        if extracted_page_data is not None:
            extracted_data.collection.extend(extracted_page_data.collection)

    rprint(extracted_data)
