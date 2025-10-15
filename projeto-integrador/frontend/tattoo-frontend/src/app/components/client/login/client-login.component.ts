// frontend/tattoo-frontend/src/app/components/client/login/client-login.component.ts

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-login.component.html',
  styleUrls: ['../shared-auth.scss']
})
export class ClientLoginComponent {
  clientLoginForm: FormGroup;
  error: string | null = null;
  clientService = inject(ClientService);
  authService = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.clientLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.clientLoginForm.valid) {
      this.error = null;
      
      this.clientService.login(this.clientLoginForm.value).subscribe({
        next: (response) => {
          // *** PASSO DE DEBUG CRÍTICO ***
          console.log('Login de Cliente bem-sucedido. Resposta da API:', response);
          
          if (response && response.client_id) { 
             this.authService.logout(); // Limpa token de tatuador
             
             localStorage.setItem('client_id', response.client_id.toString());
             localStorage.setItem('client_name', response.nome || 'Cliente');

             // NAVEGAÇÃO: Chamada simples para a rota
             this.router.navigate(['/cliente/perfil']); 

          } else {
             // Se o login foi 200 OK, mas o body não tem o ID (problema no backend)
             this.error = 'Erro: A API de login não retornou o ID do cliente. Verifique o backend.';
             console.error(this.error, response);
          }
        },
        error: (err) => {
          // Lida com erros de API (401 Unauthorized, 404 Not Found, etc.)
          console.error('Falha no login do cliente (API error):', err);
          this.error = 'Credenciais inválidas ou erro de servidor.';
          if (err.status === 401) {
              this.error = 'E-mail ou senha inválidos.';
          } else if (err.status > 0) {
              this.error = `Erro do servidor (${err.status}). Consulte o console.`;
          }
        }
      });
    }
  }
}