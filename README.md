# Qrdia
A comprehensive IoT device management system

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.7+ (for backend and CLI)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The web interface will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
python -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
python main.py
```
The API server will run on `http://localhost:8000`

### CLI Setup
```bash
cd cli
pip install -e .
provisioning-cli <interface> <command>
```