# 🔧 Solución: Localhost No Carga

## ✅ Pasos para Solucionar

### 1. Verificar que el Servidor Esté Corriendo

Abre una terminal y ejecuta:
```bash
cd "C:\Registro Horas Empleados"
npm run dev
```

Deberías ver algo como:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

### 2. Si el Servidor No Inicia

**Limpia la caché:**
```bash
# Elimina la carpeta .next
rm -rf .next
# O en PowerShell:
Remove-Item -Recurse -Force .next

# Luego reinicia
npm run dev
```

### 3. Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga:
```env
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://jawofdrbqwarsnwqywah.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**IMPORTANTE:** Después de cambiar `.env.local`, **SIEMPRE reinicia el servidor**.

### 4. Si Hay Errores de Compilación

**Revisa la terminal** donde corre `npm run dev`:
- Si ves errores en rojo, cópialos y compártelos
- Errores comunes:
  - `Cannot find module` → Ejecuta `npm install`
  - `Type error` → Revisa el archivo mencionado
  - `Environment variable` → Verifica `.env.local`

### 5. Si la Página Carga pero Está en Blanco

1. **Abre la consola del navegador** (F12)
2. **Ve a la pestaña "Console"**
3. **Revisa si hay errores en rojo**
4. **Copia los errores** y compártelos

### 6. Verificar Puerto 3000

Si el puerto 3000 está ocupado:
```bash
# Cambia el puerto en package.json o usa:
npm run dev -- -p 3001
```

Luego abre: `http://localhost:3001`

---

## 🆘 Errores Comunes

### Error: "EADDRINUSE: address already in use"
**Solución:**
```bash
# Encuentra el proceso usando el puerto 3000
netstat -ano | findstr :3000
# Mata el proceso (reemplaza PID con el número que veas)
taskkill /PID <PID> /F
# Luego reinicia
npm run dev
```

### Error: "Module not found"
**Solución:**
```bash
npm install
```

### Error: "Cannot read properties of undefined"
**Solución:**
- Verifica que `NEXT_PUBLIC_USE_SUPABASE=true` en `.env.local`
- Reinicia el servidor

### Error: "401 Unauthorized" en la consola
**Solución:**
- Verifica que `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`
- Desactiva RLS en Supabase (ver `verificar-supabase.sql`)

---

## ✅ Checklist Rápido

- [ ] Servidor corriendo (`npm run dev`)
- [ ] Veo "Ready" en la terminal
- [ ] `.env.local` configurado correctamente
- [ ] No hay errores en la terminal
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Puerto 3000 no está ocupado

---

## 🎯 Próximos Pasos

1. **Inicia el servidor**: `npm run dev`
2. **Abre**: `http://localhost:3000`
3. **Si no carga**, revisa la terminal para errores
4. **Si hay errores**, compártelos para que pueda ayudarte

---

**¿Qué error específico ves?** Comparte el mensaje de error de la terminal o del navegador.


