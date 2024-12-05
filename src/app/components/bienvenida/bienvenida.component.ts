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
 // Variables para el título y contenido
 welcomeTitle: string = 'Bienvenido a una experiencia WOW';
 welcomeContent: string = `
   Ha sido un año de logros, trabajo en equipo y crecimiento en WOW.<br />
   Fortalecimos nuestra red, innovación y compromiso con ustedes: nuestro valioso equipo, clientes y socios.<br /><br />
   Celebremos juntos este momento especial y sigamos soñando en grande.<br /><br />
 `;

 // Estado para saber en qué pantalla está
 isOnRulesScreen: boolean = false;


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
// Función que maneja el botón continuar
handleContinue() {
  if (!this.isOnRulesScreen) {
    // Cambia a la pantalla de las reglas del juego
    this.welcomeTitle = 'Participa en el juego de la Trivia WOW';
    this.welcomeContent = `
      Juega y podrás participar en un sorteo con premios sorpresa. <br /><br />
      Reglas del juego: <br />
      • Conectarse a la aplicación TRIVIA utilizando la cámara del celular y enfocar el Código QR que está en cada STAND.<br />
      •⁠ Responder las preguntas de la TRIVIA y si logra responder 3 respuestas correctas, Ud ganará un SELLO por cada STAND visitado.<br />
      •⁠ Si Ud acumula todos los SELLOS, participará en un SORTEO con premios sorpresa.<br /><br />
      <strong>¡Mucha suerte!</strong>
    `;
    this.isOnRulesScreen = true;
  } else {
    // Llama la función original de continuar
    this.continue();
  }
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