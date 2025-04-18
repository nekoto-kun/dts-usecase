@echo off
rem Batch script to build all microservices container images locally
setlocal enabledelayedexpansion

echo ===== Local Docker Image Builder =====

rem Configuration - set these variables
set /p tagVersion="Enter version tag for images (default: 'latest'): "

if "%tagVersion%"=="" (
    set tagVersion=latest
)

rem Confirm the provided values
echo.
echo You entered:
echo Tag Version: %tagVersion%
echo.

set /p confirmation="Is this information correct? (Y/N): "
if /i not "%confirmation%"=="Y" (
    echo Process cancelled. Please run the script again with correct values.
    goto :end
)

rem Check if Docker is running
echo.
echo Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Docker is not running. Please start Docker and try again.
    goto :end
)
echo Docker is running.

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

rem Build all images locally
for /l %%i in (0, 1, 3) do (
    set "service=!services[%%i]!"
    set "servicePath=!paths[%%i]!"
    set "serviceNameLower=!servicelower[%%i]!"
    
    set "imageName=!serviceNameLower!-service:%tagVersion%"
    
    echo.
    echo --- Building !service! service image ---
    
    rem Navigate to service directory
    pushd !servicePath!
    
    rem Build the Docker image
    echo Building image: !imageName!
    docker build -t !imageName! .
    if %ERRORLEVEL% neq 0 (
        echo Error building !service! image.
        popd
        goto :end
    )
    
    echo !service! image built successfully!
    
    rem Return to original directory
    popd
)

echo.
echo All images have been built locally successfully!
echo.
echo To run a container using one of these images, use:
echo docker run -d -p [HOST_PORT]:[CONTAINER_PORT] [IMAGE_NAME]
echo Example: docker run -d -p 3000:3000 frontend-service:%tagVersion%

:end
endlocal