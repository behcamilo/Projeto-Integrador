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

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/`); 
  }

  getTattooArtistProfiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/profiles/`); 
  }

  // --- 1. ENVIAR FOTO DE PERFIL (PATCH) ---
  updateProfilePicture(imageFile: File): Observable<any> {
    const formData = new FormData();
    // O nome do campo deve ser 'profile_picture'
    formData.append('profile_picture', imageFile, imageFile.name);

    // PATCH para o endpoint /me/ (o token é adicionado pelo Interceptor)
    return this.http.patch(`${this.apiUrl}/me/`, formData); 
  }

  // --- 2. POSTAR NOVA TATUAGEM (POST) ---
  postTattooImage(postData: { descricao: string, tamanho: string, preco: number, estilo_id?: number }, imageFile: File): Observable<any> {
    const formData = new FormData();
    
    // O nome do campo deve ser 'imagem'
    formData.append('imagem', imageFile, imageFile.name);
    
    // Anexar outros dados do formulário
    formData.append('descricao', postData.descricao);
    formData.append('tamanho', postData.tamanho);
    formData.append('preco', postData.preco.toString());
    
    if (postData.estilo_id) {
        formData.append('estilo_id', postData.estilo_id.toString());
    }
    
    // POST para o endpoint de criação de posts (Assumindo que o /api/tatuagem/posts/ está em environment.apiUrl/posts/)
    return this.http.post(`${this.apiUrl}/posts/`, formData); 
  }
}