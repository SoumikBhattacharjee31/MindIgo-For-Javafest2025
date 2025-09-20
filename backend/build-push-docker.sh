#!/bin/bash

servicesPath="./services"
dockerHubUsername="somikdasgupta"
dockerTag="latest"

for serviceDir in "$servicesPath"/*/; do
    serviceName=$(basename "$serviceDir")
    imageName="${dockerHubUsername}/${serviceName}:${dockerTag}"

    echo "🐳 Building Docker image for service: $serviceName"
    docker build -t "$imageName" "$serviceDir"

    echo "⬆️ Pushing Docker image to Docker Hub: $imageName"
    docker push "$imageName"
done

echo "✅ All Docker images built and pushed successfully."
