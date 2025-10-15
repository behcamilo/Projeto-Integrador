import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service'; // Novo Serviço

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-register.component.html',
  styleUrls: ['../shared-auth.scss'] // Reutiliza estilos se criarmos um arquivo shared
})
export class ClientRegisterComponent {
  clientRegisterForm: FormGroup;
  error: string | null = null;
  clientService = inject(ClientService);
  router = inject(Router);
  fb = inject(FormBuilder);

  constructor() {
    this.clientRegisterForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefone: ['']
    });
  }

  onSubmit(): void {
    if (this.clientRegisterForm.valid) {
      this.error = null;
      this.clientService.register(this.clientRegisterForm.value).subscribe({
        next: (response) => {
          console.log('Cliente registrado com sucesso!', response);
          alert('Cadastro realizado! Faça login para continuar.');
          this.router.navigate(['/cliente/login']); 
        },
        error: (err) => {
          console.error('Falha no registro do cliente:', err);
          this.error = 'Erro no cadastro. Verifique se o e-mail já está em uso.';
        }
      });
    }
  }
}