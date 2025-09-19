#!/bin/bash

set -e

SERVICES_DIR="./services"

# List of services to build in order
services=(
    "appointment-service"
    "auth-service"
    "config-server"
    "content-service"
    "discussion-service"
    "eureka-server"
    "file-server"
    "gateway-server"
    "meeting-service"
    "routine-service"
)

for service in "${services[@]}"; do
    service_dir="$SERVICES_DIR/$service"
    if [ -d "$service_dir" ]; then
        echo "📦 Building: $service"
        (cd "$service_dir" && ./mvnw clean package -DskipTests)
    else
        echo "⚠️ Skipping $service (not found)"
    fi
done

echo "✅ All services built successfully."