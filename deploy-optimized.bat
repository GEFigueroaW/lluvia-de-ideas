@echo off
echo 🚀 Desplegando funciones optimizadas de Firebase...
echo.
echo ⚙️ Configuraciones aplicadas:
echo   ✅ DeepSeek API Key configurada
echo   ✅ Timeouts optimizados (25 segundos)
echo   ✅ Reintentos agresivos (3 intentos)
echo   ✅ Lógica anti-plantillas activada
echo.
echo 📡 Iniciando despliegue...
firebase deploy --only functions
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ ¡Despliegue exitoso!
    echo.
    echo 🧪 PRÓXIMOS PASOS:
    echo 1. Ve a tu aplicación
    echo 2. Prueba generar copywriting
    echo 3. Verifica que ya NO aparezca "GENERADO CON TEMPLATES"
    echo 4. El contenido debe ser único y generado por IA
    echo.
) else (
    echo ❌ Error en el despliegue
    echo.
    echo 🔧 Soluciones:
    echo 1. Verificar que estés logueado: firebase login
    echo 2. Verificar proyecto: firebase use --list
    echo 3. Revisar los logs de error arriba
    echo.
)
pause
