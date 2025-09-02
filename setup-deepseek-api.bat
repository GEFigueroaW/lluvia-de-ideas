@echo off
REM =========================================
REM CONFIGURACIÓN DE DEEPSEEK API KEY
REM =========================================

echo 🔧 Configurando DeepSeek API Key para Firebase Functions...
echo.

REM ⚠️ IMPORTANTE: Reemplaza TU_API_KEY_AQUI con tu API key real de DeepSeek
REM Puedes obtener una gratis en: https://platform.deepseek.com/api_keys

echo 📝 PASO 1: Configurar DeepSeek API Key
echo.
echo ⚠️  ANTES DE CONTINUAR:
echo    1. Ve a https://platform.deepseek.com/api_keys
echo    2. Crea una cuenta gratuita
echo    3. Genera tu API Key (empieza con 'sk-')
echo    4. Reemplaza 'TU_API_KEY_AQUI' en el siguiente comando:
echo.

REM MÉTODO 1: Configurar con Firebase CLI (RECOMENDADO)
echo 💻 Ejecuta este comando (reemplaza TU_API_KEY_AQUI):
echo firebase functions:config:set deepseek.key="TU_API_KEY_AQUI"
echo.

REM MÉTODO 2: También crear archivo .env local
echo 📝 PASO 2: Crear archivo .env local
echo DEEPSEEK_API_KEY=TU_API_KEY_AQUI > .env.local
echo.

echo ✅ Archivo .env.local creado
echo.
echo 🚀 PRÓXIMOS PASOS:
echo 1. Ejecuta el comando firebase functions:config:set con tu API key real
echo 2. Ejecuta: firebase deploy --only functions
echo 3. Prueba la generación de copywriting
echo.
echo 📚 Para obtener API key gratuita:
echo    https://platform.deepseek.com/api_keys
echo.
echo 💡 Ejemplo de API key válida: sk-1234567890abcdef...
echo.

pause
