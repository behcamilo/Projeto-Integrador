import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClientService } from './services/client.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'tattoo-frontend';
  
  clientService = inject(ClientService);
  isClientLoggedIn: boolean = false;

  ngOnInit() {
    // Se inscreve para saber se o cliente está logado
    this.clientService.isClientLoggedIn$.subscribe(status => {
      this.isClientLoggedIn = status;
    });
  }
}