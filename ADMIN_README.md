# Panel de Administración - FeedFlow

## Acceso al Panel de Admin

El panel de administración está disponible en: `admin.html`

### Usuarios Administradores Autorizados:
- `gefigueroaw@gmail.com` (Admin principal)
- `admin@feedflow.com` (Admin secundario)

## Funcionalidades del Panel

### 🔧 Configuración Premium
- **Premium Global Activo**: Cuando está activado, TODOS los usuarios tienen acceso premium temporalmente
- **Promoción de Lanzamiento**: Promoción especial que otorga acceso premium
- **Créditos Semanales**: Configura cuántas generaciones gratuitas tienen los usuarios no-premium

### 📊 Estadísticas
- Total de usuarios registrados
- Usuarios con suscripción premium
- Generaciones creadas hoy

## Cómo Usar

### 1. Acceder al Panel
1. Ve a `https://tu-dominio.com/admin.html`
2. Ingresa con tu email de administrador autorizado
3. Usa la misma contraseña de tu cuenta de Firebase

### 2. Activar Promoción Premium Global
1. En el panel, activa el switch "Premium Global Activo"
2. Haz clic en "Guardar Configuración"
3. ✅ ¡Ahora TODOS los usuarios tienen acceso premium!

### 3. Desactivar Promoción
1. Desactiva el switch "Premium Global Activo"
2. Guarda la configuración
3. Los usuarios vuelven a sus planes normales

## Lógica de Premium en la App

El sistema verifica el acceso premium de esta manera:

```javascript
isPremium = userData.isPremium || 
           appConfig.isPremiumGlobalActive || 
           appConfig.isLaunchPromoActive;
```

### Orden de Prioridad:
1. **Usuario Premium Individual**: Si el usuario pagó premium
2. **Premium Global**: Si el admin activó la promoción global
3. **Promoción de Lanzamiento**: Si hay una promo especial activa

## Seguridad

- ✅ Solo emails autorizados pueden acceder
- ✅ Autenticación requerida con Firebase Auth
- ✅ Validación en el backend (Cloud Functions)
- ✅ Logs de quién hizo qué cambio

## Funciones Cloud Functions

### `initializeAppConfig`
Inicializa la configuración por defecto de la app.

### `getAdminStats`
Obtiene estadísticas para el panel de admin.

### `isUserAdmin`
Verifica si un usuario es administrador autorizado.

## Despliegue

Después de hacer cambios, despliega las Cloud Functions:

```bash
cd functions
npm install
firebase deploy --only functions
```

## Notas Importantes

- Los cambios son **inmediatos** para todos los usuarios
- Usa con responsabilidad la promoción global
- Siempre verifica las estadísticas antes/después de cambios
- Los logs quedan registrados con timestamp y email del admin

---

**¡Solo tú tienes el poder de activar/desactivar el premium para todos! 🔥**
