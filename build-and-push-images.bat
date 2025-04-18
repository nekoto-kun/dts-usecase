@echo off
rem Batch script to build and push all microservices container images
setlocal enabledelayedexpansion

echo ===== Azure Container Registry Image Builder =====

rem Configuration - set these variables
set /p acrName="Enter your Azure Container Registry name: "
set /p resourceGroup="Enter your Resource Group name: "
set /p tagVersion="Enter version tag for images (default: 'latest'): "

if "%tagVersion%"=="" (
    set tagVersion=latest
)

rem Confirm the provided values
echo.
echo You entered:
echo ACR Name: %acrName%
echo Resource Group: %resourceGroup%
echo Tag Version: %tagVersion%
echo.

set /p confirmation="Is this information correct? (Y/N): "
if /i not "%confirmation%"=="Y" (
    echo Process cancelled. Please run the script again with correct values.
    goto :end
)

rem Check if logged in to Azure
echo.
echo Checking Azure login status...
az account show >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo No active Azure login session detected.
    echo Logging in to Azure...
    az login
    if %ERRORLEVEL% neq 0 (
        echo Failed to login to Azure. Exiting.
        goto :end
    )
) else (
    for /f "tokens=* usebackq" %%a in (`az account show --query "user.name" -o tsv`) do (
        set username=%%a
    )
    echo Currently logged in as: !username!
)

rem Login to ACR
echo.
echo Logging in to Azure Container Registry...
az acr login --name %acrName%
if %ERRORLEVEL% neq 0 (
    echo Failed to login to ACR %acrName%. Exiting.
    goto :end
)

rem Define service directories and their lowercase names
set "services[0]=Frontend"
set "paths[0]=.\services\frontend"
set "servicelower[0]=frontend"

set "services[1]=Catalog"
set "paths[1]=.\services\catalog"
set "servicelower[1]=catalog"

set "services[2]=Cart"
set "paths[2]=.\services\cart"
set "servicelower[2]=cart"

set "services[3]=Order"
set "paths[3]=.\services\order"
set "servicelower[3]=order"

rem Build and push all images
for /l %%i in (0, 1, 3) do (
    set "service=!services[%%i]!"
    set "servicePath=!paths[%%i]!"
    set "serviceNameLower=!servicelower[%%i]!"
    
    set "imageName=%acrName%.azurecr.io/!serviceNameLower!-service:%tagVersion%"
    
    echo.
    echo --- Building !service! service image ---
    
    rem Navigate to service directory
    pushd !servicePath!
    
    rem Build the Docker image
    echo Building image: !imageName!
    docker build -t !imageName! .
    if %ERRORLEVEL% neq 0 (
        echo Error building !service! image. Exiting.
        popd
        goto :end
    )
    
    rem Push the image to ACR
    echo Pushing image: !imageName!
    docker push !imageName!
    if %ERRORLEVEL% neq 0 (
        echo Error pushing !service! image to ACR. Exiting.
        popd
        goto :end
    )
    
    echo !service! image built and pushed successfully!
    
    rem Return to original directory
    popd
)

echo.
echo All images have been built and pushed to %acrName%.azurecr.io successfully!

:end
endlocal