import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  errorMessage: string = ''; // Nueva propiedad para el mensaje de error

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    this.errorMessage = ''; // Limpiamos el mensaje de error al intentar iniciar sesión

    if (this.username.trim()) {
      const exists = await this.authService.userExists(this.username);
      if (exists) {
        await this.authService.setUserSession(this.username);
        // Navegar a bienvenida
        this.router.navigate(['/bienvenida']); // Cambiado a navigate para redirigir
      } else {
        this.errorMessage = 'El usuario no existe. Por favor, intenta con otro nombre.';
      }
    } else {
      this.errorMessage = 'Por favor, ingresa un nombre de usuario.';
    }
  }
}
