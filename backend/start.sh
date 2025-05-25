#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Initialize database
echo "Initializing database..."
node initDB.js

# Start the server
echo "Starting server..."
npm start 