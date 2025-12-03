import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl; 
  private tatuagemApiUrl = this.apiUrl.replace('/tattoo', '/tatuagem'); 
  
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

  // Atualizado para aceitar busca
  getTattooArtistProfiles(search?: string): Observable<any[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any[]>(`${this.apiUrl}/profiles/`, { params }); 
  }
  
  // Atualizado para aceitar busca
  getPosts(search?: string): Observable<any[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any[]>(`${this.tatuagemApiUrl}/posts/`, { params });
  }

  getEstilos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.tatuagemApiUrl}/estilos/`);
  }

  updateProfilePicture(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('profile_picture', imageFile, imageFile.name);
    return this.http.patch(`${this.apiUrl}/me/`, formData); 
  }

  postTattooImage(postData: { descricao: string, tamanho: string, preco: number, estilo_id?: number, tempo_estimado: number }, imageFile: File): Observable<any> {
    const formData = new FormData();
    
    formData.append('imagem', imageFile, imageFile.name);
    formData.append('descricao', postData.descricao);
    formData.append('tamanho', postData.tamanho);
    formData.append('preco', postData.preco.toString());
    formData.append('tempo_estimado', postData.tempo_estimado.toString());
    
    if (postData.estilo_id) {
        formData.append('estilo_id', postData.estilo_id.toString());
    }
    
    return this.http.post(`${this.tatuagemApiUrl}/posts/`, formData); 
  }
}