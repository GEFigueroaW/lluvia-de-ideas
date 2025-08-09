# 🚀 SCRIPT DE TESTING Y DEPLOY FIREBASE
# Ejecuta: emulador local, deploy a producción y verificación de vulnerabilidades

Write-Host "🔥 INICIANDO PROCESO COMPLETO FIREBASE" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan

$projectPath = "c:\Users\DANY\Desktop\lluvia-de-ideas"
Set-Location $projectPath

Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Green
Write-Host "🎯 Proyecto: brain-storm-8f0d8" -ForegroundColor Green

# PASO 1: VERIFICAR ESTADO
Write-Host "`n🔍 PASO 1: Verificando estado..." -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor White
Write-Host "npm: v$(npm --version)" -ForegroundColor White

try {
    $firebaseVersion = npx firebase --version 2>&1
    Write-Host "Firebase CLI: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verificando Firebase CLI" -ForegroundColor Red
}

# PASO 2: EMULADOR LOCAL (prueba rápida)
Write-Host "`n🧪 PASO 2: Probando emulador local..." -ForegroundColor Cyan
Write-Host "💡 Nota: El emulador se iniciará por 10 segundos para verificar que funciona" -ForegroundColor Yellow

try {
    # Iniciar emulador en background y detenerlo después de verificar
    Write-Host "Iniciando emulador..." -ForegroundColor White
    $emulatorJob = Start-Job -ScriptBlock {
        Set-Location "c:\Users\DANY\Desktop\lluvia-de-ideas"
        npx firebase emulators:start --only functions 2>&1
    }
    
    # Esperar 5 segundos
    Start-Sleep -Seconds 5
    
    # Verificar si el puerto está en uso
    $portCheck = netstat -ano | Select-String ":5001"
    if ($portCheck) {
        Write-Host "✅ Emulador iniciado correctamente en puerto 5001" -ForegroundColor Green
        Write-Host "🌐 URL local: http://localhost:5001/brain-storm-8f0d8/us-central1/api" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Emulador iniciando... (puede tomar tiempo)" -ForegroundColor Yellow
    }
    
    # Detener el job
    Stop-Job $emulatorJob -ErrorAction SilentlyContinue
    Remove-Job $emulatorJob -ErrorAction SilentlyContinue
    Write-Host "🛑 Emulador detenido para continuar con deploy" -ForegroundColor Yellow
    
} catch {
    Write-Host "⚠️  Error iniciando emulador: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Continuando con deploy..." -ForegroundColor White
}

# PASO 3: DEPLOY A PRODUCCIÓN
Write-Host "`n🚀 PASO 3: Deploy a producción..." -ForegroundColor Cyan
Write-Host "📤 Desplegando Functions..." -ForegroundColor Yellow

try {
    # Deploy functions
    Write-Host "Ejecutando: npx firebase deploy --only functions" -ForegroundColor White
    $deployResult = npx firebase deploy --only functions 2>&1
    
    if ($deployResult -like "*Deploy complete*" -or $deployResult -like "*functions:*") {
        Write-Host "✅ Functions desplegadas exitosamente" -ForegroundColor Green
        Write-Host "🌐 URL producción: https://us-central1-brain-storm-8f0d8.cloudfunctions.net/api" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Deploy en proceso o con advertencias" -ForegroundColor Yellow
        Write-Host "Resultado: $deployResult" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error en deploy: $($_.Exception.Message)" -ForegroundColor Red
}

# PASO 4: DEPLOY HOSTING
Write-Host "`n🌐 PASO 4: Deploy hosting..." -ForegroundColor Cyan

try {
    Write-Host "Ejecutando: npx firebase deploy --only hosting" -ForegroundColor White
    $hostingResult = npx firebase deploy --only hosting 2>&1
    
    if ($hostingResult -like "*Deploy complete*" -or $hostingResult -like "*hosting:*") {
        Write-Host "✅ Hosting desplegado exitosamente" -ForegroundColor Green
        Write-Host "🌐 URL sitio: https://brain-storm-8f0d8.firebaseapp.com" -ForegroundColor Blue
    } else {
        Write-Host "⚠️  Deploy hosting en proceso" -ForegroundColor Yellow
        Write-Host "Resultado: $hostingResult" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error en deploy hosting: $($_.Exception.Message)" -ForegroundColor Red
}

# PASO 5: VERIFICAR VULNERABILIDADES
Write-Host "`n🔒 PASO 5: Verificando vulnerabilidades..." -ForegroundColor Cyan

try {
    Set-Location "functions"
    Write-Host "📍 En directorio: functions" -ForegroundColor White
    
    # Audit vulnerabilidades
    Write-Host "Ejecutando: npm audit" -ForegroundColor White
    $auditResult = npm audit 2>&1
    
    Write-Host "Resultado del audit:" -ForegroundColor Yellow
    Write-Host $auditResult -ForegroundColor White
    
    # Intentar fix automático
    Write-Host "`nEjecutando: npm audit fix" -ForegroundColor White
    $fixResult = npm audit fix 2>&1
    
    Write-Host "Resultado del fix:" -ForegroundColor Yellow
    Write-Host $fixResult -ForegroundColor White
    
    Set-Location ".."
    Write-Host "✅ Verificación de vulnerabilidades completada" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error verificando vulnerabilidades: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ".." -ErrorAction SilentlyContinue
}

# PASO 6: VERIFICACIÓN FINAL
Write-Host "`n🏁 PASO 6: Verificación final..." -ForegroundColor Cyan

try {
    # Verificar logs recientes
    Write-Host "Verificando logs de functions..." -ForegroundColor White
    $logsResult = npx firebase functions:log --limit 3 2>&1
    
    Write-Host "Logs recientes:" -ForegroundColor Yellow
    Write-Host $logsResult -ForegroundColor White
    
} catch {
    Write-Host "⚠️  No se pudieron obtener logs (normal si es el primer deploy)" -ForegroundColor Yellow
}

# RESUMEN FINAL
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`n✅ URLS DE PRODUCCIÓN:" -ForegroundColor Green
Write-Host "   🌐 Sitio web: https://brain-storm-8f0d8.firebaseapp.com" -ForegroundColor Blue
Write-Host "   ⚡ Functions: https://us-central1-brain-storm-8f0d8.cloudfunctions.net/api" -ForegroundColor Blue
Write-Host "   🔧 Console: https://console.firebase.google.com/project/brain-storm-8f0d8" -ForegroundColor Blue

Write-Host "`n🧪 COMANDOS PARA TESTING LOCAL:" -ForegroundColor Green
Write-Host "   npx firebase emulators:start --only functions  # Emulador functions" -ForegroundColor White
Write-Host "   npx firebase serve --only hosting            # Hosting local" -ForegroundColor White
Write-Host "   npx firebase emulators:start                 # Todo el stack" -ForegroundColor White

Write-Host "`n📊 COMANDOS DE MONITOREO:" -ForegroundColor Green
Write-Host "   npx firebase functions:log                   # Ver logs" -ForegroundColor White
Write-Host "   npx firebase functions:log --limit 10        # Últimos 10 logs" -ForegroundColor White

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Gray
pause
