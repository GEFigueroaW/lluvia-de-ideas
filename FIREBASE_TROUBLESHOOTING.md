# 🚨 TROUBLESHOOTING FIREBASE CLI
## Solución de Problemas Específicos - lluvia-de-ideas

---

## 🔴 PROBLEMA: "firebase: command not found"

### Síntomas:
- PowerShell no reconoce el comando `firebase`
- Error: `'firebase' is not recognized as an internal or external command`

### Soluciones:
```powershell
# 1. Verificar si Node.js está instalado
node --version
npm --version

# 2. Reinstalar Firebase CLI
npm uninstall -g firebase-tools
npm install -g firebase-tools

# 3. Verificar PATH del sistema
$env:PATH -split ';' | Where-Object { $_ -like "*npm*" }

# 4. Reiniciar PowerShell como Administrador
# 5. Verificar instalación
firebase --version
```

---

## 🔴 PROBLEMA: "Error: Permission denied"

### Síntomas:
- `EACCES: permission denied`
- `Error: EPERM: operation not permitted`

### Soluciones:
```powershell
# 1. Ejecutar PowerShell como Administrador
Start-Process powershell -Verb RunAs

# 2. Cambiar política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Limpiar cache de npm
npm cache clean --force

# 4. Reinstalar con permisos
npm install -g firebase-tools --unsafe-perm=true --allow-root
```

---

## 🔴 PROBLEMA: "Error: Failed to authenticate"

### Síntomas:
- `Error: HTTP Error: 401, Unauthorized`
- `Error: Could not load the default credentials`

### Soluciones:
```powershell
# 1. Re-login forzado
firebase logout
firebase login --reauth

# 2. Limpiar credenciales
firebase logout
Remove-Item -Path "$env:USERPROFILE\.config\firebase" -Recurse -Force -ErrorAction SilentlyContinue
firebase login

# 3. Verificar cuenta correcta
firebase login:list
firebase use --add
```

---

## 🔴 PROBLEMA: "Error: Project not found"

### Síntomas:
- `Error: Invalid project id: brain-storm-8f0d8`
- `HTTP Error: 404, Not Found`

### Soluciones:
```powershell
# 1. Verificar proyectos disponibles
firebase projects:list

# 2. Configurar proyecto correcto
firebase use brain-storm-8f0d8

# 3. Verificar permisos de acceso
firebase login:list

# 4. Agregar proyecto si no aparece
firebase use --add
```

---

## 🔴 PROBLEMA: "Functions deploy failed"

### Síntomas:
- `Error: Build failed: npm install failed`
- `Error: Function failed on loading user code`

### Soluciones:
```powershell
# 1. Navegar a functions y verificar dependencias
Set-Location functions
npm install
npm audit fix

# 2. Verificar Node.js version en package.json
# Debe ser "engines": { "node": "18" }

# 3. Limpiar y reinstalar
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm install

# 4. Deploy con debug
Set-Location ..
firebase deploy --only functions --debug

# 5. Verificar logs
firebase functions:log
```

---

## 🔴 PROBLEMA: "Emulator won't start"

### Síntomas:
- `Error: Could not start emulator, port already in use`
- `Error: java command not found`

### Soluciones:
```powershell
# 1. Verificar puertos ocupados
netstat -ano | findstr :5001
netstat -ano | findstr :5000

# 2. Matar procesos en puertos
# Usar Task Manager o:
Stop-Process -Id <PID> -Force

# 3. Usar puertos diferentes
firebase emulators:start --only functions --port 5002

# 4. Instalar Java si es necesario
# Descargar desde: https://adoptium.net/

# 5. Emulador con configuración específica
firebase emulators:start --project brain-storm-8f0d8
```

---

## 🔴 PROBLEMA: "Module not found" en Functions

### Síntomas:
- `Error: Cannot find module 'firebase-functions'`
- `Module not found: openai`

### Soluciones:
```powershell
# 1. Verificar package.json en functions/
Set-Location functions
Get-Content package.json

# 2. Instalar dependencias específicas
npm install firebase-functions@latest
npm install firebase-admin@latest
npm install openai@3.3.0

# 3. Verificar imports en index.js
# Debe usar: const functions = require('firebase-functions');

# 4. Verificar versiones compatibles
npm list
npm outdated

# 5. Reinstalar todo
Remove-Item node_modules -Recurse -Force
npm install
Set-Location ..
```

---

## 🔴 PROBLEMA: "Hosting deploy failed"

### Síntomas:
- `Error: HTTP Error: 404, File not found`
- `Error: The requested file was not found`

