import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './services/auth.interceptor';

/**
 * Configuración global de la app (standalone).
 *
 * Aquí se registra:
 * - Router (rutas principales del flujo)
 * - HttpClient + interceptores (para adjuntar JWT en `Authorization`)
 */

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
