
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
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {

    if (this.loginForm.valid) {

      this.error = null;

      this.authService.login(this.loginForm.value).subscribe({

        next: (response) => {

          console.log('Login successful', response);

          // ❌ ANTES: this.router.navigate(['/me']);

          // ✅ AGORA: Redireciona para a rota /home, que é onde o perfil do usuário é exibido.

          this.router.navigate(['/home']); 

        },

        error: (err) => {

          console.error('Login failed', err);

          this.error = 'Credenciais inválidas. Verifique seu e-mail e senha.';

        }

      });

    }

  }

}