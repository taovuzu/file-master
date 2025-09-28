#!/bin/bash
set -e

echo "Initializing shared volume..."

mkdir -p /app/shared/temp/uploads
mkdir -p /app/shared/public/processed

chown -R 1000:1000 /app/shared
chmod -R 755 /app/shared

echo "Shared volume initialized successfully"
