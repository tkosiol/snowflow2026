#!/bin/sh
set -e

echo "Running Prisma db push..."
node node_modules/prisma/build/index.js db push --skip-generate
echo "Prisma db push complete."

echo "Starting server..."
exec node server.js
