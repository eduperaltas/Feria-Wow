import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css'],
})
export class BienvenidaComponent implements OnInit {
  username: string | null = '';
  name: string | null = '';
  nextUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    // Obtener el nombre de usuario desde el servicio de autenticación
    this.username = this.authService.getUsername();
    this.name = this.authService.getName();

    if (this.username) {
      // Marcar en Firestore que el usuario ha visto la bienvenida
      await this.authService.markWelcomeAsSeen(this.username);
    }

   // Obtener la URL de redirección desde los query params
   const queryParams = new URLSearchParams(window.location.search);
   this.nextUrl = queryParams.get("nextUrl") || "/pasaporte"; // Por defecto redirigir a "/home"
  }

  // Función para continuar después de la bienvenida
  continue() {
    if (this.nextUrl) {
      // Redirigir al nextUrl si está definido
      this.router.navigateByUrl(this.nextUrl);
    } else {
      // Si no hay nextUrl, redirigir a una página predeterminada
      this.router.navigate(['pasaporte']);
    }
  }
}