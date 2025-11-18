import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { Router } from '@angular/router'; // [CORREÇÃO] Removido RouterLink
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule], // [CORREÇÃO] Removido RouterLink
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  user: any; 
  posts: any[] = []; 
  
  // Controle do Cliente Logado
  clientId: number | null = null;
  likedPostIds: Set<number> = new Set(); 

  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  ngOnInit(): void {
    // 1. Verifica se é um Tatuador logado
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
        this.authService.getMe().subscribe({
            next: (data: any) => { this.user = data; },
            error: (err: any) => {
                this.authService.logout();
                this.isLoggedIn = false;
            }
        });
    }

    // 2. Verifica se é um Cliente logado
    const cId = localStorage.getItem('client_id');
    if (cId) {
        this.clientId = parseInt(cId, 10);
    }

    this.loadData();
  }

  loadData(): void {
    this.authService.getPosts().subscribe({
      next: (postsData: any[]) => {
        this.posts = postsData;
        // Se houver um cliente logado, carregamos os likes dele
        if (this.clientId) {
            this.loadClientLikes();
        }
      },
      error: (err: any) => {
        console.error('Falha ao carregar posts:', err);
      }
    });
  }

  loadClientLikes(): void {
      if (!this.clientId) return;

      this.clientService.getProfile(this.clientId).subscribe({
          next: (profile: any) => {
              this.likedPostIds.clear();
              if (profile.posts_curtidos) {
                  profile.posts_curtidos.forEach((p: any) => this.likedPostIds.add(p.id));
              }
              this.updatePostsLikeStatus();
          },
          error: (err) => console.error('Erro ao carregar likes do cliente', err)
      });
  }

  updatePostsLikeStatus(): void {
      this.posts.forEach(post => {
          post.curtido = this.likedPostIds.has(post.id);
      });
  }

  toggleLike(post: any): void {
      if (!this.clientId) {
          alert('Você precisa estar logado como Cliente para curtir.');
          this.router.navigate(['/cliente/login']);
          return;
      }

      const wasLiked = post.curtido;
      post.curtido = !wasLiked;

      if (post.curtido) {
          this.likedPostIds.add(post.id);
      } else {
          this.likedPostIds.delete(post.id);
      }

      this.clientService.likePost(post.id, this.clientId).subscribe({
          next: (res) => {
              console.log('Like atualizado', res);
          },
          error: (err) => {
              console.error('Erro ao dar like', err);
              post.curtido = wasLiked;
              if (wasLiked) this.likedPostIds.add(post.id);
              else this.likedPostIds.delete(post.id);
          }
      });
  }

  agendar(tatuadorId: number): void {
      if (!tatuadorId) return;
      this.router.navigate(['/artista', tatuadorId]);
  }
}