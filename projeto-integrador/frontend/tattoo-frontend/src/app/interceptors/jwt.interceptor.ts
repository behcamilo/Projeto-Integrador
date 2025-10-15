// frontend/tattoo-frontend/src/app/interceptors/jwt.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment.development';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const accessToken = this.authService.getAccessToken();
    const apiUrl = environment.apiUrl;
    const isApiUrl = request.url.startsWith(apiUrl);

    // CORREÇÃO: Exclui endpoints de autenticação da adição automática de token
    const isAuthEndpoint = request.url.includes('/login/') || request.url.includes('/register/');

    // Só anexa o token se:
    // 1. O token existir
    // 2. A requisição for para a nossa API
    // 3. NÃO for para um endpoint de autenticação (login/register)
    if (accessToken && isApiUrl && !isAuthEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}