import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientService } from '../../../services/client.service';

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
  
  // Variáveis para upload
  uploading: boolean = false;
  uploadMessage: string | null = null;
  @ViewChild('fileInput') fileInput: ElementRef | undefined;

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
    
    this.clientService.getProfile(this.clientId).subscribe({
      next: (data: any) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil do cliente:', err);
        this.logout();
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Upload de Foto ---
  
  triggerFileInputClick(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && this.clientId) {
      this.uploading = true;
      this.uploadMessage = 'Enviando imagem...';

      this.clientService.updateAvatar(this.clientId, file).subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile; // Atualiza o perfil na tela
          this.uploading = false;
          this.uploadMessage = 'Foto atualizada com sucesso!';
          setTimeout(() => this.uploadMessage = null, 3000);
        },
        error: (err) => {
          console.error('Erro no upload:', err);
          this.uploading = false;
          this.uploadMessage = 'Erro ao enviar imagem.';
          setTimeout(() => this.uploadMessage = null, 3000);
        }
      });
    }
  }

  // --- Lógica de Favoritos ---

  handleLike(postId: number): void {
      if (!this.clientId) return;

      this.clientService.likePost(postId, this.clientId).subscribe({
          next: (response: any) => {
              console.log('Post descurtido:', response);
              // Remove o post da lista localmente para atualizar a tela instantaneamente
              if (this.profile && this.profile.posts_curtidos) {
                  this.profile.posts_curtidos = this.profile.posts_curtidos.filter((p: any) => p.id !== postId);
              }
          },
          error: (err: any) => {
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