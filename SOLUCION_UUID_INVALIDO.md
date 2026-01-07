# 🔧 Solución: Error UUID Inválido

## 🔴 Problema Detectado

Error: `invalid input syntax for type uuid: "user-1766684434372-djbd2y5ag"`

**Causa:** El usuario tiene un ID de Mock DB (`user-1766684434372-djbd2y5ag`), pero Supabase requiere UUIDs válidos (formato: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

## ✅ Solución Aplicada

He modificado el código para que:

1. **Cuando inicies sesión**, si el usuario tiene un ID de Mock DB y estás usando Supabase:
   - Busca el usuario en Supabase por email
   - Si existe, usa ese usuario (con UUID válido)
   - Si no existe, lo crea en Supabase (obtendrá un UUID válido)
   - Actualiza la sesión con el nuevo ID

2. **Cuando recuperes la sesión**, también verifica y migra si es necesario

## 🔄 Pasos para Solucionar

### Paso 1: Cerrar Sesión y Volver a Iniciar

1. **Cierra sesión** en la app
2. **Inicia sesión de nuevo** con tu email y contraseña
3. El sistema debería migrar tu usuario a Supabase automáticamente

### Paso 2: Verificar en la Consola

Cuando inicies sesión, deberías ver en la consola:

```
🔄 [Auth] Usuario con ID Mock DB detectado, migrando a Supabase...
✅ [Auth] Usuario migrado a Supabase: [UUID válido]
```

O si ya existe:

```
✅ [Auth] Usuario ya existe en Supabase: [UUID válido]
```

### Paso 3: Crear Restaurante de Nuevo

1. **Crea un restaurante nuevo**
2. **Debería funcionar** sin errores de UUID
3. **El ID del restaurante** debería ser un UUID válido

---

## 🆘 Si Sigue Fallando

### Opción 1: Limpiar localStorage

1. **Abre la consola** (F12)
2. **Ejecuta esto:**
   ```javascript
   localStorage.removeItem('mock_session')
   ```
3. **Recarga la página** (F5)
4. **Inicia sesión de nuevo**

### Opción 2: Verificar en Supabase

1. **Ve a Supabase** > SQL Editor
2. **Ejecuta:**
   ```sql
   SELECT * FROM users WHERE email = 'tu-email@ejemplo.com';
   ```
3. **¿Ves tu usuario?**
   - Si SÍ → Tiene un UUID válido
   - Si NO → Se creará al iniciar sesión

---

## ✅ Verificación

Después de iniciar sesión de nuevo:

1. ✅ **En la consola** deberías ver mensajes de migración
2. ✅ **El usuario** debería tener un UUID válido (no `user-...`)
3. ✅ **Crear restaurante** debería funcionar sin errores

---

**Cierra sesión e inicia sesión de nuevo. Luego crea un restaurante y comparte qué ves en la consola.** 🔄



