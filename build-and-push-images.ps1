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

# Check if ACR exists
Write-Host ""
Write-Host "Checking if ACR '$acrName' exists..." -ForegroundColor Yellow
$acrExists = $null
try {
    $acrExists = az acr show --name $acrName --query id --output tsv 2>$null
}
catch {
    # Error will be handled below, no action needed here
}

# If ACR doesn't exist, prompt to create it
if ([string]::IsNullOrEmpty($acrExists)) {
    Write-Host "ACR '$acrName' does not exist." -ForegroundColor Yellow
    $createAcr = Read-Host "Would you like to create this ACR? (Y/N)"
    
    if ($createAcr -eq "Y" -or $createAcr -eq "y") {
        # Check if resource group exists
        $rgExists = $null
        try {
            $rgExists = az group show --name $resourceGroup --query id --output tsv 2>$null
        }
        catch {
            # Error will be handled below, no action needed here
        }
        
        # Create resource group if it doesn't exist
        if ([string]::IsNullOrEmpty($rgExists)) {
            Write-Host "Resource Group '$resourceGroup' does not exist." -ForegroundColor Yellow
            $location = Read-Host "Enter the location for the Resource Group (e.g., eastus, westeurope)"
            
            Write-Host "Creating Resource Group '$resourceGroup' in location '$location'..." -ForegroundColor Yellow
            az group create --name $resourceGroup --location $location
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Failed to create Resource Group. Exiting." -ForegroundColor Red
                exit
            }
            Write-Host "Resource Group created successfully!" -ForegroundColor Green
        }
        
        # Prompt for ACR SKU
        Write-Host ""
        Write-Host "Available ACR SKUs:" -ForegroundColor Yellow
        Write-Host "  Basic - Optimized for cost (recommended for development)"
        Write-Host "  Standard - Enhanced throughput for most production applications"
        Write-Host "  Premium - Higher throughput and advanced features"
        $acrSku = Read-Host "Select ACR SKU (Basic/Standard/Premium) [Default: Basic]"
        
        if ([string]::IsNullOrEmpty($acrSku)) {
            $acrSku = "Basic"
        }
        
        # Create ACR
        Write-Host "Creating Azure Container Registry '$acrName'..." -ForegroundColor Yellow
        az acr create --name $acrName --resource-group $resourceGroup --sku $acrSku --admin-enabled false
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to create ACR. Exiting." -ForegroundColor Red
            exit
        }
        Write-Host "ACR '$acrName' created successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "ACR creation skipped. Exiting as ACR is required for this script." -ForegroundColor Red
        exit
    }
}
else {
    Write-Host "ACR '$acrName' found!" -ForegroundColor Green
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