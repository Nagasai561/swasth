# Backend API Documentation (Progress So Far)

This document lists the API endpoints currently exposed by the backend for frontend integration.

## Base Information

- **Framework:** FastAPI
- **Current run target:** `http://localhost:8000` (when running locally)

## Exposed Endpoints

### `POST /user_medical_info`

Creates a new in-memory user medical profile entry and returns a generated `user_id`.

**Request body**

The endpoint accepts a JSON payload matching the `UserMedicalInfo` schema.

Schema source:
- `src/backend/user_medical_info.py`
- Main model: `UserMedicalInfo`
- Nested model used directly by `UserMedicalInfo`: `LifeStyleOptions`

```json
{
  "...": "Fields defined in UserMedicalInfo"
}
```

**Response**

```json
{
  "user_id": 0
}
```

**Notes**

- Data is currently stored in-memory (`user_id_to_user` dictionary), so it resets when the server restarts.
- `user_id` is assigned incrementally based on current in-memory count.
- In the Schema which accepts a lot of hardcoded values, 'str' type is also used to handle any unexpected values. 
  The frontend should be aware of this and display 'Other' field.
  Allow users to input their own values if they select 'Other' in the dropdowns.


## Progress Summary

- 1 endpoint is currently implemented and available for integration.
- No read/update/delete endpoints are exposed yet.
