import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  user: any = null; 
  uploading: boolean = false; 
  uploadMessage: string | null = null;
  
  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']); 
      return;
    }
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    this.authService.getMe().subscribe({
      next: (data: any) => {
        this.user = data;
      },
      error: (err: any) => {
        console.error('Token inválido ou expirado. Forçando logout.', err);
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  // CORREÇÃO OTIMIZADA: Retorna a URL absoluta diretamente se ela vier completa (o que está acontecendo)
  getProfileImageUrl(path: string | null): string {
    if (path && path.startsWith('http')) {
        // Se o path já começar com 'http' (URL absoluta), usa ele.
        return path; 
    }
    if (path) {
        // Fallback: Se for um path relativo (ex: /media/...), constrói o URL.
        const baseUrl = environment.apiUrl.replace('/api/tattoo', '');
        return `${baseUrl}${path}`;
    }
    // Imagem padrão
    return 'assets/default-profile.png'; 
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.uploading = true;
      this.uploadMessage = 'Enviando imagem...';

      this.authService.updateProfilePicture(file).subscribe({
        next: (response: any) => {
          this.user = response; 
          this.uploading = false;
          this.uploadMessage = 'Foto de perfil atualizada com sucesso!';
          setTimeout(() => this.uploadMessage = null, 3000);
        },
        error: (err: any) => {
          this.uploading = false;
          this.uploadMessage = 'Erro ao enviar a imagem. Tente novamente.';
          console.error('Erro de upload:', err);
          setTimeout(() => this.uploadMessage = null, 3000);
        }
      });
    }
  }
}