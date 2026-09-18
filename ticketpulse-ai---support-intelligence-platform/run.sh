#!/bin/bash
set -e

echo "=========================================================="
echo " DOTMappers IT Pvt. Ltd. - AI Engineer Assessment Sprint "
echo " TicketPulse AI - Support Intelligence & Anomaly Engine    "
echo "=========================================================="

if command -v python3 &>/dev/null && [ -f "requirements.txt" ]; then
  echo "Found Python environment. Starting Python FastAPI backend on port 8000..."
  pip install -q -r requirements.txt 2>/dev/null || true
  uvicorn main:app --host 0.0.0.0 --port 8000
elif command -v npm &>/dev/null; then
  echo "Starting Node.js / Express + Vite full-stack server on port 3000..."
  npm run dev
else
  echo "No suitable runtime found. Please install Python 3.10+ or Node.js 18+."
  exit 1
fi
