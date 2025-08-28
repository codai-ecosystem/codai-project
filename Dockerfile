FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install -r apps/romai/requirements.txt

EXPOSE 6101 8001

CMD ["python", "-m", "uvicorn", "apps.romai.src.ml.serving.model_server:app", "--host", "0.0.0.0", "--port", "6101"]