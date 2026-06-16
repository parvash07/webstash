# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

# Install dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# Copy and build the frontend source
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Java backend application
FROM eclipse-temurin:21-jdk-alpine AS backend-build

WORKDIR /app

# Copy Maven wrapper and POM related files
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make sure maven wrapper is executable
RUN chmod +x ./mvnw

# Optional: download dependencies to help cache them
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src src

# Copy the built React frontend into Spring Boot's static resources directory
# This makes Spring Boot serve the frontend at the root path "/"
COPY --from=frontend-build /app/dist/ src/main/resources/static/

# Build the application (the frontend is now bundled inside the JAR)
RUN ./mvnw clean package -DskipTests

# Stage 3: Create the minimal runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar from the build stage
COPY --from=backend-build /app/target/*.jar app.jar

# Expose port (default 8080)
EXPOSE 8080

# Run the app — serves both the React frontend and all API endpoints
ENTRYPOINT ["java", "-jar", "app.jar"]
