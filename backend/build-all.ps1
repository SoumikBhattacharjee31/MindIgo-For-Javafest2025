$servicesPath = "./services"

Get-ChildItem -Path $servicesPath -Directory | ForEach-Object {
    $serviceDir = $_.FullName
    Write-Host "Building: $serviceDir"
    Push-Location $serviceDir
    ./mvnw clean package -DskipTests
    Pop-Location
}

Write-Host "✅ All services built successfully."
