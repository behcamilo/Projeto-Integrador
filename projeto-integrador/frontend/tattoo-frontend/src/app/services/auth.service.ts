// frontend/tattoo-frontend/src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'access_token';
  private refreshKey = 'refresh_token';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<{access: string, refresh: string}>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
      })
    );
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.clear();
  }

  // CORREÇÃO: Endpoint para buscar dados do usuário logado
  getMe(): Observable<any> {
    // A chamada é para /api/tattoo/me/. O Interceptor adiciona o token JWT.
    return this.http.get(`${this.apiUrl}/me/`); 
  }

  getTattooArtistProfiles(): Observable<any[]> {
    // A chamada é para /api/tattoo/profiles/
    return this.http.get<any[]>(`${this.apiUrl}/profiles/`); 
  }
}