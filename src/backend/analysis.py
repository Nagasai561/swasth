from pydantic import BaseModel, Field

from llm import llm_client
from measurements import Measurements
from user_medical_info import UserMedicalInfo

class AnalysisResult(BaseModel):
    anomalies: list[str] = Field(description="List of anomalies detected in the blood test report (if any)")
    possible_causes: list[str] = Field(
        description="List of possible causes for the detected anomalies in context of the light of given user's information"
    )
    suggested_diet: list[str] = Field(
        description="List of suggested dietary changes to address the anomalies or observed conditions"
    )
    suggested_lifestyle_changes: list[str] = Field(
        description="List of suggested lifestyle changes to address the anomalies or observed conditions"
    )


MODEL = "gpt-5-mini"
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
}

ANALYSIS_PROMPT = """
You are an expert medical analyst.
You are given a user's blood test report results and the user's medical history, current medications, lifestyle, family history, and symptoms.
The user isn't a medical professional, so try to use simple language yet retain important medical terms/explanations when necessary.
"""

def analyze_blood_test_results(measurements: Measurements, user_info: UserMedicalInfo, language: str = "en") -> AnalysisResult | None:
    output_language = LANGUAGE_NAMES.get(language, "English")
    response = llm_client.responses.parse(
        model=MODEL,
        input=[
            {"role": "system", "content": f"{ANALYSIS_PROMPT}\nReturn every user-facing string in {output_language}."},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Analyze the following blood test results and user information"},
                    {"type": "input_text", "text": f"Output language: {output_language}"},
                    {"type": "input_text", "text": f"Blood Test Results:\n{measurements.model_dump_json()}"},
                    {"type": "input_text", "text": f"User Information:\n{user_info.model_dump_json()}"},
                ],
            },
        ],
        text_format=AnalysisResult,
    )
    return response.output_parsed
