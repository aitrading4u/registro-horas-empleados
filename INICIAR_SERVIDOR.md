# 🚀 Cómo Iniciar el Servidor

## ✅ Pasos Rápidos

### 1. Abre una Terminal

- **PowerShell** o **CMD**
- Navega a la carpeta del proyecto:
  ```bash
  cd "C:\Registro Horas Empleados"
  ```

### 2. Inicia el Servidor

```bash
npm run dev
```

### 3. Espera a que Compile

Deberías ver algo como:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

### 4. Abre el Navegador

Abre: `http://localhost:3000`

---

## 🆘 Si el Puerto 3000 Está Ocupado

### Solución Rápida:

```bash
# Encuentra qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Mata el proceso (reemplaza <PID> con el número que veas)
taskkill /PID <PID> /F

# Luego inicia el servidor
npm run dev
```

---

## ⚠️ Errores Comunes

### Error: "EADDRINUSE"
- El puerto 3000 está ocupado
- Mata el proceso (ver arriba)

### Error: "Cannot find module"
- Ejecuta: `npm install`

### Error: "This site can't be reached"
- El servidor no está corriendo
- Inicia el servidor: `npm run dev`
- Espera a ver "Ready" en la terminal

---

## ✅ Verificación

1. ✅ Terminal muestra "Ready"
2. ✅ Puedes abrir `http://localhost:3000`
3. ✅ La página carga (no error DNS)

---

**¡El servidor debería estar corriendo ahora!** 🎉



