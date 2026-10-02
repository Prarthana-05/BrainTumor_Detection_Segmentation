# NeuroScan AI

NeuroScan AI is a full-stack medical imaging application for brain tumor detection and segmentation from MRI scans. The system uses a trained TensorFlow/Keras classification model and a segmentation model to analyze uploaded brain images and return prediction results with tumor area estimates.

## What this project does

- Upload an MRI image through the web interface
- Detect whether the scan shows a tumor and classify the condition
- Predict one of these classes:
  - glioma
  - meningioma
  - no_tumor
  - pituitary
- Run tumor segmentation to isolate the tumor region
- Show image overlays and size metrics such as tumor area and diameter
- Expose the backend as a REST API for frontend integration

## Project architecture

This repository contains two main parts:

- Backend: FastAPI + TensorFlow/Keras + OpenCV
- Frontend: React + Vite + CSS

### Structure

- `backend/` — Python API server, trained models, and image processing logic
- `frontend/` — React frontend for uploading images and viewing predictions
- `backend/main.py` — API server and model loading logic
- `backend/requirements.txt` — Python dependencies
- `frontend/package.json` — frontend dependencies and scripts

## Tech stack

### Backend
- Python 3.11
- FastAPI
- Uvicorn
- TensorFlow 2.19.0
- Keras 3.13.2
- OpenCV
- NumPy

### Frontend
- React 19
- Vite
- React Router
- Framer Motion

## Prerequisites

Before starting the project, install:

- Python 3.11+
- Node.js 18+
- npm or pnpm
- Git

## Important model requirement

The backend expects these model files to exist in the `backend/` directory:

- `backend/efficientnet_clf_brisc.keras`
- `backend/resunet_seg_brisc.keras`

If those files are missing, the backend will fail when starting because the app loads them at startup.

## Run the backend

Open a terminal in the project root and run:

```bash
cd backend
python -m venv .venv
```

On Windows:

```powershell
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

On macOS/Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API server should start on:

- http://localhost:8000

## Run the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

If you prefer pnpm:

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend should run on:

- http://localhost:5173

## API endpoints

### 1) Detect tumor

Endpoint:

```http
POST /detect
```

Request:
- Form-data field named `file`
- Upload an MRI image

Response:
- predicted class
- confidence score
- class probabilities
- generated result image URL if available

### 2) Segment tumor

Endpoint:

```http
POST /segment
```

Request:
- Form-data field named `file`
- Upload an MRI image

Response:
- tumor area
- area percentage
- max diameter
- result image URL

## Example API test

### Detect example using curl

```bash
curl -X POST "http://localhost:8000/detect" -F "file=@sample.jpg"
```

### Segment example using curl

```bash
curl -X POST "http://localhost:8000/segment" -F "file=@sample.jpg"
```

## Docker setup

There is also a backend Dockerfile in `backend/Dockerfile`.

Build the image:

```bash
cd backend
docker build -t neuro-scan-api .
```

Run the container:

```bash
docker run -p 8000:8000 neuro-scan-api
```

## Troubleshooting

### Backend fails on startup

If you see an error like:

```text
ValueError: File not found: filepath=efficientnet_clf_brisc.keras
```

that means the model file is missing in the `backend/` folder. Ensure both model files are present before starting the server.

### Frontend cannot connect to backend

Check that the backend is running on port 8000 and that the frontend is calling the correct URL. The app uses `http://localhost:8000` for API requests.

### Missing dependencies

Reinstall dependencies inside each environment:

```bash
pip install -r backend/requirements.txt
npm install
```

## Notes

This project is intended for demonstration and research-oriented medical imaging workflows. For real clinical deployment, you should add:

- stronger validation and testing
- secure authentication and authorization
- proper model version control
- data privacy controls
- production deployment configuration

## License

This project does not include a specific license file in the repository. If you plan to distribute or deploy it publicly, add a proper license before release.

## Summary

NeuroScan AI is a brain MRI classification and segmentation web application built with React + FastAPI + TensorFlow. It allows users to upload medical images, classify the tumor type, and generate segmentation results for analysis.
