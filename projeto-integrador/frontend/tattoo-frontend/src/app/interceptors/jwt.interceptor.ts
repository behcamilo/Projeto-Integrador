import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    const accessToken = this.authService.getAccessToken();

    // 1. Verifica se é uma requisição para a API
    const isApiRequest = request.url.includes('/api/tattoo/') || request.url.includes('/api/tatuagem/');

    // 2. Verifica se é um endpoint de autenticação (para não enviar token onde não deve)
    const isAuthEndpoint = request.url.includes('/login/') || 
                           request.url.includes('/register/') ||
                           request.url.includes('/client/register/');

    // 3. Anexa o token se existir e for apropriado
    if (accessToken && isApiRequest && !isAuthEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    // 4. Manipula a resposta: Se der erro 401, faz logout forçado
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Token expirado ou inválido (401). Realizando logout automático.');
          // Limpa o token inválido
          this.authService.logout();
          // Redireciona para o login
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}