import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/auth/home/home.component';
import { ProfileComponent } from './components/profile/profile.component'; 
import { ClientLoginComponent } from './components/client/login/client-login.component'; 
import { ClientRegisterComponent } from './components/client/register/client-register.component'; 
import { ClientProfileComponent } from './components/client/profile/client-profile.component'; // Importe o componente

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Tatuador Login' },
    { path: 'register', component: RegisterComponent, title: 'Tatuador Registro' },
    
    // Rota original (Perfil do Tatuador Logado)
    { path: 'perfil', component: ProfileComponent, title: 'Perfil do Tatuador' }, 
    
    // *** ROTA ADICIONADA ***
    // Rota para o perfil público de um artista específico
    { path: 'artista/:id', component: ProfileComponent, title: 'Perfil do Artista' },
    
    // Rotas de Cliente
    { path: 'cliente/login', component: ClientLoginComponent, title: 'Cliente Login' },
    { path: 'cliente/cadastro', component: ClientRegisterComponent, title: 'Cliente Cadastro' },
    { path: 'cliente/perfil', component: ClientProfileComponent, title: 'Perfil do Cliente' }, // Rota de destino
    
    { path: 'home', component: HomeComponent, title: 'Feed' },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];