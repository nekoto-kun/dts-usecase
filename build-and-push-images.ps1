# PowerShell script to build and push all microservices container images

Write-Host "===== Azure Container Registry Image Builder =====" -ForegroundColor Cyan

# Configuration - prompt for variables
$acrName = Read-Host "Enter your Azure Container Registry name"
$resourceGroup = Read-Host "Enter your Resource Group name"
$tagVersion = Read-Host "Enter version tag for images (default: 'latest')"

if ([string]::IsNullOrEmpty($tagVersion)) {
    $tagVersion = "latest"
}

# Confirm the provided values
Write-Host ""
Write-Host "You entered:"
Write-Host "ACR Name: $acrName"
Write-Host "Resource Group: $resourceGroup"
Write-Host "Tag Version: $tagVersion"
Write-Host ""

$confirmation = Read-Host "Is this information correct? (Y/N)"
if ($confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "Process cancelled. Please run the script again with correct values." -ForegroundColor Red
    exit
}

# Check if logged in to Azure
Write-Host ""
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    $loginStatus = az account show | ConvertFrom-Json -ErrorAction Stop
    $username = $loginStatus.user.name
    Write-Host "Currently logged in as: $username" -ForegroundColor Green
} 
catch {
    Write-Host "No active Azure login session detected." -ForegroundColor Yellow
    Write-Host "Logging in to Azure..." -ForegroundColor Yellow
    try {
        az login
    }
    catch {
        Write-Host "Failed to login to Azure. Exiting." -ForegroundColor Red
        exit
    }
}

# Login to ACR
Write-Host ""
Write-Host "Logging in to Azure Container Registry..." -ForegroundColor Yellow
try {
    az acr login --name $acrName
}
catch {
    Write-Host "Failed to login to ACR $acrName. Exiting." -ForegroundColor Red
    exit
}

# Define service directories and their lowercase names
$services = @(
    @{
        Name = "Frontend"
        Path = ".\services\frontend"
        LowerName = "frontend"
    },
    @{
        Name = "Catalog"
        Path = ".\services\catalog"
        LowerName = "catalog"
    },
    @{
        Name = "Cart"
        Path = ".\services\cart"
        LowerName = "cart"
    },
    @{
        Name = "Order"
        Path = ".\services\order"
        LowerName = "order"
    }
)

# Build and push all images
foreach ($service in $services) {
    $imageName = "$acrName.azurecr.io/$($service.LowerName)-service:$tagVersion"
    
    Write-Host ""
    Write-Host "--- Building $($service.Name) service image ---" -ForegroundColor Cyan
    
    # Navigate to service directory
    Push-Location $service.Path
    
    # Build the Docker image
    Write-Host "Building image: $imageName" -ForegroundColor Yellow
    docker build -t $imageName .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error building $($service.Name) image. Exiting." -ForegroundColor Red
        Pop-Location
        exit
    }
    
    # Push the image to ACR
    Write-Host "Pushing image: $imageName" -ForegroundColor Yellow
    docker push $imageName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error pushing $($service.Name) image to ACR. Exiting." -ForegroundColor Red
        Pop-Location
        exit
    }
    
    Write-Host "$($service.Name) image built and pushed successfully!" -ForegroundColor Green
    
    # Return to original directory
    Pop-Location
}

Write-Host ""
Write-Host "All images have been built and pushed to $acrName.azurecr.io successfully!" -ForegroundColor Green