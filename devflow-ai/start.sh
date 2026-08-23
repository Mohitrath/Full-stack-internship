#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
echo "Installing root tools..."
npm install --no-audit --no-fund
npm run install:all
npm run dev
