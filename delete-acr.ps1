# PowerShell script to delete an Azure Container Registry

Write-Host "===== Azure Container Registry Cleanup =====" -ForegroundColor Cyan

# Configuration - prompt for variables
$acrName = Read-Host "Enter the Azure Container Registry name to delete"
$resourceGroup = Read-Host "Enter the Resource Group name containing the ACR"

# Confirm the provided values
Write-Host ""
Write-Host "You entered:"
Write-Host "ACR Name: $acrName"
Write-Host "Resource Group: $resourceGroup"
Write-Host ""

# Check if logged in to Azure
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

if ([string]::IsNullOrEmpty($acrExists)) {
    Write-Host "ACR '$acrName' does not exist or you don't have access to it." -ForegroundColor Red
    exit
}

Write-Host "ACR '$acrName' found!" -ForegroundColor Green

# Get ACR details for confirmation
$acrDetails = az acr show --name $acrName --output json | ConvertFrom-Json
Write-Host ""
Write-Host "ACR Details:" -ForegroundColor Yellow
Write-Host "  Name: $($acrDetails.name)"
Write-Host "  Resource Group: $($acrDetails.resourceGroup)"
Write-Host "  Location: $($acrDetails.location)"
Write-Host "  Creation Date: $($acrDetails.creationDate)"
Write-Host "  SKU: $($acrDetails.sku.name)"
Write-Host ""

# Show repository count if we can access them
try {
    $repos = az acr repository list --name $acrName --output json | ConvertFrom-Json
    $repoCount = $repos.Count
    if ($repoCount -gt 0) {
        Write-Host "Warning: This ACR contains $repoCount repositories." -ForegroundColor Yellow
        Write-Host "Repositories:" -ForegroundColor Yellow
        foreach ($repo in $repos) {
            Write-Host "  - $repo"
        }
        Write-Host ""
        Write-Host "All these repositories and their images will be permanently deleted!" -ForegroundColor Red
    }
    else {
        Write-Host "This ACR has no repositories." -ForegroundColor Green
    }
}
catch {
    Write-Host "Could not retrieve repository information. You may not have sufficient permissions." -ForegroundColor Yellow
}

# Final confirmation with ACR name typing for safety
Write-Host ""
Write-Host "WARNING: This operation will permanently delete the ACR and all its contents!" -ForegroundColor Red
Write-Host "This action CANNOT be undone." -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "To confirm deletion, please type the ACR name '$acrName'"

if ($confirmation -ne $acrName) {
    Write-Host "ACR name does not match. Deletion cancelled." -ForegroundColor Yellow
    exit
}

# Additional final confirmation
$finalConfirm = Read-Host "Are you ABSOLUTELY sure you want to delete this ACR and all its contents? (Y/N)"

if ($finalConfirm -ne "Y" -and $finalConfirm -ne "y") {
    Write-Host "Deletion cancelled." -ForegroundColor Yellow
    exit
}

# Delete ACR
Write-Host ""
Write-Host "Deleting ACR '$acrName'..." -ForegroundColor Yellow

try {
    az acr delete --name $acrName --resource-group $resourceGroup --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to delete ACR. Please check your permissions and try again." -ForegroundColor Red
        exit
    }
    
    Write-Host "ACR '$acrName' has been successfully deleted." -ForegroundColor Green
}
catch {
    Write-Host "An error occurred while deleting the ACR: $_" -ForegroundColor Red
    exit
}