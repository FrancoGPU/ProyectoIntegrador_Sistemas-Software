import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor HTTP para agregar el token JWT a todas las peticiones
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('authToken');
  
  // Si existe token y la petición es a la API (no a auth/login o auth/register)
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    // Clonar la petición y agregar el header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Continuar con la petición
  return next(req);
};
