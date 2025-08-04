#!/bin/bash

set -e

SERVICES_DIR="./services"

for dir in "$SERVICES_DIR"/*; do
  if [ -d "$dir" ]; then
    echo "Building: $dir"
    (cd "$dir" && ./mvnw clean package -DskipTests)
  fi
done

echo "✅ All services built successfully."
