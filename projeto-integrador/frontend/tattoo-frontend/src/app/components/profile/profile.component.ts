// frontend/tattoo-frontend/src/app/components/profile/profile.component.ts

// 1. Importar ReactiveFormsModule e tipos de formulário
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
// [REMOVIDO] A importação do environment não é mais necessária aqui
import { AgendaComponent } from "../agenda/agenda.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  // 2. Adicionar ReactiveFormsModule
  imports: [CommonModule, AgendaComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder); // 3. Injetar FormBuilder

  user: any = null;
  uploading: boolean = false;
  uploadMessage: string | null = null;

  isMyProfile: boolean = false;
  artistId: number | null = null;

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  
  // 4. Variáveis para o formulário de postagem
  postForm: FormGroup;
  postFile: File | null = null;
  @ViewChild('postFileInput') postFileInput: ElementRef | undefined;
  postSubmissionError: string | null = null;
  estilos: any[] = []; // Para o dropdown

  constructor() {
    // 5. Inicializar o formulário de postagem
    this.postForm = this.fb.group({
      descricao: [''],
      tamanho: [''],
      preco: [0, Validators.min(0)],
      estilo_id: [null],
      imagem: [null, Validators.required] // Validador para o arquivo
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      
      if (idParam) {
        // É um perfil público (ex: /artista/5)
        this.isMyProfile = false;
        this.artistId = parseInt(idParam, 10);
        this.fetchPublicUserProfile(this.artistId);
      } else {
        // É o perfil do tatuador logado (rota /perfil)
        this.isMyProfile = true;
        if (!this.authService.isLoggedIn()) {
          this.router.navigate(['/login']);
          return;
        }
        this.fetchMyUserProfile();
        this.loadEstilos(); // 6. Carregar estilos se for o perfil do dono
      }
    });
  }

  // 7. [NOVO] Carregar estilos da API
  loadEstilos(): void {
    this.authService.getEstilos().subscribe({
      next: (data) => {
        this.estilos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar estilos', err);
      }
    });
  }

  fetchMyUserProfile() {
    this.authService.getMe().subscribe({
      next: (data: any) => {
        this.user = data;
        this.artistId = data.id; // Salva o ID para passar para a agenda
      },
      error: (err: any) => {
        console.error('Token inválido ou expirado. Forçando logout.', err);
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  fetchPublicUserProfile(id: number) {
    // Reutiliza o endpoint que busca TODOS os perfis (idealmente, o backend teria um endpoint /profiles/<id>/)
    this.authService.getTattooArtistProfiles().subscribe({
      next: (profiles) => {
        this.user = profiles.find(p => p.id === id);
        if (!this.user) {
          console.error('Artista não encontrado');
          this.router.navigate(['/home']); // Volta pro feed se o artista não existe
        }
      },
      error: (err) => {
        console.error('Erro ao buscar perfil público', err);
        this.router.navigate(['/home']);
      }
    });
  }

  // [REMOVIDO] A função getProfileImageUrl(path) foi removida.

  triggerFileInputClick(): void {
    this.fileInput?.nativeElement.click();
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
  
  // 8. [NOVO] Lógica para o formulário de NOVO POST
  triggerPostFileInputClick(): void {
    this.postFileInput?.nativeElement.click();
  }

  onPostFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.postFile = file;
      // Atualiza o valor do form para passar na validação
      this.postForm.patchValue({ imagem: file }); 
      this.postSubmissionError = null;
    }
  }

  onPostSubmit(): void {
    if (!this.postFile) {
      this.postSubmissionError = 'Por favor, selecione uma imagem para postar.';
      this.postForm.markAllAsTouched();
      return;
    }
    
    if (this.postForm.invalid) {
       this.postSubmissionError = 'Preencha os campos obrigatórios.';
       return;
    }

    this.postSubmissionError = null;
    const postData = this.postForm.value;

    this.authService.postTattooImage(postData, this.postFile).subscribe({
      next: (newPost) => {
        console.log('Post criado com sucesso!', newPost);
        // Adiciona o novo post no início da lista na UI
        if (!this.user.posts) {
            this.user.posts = [];
        }
        this.user.posts.unshift(newPost);
        
        // Limpa o formulário
        this.postForm.reset({ preco: 0, estilo_id: null });
        this.postFile = null;
        if (this.postFileInput) {
          this.postFileInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('Erro ao criar post', err);
        this.postSubmissionError = 'Erro ao enviar o post. Tente novamente.';
      }
    });
  }
}
