@echo off
echo ========================================
echo Azure Kubernetes Service (AKS) Cluster Creation Script
echo ========================================
echo.

REM Get user input for AKS cluster configuration
set /p RESOURCE_GROUP="Enter Resource Group name: "
set /p CLUSTER_NAME="Enter AKS Cluster name: "
set /p LOCATION="Enter location/region (default: eastus): "
if "%LOCATION%"=="" set LOCATION=eastus

REM Node configuration
set /p NODE_COUNT="Enter initial node count (default: 1): "
if "%NODE_COUNT%"=="" set NODE_COUNT=1

echo.
echo Select VM size for nodes:
echo [1] Standard_B2s (2 vCPU, 4GB RAM - economical, burstable)
echo [2] Standard_D2s_v3 (2 vCPU, 8GB RAM - general purpose)
echo [3] Standard_DS2_v2 (2 vCPU, 7GB RAM - balanced)
set /p VM_SIZE_CHOICE="Enter choice [1-3] (default: 1): "
if "%VM_SIZE_CHOICE%"=="" set VM_SIZE_CHOICE=1

if "%VM_SIZE_CHOICE%"=="1" (
    set NODE_VM_SIZE=Standard_B2s
) else if "%VM_SIZE_CHOICE%"=="2" (
    set NODE_VM_SIZE=Standard_D2s_v3
) else if "%VM_SIZE_CHOICE%"=="3" (
    set NODE_VM_SIZE=Standard_DS2_v2
) else (
    set NODE_VM_SIZE=Standard_B2s
    echo Invalid choice. Using Standard_B2s.
)

REM Autoscaling configuration
set /p ENABLE_AUTOSCALER="Enable cluster autoscaler? (y/n, default: y): "
if /i "%ENABLE_AUTOSCALER%"=="" set ENABLE_AUTOSCALER=y

if /i "%ENABLE_AUTOSCALER%"=="y" (
    set /p MIN_COUNT="Enter minimum node count (default: 1): "
    if "%MIN_COUNT%"=="" set MIN_COUNT=1
    
    set /p MAX_COUNT="Enter maximum node count (default: 3): "
    if "%MAX_COUNT%"=="" set MAX_COUNT=3
    
    set AUTO_MIN=--min-count %MIN_COUNT%
    set AUTO_MAX=--max-count %MAX_COUNT%
    set AUTO_ENABLE=--enable-cluster-autoscaler
) else (
    set AUTO_MIN=
    set AUTO_MAX=
    set AUTO_ENABLE=
)

REM Network configuration
set /p NETWORK_PLUGIN="Enter network plugin (azure or kubenet, default: azure): "
if "%NETWORK_PLUGIN%"=="" set NETWORK_PLUGIN=azure

REM Tags
set /p ENV_TAG="Enter environment tag (default: demo): "
if "%ENV_TAG%"=="" set ENV_TAG=demo

set /p PROJECT_TAG="Enter project tag (default: e-shop): "
if "%PROJECT_TAG%"=="" set PROJECT_TAG=e-shop

echo.
echo ========================================
echo AKS Cluster Configuration Summary:
echo ========================================
echo Resource Group: %RESOURCE_GROUP%
echo Cluster Name: %CLUSTER_NAME%
echo Location: %LOCATION%
echo Node Count: %NODE_COUNT%
echo VM Size: %NODE_VM_SIZE%
if /i "%ENABLE_AUTOSCALER%"=="y" (
    echo Autoscaling: Enabled (Min: %MIN_COUNT%, Max: %MAX_COUNT%)
) else (
    echo Autoscaling: Disabled
)
echo Network Plugin: %NETWORK_PLUGIN%
echo Tags: environment=%ENV_TAG%, project=%PROJECT_TAG%
echo.

REM Display the az aks create command
echo The following command will be used to create the AKS cluster:
echo.

if /i "%ENABLE_AUTOSCALER%"=="y" (
    echo az aks create --resource-group %RESOURCE_GROUP% --name %CLUSTER_NAME% --node-count %NODE_COUNT% --node-vm-size %NODE_VM_SIZE% --enable-cluster-autoscaler --min-count %MIN_COUNT% --max-count %MAX_COUNT% --network-plugin %NETWORK_PLUGIN% --generate-ssh-keys --location %LOCATION% --tags environment=%ENV_TAG% project=%PROJECT_TAG%
) else (
    echo az aks create --resource-group %RESOURCE_GROUP% --name %CLUSTER_NAME% --node-count %NODE_COUNT% --node-vm-size %NODE_VM_SIZE% --network-plugin %NETWORK_PLUGIN% --generate-ssh-keys --location %LOCATION% --tags environment=%ENV_TAG% project=%PROJECT_TAG%
)
echo.

REM Ask if user wants to execute the command
set /p EXECUTE="Do you want to execute this command now? (y/n, default: n): "
if /i "%EXECUTE%"=="y" (
    echo Executing AKS cluster creation command...
    set COMMAND_SUCCESS=true

    if /i "%ENABLE_AUTOSCALER%"=="y" (
        az aks create ^
          --resource-group %RESOURCE_GROUP% ^
          --name %CLUSTER_NAME% ^
          --node-count %NODE_COUNT% ^
          --node-vm-size %NODE_VM_SIZE% ^
          %AUTO_ENABLE% ^
          %AUTO_MIN% ^
          %AUTO_MAX% ^
          --network-plugin %NETWORK_PLUGIN% ^
          --generate-ssh-keys ^
          --location %LOCATION% ^
          --tags environment=%ENV_TAG% project=%PROJECT_TAG%
    ) else (
        az aks create ^
          --resource-group %RESOURCE_GROUP% ^
          --name %CLUSTER_NAME% ^
          --node-count %NODE_COUNT% ^
          --node-vm-size %NODE_VM_SIZE% ^
          --network-plugin %NETWORK_PLUGIN% ^
          --generate-ssh-keys ^
          --location %LOCATION% ^
          --tags environment=%ENV_TAG% project=%PROJECT_TAG%
    )

    echo To configure kubectl to connect to your cluster, run:
    echo az aks get-credentials --resource-group %RESOURCE_GROUP% --name %CLUSTER_NAME%
) else (
    echo.
    echo Command not executed. You can run this script again when ready to create the cluster.
)

pause