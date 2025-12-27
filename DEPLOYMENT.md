# Guía de Deployment a Vercel

## 📦 Preparación para Deployment

### 1. Crear Cuenta en Vercel (si no tienes)
- Ir a [vercel.com](https://vercel.com)
- Registrarse con GitHub, GitLab o email

### 2. Preparar el Proyecto

#### Opción A: Deploy desde Git (Recomendado)

```bash
# 1. Inicializar repositorio Git
cd /Users/juantrabucco/Desktop/INFECTO
git init

# 2. Crear repositorio en GitHub/GitLab
# (Ir a la plataforma y crear nuevo repositorio)

# 3. Subir código
git add .
git commit -m "Initial commit - InfectoPlan v1.0.0"
git branch -M main
git remote add origin <TU_URL_DEL_REPOSITORIO>
git push -u origin main

# 4. Importar en Vercel
# - Ir a vercel.com/dashboard
# - Click en "Add New Project"
# - Seleccionar repositorio de GitHub/GitLab
# - Vercel detectará automáticamente Vite
# - Click en "Deploy"
```

#### Opción B: Deploy Directo con Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /Users/juantrabucco/Desktop/INFECTO
vercel

# Responder preguntas:
# - Set up and deploy? Y
# - Which scope? (tu cuenta)
# - Link to existing project? N
# - Project name? infectoplan
# - Directory? ./
# - Override settings? N
```

### 3. Configuración de Build (Automática)

Vercel detectará automáticamente estas configuraciones de `package.json`:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

**Framework Preset**: Vite  
**Build Command**: `npm run build`  
**Output Directory**: `dist`  
**Install Command**: `npm install`

### 4. Variables de Entorno (Futuro)

Cuando configures Google APIs, añadir en Vercel Dashboard:

```
Settings → Environment Variables:

VITE_GOOGLE_CLIENT_ID=tu_client_id
VITE_GOOGLE_API_KEY=tu_api_key
```

Luego modificar `src/services/googleApiService.ts`:
```typescript
const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  // ...
};
```

## 🚀 Proceso de Deploy Completo

### Primera vez:

```bash
# 1. Build local para verificar
npm run build

# 2. Preview del build
npm run preview

# 3. Si todo funciona, deploy
vercel --prod
```

### Actualizaciones futuras:

```bash
# Opción A: Git Push (si usaste Opción A)
git add .
git commit -m "Descripción de cambios"
git push
# Vercel detecta el push y redeploy automáticamente

# Opción B: CLI directo
vercel --prod
```

## 🔧 Configuración Avanzada (vercel.json)

Crear archivo `vercel.json` en la raíz si necesitas configuración custom:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🌐 Dominio Custom (Opcional)

### Configurar dominio propio:

1. Ir a Vercel Dashboard → Project Settings → Domains
2. Añadir dominio custom (ej: `infectoplan.tu-hospital.com.ar`)
3. Actualizar DNS en tu proveedor:
   ```
   Type: CNAME
   Name: infectoplan
   Value: cname.vercel-dns.com
   ```

## 📊 Monitoreo Post-Deploy

### Vercel proporciona automáticamente:
- ✅ HTTPS/SSL (certificado automático)
- ✅ CDN global (carga rápida en todo el mundo)
- ✅ Analytics (visitas, performance)
- ✅ Preview deployments (cada push a branch)
- ✅ Rollback instantáneo

### URLs Generadas:
- **Producción**: `https://infectoplan.vercel.app`
- **Preview**: `https://infectoplan-git-<branch>.vercel.app`

## 🔒 Seguridad

### Para ambiente de producción:

1. **Autenticación** (implementar en futuro):
   ```typescript
   // Usar Vercel Edge Functions + JWT
   // O integrar con Supabase Auth
   ```

2. **Rate Limiting**:
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           }
         ]
       }
     ]
   }
   ```

## 🐛 Troubleshooting

### Error: "Build failed"
```bash
# Verificar build local
npm run build

# Si falla, revisar errores de TypeScript
npx tsc --noEmit
```

### Error: "Runtime error en producción"
```bash
# Verificar que las rutas sean absolutas
# En vez de './archivo.ts' usar '/archivo.ts'
```

### Error: "LocalStorage no funciona"
```typescript
// Verificar que el código maneje caso sin LocalStorage
try {
  localStorage.setItem('test', 'test');
} catch (e) {
  console.warn('LocalStorage no disponible');
}
```

## 📱 PWA (Progressive Web App) - Opcional

Para instalar la app en el teléfono:

1. Crear `public/manifest.json`:
```json
{
  "name": "InfectoPlan",
  "short_name": "InfectoPlan",
  "description": "Sistema de Gestión de Guardias Médicas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. Añadir en `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```

## ✅ Checklist Pre-Deploy

- [ ] `npm run build` funciona sin errores
- [ ] `npm run preview` muestra la app correctamente
- [ ] Todas las rutas son absolutas (no relativas)
- [ ] Variables de entorno configuradas (si aplica)
- [ ] README.md actualizado con URL de producción
- [ ] `.gitignore` incluye `node_modules`, `dist`, `.env`

## 🎉 ¡Listo!

Una vez deployado, la URL será algo como:
```
https://infectoplan.vercel.app
```

Comparte esta URL con el equipo médico y estarán listos para usar el sistema desde cualquier dispositivo con internet.

