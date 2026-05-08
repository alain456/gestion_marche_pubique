#!/usr/bin/env bash

# install_node.sh – set up Node 20 via nvm and launch the frontend
# ---------------------------------------------------------------
# Exit on any error
default_opts="set -euo pipefail"
$default_opts

# 1️⃣ Install nvm (if not already present)
if command -v nvm >/dev/null 2>&1; then
  echo "nvm already installed"
else
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.409.0/install.sh | bash
fi

# Load nvm into the current shell session
export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# 2️⃣ Install Node 20 (latest LTS)
echo "Installing Node 20 (latest LTS)..."
nvm install 20
nvm use 20

# Verify the version
node -v
npm -v

# 3️⃣ Check for .env file
if [ ! -f .env ]; then
  echo "⚠️ Warning: .env file not found. Creating a default one..."
  echo "VITE_API_URL=http://localhost:5000/api" > .env
fi

# 4️⃣ Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Running npm install..."
  npm install
else
  echo "node_modules already exists, skipping install. (Use 'rm -rf node_modules' to force)"
fi

# 5️⃣ Start the Vite dev server
echo "Starting the frontend with npm run dev..."
npm run dev
