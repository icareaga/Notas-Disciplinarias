import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que adjunta el JWT guardado en `localStorage` a todas las
 * peticiones HTTP como `Authorization: Bearer <token>`.
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};