# Swasth

Swasth is an AI-assisted medical report analysis platform. The goal of the project is to help users upload blood test reports, combine that report with their medical history, and receive structured, easy-to-understand guidance about possible anomalies, likely causes, and practical diet and lifestyle suggestions.

The system is designed as a decision-support tool, not a replacement for a doctor. We also discussed the project with real doctors, and they told us the results are helpful and clinically useful as a first-pass interpretation aid.

## What It Does

- Accepts user medical details such as age, symptoms, lifestyle, and family history.
- Accepts uploaded blood reports in `PDF`, `JPG`, `JPEG`, or `PNG` format.
- Extracts measurements from the report.
- Cross-checks the report with user context and a clinical reference corpus.
- Returns structured analysis in a simple UI, including anomalies, possible causes, and suggestions.
- Supports multilingual output in English, Hindi, and Telugu.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- i18next / react-i18next
- Recharts
- Lucide React

### Backend

- FastAPI
- Python 3.13
- Uvicorn
- Pydantic
- OpenAI SDK
- PyMuPDF
- python-multipart
- Requests
- BeautifulSoup4
- Pinecone

## Architecture

The project uses a split frontend/backend architecture:

1. The React frontend collects user information, handles report uploads, and renders the results.
2. The FastAPI backend exposes the API, stores user medical information, and serves the built frontend in production.
3. The extraction layer converts uploaded report files into structured measurements.
4. The analysis layer combines the extracted measurements with the user profile and produces a final medical interpretation.
5. The RAG layer uses a curated blood-test corpus so the model can ground its output in reference material before generating recommendations.

## Analysis Pipeline

The backend follows this flow:

1. User creates or updates their medical profile.
2. User uploads a blood report.
3. The backend validates the file type and extracts report data.
4. PDFs are split into page images; image files are sent directly for extraction.
5. The extracted measurements are normalized into a structured schema.
6. The backend loads the user medical profile from the database.
7. The LLM produces a structured `AnalysisResult` with anomalies, possible causes, diet suggestions, and lifestyle suggestions.
8. For medically relevant questions, the LLM can call a RAG retrieval tool that searches the indexed blood-test corpus.
9. The final response is returned to the frontend and displayed in a user-friendly format.

## Key Backend Features

- `POST /create_user_medical_info`
- `PUT /update_user_medical_info/{user_id}`
- `POST /upload_file`
- Language selection through the `lang` query parameter
- Support for report parsing and structured analysis
- Frontend static file serving from the same FastAPI process in production

## Local Setup

### Backend

```bash
cd src/backend
uv sync
uv run python3 -O -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Set `OPENAI_API_KEY` in your environment or in the backend `.env` file before running the server.

### Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Create a `.env` file in `src/frontend` with:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Docker

Build and run the combined app:

```bash
docker build -t swasth .
docker run --rm -p 8000:8000 swasth
```

The container serves the FastAPI backend and the built frontend from the same process on port `8000`.

## Notes

- Supported upload types: `.pdf`, `.jpeg`, `.jpg`, `.png`
- Language support: `en`, `hi`, `te`
- The app is intended to assist interpretation, not provide a definitive diagnosis
