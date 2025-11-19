import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';
import { JwtInterceptor } from './interceptors/jwt.interceptor'; // <-- Importado
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt, 'pt-BR'); // <-- Registra 'pt-BR'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // <-- HttpClient configurado
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, // <-- Interceptor registrado
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ]
};
