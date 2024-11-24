import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  name: string | null = '';

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    // Obtener el nombre de usuario desde el servicio de autenticación
    this.name = this.authService.getName();

  }

}
