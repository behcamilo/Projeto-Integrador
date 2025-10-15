import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // CORREÇÃO: Adiciona RouterLink aqui para a navegação funcionar no template HTML
  imports: [RouterOutlet, RouterLink], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tattoo-frontend';
}