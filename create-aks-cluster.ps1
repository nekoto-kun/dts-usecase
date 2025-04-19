# PowerShell script to create an AKS cluster
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Azure Kubernetes Service (AKS) Cluster Creation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get user input for AKS cluster configuration
$RESOURCE_GROUP = Read-Host "Enter Resource Group name"
$CLUSTER_NAME = Read-Host "Enter AKS Cluster name"
$LOCATION = Read-Host "Enter location/region (default: eastus)"
if ([string]::IsNullOrEmpty($LOCATION)) { $LOCATION = "eastus" }

# Node configuration
$NODE_COUNT = Read-Host "Enter initial node count (default: 1)"
if ([string]::IsNullOrEmpty($NODE_COUNT)) { $NODE_COUNT = 1 }

Write-Host ""
Write-Host "Select VM size for nodes:"
Write-Host "[1] Standard_B2s (2 vCPU, 4GB RAM - economical, burstable)"
Write-Host "[2] Standard_D2s_v3 (2 vCPU, 8GB RAM - general purpose)"
Write-Host "[3] Standard_DS2_v2 (2 vCPU, 7GB RAM - balanced)"
$VM_SIZE_CHOICE = Read-Host "Enter choice [1-3] (default: 1)"
if ([string]::IsNullOrEmpty($VM_SIZE_CHOICE)) { $VM_SIZE_CHOICE = 1 }

switch ($VM_SIZE_CHOICE) {
    "1" { $NODE_VM_SIZE = "Standard_B2s" }
    "2" { $NODE_VM_SIZE = "Standard_D2s_v3" }
    "3" { $NODE_VM_SIZE = "Standard_DS2_v2" }
    Default {
        $NODE_VM_SIZE = "Standard_B2s"
        Write-Host "Invalid choice. Using Standard_B2s." -ForegroundColor Yellow
    }
}

# Autoscaling configuration
$ENABLE_AUTOSCALER = Read-Host "Enable cluster autoscaler? (y/n, default: y)"
if ([string]::IsNullOrEmpty($ENABLE_AUTOSCALER)) { $ENABLE_AUTOSCALER = "y" }

if ($ENABLE_AUTOSCALER -eq "y") {
    $MIN_COUNT = Read-Host "Enter minimum node count (default: 1)"
    if ([string]::IsNullOrEmpty($MIN_COUNT)) { $MIN_COUNT = 1 }
    
    $MAX_COUNT = Read-Host "Enter maximum node count (default: 3)"
    if ([string]::IsNullOrEmpty($MAX_COUNT)) { $MAX_COUNT = 3 }
    
    $AUTO_MIN = "--min-count $MIN_COUNT"
    $AUTO_MAX = "--max-count $MAX_COUNT"
    $AUTO_ENABLE = "--enable-cluster-autoscaler"
}
else {
    $AUTO_MIN = ""
    $AUTO_MAX = ""
    $AUTO_ENABLE = ""
}

# Network configuration
$NETWORK_PLUGIN = Read-Host "Enter network plugin (azure or kubenet, default: azure)"
if ([string]::IsNullOrEmpty($NETWORK_PLUGIN)) { $NETWORK_PLUGIN = "azure" }

# Tags
$ENV_TAG = Read-Host "Enter environment tag (default: demo)"
if ([string]::IsNullOrEmpty($ENV_TAG)) { $ENV_TAG = "demo" }

$PROJECT_TAG = Read-Host "Enter project tag (default: e-shop)"
if ([string]::IsNullOrEmpty($PROJECT_TAG)) { $PROJECT_TAG = "e-shop" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AKS Cluster Configuration Summary:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resource Group: $RESOURCE_GROUP"
Write-Host "Cluster Name: $CLUSTER_NAME"
Write-Host "Location: $LOCATION"
Write-Host "Node Count: $NODE_COUNT"
Write-Host "VM Size: $NODE_VM_SIZE"

if ($ENABLE_AUTOSCALER -eq "y") {
    Write-Host "Autoscaling: Enabled (Min: $MIN_COUNT, Max: $MAX_COUNT)"
}
else {
    Write-Host "Autoscaling: Disabled"
}

Write-Host "Network Plugin: $NETWORK_PLUGIN"
Write-Host "Tags: environment=$ENV_TAG, project=$PROJECT_TAG"
Write-Host ""

# Display the az aks create command
Write-Host "The following command will be used to create the AKS cluster:" -ForegroundColor Yellow
Write-Host ""

if ($ENABLE_AUTOSCALER -eq "y") {
    Write-Host "az aks create --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --node-count $NODE_COUNT --node-vm-size $NODE_VM_SIZE --enable-cluster-autoscaler --min-count $MIN_COUNT --max-count $MAX_COUNT --network-plugin $NETWORK_PLUGIN --generate-ssh-keys --location $LOCATION --tags environment=$ENV_TAG project=$PROJECT_TAG" -ForegroundColor Yellow
}
else {
    Write-Host "az aks create --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME --node-count $NODE_COUNT --node-vm-size $NODE_VM_SIZE --network-plugin $NETWORK_PLUGIN --generate-ssh-keys --location $LOCATION --tags environment=$ENV_TAG project=$PROJECT_TAG" -ForegroundColor Yellow
}

Write-Host ""

# Ask if user wants to execute the command
$EXECUTE = Read-Host "Do you want to execute this command now? (y/n, default: n)"
if ($EXECUTE -eq "y") {
    Write-Host "Executing AKS cluster creation command..." -ForegroundColor Green

    if ($ENABLE_AUTOSCALER -eq "y") {
        $command = "az aks create " +
            "--resource-group $RESOURCE_GROUP " +
            "--name $CLUSTER_NAME " +
            "--node-count $NODE_COUNT " +
            "--node-vm-size $NODE_VM_SIZE " +
            "$AUTO_ENABLE " +
            "$AUTO_MIN " +
            "$AUTO_MAX " +
            "--network-plugin $NETWORK_PLUGIN " +
            "--generate-ssh-keys " +
            "--location $LOCATION " +
            "--tags environment=$ENV_TAG project=$PROJECT_TAG"
        
        Invoke-Expression $command
    }
    else {
        $command = "az aks create " +
            "--resource-group $RESOURCE_GROUP " +
            "--name $CLUSTER_NAME " +
            "--node-count $NODE_COUNT " +
            "--node-vm-size $NODE_VM_SIZE " +
            "--network-plugin $NETWORK_PLUGIN " +
            "--generate-ssh-keys " +
            "--location $LOCATION " +
            "--tags environment=$ENV_TAG project=$PROJECT_TAG"
        
        Invoke-Expression $command
    }

    Write-Host "To configure kubectl to connect to your cluster, run:" -ForegroundColor Cyan
    Write-Host "az aks get-credentials --resource-group $RESOURCE_GROUP --name $CLUSTER_NAME" -ForegroundColor Cyan
}
else {
    Write-Host ""
    Write-Host "Command not executed. You can run this script again when ready to create the cluster." -ForegroundColor Yellow
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")