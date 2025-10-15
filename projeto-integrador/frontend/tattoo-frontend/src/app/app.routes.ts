import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/auth/home/home.component';
import { ProfileComponent } from './components/profile/profile.component'; // NOVO: Importe o ProfileComponent
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';


export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'register', component: RegisterComponent, title: 'Registro' },
    { path: 'home', component: HomeComponent, title: 'Feed' },
    
    // NOVO: Rota para o perfil
    { path: 'perfil', component: ProfileComponent, title: 'Perfil do Tatuador' },
    
    // Rota de Redirecionamento
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];