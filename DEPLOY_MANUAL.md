# Manual Deploy Instructions

## 📋 Para Desplegar las Cloud Functions manualmente:

### Opción 1: Firebase Console (RECOMENDADA)
1. Ve a https://console.firebase.google.com/project/brain-storm-8f0d8/functions
2. Haz clic en "Create function" o "Edit function" 
3. Copia y pega el código de `functions/admin.js` en el editor
4. Configura los triggers como HTTPS Callable
5. Deploy

### Opción 2: Local con permisos de administrador
1. Abre PowerShell como **Administrador**
2. Navega al proyecto: `cd "E:\Usuarios\gfigueroa\Desktop\lluvia-de-ideas"`
3. Ejecuta: `firebase login`
4. Ejecuta: `firebase deploy --only functions`

### Opción 3: Via GitHub Actions (Automático)
Se pueden configurar GitHub Actions para desplegar automáticamente.

## 🔧 Mientras tanto - Solución Temporal:

Las funciones de admin funcionarán localmente, pero para probar el sistema completo:

1. **Frontend ya funciona**: Los archivos HTML ya están desplegados en GitHub Pages
2. **Admin email actualizado**: Ya está configurado como `eugenfw@gmail.com`
3. **Cloud Functions**: Necesitan ser desplegadas para funcionar completamente

## ✅ Lo que YA está funcionando:
- ✅ Autenticación con Google y Email
- ✅ Panel de admin (HTML)
- ✅ Verificación de admin (local)
- ✅ Configuración actualizada

## ⏳ Lo que necesita despliegue:
- ⏳ Cloud Functions (admin.js)
- ⏳ Backend de estadísticas
- ⏳ Verificación de admin desde servidor

## 🚀 Para activar promoción premium AHORA:

Puedes activar manualmente la promoción agregando un documento en Firestore:

1. Ve a https://console.firebase.google.com/project/brain-storm-8f0d8/firestore
2. Crea una colección: `appConfig`
3. Crea un documento: `config`
4. Agrega estos campos:
   ```
   isPremiumGlobalActive: true
   isLaunchPromoActive: false
   weeklyCredits: 3
   ```

¡Y listo! Todos los usuarios tendrán premium inmediatamente.
