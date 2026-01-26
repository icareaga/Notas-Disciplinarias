# 🚀 Guía de Despliegue a Producción

## Preparación del Entorno

### 1️⃣ **Variables de Entorno**

Crear archivo `environment.prod.ts` con la URL real del backend:

```typescript
export const environment = {
  production: true,
  apiUrl: "https://api-produccion.megacable.com.mx/api"  // ⬅️ URL real
};
```

### 2️⃣ **Construir para Producción**

```bash
# Generar build optimizado
ng build --configuration production

# Archivos generados en: dist/notas-disciplinarias/browser/
```

**Resultado:**
- JavaScript minificado
- CSS optimizado
- HTML comprimido
- Source maps (opcional)
- Assets copiados

---

## Opciones de Despliegue

### 🔵 **Opción 1: IIS (Internet Information Services) - Windows Server**

#### **Paso 1: Preparar IIS**
```powershell
# Instalar IIS (si no está instalado)
Install-WindowsFeature -name Web-Server -IncludeManagementTools

# Instalar URL Rewrite Module
# Descargar de: https://www.iis.net/downloads/microsoft/url-rewrite
```

#### **Paso 2: Configurar Sitio**
1. Abrir IIS Manager
2. Click derecho en "Sites" → "Add Website"
3. Configurar:
   - **Site name**: NotasDisciplinarias
   - **Physical path**: `C:\inetpub\wwwroot\notas-disciplinarias`
   - **Binding**: 
     - Type: https
     - Port: 443
     - Hostname: notas.megacable.com.mx
     - SSL Certificate: [Seleccionar certificado]

#### **Paso 3: Copiar Archivos**
```powershell
# Copiar build a IIS
Copy-Item -Path "dist/notas-disciplinarias/browser/*" -Destination "C:\inetpub\wwwroot\notas-disciplinarias" -Recurse -Force
```

#### **Paso 4: Configurar web.config**

Crear `web.config` en la raíz del sitio:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <!-- Habilitar compresión -->
    <urlCompression doStaticCompression="true" doDynamicCompression="true" />
    
    <!-- Rewrite rules para Angular routing -->
    <rewrite>
      <rules>
        <rule name="Angular Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Headers de seguridad -->
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="no-referrer-when-downgrade" />
      </customHeaders>
    </httpProtocol>
    
    <!-- Cache para assets estáticos -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

---

### 🟢 **Opción 2: Nginx - Linux**

#### **Paso 1: Instalar Nginx**
```bash
sudo apt update
sudo apt install nginx
```

#### **Paso 2: Configurar Sitio**

Crear `/etc/nginx/sites-available/notas-disciplinarias`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name notas.megacable.com.mx;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name notas.megacable.com.mx;
    
    # Certificados SSL
    ssl_certificate /etc/ssl/certs/megacable.crt;
    ssl_certificate_key /etc/ssl/private/megacable.key;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Root del proyecto
    root /var/www/notas-disciplinarias;
    index index.html;
    
    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Routing de Angular
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # No cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Logs
    access_log /var/log/nginx/notas-disciplinarias-access.log;
    error_log /var/log/nginx/notas-disciplinarias-error.log;
}
```

#### **Paso 3: Activar Sitio**
```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/notas-disciplinarias /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

#### **Paso 4: Copiar Archivos**
```bash
# Crear directorio
sudo mkdir -p /var/www/notas-disciplinarias

# Copiar build
sudo cp -r dist/notas-disciplinarias/browser/* /var/www/notas-disciplinarias/

# Permisos
sudo chown -R www-data:www-data /var/www/notas-disciplinarias
sudo chmod -R 755 /var/www/notas-disciplinarias
```

---

### 🔴 **Opción 3: Azure Static Web Apps**

#### **Paso 1: Crear recurso en Azure Portal**
1. Ir a Azure Portal
2. "Create a resource" → "Static Web App"
3. Configurar:
   - **Name**: notas-disciplinarias
   - **Region**: Central US
   - **Source**: GitHub (conectar repositorio)

#### **Paso 2: Configurar GitHub Actions**

