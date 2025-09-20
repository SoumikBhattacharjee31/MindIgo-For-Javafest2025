#!/bin/bash
set -e

# List of all Docker images you want to pull
images=(
  "postgres:17-alpine"
  "mongo:latest"
  "mongo-express:latest"
  "somikdasgupta/config-server:latest"
  "somikdasgupta/signaling-server:latest"
  "somikdasgupta/eureka-server:latest"
  "somikdasgupta/auth-service:latest"
  "somikdasgupta/appointment-service:latest"
  "somikdasgupta/content-service:latest"
  "somikdasgupta/file-server:latest"
  "somikdasgupta/meeting-service:latest"
  "somikdasgupta/discussion-service:latest"
  "somikdasgupta/routine-service:latest"
  "somikdasgupta/genai-service:latest"
  "somikdasgupta/gateway-server:latest"
)

echo "🔄 Pulling all images..."
for img in "${images[@]}"; do
    echo "Pulling $img..."
    docker pull $img
done

echo "🧹 Cleaning up obsolete containers and images..."
docker container prune -f
docker image prune -af
docker volume prune -f
docker network prune -f

echo "✅ Done pulling images and pruning obsolete Docker resources."
