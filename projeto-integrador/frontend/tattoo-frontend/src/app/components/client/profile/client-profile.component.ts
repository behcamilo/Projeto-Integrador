import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/client.service'; // <-- CORREÇÃO: 3 níveis para o Service
import { environment } from '../../../../environments/environment.development'; // 4 níveis para o Environment (Correto)

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'] 
})
export class ClientProfileComponent implements OnInit {
  clientService = inject(ClientService);
  router = inject(Router);
  profile: any = null;
  clientId: number | null = null;
  isLoading: boolean = true; 

  ngOnInit(): void {
    const id = localStorage.getItem('client_id');
    if (id) {
      this.clientId = parseInt(id, 10);
      this.fetchClientProfile();
    } else {
      this.router.navigate(['/cliente/login']);
    }
  }

  fetchClientProfile(): void {
    if (!this.clientId) {
      this.logout();
      return;
    }
    
    // TS2571 - Corrigido pelo uso de tipagem explícita abaixo
    this.clientService.getProfile(this.clientId).subscribe({
      next: (data: any) => { // <-- CORREÇÃO TS7006: data: any
        this.profile = data;
        this.isLoading = false;
      },
      error: (err: any) => { // <-- CORREÇÃO TS7006: err: any
        console.error('Erro ao carregar perfil do cliente:', err);
        this.logout();
        this.isLoading = false;
      }
    });
  }
  
  // Método de construção de URL para resolver imagens
  getProfileImageUrl(path: string | null): string {
    if (path && path.startsWith('http')) {
        return path; 
    }
    if (path) {
        const baseUrl = environment.apiUrl.replace('/api/tattoo', '');
        return `${baseUrl}${path}`;
    }
    return 'assets/default-profile.png'; 
  }

  // Função handleLike que o template espera
  handleLike(postId: number): void {
      if (!this.clientId) return;

      // TS2571 - Corrigido pelo uso de tipagem explícita abaixo
      this.clientService.likePost(postId, this.clientId).subscribe({
          next: (response: any) => { // <-- CORREÇÃO TS7006: response: any
              console.log('Post descurtido/removido dos favoritos:', response);
              // Recarrega o perfil para atualizar a lista de favoritos
              this.fetchClientProfile();
          },
          error: (err: any) => { // <-- CORREÇÃO TS7006: err: any
              console.error('Falha ao remover favorito:', err);
          }
      });
  }

  logout(): void {
    localStorage.removeItem('client_id');
    localStorage.removeItem('client_name');
    this.router.navigate(['/cliente/login']);
  }
}