# Court Transcript Analyzer

This project is a web application for analyzing court transcripts. It allows users to upload a transcript file and a corresponding audio file, and the application will analyze them to find potential errors.

The application is composed of three parts:
1.  A React frontend for the user interface.
2.  A Node.js server that acts as a proxy.
3.  A Python service that performs the transcript alignment and analysis.

## Running the Application

To run the application, you will need to run all three services concurrently in separate terminal windows.

### 1. Python Alignment Service

```bash
cd alignment_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
./run.sh
```

This service will run on `http://localhost:8000`.

### 2. Node.js Server (Proxy)

```bash
cd app/server
npm install
ALIGN_URL=http://localhost:8000/align npm run dev
```

This service will run on `http://localhost:8787`.

### 3. React Frontend

```bash
npm install
VITE_API_BASE=http://localhost:8787 npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use).
