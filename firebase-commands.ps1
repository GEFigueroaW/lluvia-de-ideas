# 🔥 COMANDOS RÁPIDOS FIREBASE - lluvia-de-ideas
# Copia y pega estos comandos en PowerShell

# ==========================================
# 🚀 COMANDOS DE SETUP INICIAL
# ==========================================

# Navegar al proyecto
cd "c:\Users\DANY\Desktop\lluvia-de-ideas"

# Verificar versiones
node --version
npm --version
firebase --version

# Login Firebase (abre navegador)
firebase login

# Seleccionar proyecto
firebase use brain-storm-8f0d8

# Verificar configuración
firebase list

# ==========================================
# 🧪 COMANDOS DE DESARROLLO/TESTING
# ==========================================

# Instalar dependencias de functions
cd functions
npm install
cd ..

# Iniciar emulador completo
firebase emulators:start

# Solo emulador de functions
firebase emulators:start --only functions

# Solo emulador de hosting
firebase emulators:start --only hosting

# Emulador con datos importados
firebase emulators:start --import=./emulator-data --export-on-exit

# ==========================================
# 📦 COMANDOS DE DEPLOY
# ==========================================

# Deploy solo functions
firebase deploy --only functions

# Deploy solo hosting
firebase deploy --only hosting

# Deploy completo
firebase deploy

# Deploy con mensaje personalizado
firebase deploy -m "Actualización $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Deploy forzado (ignora warnings)
firebase deploy --only functions --force

# ==========================================
# 🐛 COMANDOS DE DEBUGGING
# ==========================================

# Ver logs de functions en tiempo real
firebase functions:log

# Ver logs filtrados
firebase functions:log --only api

# Deploy con debug completo
firebase deploy --only functions --debug

# Estado del proyecto
firebase projects:list

# Información del proyecto actual
firebase list

# ==========================================
# 🔧 COMANDOS DE MANTENIMIENTO
# ==========================================

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias de functions
cd functions
rm -rf node_modules
npm install
cd ..

# Actualizar Firebase CLI
npm update -g firebase-tools

# Verificar vulnerabilidades
cd functions
npm audit
npm audit fix
cd ..

# ==========================================
# 🔄 COMANDOS DE ROLLBACK
# ==========================================

# Ver versiones desplegadas
firebase functions:log --limit 50

# Rollback a versión anterior (manual desde console)
# https://console.firebase.google.com/project/brain-storm-8f0d8/functions

# ==========================================
# 🌐 COMANDOS DE HOSTING
# ==========================================

# Servir hosting localmente
firebase serve

# Servir solo hosting en puerto específico
firebase serve --port 3000

# Deploy a canal de preview
firebase hosting:channel:deploy preview

# Listar canales de hosting
firebase hosting:channel:list

# ==========================================
# 📊 COMANDOS DE MONITORING
# ==========================================

# Abrir console de Firebase
start https://console.firebase.google.com/project/brain-storm-8f0d8

# Abrir functions en console
start https://console.firebase.google.com/project/brain-storm-8f0d8/functions

# Abrir hosting en console
start https://console.firebase.google.com/project/brain-storm-8f0d8/hosting

# Abrir Firestore
start https://console.firebase.google.com/project/brain-storm-8f0d8/firestore

# ==========================================
# 🆘 COMANDOS DE EMERGENCIA
# ==========================================

# Reinstalar Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools

# Re-login forzado
firebase login --reauth

# Verificar conexión a proyecto
firebase use --add

# Reset completo del proyecto
firebase use --clear
firebase use brain-storm-8f0d8

# ==========================================
# 📝 COMANDOS ÚTILES ADICIONALES
# ==========================================

# Abrir documentación
start https://firebase.google.com/docs/cli

# Ver ayuda de comandos
firebase --help
firebase deploy --help
firebase emulators:start --help

# Verificar cuota de functions
firebase functions:log --limit 1

# Generar archivo de configuración
firebase init

# ==========================================
# 🔥 COMANDOS EN UN SOLO SCRIPT
# ==========================================

# Script completo de deploy
cd "c:\Users\DANY\Desktop\lluvia-de-ideas"; firebase login; firebase use brain-storm-8f0d8; firebase deploy

# Script de desarrollo
cd "c:\Users\DANY\Desktop\lluvia-de-ideas"; firebase emulators:start

# Script de verificación
cd "c:\Users\DANY\Desktop\lluvia-de-ideas"; firebase list; firebase functions:log --limit 5

# ==========================================
# 💡 NOTAS IMPORTANTES
# ==========================================

# 1. Siempre ejecutar desde la carpeta del proyecto
# 2. Mantener Firebase CLI actualizado
# 3. Usar emulador para testing local
# 4. Verificar logs después de cada deploy
# 5. Hacer backup antes de cambios importantes

# ==========================================
# 🔗 URLS IMPORTANTES
# ==========================================

# Firebase Console: https://console.firebase.google.com/project/brain-storm-8f0d8
# Hosting URL: https://brain-storm-8f0d8.firebaseapp.com
# Functions URL: https://us-central1-brain-storm-8f0d8.cloudfunctions.net
# Documentación: https://firebase.google.com/docs
