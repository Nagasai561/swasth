## Setting up the environment for the Swasth Backend

1. Install `uv` (if not already)
2. From the repository root, run:
```bash
uv sync
cp src/backend/.env.example src/backend/.env
```
3. Fill up `src/backend/.env` (`OPENAI_API_KEY=...`)


## Code to run the backend server

From `src/backend`:

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000
```

(Note: add `--reload` for development mode)


## Curl commands to test the endpoints

1. Create user medical info (returns `user_id`):

```bash
curl -X POST "http://localhost:8000/user_medical_info" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "weight": 70,
    "height": 170,
    "sex": "Male",
    "pregnant": false,
    "existing_conditions": ["None"],
    "current_medications": ["None"],
    "lifestyle": {
      "smoking": "Never",
      "alcohol": "Occasionally",
      "exercise": "3-5 days/week",
      "diet": "Mixed",
      "sleep": "7-8 hours"
    },
    "family_history": ["None"],
    "symptoms": ["Fatigue or weakness"]
  }'
```

2. Upload report file for analysis (`user_id` from step 1):

```bash
curl -X POST "http://localhost:8000/upload_file?user_id=0" \
  -F "file=@/absolute/path/to/report.pdf"
```

Supported upload types: `.pdf`, `.jpeg`, `.jpg`, `.png`.

Response shape for `/upload_file`:

```json
{
  "analysis_result": {
    "anomalies": ["..."],
    "possible_causes": ["..."],
    "suggested_diet": ["..."],
    "suggested_lifestyle_changes": ["..."]
  },
  "measurements": {
    "collection": [
      {
        "category": "Complete Blood Count",
        "name": "Hemoglobin",
        "observed_value": 11,
        "nominal_range": {
          "lower_value": 12,
          "upper_value": 16
        },
        "unit": "g/dL",
        "concern": "Medium"
      }
    ]
  }
}
```
