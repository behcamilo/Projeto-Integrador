import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private baseClientUrl = environment.apiUrl.replace('/tattoo', '/tatuagem/client'); 
  private basePostUrl = environment.apiUrl.replace('/tattoo', '/tatuagem/posts'); 

  // Gerenciamento de Estado de Login do Cliente
  private isClientLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isClientLoggedIn$ = this.isClientLoggedInSubject.asObservable();

  private hasToken(): boolean {
    return !!localStorage.getItem('client_id');
  }

  // --- Funções de Autenticação ---

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseClientUrl}/register/`, userData);
  }

  login(credentials: any): Observable<{ client_id: number; nome: string; }> {
    return this.http.post<{ client_id: number; nome: string; }>(`${this.baseClientUrl}/login/`, credentials)
      .pipe(
        tap(response => {
          if (response && response.client_id) {
            localStorage.setItem('client_id', response.client_id.toString());
            localStorage.setItem('client_name', response.nome || 'Cliente');
            this.isClientLoggedInSubject.next(true); // Notifica que logou
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('client_id');
    localStorage.removeItem('client_name');
    this.isClientLoggedInSubject.next(false); // Notifica que saiu
  }

  getProfile(clientId: number): Observable<any> {
    return this.http.get(`${this.baseClientUrl}/${clientId}/perfil/`);
  }

  updateAvatar(clientId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.patch(`${this.baseClientUrl}/${clientId}/perfil/`, formData);
  }

  // --- Funções de Favorito ---

  likePost(postId: number, clientId: number): Observable<{ status: string; total_curtidas: number }> {
    return this.http.post<{ status: string; total_curtidas: number }>(
      `${this.basePostUrl}/${postId}/like/${clientId}/`, {}
    );
  }
}