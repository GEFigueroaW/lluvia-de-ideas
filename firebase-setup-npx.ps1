# 🔥 SCRIPT ALTERNATIVO FIREBASE CLI CON NPX
# Para casos donde firebase no está en PATH

Write-Host "🔥 INICIANDO CONFIGURACIÓN FIREBASE CON NPX" -ForegroundColor Yellow

# Verificar instalación
Write-Host "`n✅ Verificando instalación..." -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor Green
Write-Host "npm: v$(npm --version)" -ForegroundColor Green

# Verificar Firebase Tools
try {
    $firebaseVersion = npm list -g firebase-tools 2>$null | Select-String "firebase-tools"
    Write-Host "Firebase Tools: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase Tools no encontrado" -ForegroundColor Red
}

# Función para ejecutar Firebase con npx
function Invoke-Firebase {
    param([string]$Command)
    Write-Host "🔥 Ejecutando: npx firebase $Command" -ForegroundColor Yellow
    npx firebase $Command
}

# Navegar al proyecto
$projectPath = "c:\Users\DANY\Desktop\lluvia-de-ideas"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "📁 En directorio: $projectPath" -ForegroundColor Green
} else {
    Write-Host "❌ Directorio no encontrado: $projectPath" -ForegroundColor Red
    exit 1
}

# Verificar Firebase CLI con npx
Write-Host "`n🔍 Verificando Firebase CLI..." -ForegroundColor Cyan
try {
    Write-Host "Versión de Firebase CLI:" -ForegroundColor Yellow
    Invoke-Firebase "--version"
} catch {
    Write-Host "❌ Error verificando Firebase CLI" -ForegroundColor Red
}

# Autenticación
Write-Host "`n🔑 Iniciando autenticación..." -ForegroundColor Cyan
Write-Host "🌐 Se abrirá el navegador para login..." -ForegroundColor Yellow
Write-Host "📧 Usa la cuenta: eugenfw@gmail.com" -ForegroundColor Blue

try {
    Invoke-Firebase "login"
    Write-Host "✅ Autenticación completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en autenticación" -ForegroundColor Red
    Write-Host "💡 Intenta manualmente: npx firebase login" -ForegroundColor Yellow
}

# Configurar proyecto
Write-Host "`n🎯 Configurando proyecto..." -ForegroundColor Cyan
try {
    Write-Host "Proyectos disponibles:" -ForegroundColor Yellow
    Invoke-Firebase "projects:list"
    
    Write-Host "`nConfigurando proyecto brain-storm-8f0d8..." -ForegroundColor Yellow
    Invoke-Firebase "use brain-storm-8f0d8"
    
    Write-Host "`nVerificando configuración:" -ForegroundColor Yellow
    Invoke-Firebase "list"
    
    Write-Host "✅ Proyecto configurado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando proyecto" -ForegroundColor Red
}

# Instalar dependencias de functions
Write-Host "`n📦 Instalando dependencias de functions..." -ForegroundColor Cyan
if (Test-Path "functions") {
    Set-Location "functions"
    npm install
    Set-Location ".."
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Carpeta functions no encontrada" -ForegroundColor Yellow
}

# Comandos disponibles
Write-Host "`n" + "=" * 50 -ForegroundColor Cyan
Write-Host "🎉 CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Cyan

Write-Host "`n✅ COMANDOS DISPONIBLES (usar npx):" -ForegroundColor Green
Write-Host "   npx firebase --version         # Verificar versión" -ForegroundColor White
Write-Host "   npx firebase projects:list     # Listar proyectos" -ForegroundColor White
Write-Host "   npx firebase emulators:start   # Emulador local" -ForegroundColor White
Write-Host "   npx firebase deploy            # Deploy a producción" -ForegroundColor White
Write-Host "   npx firebase functions:log     # Ver logs" -ForegroundColor White

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Green
Write-Host "   1. npx firebase emulators:start     # Probar localmente" -ForegroundColor White
Write-Host "   2. npx firebase deploy --only functions # Deploy functions" -ForegroundColor White
Write-Host "   3. npx firebase deploy --only hosting  # Deploy hosting" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Gray
pause
