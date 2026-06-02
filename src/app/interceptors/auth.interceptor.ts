import { HttpInterceptorFn } from '@angular/common/http';

// Define el base URL de la API. Puedes cambiarlo a 'http://localhost:3000' si deseas probar localmente.
export const API_BASE_URL = 'https://organizacion-bakend-3yl9vj-87dc47-187-77-195-31.sslip.io';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    let url = req.url;

    // Si la petición va dirigida a localhost, la redirigimos a la API del servidor desplegado
    if (url.startsWith('http://localhost:3000')) {
        url = url.replace('http://localhost:3000', API_BASE_URL);
    }

    const authReq = req.clone({
        url,
        withCredentials: true
    });
    return next(authReq);
};

