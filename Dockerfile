FROM python:3.11-slim

WORKDIR /app

# Kerakli paketlarni o'rnatish
COPY crm/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# CRM ilovasini nusxalash
COPY crm/ .

# SQLite database papkasini yaratish
RUN mkdir -p database

# Port ochish
EXPOSE 8080

# Gunicorn bilan ishga tushirish
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--timeout", "120", "app:app"]
