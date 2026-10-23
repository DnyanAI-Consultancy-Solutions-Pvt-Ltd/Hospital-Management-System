#!/bin/sh

export SERVER_PORT=8081

echo "Starting Spring Boot backend..."

java -jar /app/hospital-management.jar &

echo "Starting Nginx..."

nginx -g "daemon off;"