# fix-dependencies.ps1
Write-Host "🔧 Fixing dependencies for Asset Management App..." -ForegroundColor Cyan

# Navigate to project
Set-Location -Path "C:\Users\ameyb\OneDrive\Desktop\Asset-Frontend\AssetManagementMobile"

# Clean up
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Update package.json with correct versions
$packageJson = @'
{
  "name": "assetmanagementmobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.0",
    "react": "18.2.0",
    "react-native": "0.73.2",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "3.29.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-vector-icons": "^10.0.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "axios": "^1.6.2",
    "react-native-qrcode-svg": "^6.3.1",
    "expo-camera": "~14.0.5",
    "expo-barcode-scanner": "~12.9.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
'@

# Write updated package.json
$packageJson | Set-Content -Path "package.json" -Force

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Dependencies fixed successfully!" -ForegroundColor Green
Write-Host "🚀 Run 'npx expo start' to start your app" -ForegroundColor Cyan