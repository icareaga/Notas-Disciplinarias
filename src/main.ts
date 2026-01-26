import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Punto de entrada de Angular.
 *
 * Arranca la aplicación standalone usando `bootstrapApplication` y la
 * configuración global en `appConfig` (router + http/interceptors).
 */

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
