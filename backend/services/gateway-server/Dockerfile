# Use JRE instead of JDK for smaller runtime image
FROM eclipse-temurin:24-jre-alpine

# Add curl for health checks
RUN apk add --no-cache curl

# Set work directory
WORKDIR /app

# Copy the jar (update the JAR name based on your service)
COPY target/*.jar app.jar

# Expose the app port (set properly per service in compose)
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