### Soluciones:
```powershell
# 1. Verificar firebase.json
Get-Content firebase.json

# 2. Verificar archivos públicos
dir .
# Debe existir: index.html, admin.html, etc.

# 3. Deploy específico
firebase deploy --only hosting

# 4. Verificar configuración de rewrites
# En firebase.json debe tener:
# "rewrites": [{"source": "**", "destination": "/index.html"}]

# 5. Deploy con debug
firebase deploy --only hosting --debug
```

---

## 🔴 PROBLEMA: "CORS errors" en producción

### Síntomas:
- `Access to fetch has been blocked by CORS policy`
- Functions no responden desde frontend

### Soluciones:
```javascript
// 1. Agregar CORS a functions/index.js
const cors = require('cors')({origin: true});

exports.api = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Tu código aquí
  });
});

// 2. O usar onCall (recomendado)
exports.api = functions.https.onCall(async (data, context) => {
  // Tu código aquí
});
```

```powershell
# 3. Instalar cors en functions
Set-Location functions
npm install cors
Set-Location ..
firebase deploy --only functions
```

---

## 🔴 PROBLEMA: "Firebase config not found"

### Síntomas:
- `FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created`
- App no conecta con Firebase

### Soluciones:
```javascript
// 1. Verificar firebase-config.js
// Debe tener configuración correcta:
const firebaseConfig = {
    apiKey: "AIzaSyCScJA-UGs3WcBnfAm-6K94ybZ4bzBahz8",
    authDomain: "brain-storm-8f0d8.firebaseapp.com",
    projectId: "brain-storm-8f0d8",
    // ... resto de config
};
```

```powershell
# 2. Verificar que se importa correctamente
# En HTML debe tener:
# <script type="module" src="js/firebase-config.js"></script>

# 3. Verificar consola del navegador
# F12 > Console > Buscar errores
```

---

## 🔴 PROBLEMA: "Quota exceeded"

### Síntomas:
- `Error: Quota exceeded for service`
- Functions no ejecutan

### Soluciones:
```powershell
# 1. Verificar uso en Firebase Console
Start-Process https://console.firebase.google.com/project/brain-storm-8f0d8/usage

# 2. Verificar límites de Spark plan
# Functions: 125K invocations/month
# Storage: 1GB
# Bandwidth: 10GB/month

# 3. Optimizar functions para reducir llamadas
# 4. Considerar upgrade a Blaze plan si es necesario
```

---

## 🔴 PROBLEMA: "Build errors" en Functions

### Síntomas:
- `SyntaxError: Unexpected token`
- `Error: Function failed on loading user code`

### Soluciones:
```powershell
# 1. Verificar sintaxis en functions/index.js
# Usar editor con linting (VS Code)

# 2. Verificar imports/exports
# CommonJS: const x = require('x'); module.exports = x;
# NO ES6 modules en functions

# 3. Validar JSON en package.json
Get-Content functions/package.json | ConvertFrom-Json

# 4. Verificar logs de deploy
firebase deploy --only functions --debug
firebase functions:log
```

---

## 🆘 RESET COMPLETO (Último recurso)

```powershell
# 1. Desinstalar todo
npm uninstall -g firebase-tools
Remove-Item -Path "$env:USERPROFILE\.config\firebase" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Limpiar cache
npm cache clean --force

# 3. Reinstalar
npm install -g firebase-tools

# 4. Re-configurar
firebase login
firebase use brain-storm-8f0d8

# 5. Verificar
firebase list
firebase projects:list
```

---

## 📞 CONTACTOS DE EMERGENCIA

### Firebase Support:
- 📖 Docs: https://firebase.google.com/docs/cli
- 💬 Community: https://firebase.google.com/support
- 🐛 Issues: https://github.com/firebase/firebase-tools/issues

### Stack Overflow:
- 🔍 Tag: firebase-cli
- 🔍 Tag: google-cloud-functions

### Console directo:
- 🌐 Firebase Console: https://console.firebase.google.com/project/brain-storm-8f0d8
- 📊 Usage: https://console.firebase.google.com/project/brain-storm-8f0d8/usage
- 🔧 Functions: https://console.firebase.google.com/project/brain-storm-8f0d8/functions

---

## 💡 COMANDOS DE VERIFICACIÓN RÁPIDA

```powershell
# Health Check completo
node --version; npm --version; firebase --version; firebase projects:list; firebase list

# Verificar estado del proyecto
firebase use; firebase functions:log --limit 3

# Test de conectividad
firebase projects:list | Select-String "brain-storm-8f0d8"
```
