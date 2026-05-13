#!/bin/bash
set -e

echo "Deploying VidyaPath Backend to AWS EC2..."

# 1. Pull latest code from GitHub
echo "Pulling latest code..."
git pull origin main

# 2. Setup and activate Virtual Environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

# 3. Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# 4. Run database migrations (Alembic)
# Ensure alembic upgrade works correctly. Since we use SQLite, it will just verify/create tables in the volume.
echo "Running database migrations..."
alembic upgrade head

# 5. Restart the Systemd Service
echo "Restarting Vidyapath Systemd Service..."
sudo systemctl restart vidyapath.service

echo "Deployment completed successfully! ✅"
