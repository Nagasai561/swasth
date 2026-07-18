from typing import Literal
import logging
from logging import FileHandler
from pathlib import Path
from rich.logging import RichHandler
import time

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from user_medical_info import UserMedicalInfo
from extract import get_data_from_filebytes, Measurements
from analysis import analyze_blood_test_results, AnalysisResult
from pydantic import BaseModel
from user_info_db import (
    create_user_medical_info,
    get_user_medical_info_by_id,
    init_user_info_db,
    update_user_medical_info_by_id,
)

app = FastAPI()

logfile = Path(".").parent / "runtime_files" / "app.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[RichHandler(), FileHandler(logfile, mode='w')]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_user_info_db()

@app.post("/create_user_medical_info")
def collect_user_medical_info(data: UserMedicalInfo):
    logging.info("Received user medical info: %s", data)
    start = time.perf_counter()
    user_id = create_user_medical_info(data)
    end = time.perf_counter()

    logging.info("Created user_id: %d medical record in database in %.1f seconds", user_id, end - start)

    return {
        "user_id": user_id
    }


@app.put("/update_user_medical_info/{user_id}")
def update_user_medical_info(user_id: int, data: UserMedicalInfo):
    logging.info("Updating user medical info for user_id: %d with data: %s", user_id, data)

    start = time.perf_counter()
    updated = update_user_medical_info_by_id(user_id, data)
    end = time.perf_counter()

    logging.info("Update operation for user_id: %d was %s in %.1f", user_id, "successful" if updated else "unsuccessful", end - start)

    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id}

SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
MIME_TYPE_TO_EXTENSION = {
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "image/jpg": ".jpg",
    "application/pdf": ".pdf"
}

class UploadFileResponse(BaseModel):
    analysis_result: AnalysisResult
    measurements: Measurements

# TODO: Handle user_id in a better way, maybe through authentication or session management
@app.post("/upload_file")
def upload_file(user_id: int, lang: Literal["en", "hi", "te"] = "en", file: UploadFile = File(...)):
    logging.info("Received file upload request for user_id: %d with language: %s and file: %s", user_id, lang, file.filename)

    start = time.perf_counter()
    if file.content_type not in SUPPORTED_MIME_TYPES:
        logging.info("Unsupported file type: %s", file.content_type)
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_ext = MIME_TYPE_TO_EXTENSION[file.content_type]
    extracted_data = get_data_from_filebytes(file.file.read(), file_ext)
    if extracted_data is None:
        logging.info("Failed to extract data from the uploaded file: %s", file.filename)
        raise HTTPException(status_code=400, detail="Failed to extract data from the uploaded file")

    user_info = get_user_medical_info_by_id(user_id)
    if user_info is None:
        logging.info("User not found for user_id: %d", user_id)
        raise HTTPException(status_code=404, detail="User not found")

    analysis = analyze_blood_test_results(extracted_data, user_info, lang)
    if analysis is None:
        raise HTTPException(status_code=500, detail="Failed to analyze the extracted data")

    end = time.perf_counter()

    logging.info("File upload and analysis completed for user_id: %d in %.1f seconds", user_id, end - start)
    return UploadFileResponse(analysis_result=analysis, measurements=extracted_data)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
