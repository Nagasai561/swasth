FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend

COPY src/frontend/package*.json ./
RUN npm ci

COPY src/frontend/ ./
RUN npm run build

FROM python:3.13-slim AS backend-build
WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1
ENV PATH="/root/.local/bin:$PATH"

RUN pip install --no-cache-dir uv

COPY src/backend/pyproject.toml src/backend/uv.lock ./
COPY src/backend/ ./
RUN uv sync

FROM python:3.13-slim AS runtime
WORKDIR /app/backend

ENV PYTHONUNBUFFERED=1
ENV PATH="/app/backend/.venv/bin:$PATH"

COPY --from=backend-build /app/backend /app/backend
COPY --from=frontend-build /app/frontend/dist /app/backend/frontend_dist

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
