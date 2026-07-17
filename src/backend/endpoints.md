# Backend API Documentation

This document is the frontend integration source of truth for the currently exposed backend endpoints and their request/response structures.

## Base Information

- **Framework:** FastAPI
- **Local base URL:** `http://localhost:8000`
- **Current storage behavior:** User medical info is stored in-memory (`user_id_to_user`) and is lost on server restart.

## Data Models Used by Endpoints

### `UserMedicalInfo` (JSON request body)

```json
{
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
}
```

Field types:
- `age`, `weight`, `height`: `int`
- `sex`: `"Male"` | `"Female"`
- `pregnant`: `bool`
- `existing_conditions`, `current_medications`, `family_history`, `symptoms`: `list[str]` with known options in `src/backend/user_medical_info.py` (`Literal[...] | str` allows custom values such as "Other")
- `lifestyle` object:
  - `smoking`: `"Never"` | `"Former Smoker"` | `"Occasionally"` | `"Daily"`
  - `alcohol`: `"Never"` | `"Occasionally"` | `"Weekly"` | `"Daily"`
  - `exercise`: `"None"` | `"1-2 days/week"` | `"3-5 days/week"` | `"6-7 days/week"`
  - `diet`: `"Vegetarian"` | `"Vegan"` | `"Mixed"`
  - `sleep`: `"<5 hours"` | `"5-6 hours"` | `"7-8 hours"` | `"8+ hours"`

### `AnalysisResult` (JSON response body)

Returned by `/upload_file` on success:

```json
{
  "anomalies": ["Hemoglobin slightly low"],
  "possible_causes": ["Iron deficiency", "Recent blood loss"],
  "suggested_diet": ["Increase iron-rich foods", "Add vitamin C with iron meals"],
  "suggested_lifestyle_changes": ["Improve sleep consistency", "Hydrate adequately"]
}
```

Field types:
- `anomalies`: `list[str]`
- `possible_causes`: `list[str]`
- `suggested_diet`: `list[str]`
- `suggested_lifestyle_changes`: `list[str]`

## Endpoints

### `POST /user_medical_info`

Creates a user record and returns a generated `user_id`.

**Request**
- Content-Type: `application/json`
- Body: `UserMedicalInfo`

**Success response (`200`)**
```json
{
  "user_id": 0
}
```

### `POST /upload_file`

Uploads a blood report file for a previously created `user_id`, extracts measurements, and returns AI analysis.

**Request**
- Content-Type: `multipart/form-data`
- Query parameter:
  - `user_id` (`int`, required)
- Form-data:
  - `file` (`UploadFile`, required)

Supported file MIME types:
- `image/jpeg`
- `image/png`
- `image/jpg`
- `application/pdf`

**Success response (`200`)**
- Body: `AnalysisResult` (see schema above)
- The route currently returns whatever `analyze_blood_test_results(...)` returns; if analysis parsing fails, response can be `null`.

**Error responses**
- `400`:
  - `"Unsupported file type"` (invalid MIME type)
  - `"Failed to extract data from the uploaded file"` (extractor returned no data)
- `404`:
  - `"User not found"` (missing or unknown `user_id`)

## Frontend Integration Notes

- Call `/user_medical_info` first and store returned `user_id`; `/upload_file` depends on it.
- For list-based medical history/symptom fields, frontend can offer dropdown options from backend literals and also allow custom free-text values ("Other"), because backend accepts `str` entries.
