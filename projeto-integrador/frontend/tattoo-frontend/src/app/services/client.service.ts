import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  // Assumindo que environment.apiUrl é "http://localhost:8000/api/tattoo"
  private baseClientUrl = environment.apiUrl.replace('/tattoo', '/tatuagem/client'); 
  private basePostUrl = environment.apiUrl.replace('/tattoo', '/tatuagem/posts'); 

  // --- Funções de Autenticação ---

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseClientUrl}/register/`, userData);
  }

  login(credentials: any): Observable<{ client_id: number; nome: string; }> {
    return this.http.post<{ client_id: number; nome: string; }>(`${this.baseClientUrl}/login/`, credentials);
  }

  getProfile(clientId: number): Observable<any> {
    return this.http.get(`${this.baseClientUrl}/${clientId}/perfil/`);
  }

  // --- Funções de Favorito ---

  likePost(postId: number, clientId: number): Observable<{ status: string; total_curtidas: number }> {
    // POST /api/tatuagem/posts/{post_id}/like/{client_id}/
    return this.http.post<{ status: string; total_curtidas: number }>(
      `${this.basePostUrl}/${postId}/like/${clientId}/`, {}
    );
  }
}