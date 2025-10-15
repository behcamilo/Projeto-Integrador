// Conteúdo de frontend/tattoo-frontend/src/app/components/auth/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  user: any; 
  // Novo: Array para armazenar os perfis dos tatuadores
  tattooArtistProfiles: any[] = []; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // 1. Tenta carregar o perfil do usuário logado (para o header/boas-vindas)
    if (this.isLoggedIn) {
        this.authService.getMe().subscribe({
            next: (data: any) => { this.user = data; },
            error: (err: any) => {
                // Se o token falhar, o usuário não está mais logado.
                this.authService.logout();
                this.isLoggedIn = false;
            }
        });
    }

    // 2. Carrega todos os perfis para o feed (funciona mesmo sem login)
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.authService.getTattooArtistProfiles().subscribe({
      next: (profiles: any[]) => {
        this.tattooArtistProfiles = profiles;
        console.log('Perfis carregados:', this.tattooArtistProfiles);
      },
      error: (err: any) => {
        console.error('Falha ao carregar perfis:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Novo método para a funcionalidade do botão Agendar
  agendar(tatuadorId: number): void {
      console.log(`Abrir agendamento para o Tatuador ID: ${tatuadorId}`);
      // Lógica futura: Redirecionar para a tela de agendamento (/agenda/:id)
      // this.router.navigate(['/agenda', tatuadorId]);
  }
}