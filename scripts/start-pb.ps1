# PowerShell script to automate PocketBase setup and execution for Windows

$PB_VERSION = "0.22.18"
$PB_DIR = Join-Path $PSScriptRoot "..\bin\pocketbase"
$PB_EXE = Join-Path $PB_DIR "pocketbase.exe"
$ZIP_PATH = Join-Path $PSScriptRoot "..\pocketbase.zip"
$DOWNLOAD_URL = "https://github.com/pocketbase/pocketbase/releases/download/v$PB_VERSION/pocketbase_${PB_VERSION}_windows_amd64.zip"

if (-not (Test-Path $PB_EXE)) {
    Write-Host "PocketBase executable not found. Starting download of PocketBase v$PB_VERSION..." -ForegroundColor Cyan
    
    # Ensure directory exists
    if (-not (Test-Path $PB_DIR)) {
        New-Item -ItemType Directory -Path $PB_DIR -Force | Out-Null
    }
    
    # Download PocketBase ZIP
    Write-Host "Downloading from $DOWNLOAD_URL ..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $ZIP_PATH
    
    # Extract ZIP
    Write-Host "Extracting PocketBase to $PB_DIR ..." -ForegroundColor Gray
    Expand-Archive -Path $ZIP_PATH -DestinationPath $PB_DIR -Force
    
    # Clean up ZIP
    Remove-Item -Path $ZIP_PATH -Force
    
    Write-Host "PocketBase successfully installed to $PB_EXE" -ForegroundColor Green
} else {
    Write-Host "PocketBase is already installed at $PB_EXE." -ForegroundColor Green
}

# Run PocketBase
Write-Host "Starting PocketBase on http://127.0.0.1:8090 ..." -ForegroundColor Cyan
Write-Host "Use Ctrl+C to stop it." -ForegroundColor Yellow
Start-Process -FilePath $PB_EXE -ArgumentList "serve --http=127.0.0.1:8090" -NoNewWindow -Wait
