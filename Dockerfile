# =========================
# Stage 1 - Build React
# =========================
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY hospital-frontend/package*.json ./

RUN npm install

COPY hospital-frontend/ ./

RUN npm run build


# =========================
# Stage 2 - Build Spring Boot
# =========================
FROM maven:3.9-eclipse-temurin-17 AS backend-build

WORKDIR /backend

COPY hospital-management/pom.xml ./

RUN mvn dependency:go-offline -B

COPY hospital-management/ ./

RUN mvn clean package -DskipTests


# =========================
# Stage 3 - Final Image
# =========================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install nginx
RUN apt-get update \
    && apt-get install -y nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy React build
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Copy Spring Boot JAR
COPY --from=backend-build /backend/target/*.jar /app/hospital-management.jar

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

# Hugging Face Spaces port
EXPOSE 7860

CMD ["/app/start.sh"]