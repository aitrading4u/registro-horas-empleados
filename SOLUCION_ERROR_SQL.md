# 🔧 Solución: Error al Ejecutar SQL

## 🔴 Problema

El SQL se está cortando o hay un error de sintaxis al ejecutarlo.

## ✅ Solución: Ejecuta Cada Línea por Separado

### Opción 1: Ejecutar Todo Junto (Sin Saltos de Línea)

Copia y pega esto **TODO JUNTO** (sin saltos de línea entre comandos):

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY; ALTER TABLE organizations DISABLE ROW LEVEL SECURITY; ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY; ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY; ALTER TABLE incidents DISABLE ROW LEVEL SECURITY; ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY; ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

### Opción 2: Ejecutar Una por Una (Más Seguro)

Ejecuta cada comando **por separado**:

**1. Primero:**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

**2. Segundo:**
```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
```

**3. Tercero:**
```sql
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
```

**4. Cuarto:**
```sql
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
```

**5. Quinto:**
```sql
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
```

**6. Sexto:**
```sql
ALTER TABLE scheduled_times DISABLE ROW LEVEL SECURITY;
```

**7. Séptimo:**
```sql
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Pasos en Supabase

1. **Ve a SQL Editor**
2. **Pega el SQL** (Opción 1 o 2)
3. **Asegúrate de que "No limit" esté seleccionado** (no "limit 100")
4. **Haz clic en "Run"**
5. **Deberías ver:** ✅ "Success. No rows returned"

---

## ✅ Después de Ejecutar

1. **Recarga la página** en el navegador (F5)
2. **Los errores 406 deberían desaparecer**

---

**Ejecuta el SQL y luego recarga la página. ¿Funciona ahora?** 🔧



