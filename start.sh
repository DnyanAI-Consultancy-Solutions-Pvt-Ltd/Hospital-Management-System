#!/bin/sh

echo "Starting Spring Boot backend..."

java -jar /app/hospital-management.jar &

echo "Starting Nginx..."

nginx -g "daemon off;"