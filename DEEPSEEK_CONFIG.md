# Configuración de API Key para Deepseek

## Método 1: Firebase Console (RECOMENDADO)
1. Ve a: https://console.firebase.google.com/project/brain-storm-8f0d8/functions/list
2. Haz clic en la función "api"
3. Ve a la pestaña "Variables y secretos"
4. Agrega una nueva variable de entorno:
   - Nombre: DEEPSEEK_API_KEY
   - Valor: sk-97c8f4c543fa45acabaf02ebcac60f03

## Método 2: Firebase CLI (si funciona)
```bash
firebase functions:config:set deepseek.key=sk-97c8f4c543fa45acabaf02ebcac60f03
firebase deploy --only functions
```

## Método 3: Editar directamente en Console
1. Ve a Functions → api → Source
2. Edita el código para incluir la API key directamente (temporal)

## Estado Actual:
- ✅ Función desplegada: `api`
- ✅ Frontend actualizado para usar `api`
- ⏳ API key pendiente de configurar
- ⏳ Redespliegue necesario
