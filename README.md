
# Notas Disciplinarias

Este proyecto corresponde al **frontend** de la aplicación para la gestión de notas disciplinarias. Está desarrollado con **Angular** y fue generado utilizando [Angular CLI](https://github.com/angular/angular-cli) versión 20.3.3.

---

## 📌 Descripción
La aplicación permite gestionar notas disciplinarias de manera eficiente, ofreciendo una interfaz amigable para interactuar con la API del sistema.

---

## ✅ Requisitos previos
Antes de ejecutar el proyecto, asegúrate de tener instalado:
- https://nodejs.org/ (versión recomendada: 18+)
- https://angular.dev/tools/cli
- Un editor de código (Visual Studio Code recomendado)

---

## 🚀 Servidor de desarrollo
Para iniciar un servidor local de desarrollo, ejecuta:

bash
ng serve
Luego, abre tu navegador y navega a:
http://localhost:4200/
La aplicación se recargará automáticamente cada vez que modifiques los archivos fuente.

## 🛠️ Generación de código (Scaffolding)
Angular CLI incluye herramientas para generar componentes, directivas y más.
Para crear un nuevo componente, ejecuta:

ng generate component nombre-del-compone

Para ver la lista completa de esquemas disponibles (componentes, directivas, pipes, etc.), ejecuta:

ng generate --help

## 📦 Construcción del proyecto
Para compilar el proyecto, ejecuta:

ng build

Esto generará los artefactos de compilación en el directorio dist/.
Por defecto, la compilación para producción optimiza la aplicación para rendimiento y velocidad.

## ✅ Pruebas unitarias
Para ejecutar pruebas unitarias con https://karma-runner.github.io, utiliza:

ng test

## 📂 Estructura del proyecto

src/
  app/
    features/                # Módulos y funcionalidades principales
      acta-administrativa/   # Gestión de actas administrativas
      admin/                 # Panel de administración
      determinar-causa/      # Módulo para determinar causas
      evaluar-resultados/    # Evaluación de resultados
      login/                 # Pantalla de inicio de sesión
      nota-incumplimiento/   # Gestión de notas por incumplimiento
      plan-accion/           # Planes de acción correctiva
      senalar-problema/      # Reporte de problemas
      usuario/               # Gestión de usuarios
    models/                  # Modelos de datos (interfaces TypeScript)
      caso-admin.model.ts
      caso-create.model.ts
      categoria.model.ts
    services/                # Servicios para comunicación con la API
      casos.service.ts
      categorias.service.ts
      usuarios.service.ts
    app.component.ts          # Componente raíz de la aplicación
    app.component.scss        # Estilos del componente raíz
    app.config.ts             # Configuración global
    app.routes.ts             # Definición de rutas
    app.html                  # Plantilla principal
    app.spec.ts               # Pruebas del componente raíz
  assets/img/                # Imágenes y recursos gráficos
    Logo.jpg
    mega-building.jpg
    mega-icon.ico
  index.html                 # Archivo HTML principal
  main.ts                    # Punto de entrada de la aplicación
  styles.scss                # Estilos globales
.editorconfig               # Configuración de estilo de código
angular.json                # Configuración del proyecto Angular
package.json                # Dependencias y scripts del proyecto
package-lock.json           # Bloqueo de dependencias
README.md                   # Documentación del proyecto
tsconfig.app.json           # Configuración TypeScript para la aplicación
tsconfig.json               # Configuración global de TypeScript
tsconfig.spec.json          # Configuración TypeScript para pruebas


## 🌐 Relación con otros repositorios
Este proyecto se conecta con el backend disponible en el repositorio:
NotasDisciplinarias.API 

📚 Recursos adicionales
Para más información sobre Angular CLI y referencias detalladas de comandos, visita:
https://angular.dev/tools/cli

