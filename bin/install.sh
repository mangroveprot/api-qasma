#!/bin/bash

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Read the environment argument (default to 'development' if not passed)
ENVIRONMENT=${1:-development}

# Main .env file used by Docker
ENV_FILE="$PROJECT_ROOT/.env"

# Source file based on environment
ENV_SOURCE_FILE="$PROJECT_ROOT/.env.$ENVIRONMENT"

# Fallback example file
ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"

echo "🔄 Setting up .env file for environment: $ENVIRONMENT"

# Check if .env.{env} exists; if not, create it from .env.example
if [ ! -f "$ENV_SOURCE_FILE" ]; then
    if [ -f "$ENV_EXAMPLE_FILE" ]; then
        cp "$ENV_EXAMPLE_FILE" "$ENV_SOURCE_FILE"
        echo "⚠️  $ENV_SOURCE_FILE not found. Created from .env.example."
    else
        echo "❌ Neither $ENV_SOURCE_FILE nor .env.example found. Cannot proceed."
        exit 1
    fi
fi

# Warn about replacing .env
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env already exists. It will be replaced with $ENV_SOURCE_FILE."
else
    echo "✅ .env file does not exist. It will be created from $ENV_SOURCE_FILE."
fi

# Copy .env.{env} to .env
cp "$ENV_SOURCE_FILE" "$ENV_FILE"
echo "✅ .env file created from $ENV_SOURCE_FILE."

# Install dependencies
echo "🔄 Installing npm dependencies..."
(cd "$PROJECT_ROOT" && npm install)
echo "✅ npm dependencies installed."
