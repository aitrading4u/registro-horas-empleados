# 🔧 Solución: Error 404 en Archivos Estáticos

## 🔴 Problema
Errores como:
- `GET http://localhost:3000/_next/static/css/app/layout.css 404`
- `GET http://localhost:3000/_next/static/chunks/main-app.js 404`

Esto significa que Next.js no compiló correctamente.

## ✅ Solución

### Paso 1: Detener el Servidor
Presiona `Ctrl+C` en la terminal donde corre `npm run dev`

### Paso 2: Limpiar la Caché
```bash
# Elimina la carpeta .next
Remove-Item -Recurse -Force .next

# O manualmente:
# Borra la carpeta .next de tu proyecto
```

### Paso 3: Reiniciar el Servidor
```bash
npm run dev
```

### Paso 4: Esperar a que Compile
Espera 20-30 segundos hasta que veas:
```
✓ Ready in X.Xs
```

### Paso 5: Recargar el Navegador
- Presiona `Ctrl+Shift+R` (recarga forzada)
- O cierra y abre de nuevo `http://localhost:3000`

---

## 🆘 Si Sigue Fallando

### Opción 1: Reinstalar Dependencias
```bash
# Elimina node_modules y package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstala
npm install

# Reinicia
npm run dev
```

### Opción 2: Verificar Errores de Compilación
Revisa la terminal donde corre `npm run dev`:
- ¿Hay errores en rojo?
- ¿Se detiene la compilación?
- ¿Qué mensajes ves?

---

## ✅ Verificación

Después de limpiar y reiniciar:
1. ✅ Terminal muestra "Ready"
2. ✅ No hay errores 404 en la consola
3. ✅ La página carga correctamente

---

**He limpiado la caché y reiniciado el servidor. Espera 20-30 segundos y recarga la página (Ctrl+Shift+R).**


