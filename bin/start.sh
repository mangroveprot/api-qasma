#!/bin/bash

# Function to check if container exists
container_exists() {
  docker ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# If containers exist, start them via Docker Compose
if container_exists "mongodb" || container_exists "redis"; then
  echo "🟢 Starting existing containers with Docker Compose..."
else
  echo "🆕 Creating containers with Docker Compose..."
fi

# Start the entire Docker Compose setup (all services and volumes)
docker compose up -d

echo "🚀 MongoDB and Redis are ready."
