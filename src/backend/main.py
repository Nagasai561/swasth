from fastapi import FastAPI, File, UploadFile, HTTPException
from user_medical_info import UserMedicalInfo
from extract import get_data_from_filebytes
from analysis import analyze_blood_test_results

app = FastAPI()
user_id_to_user: dict[int, UserMedicalInfo] = {}

@app.post("/user_medical_info")
def collect_user_medical_info(data: UserMedicalInfo):
    user_id = len(user_id_to_user)
    user_id_to_user[user_id] = data
    return {
        "user_id": user_id
    }

SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
MIME_TYPE_TO_EXTENSION = {
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "image/jpg": ".jpg",
    "application/pdf": ".pdf"
}

# TODO: Handle user_id in a better way, maybe through authentication or session management
@app.post("/upload_file")
def upload_file(user_id: int, file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_ext = MIME_TYPE_TO_EXTENSION[file.content_type]
    extracted_data = get_data_from_filebytes(file.file.read(), file_ext)
    if extracted_data is None:
        raise HTTPException(status_code=400, detail="Failed to extract data from the uploaded file")

    user_info = user_id_to_user.get(user_id)
    if user_info is None:
        raise HTTPException(status_code=404, detail="User not found")

    analysis = analyze_blood_test_results(extracted_data, user_info)
    return analysis


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0", port=8000)
