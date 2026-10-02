# 1. Start with a lightweight Python base
FROM python:3.11

# 2. Install system libraries for OpenCV (Required for medical imaging)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy requirements and install (This is where the 'shining' happens)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy your code and your model files
COPY main.py .
COPY efficientnet_clf_brisc.keras .
COPY resunet_seg_brisc.keras .

RUN mkdir -p static

# 6. Open port 8000 for FastAPI
EXPOSE 8000

# 7. Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]