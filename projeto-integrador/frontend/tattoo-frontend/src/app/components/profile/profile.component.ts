import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 

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
  
  ngOnInit(): void {
    // Redirecionamento de segurança caso o usuário tente acessar sem estar logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']); 
      return;
    }
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    // Chama o endpoint /api/tattoo/me/
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

  // Lógica para formatar a URL da imagem (incluindo o host do backend)
  getProfileImageUrl(path: string | null): string {
    if (path) {
      // Usa o proxy/backend em localhost:8000 para acessar a pasta media
      return `http://localhost:8000${path}`;
    }
    // Imagem padrão (crie assets/default-profile.png)
    return 'assets/default-profile.png'; 
  }
}