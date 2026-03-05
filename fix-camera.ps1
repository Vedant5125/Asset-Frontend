# fix-camera.ps1
Write-Host "📸 Fixing Expo Camera and BarCodeScanner..." -ForegroundColor Cyan

cd C:\Users\ameyb\OneDrive\Desktop\Asset-Frontend\AssetManagementMobile

# Stop any running Expo instances
Write-Host "🛑 Stopping any running Expo processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean everything
Write-Host "🧹 Cleaning cache and node_modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Create fresh package.json with correct camera versions
Write-Host "📝 Updating package.json with correct camera versions..." -ForegroundColor Yellow

# Read current package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Update camera versions
$packageJson.dependencies.'expo-camera' = '~16.1.0'
$packageJson.dependencies.'expo-barcode-scanner' = '~14.1.0'

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Clear metro cache
Write-Host "🧹 Clearing Metro bundler cache..." -ForegroundColor Yellow
npx expo start -c