import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ClientService } from '../../../services/client.service';
import { Router, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  user: any; 
  
  // Listas de dados
  posts: any[] = []; 
  artists: any[] = [];
  
  // Controle de Busca
  searchType: 'posts' | 'artists' = 'posts';
  searchTerm: string = '';
  
  clientId: number | null = null;
  likedPostIds: Set<number> = new Set(); 

  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  ngOnInit(): void {
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

    const cId = localStorage.getItem('client_id');
    if (cId) {
        this.clientId = parseInt(cId, 10);
    }

    this.loadData();
  }

  loadData(): void {
    if (this.searchType === 'posts') {
        this.authService.getPosts(this.searchTerm).subscribe({
          next: (postsData: any[]) => {
            this.posts = postsData;
            this.artists = []; 
            if (this.clientId) {
                this.loadClientLikes();
            }
          },
          error: (err: any) => console.error('Falha ao carregar posts:', err)
        });
    } else {
        this.authService.getTattooArtistProfiles(this.searchTerm).subscribe({
            next: (artistsData: any[]) => {
                this.artists = artistsData;
                this.posts = [];
            },
            error: (err: any) => console.error('Falha ao carregar artistas:', err)
        });
    }
  }

  onSearch(): void {
      this.loadData();
  }

  onTypeChange(): void {
      this.searchTerm = ''; 
      this.loadData();
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

  agendar(post: any): void {
      if (!post.tatuador_id) return;
      
      this.router.navigate(['/artista', post.tatuador_id], {
          queryParams: {
              tattoo: post.id,
              duration: post.tempo_estimado || 60
          }
      });
  }
}