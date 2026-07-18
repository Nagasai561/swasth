# medisum

Docker setup:

- build: `docker build -t medisum .`
- run: `docker run --rm -p 8000:8000 medisum`

This container serves the FastAPI backend and the built frontend from the same process on port `8000`.
