import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AgendaComponent } from "../agenda/agenda.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AgendaComponent, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  user: any = null;
  uploading: boolean = false;
  uploadMessage: string | null = null;

  isMyProfile: boolean = false;
  artistId: number | null = null;

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  
  postForm: FormGroup;
  postFile: File | null = null;
  @ViewChild('postFileInput') postFileInput: ElementRef | undefined;
  postSubmissionError: string | null = null;
  
  // [REMOVIDO] estilos: any[] = []; 

  preSelectedTattooId: number | null = null;
  preSelectedDuration: number | null = null;

  constructor() {
    this.postForm = this.fb.group({
      descricao: [''],
      tamanho: [''],
      preco: [0, Validators.min(0)],
      tempo_estimado: [60, [Validators.required, Validators.min(30)]], 
      // [ALTERADO] Estilo agora é string
      estilo: [''],
      imagem: [null, Validators.required] 
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
       if (params['tattoo'] && params['duration']) {
           this.preSelectedTattooId = parseInt(params['tattoo'], 10);
           this.preSelectedDuration = parseInt(params['duration'], 10);
           
           setTimeout(() => {
               const agendaEl = document.querySelector('app-agenda');
               if (agendaEl) agendaEl.scrollIntoView({ behavior: 'smooth' });
           }, 500);
       }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      
      if (idParam) {
        this.isMyProfile = false;
        this.artistId = parseInt(idParam, 10);
        this.fetchPublicUserProfile(this.artistId);
      } else {
        this.isMyProfile = true;
        if (!this.authService.isLoggedIn()) {
          this.router.navigate(['/login']);
          return;
        }
        this.fetchMyUserProfile();
        // [REMOVIDO] this.loadEstilos(); 
      }
    });
  }

  fetchMyUserProfile() {
    this.authService.getMe().subscribe({
      next: (data: any) => {
        this.user = data;
        this.artistId = data.id; 
      },
      error: (err: any) => {
        console.error('Token inválido ou expirado.', err);
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  fetchPublicUserProfile(id: number) {
    this.authService.getTattooArtistProfiles().subscribe({
      next: (profiles) => {
        this.user = profiles.find(p => p.id === id);
        if (!this.user) {
          console.error('Artista não encontrado');
          this.router.navigate(['/home']); 
        }
      },
      error: (err) => {
        console.error('Erro ao buscar perfil público', err);
        this.router.navigate(['/home']);
      }
    });
  }

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
          setTimeout(() => this.uploadMessage = null, 3000);
        }
      });
    }
  }
  
  triggerPostFileInputClick(): void {
    this.postFileInput?.nativeElement.click();
  }

  onPostFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.postFile = file;
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
        if (!this.user.posts) {
            this.user.posts = [];
        }
        this.user.posts.unshift(newPost);
        
        // Reset atualizado
        this.postForm.reset({ preco: 0, estilo: '', tempo_estimado: 60 });
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