
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // Adicione um arquivo .scss se quiser estilos
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], 
      studio_name: [''],
      bio: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.error = null;
      // Chamada ao endpoint POST /api/tattoo/register/
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registro realizado com sucesso!', response);
          // O registro bem-sucedido não retorna tokens, então redirecionamos para o login.
          this.router.navigate(['/login']); 
        },
        error: (err) => {
          console.error('Falha no registro', err);
          // Tratamento de erros, ex: username já existe.
          this.error = 'Ocorreu um erro no registro. Verifique os dados e tente novamente.';
        }
      });
    }
  }
}