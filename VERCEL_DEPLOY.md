# 🚀 Deploy InfectoPlan a Vercel - Guía Rápida

## ✅ Paso 1: Código Subido a GitHub

✅ **COMPLETADO** - Tu código ya está en:
**https://github.com/juantrabucco/infecto**

---

## 📦 Paso 2: Deploy a Vercel

### Opción A: Deploy Automático desde GitHub (Recomendado)

1. **Ir a Vercel**:
   - Abrir https://vercel.com
   - Hacer clic en **"Sign Up"** o **"Log In"**
   - Seleccionar **"Continue with GitHub"**

2. **Importar Proyecto**:
   - Click en **"Add New..."** → **"Project"**
   - Buscar **"juantrabucco/infecto"** en la lista
   - Click en **"Import"**

3. **Configuración Automática**:
   ```
   Framework Preset: Vite ✅ (detectado automáticamente)
   Root Directory: ./ 
   Build Command: npm run build ✅ (detectado)
   Output Directory: dist ✅ (detectado)
   Install Command: npm install ✅ (detectado)
   ```

4. **Deploy**:
   - Click en **"Deploy"** (botón azul)
   - Esperar 1-2 minutos
   - ¡Listo! 🎉

### Tu URL será:
```
https://infecto.vercel.app
```
O similar (Vercel te asignará una URL única)

---

## 🔄 Actualizaciones Automáticas

Cada vez que hagas push a GitHub, Vercel redeplegará automáticamente:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push

# Vercel detecta el push y redeploy automáticamente ✅
```

---

## 🌐 Configurar Dominio Custom (Opcional)

1. Ir a tu proyecto en Vercel Dashboard
2. **Settings** → **Domains**
3. Añadir tu dominio (ej: `infectoplan.hospital.com.ar`)
4. Seguir instrucciones de DNS

---

## 🔧 Variables de Entorno (Futuro - Google APIs)

Cuando configures Google APIs:

1. En Vercel Dashboard → **Settings** → **Environment Variables**
2. Añadir:
   ```
   VITE_GOOGLE_CLIENT_ID=tu_client_id
   VITE_GOOGLE_API_KEY=tu_api_key
   ```
3. **Redeploy** para aplicar cambios

---

## 📊 Monitoreo

Vercel proporciona automáticamente:
- ✅ **Analytics**: Visitas, performance
- ✅ **Logs**: Errores en tiempo real
- ✅ **HTTPS**: Certificado SSL automático
- ✅ **CDN**: Distribución global

---

## 🎯 Resumen de URLs

- **Repositorio GitHub**: https://github.com/juantrabucco/infecto
- **Deploy Vercel**: https://infecto.vercel.app (después de deploy)
- **Dashboard Vercel**: https://vercel.com/dashboard

---

## ✅ Checklist Rápido

- [x] Código en GitHub ✅
- [ ] Cuenta en Vercel creada
- [ ] Proyecto importado desde GitHub
- [ ] Deploy exitoso
- [ ] URL compartida con equipo
- [ ] Dominio custom configurado (opcional)

---

## 🆘 Troubleshooting

### Error: "Build failed"
- Verificar que el build funciona local: `npm run build`
- Ver logs en Vercel Dashboard
- El build debería ser exitoso (ya probado localmente ✅)

### Error: "Module not found"
- Vercel instalará automáticamente las dependencias de `package.json`
- Ya está configurado correctamente ✅

### Error: "404 en rutas"
- Vite maneja esto automáticamente
- No necesitas configuración adicional ✅

---

## 🎉 ¡Todo Listo!

Tu proyecto **InfectoPlan** está listo para ser deployado en Vercel. 

**Siguiente paso**: 
1. Ve a https://vercel.com
2. Haz login con GitHub
3. Importa el repositorio
4. ¡Deploy en 2 minutos!

---

**Nota**: El repositorio ya está configurado y sincronizado. Solo necesitas hacer el deploy en Vercel siguiendo los pasos anteriores.

