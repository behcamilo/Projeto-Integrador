import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Necessário para ngIf, ngFor, etc.

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // *** ALTERAÇÃO AQUI ***
    // O formulário agora usa 'username' em vez de 'email'
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {

    if (this.loginForm.valid) {

      this.error = null;

      this.authService.login(this.loginForm.value).subscribe({

        next: (response) => {

          console.log('Login successful', response);
          
          // Redireciona para a rota /perfil do tatuador
          this.router.navigate(['/perfil']); 

        },

        error: (err) => {

          console.error('Login failed', err);
          this.error = 'Credenciais inválidas. Verifique seu usuário e senha.';
          if (err.status === 401) {
              this.error = 'Usuário ou senha inválidos.';
          }

        }

      });

    }

  }

}