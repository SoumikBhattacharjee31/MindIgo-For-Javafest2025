$servicesPath = "./services"
$dockerHubUsername = "somikdasgupta"
$dockerTag = "latest"

Get-ChildItem -Path $servicesPath -Directory | ForEach-Object {
    $serviceDir = $_.FullName
    $serviceName = $_.Name
    $imageName = "${dockerHubUsername}/${serviceName}:$dockerTag"

    Write-Host " Building Docker image for service: $serviceName"
    docker build -t $imageName $serviceDir

    Write-Host " Pushing Docker image to Docker Hub: $imageName"
    docker push $imageName
}

Write-Host "✅ All Docker images built and pushed successfully."
