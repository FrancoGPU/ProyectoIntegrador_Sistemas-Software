import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor HTTP para agregar el token JWT a todas las peticiones
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del localStorage
  const token = localStorage.getItem('authToken');
  
  console.log('JwtInterceptor processing:', req.url);

  // Dominios externos que no requieren autenticación
  const isExternalApi = req.url.includes('openstreetmap.org') || req.url.includes('project-osrm.org');

  // Si existe token y la petición es a la API (no a auth/login o auth/register) y no es externa
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register') && !isExternalApi) {
    console.log('JwtInterceptor: Adding Authorization header');
    // Clonar la petición y agregar el header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log('JwtInterceptor: NOT adding header. Token:', !!token);
  }
  
  // Continuar con la petición
  return next(req);
};
