# 🔥 SCRIPT DE INSTALACIÓN AUTOMÁTICA - FIREBASE CLI
# Ejecutar como Administrador en PowerShell

Write-Host "🔥 INICIANDO INSTALACIÓN AUTOMÁTICA DE FIREBASE CLI" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

# Verificar si se ejecuta como administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "💡 Solución: Clic derecho en PowerShell > 'Ejecutar como administrador'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Ejecutándose como Administrador" -ForegroundColor Green

# Función para verificar si un comando existe
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Paso 1: Verificar/Instalar Node.js
Write-Host "`n📦 PASO 1: Verificando Node.js..." -ForegroundColor Cyan

if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    
    # Verificar si es versión 18+
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Host "⚠️  Versión de Node.js muy antigua. Se recomienda Node.js 18+" -ForegroundColor Yellow
        Write-Host "🔗 Descargar desde: https://nodejs.org" -ForegroundColor Blue
    }
} else {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    Write-Host "📥 Descargando Node.js LTS..." -ForegroundColor Yellow
    
    # Detectar arquitectura
    $arch = if ([Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
    $nodeUrl = "https://nodejs.org/dist/latest-v18.x/node-v18.19.0-win-$arch.msi"
    $nodeFile = "$env:TEMP\nodejs.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeFile
        Write-Host "✅ Descarga completada" -ForegroundColor Green
        Write-Host "🚀 Iniciando instalación..." -ForegroundColor Yellow
        Start-Process -FilePath $nodeFile -Wait
        Write-Host "✅ Node.js instalado. Reiniciando PowerShell..." -ForegroundColor Green
        Write-Host "⚠️  REINICIA POWERSHELL Y EJECUTA ESTE SCRIPT NUEVAMENTE" -ForegroundColor Red
        pause
        exit 0
    }
    catch {
        Write-Host "❌ Error descargando Node.js: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔗 Descarga manual desde: https://nodejs.org" -ForegroundColor Blue
        pause
        exit 1
    }
}

# Paso 2: Verificar/Instalar npm
Write-Host "`n📦 PASO 2: Verificando npm..." -ForegroundColor Cyan

if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm no encontrado (debería venir con Node.js)" -ForegroundColor Red
    Write-Host "🔄 Reinstala Node.js desde https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

# Paso 3: Instalar Firebase CLI
Write-Host "`n🔥 PASO 3: Instalando Firebase CLI..." -ForegroundColor Cyan

if (Test-Command "firebase") {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI ya instalado: $firebaseVersion" -ForegroundColor Green
    Write-Host "🔄 Actualizando a la última versión..." -ForegroundColor Yellow
    npm update -g firebase-tools
} else {
    Write-Host "📥 Instalando Firebase CLI..." -ForegroundColor Yellow
    try {
        npm install -g firebase-tools
        Write-Host "✅ Firebase CLI instalado exitosamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error instalando Firebase CLI: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔄 Intentando con cache limpio..." -ForegroundColor Yellow
        npm cache clean --force
        npm install -g firebase-tools
    }
}

# Paso 4: Verificar instalación
Write-Host "`n✅ PASO 4: Verificando instalación..." -ForegroundColor Cyan

Write-Host "Node.js: " -NoNewline
if (Test-Command "node") {
    Write-Host "$(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ No disponible" -ForegroundColor Red
}

Write-Host "npm: " -NoNewline
if (Test-Command "npm") {
    Write-Host "v$(npm --version)" -ForegroundColor Green
} else {
    Write-Host "❌ No disponible" -ForegroundColor Red
}

Write-Host "Firebase CLI: " -NoNewline
if (Test-Command "firebase") {
    Write-Host "$(firebase --version)" -ForegroundColor Green
} else {
    Write-Host "❌ No disponible" -ForegroundColor Red
}

# Paso 5: Configurar proyecto
Write-Host "`n🚀 PASO 5: Configurando proyecto..." -ForegroundColor Cyan

$projectPath = "c:\Users\DANY\Desktop\lluvia-de-ideas"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "📁 Navegando a: $projectPath" -ForegroundColor Green
    
    # Verificar firebase.json
    if (Test-Path "firebase.json") {
        Write-Host "✅ firebase.json encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ firebase.json no encontrado" -ForegroundColor Red
    }
    
    # Verificar carpeta functions
    if (Test-Path "functions") {
        Write-Host "✅ Carpeta functions encontrada" -ForegroundColor Green
        
        # Instalar dependencias de functions
        if (Test-Path "functions\package.json") {
            Write-Host "📦 Instalando dependencias de functions..." -ForegroundColor Yellow
            Set-Location "functions"
            npm install
            Set-Location ".."
            Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Carpeta functions no encontrada" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Proyecto no encontrado en: $projectPath" -ForegroundColor Red
}

# Paso 6: Login Firebase
Write-Host "`n🔑 PASO 6: Configurando autenticación..." -ForegroundColor Cyan
Write-Host "🌐 Se abrirá el navegador para autenticación..." -ForegroundColor Yellow
Write-Host "📧 Usa la cuenta: eugenfw@gmail.com" -ForegroundColor Blue

try {
    firebase login
    Write-Host "✅ Autenticación completada" -ForegroundColor Green
    
    # Listar proyectos
    Write-Host "`n📋 Proyectos disponibles:" -ForegroundColor Cyan
    firebase projects:list
    
    # Configurar proyecto
    Write-Host "`n🎯 Configurando proyecto brain-storm-8f0d8..." -ForegroundColor Yellow
    firebase use brain-storm-8f0d8
    Write-Host "✅ Proyecto configurado" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error en autenticación: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Ejecuta manualmente: firebase login" -ForegroundColor Yellow
}

# Paso 7: Test rápido
Write-Host "`n🧪 PASO 7: Test rápido..." -ForegroundColor Cyan

try {
    Write-Host "🔍 Verificando configuración del proyecto..." -ForegroundColor Yellow
    firebase list
    Write-Host "✅ Configuración OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Configuración pendiente" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n✅ COMANDOS DISPONIBLES:" -ForegroundColor Green
Write-Host "   firebase --version          # Verificar versión" -ForegroundColor White
Write-Host "   firebase login              # Autenticación" -ForegroundColor White
Write-Host "   firebase projects:list      # Listar proyectos" -ForegroundColor White
Write-Host "   firebase use PROJECT_ID     # Seleccionar proyecto" -ForegroundColor White
Write-Host "   firebase emulators:start    # Emulador local" -ForegroundColor White
Write-Host "   firebase deploy             # Deploy a producción" -ForegroundColor White

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Green
Write-Host "   1. firebase emulators:start      # Probar localmente" -ForegroundColor White
Write-Host "   2. firebase deploy --only functions  # Deploy functions" -ForegroundColor White
Write-Host "   3. firebase deploy --only hosting   # Deploy hosting" -ForegroundColor White

Write-Host "`n📖 DOCUMENTACIÓN:" -ForegroundColor Blue
Write-Host "   Ver: FIREBASE_CLI_DIAGNOSTICO.md para más detalles" -ForegroundColor White

Write-Host "`n💡 SOPORTE:" -ForegroundColor Yellow
Write-Host "   Si hay problemas, verifica que PowerShell esté ejecutándose como Administrador" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Gray
pause
