import base64
import sys
from pathlib import Path

import pymupdf
from llm import get_llm_response
from measurements import Measurements


MODEL = "gpt-5.4-mini"
EXTRACTION_PROMPT = """
You are expert at structured data extraction.
You are given a medical report of a user's blood test.
Extract only the meaningful information necessary for downstream tasks as required.
""".replace("\n", "")


def encode_bytes_base64(imgbytes: bytes):
    encoded_bytes = base64.b64encode(imgbytes)
    return encoded_bytes.decode("utf-8")


def get_data_from_imgbytes(imgbytes: bytes, img_ext: str) -> Measurements | None:
    img_base64 = encode_bytes_base64(imgbytes)
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
    response = get_llm_response(input=input, use_tools=False, text_format=Measurements, model=MODEL)
    return response

def get_data_from_filebytes(filebytes: bytes, file_ext: str) -> Measurements | None:
    if file_ext == ".pdf":
        doc = pymupdf.open(stream=filebytes, filetype="pdf")
        imgbytes_container: list[bytes] = []
        for page in doc:
            pix = page.get_pixmap()
            raw_bytes = pix.tobytes("png")
            imgbytes_container.append(raw_bytes)
    elif file_ext in [".jpeg", ".png", ".jpg"]:
        imgbytes_container = [filebytes]
    else:
        raise ValueError(f"Unsupported file extension: {file_ext}")

    extracted_data = Measurements(collection=[])
    for imgbytes in imgbytes_container:
        extracted_page_data = get_data_from_imgbytes(imgbytes, file_ext[1:])
        if extracted_page_data is not None:
            extracted_data.collection.extend(extracted_page_data.collection)

    return extracted_data


if __name__ == "__main__":
    from rich import print as rprint

    filepath = Path(sys.argv[1])
    ext = filepath.suffix.lower()
    filebytes = filepath.read_bytes()
    extracted_data = get_data_from_filebytes(filebytes, ext)
    rprint(extracted_data)
