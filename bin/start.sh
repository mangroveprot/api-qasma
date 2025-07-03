#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ENVIRONMENT="development"

if [ "$1" == "--prod" ]; then
  ENVIRONMENT="production"
fi

echo "🔄 Checking for Docker installation..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker could not be found. Please install Docker and try again."
    exit 1
fi

echo "✅ Docker is installed."

echo "🔄 Checking for Docker Compose installation..."

# Check if Docker Compose is installed and determine which command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo "✅ Docker Compose (standalone) is installed."
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo "✅ Docker Compose (plugin) is installed."
else
    echo "❌ Docker Compose could not be found. Please install Docker Compose and try again."
    exit 1
fi

# Run the install script
echo "🔄 Running install.sh..."
bash "$PROJECT_ROOT/bin/install.sh"

# Build the base docker-compose command
DOCKER_COMPOSE_ARGS="--env-file $PROJECT_ROOT/.env"

# Use custom compose file only if in development mode
if [ "$ENVIRONMENT" = "development" ]; then
  COMPOSE_FILE="-f docker-compose.dev.yml"
else
  COMPOSE_FILE=""
fi

# Start the containers
echo "🔄 Starting Docker containers in $ENVIRONMENT mode..."
echo "🔄 Targetting $COMPOSE_FILE"
$DOCKER_COMPOSE_CMD $COMPOSE_FILE $DOCKER_COMPOSE_ARGS up --build
echo "✅ Docker containers started."