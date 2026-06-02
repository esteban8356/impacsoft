import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideLottieOptions } from 'ngx-lottie';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideLottieOptions({
      player: () => import('lottie-web'),
    })
  ]
};
