# PowerShell script to delete an AKS cluster
Write-Host "========================================" -ForegroundColor Red
Write-Host "Azure Kubernetes Service (AKS) Cluster Deletion Script" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check Azure login status
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

# Get user input for AKS cluster to delete
Write-Host ""
$RESOURCE_GROUP = Read-Host "Enter Resource Group name containing the AKS cluster"
$CLUSTER_NAME = Read-Host "Enter AKS Cluster name to delete"

# List available clusters
Write-Host ""
Write-Host "Checking if cluster exists..." -ForegroundColor Yellow
try {
    $clusterExists = az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --output none 2>$null
    if ($?) {
        Write-Host "Cluster '$CLUSTER_NAME' found in resource group '$RESOURCE_GROUP'" -ForegroundColor Green
        
        # Show cluster details
        Write-Host ""
        Write-Host "Cluster details:" -ForegroundColor Cyan
        $clusterDetails = az aks show --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME | ConvertFrom-Json
        Write-Host "Name: $($clusterDetails.name)"
        Write-Host "Location: $($clusterDetails.location)"
        Write-Host "Kubernetes version: $($clusterDetails.kubernetesVersion)"
        Write-Host "Node count: $($clusterDetails.agentPoolProfiles[0].count)"
        Write-Host "VM size: $($clusterDetails.agentPoolProfiles[0].vmSize)"
        
        # Confirm deletion
        Write-Host ""
        Write-Host "WARNING! This action will delete the AKS cluster and is irreversible!" -ForegroundColor Red
        $confirmation = Read-Host "Are you sure you want to delete this cluster? Type 'DELETE' to confirm"
        
        if ($confirmation -eq "DELETE") {
            Write-Host ""
            Write-Host "Deleting AKS cluster '$CLUSTER_NAME'..." -ForegroundColor Yellow
            
            # Delete the AKS cluster
            az aks delete --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --yes
            
            Write-Host "AKS cluster deletion initiated. This process may take several minutes." -ForegroundColor Green
            
            # Ask if user wants to delete the resource group as well
            $DELETE_RG = Read-Host "Do you also want to delete the resource group '$RESOURCE_GROUP'? (y/n, default: n)"
            
            if ($DELETE_RG -eq "y") {
                Write-Host "Deleting resource group '$RESOURCE_GROUP'..." -ForegroundColor Yellow
                az group delete --name $RESOURCE_GROUP --yes
                Write-Host "Resource group deletion initiated. This process may take several minutes." -ForegroundColor Green
            }
        }
        else {
            Write-Host "Cluster deletion cancelled." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Cluster '$CLUSTER_NAME' not found in resource group '$RESOURCE_GROUP'" -ForegroundColor Red
        
        # List available clusters
        Write-Host ""
        Write-Host "Available clusters:" -ForegroundColor Cyan
        az aks list --output table
    }
}
catch {
    Write-Host "Error checking cluster: $_" -ForegroundColor Red
    
    # List available clusters
    Write-Host ""
    Write-Host "Available clusters:" -ForegroundColor Cyan
    az aks list --output table
}

Write-Host ""
Write-Host "Script completed. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")