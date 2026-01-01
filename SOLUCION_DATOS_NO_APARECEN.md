# 🔍 Solución: Datos No Aparecen en Supabase

## ✅ Lo que hice:

1. **Agregué logging detallado** para ver exactamente qué está pasando
2. **Mejoré el manejo de errores** para capturar todos los problemas

## 🔍 Pasos para Diagnosticar:

### 1. Crea un Restaurante Nuevo

1. **Abre la app** (`localhost:3000`)
2. **Abre la consola** (F12) > pestaña "Console"
3. **Crea un restaurante nuevo**
4. **Revisa los mensajes en la consola**:
   - Deberías ver mensajes que empiezan con 🔵 (azul) y ✅ (verde)
   - Si hay errores, verás ❌ (rojo)

### 2. Revisa los Mensajes

**Si ves:**
- `🔵 Intentando crear restaurante en Supabase...` → Está intentando usar Supabase
- `✅ Restaurante creado exitosamente` → Se creó correctamente
- `✅ ID del restaurante: ...` → Tiene un ID (debería ser un UUID)

**Si ves errores:**
- `❌ Error creando organización` → Hay un problema
- Copia el mensaje de error completo

### 3. Verifica en Supabase

**Opción A: SQL Editor**
1. Ve a Supabase > SQL Editor
2. Ejecuta:
   ```sql
   SELECT * FROM organizations ORDER BY created_at DESC;
   ```
3. ¿Ves tu restaurante?

**Opción B: Table Editor**
1. Ve a Table Editor > `organizations`
2. Haz clic en "Refresh" (actualizar)
3. ¿Ves tu restaurante?

---

## 🆘 Errores Comunes y Soluciones

### Error: "new row violates row-level security policy"
**Solución:** RLS está bloqueando. Ejecuta en SQL Editor:
```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
```

### Error: "relation does not exist"
**Solución:** Las tablas no existen. Ejecuta `supabase/schema-safe.sql` en SQL Editor.

### Error: "permission denied"
**Solución:** Problema de permisos. Verifica que `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`.

### No hay errores pero no aparece
**Solución:** 
1. Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
2. Reinicia el servidor
3. Crea el restaurante de nuevo

---

## 📋 Información que Necesito

Después de crear un restaurante, comparte:

1. **¿Qué mensajes ves en la consola?**
   - Copia todos los mensajes que empiezan con 🔵, ✅ o ❌

2. **¿Qué ves cuando ejecutas `SELECT * FROM organizations;` en SQL Editor?**
   - Vacío
   - Tu restaurante
   - Error

3. **¿Hay algún error en rojo en la consola?**
   - Sí / No
   - Si sí, copia el mensaje completo

---

**Ahora crea un restaurante nuevo y comparte los mensajes de la consola.** 🔍