Azure crea automáticamente `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist/notas-disciplinarias/browser"
```

---

## Configuración Post-Despliegue

### 🔐 **Seguridad**

#### **1. Configurar HTTPS**
```bash
# Opción A: Let's Encrypt (gratis)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d notas.megacable.com.mx

# Opción B: Certificado corporativo
# Copiar .crt y .key a /etc/ssl/
```

#### **2. Firewall**
```bash
# Permitir solo HTTPS
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp  # Solo para redirección
sudo ufw enable
```

#### **3. Headers de Seguridad**
Verificar en browser DevTools → Network:
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-XSS-Protection: 1; mode=block`

---

### 📊 **Monitoreo**

#### **1. Logs de Aplicación**
```bash
# Nginx
sudo tail -f /var/log/nginx/notas-disciplinarias-access.log

# IIS
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Wait -Tail 50
```

#### **2. Métricas**
- Tiempo de carga: < 3 segundos
- Disponibilidad: > 99.9%
- Errores 4xx/5xx: < 1%

#### **3. Alertas**
Configurar notificaciones para:
- Sitio caído (status 500)
- Alto uso de CPU/RAM
- Certificado SSL próximo a expirar

---

### 🔄 **Actualizaciones**

#### **Script de Despliegue Automático**

```powershell
# deploy-to-production.ps1

# 1. Build
Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Cyan
npm run build --configuration production

# 2. Backup anterior
Write-Host "💾 Creando backup..." -ForegroundColor Cyan
$backupPath = "C:\backups\notas-disciplinarias-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item "C:\inetpub\wwwroot\notas-disciplinarias" -Destination $backupPath -Recurse

# 3. Detener sitio IIS
Write-Host "⏸️ Deteniendo sitio..." -ForegroundColor Yellow
Stop-WebSite -Name "NotasDisciplinarias"

# 4. Copiar nuevos archivos
Write-Host "📦 Copiando archivos..." -ForegroundColor Cyan
Remove-Item "C:\inetpub\wwwroot\notas-disciplinarias\*" -Recurse -Force
Copy-Item "dist\notas-disciplinarias\browser\*" -Destination "C:\inetpub\wwwroot\notas-disciplinarias" -Recurse

# 5. Reiniciar sitio
Write-Host "▶️ Reiniciando sitio..." -ForegroundColor Green
Start-WebSite -Name "NotasDisciplinarias"

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
```

---

## Checklist de Producción

Antes de liberar a producción:

- [ ] Build sin errores ni warnings
- [ ] Variables de entorno configuradas
- [ ] HTTPS habilitado
- [ ] Certificado SSL válido
- [ ] Headers de seguridad configurados
- [ ] Compresión gzip/brotli activa
- [ ] Cache de assets configurado
- [ ] Logs de acceso y errores funcionando
- [ ] Monitoreo configurado
- [ ] Backup automatizado
- [ ] Plan de rollback preparado
- [ ] DNS apuntando al servidor
- [ ] Pruebas de integración pasadas
- [ ] Autenticación ItGov funcionando
- [ ] API backend accesible
- [ ] Base de datos lista
- [ ] Usuarios de prueba validados

---

## Rollback de Emergencia

Si algo falla en producción:

```powershell
# Restaurar versión anterior
$ultimoBackup = Get-ChildItem "C:\backups" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

Stop-WebSite -Name "NotasDisciplinarias"
Remove-Item "C:\inetpub\wwwroot\notas-disciplinarias\*" -Recurse -Force
Copy-Item "$($ultimoBackup.FullName)\*" -Destination "C:\inetpub\wwwroot\notas-disciplinarias" -Recurse
Start-WebSite -Name "NotasDisciplinarias"

Write-Host "✅ Rollback completado" -ForegroundColor Green
```

---

## Contacto de Soporte

**En caso de problemas en producción:**
- 📧 Email: soporte-ti@megacable.com.mx
- 📞 Tel: 33-XXXX-XXXX ext. 1234
- 🔧 Ticket: https://soporte.megacable.com.mx
