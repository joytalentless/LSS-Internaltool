#!/bin/bash

echo "Starting npm install reactstrap..."
npm i reactstrap --legacy-peer-deps 2>&1
echo "Completed npm install reactstrap."

echo "Starting npm install with force..."
npm install --force 2>&1
echo "Completed npm install with force."

# echo "Starting npm run build..."
# NODE_OPTIONS="--max-old-space-size=2048" npm run build 2>&1
# echo "Completed npm run build."
