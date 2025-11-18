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
// REMOVA a importação do environment, não precisamos mais dela aqui.

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const accessToken = this.authService.getAccessToken();

    // --- LÓGICA CORRIGIDA ---

    // 1. Verifica se é uma requisição para qualquer API do backend (que o proxy irá capturar)
    const isApiRequest = request.url.includes('/api/tattoo/') || request.url.includes('/api/tatuagem/');

    // 2. Verifica se é um endpoint de autenticação (Tatuador OU Cliente)
    //    Estes NUNCA devem receber o token.
    const isAuthEndpoint = request.url.includes('/login/') || 
                           request.url.includes('/register/') ||
                           request.url.includes('/client/register/'); // Adicionado para garantir

    // 3. Anexa o token se:
    //    - O token existir E
    //    - For uma requisição para a API E
    //    - NÃO for um endpoint de autenticação
    if (accessToken && isApiRequest && !isAuthEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(request);
  }
}