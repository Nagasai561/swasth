from fastapi import FastAPI
from user_medical_info import UserMedicalInfo

app = FastAPI()
user_id_to_user: dict[int, UserMedicalInfo] = {}

@app.post("/user_medical_info")
def collect_user_medical_info(data: UserMedicalInfo):
    user_id = len(user_id_to_user)
    user_id_to_user[user_id] = data
    return {
        "user_id": user_id
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0", port=8000)
