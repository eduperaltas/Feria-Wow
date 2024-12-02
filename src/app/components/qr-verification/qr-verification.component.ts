import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from "../../services/auth.service";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-verification.component.html',
  styleUrls: ['./qr-verification.component.css']
})
export class QrVerificationComponent implements OnInit {
  welcomeTitle: string = '';
  welcomeMessage: string = '';
  username: string = '';
  securityUser: string = '';
  isLoading: boolean = true; // Variable para controlar el estado de carga

  constructor(private route: ActivatedRoute,     private router: Router, // Inyectar Router
    private authService: AuthService) {}

  async ngOnInit() {
    try {
      // Extraer el username desde la URL
      this.username = this.route.snapshot.paramMap.get('username') || 'Usuario desconocido';
      this.securityUser = this.authService.getUsername() || "";


      // Verificar si el usuario tiene acceso de seguridad
      const hasSecurityAccess = await this.authService.IsSecurityAccess(this.securityUser);
      if (!hasSecurityAccess) {
        console.warn(`El usuario ${this.username} no tiene acceso de seguridad.`);
        
        // Redirigir a /pasaporte
        this.router.navigate(['/pasaporte']); 

        this.isLoading = false; // Detener el loader
        return; // Salir de la función si no tiene acceso
      }


      // Llamar a la función de asistencia y obtener el mensaje correspondiente
      const message = await this.authService.registerAttendance(this.username);

      // Obtener solo la primera oración del mensaje
      const firstSentence = message.split('.')[0];

      // Configurar los mensajes según el resultado
      if (message.includes('Acceso permitido')) {
        this.welcomeTitle = 'Acceso Permitido';
        this.welcomeMessage = firstSentence;
      } else {
        this.welcomeTitle = 'Acceso Denegado';
        this.welcomeMessage = firstSentence;
      }
    } catch (error) {
      console.error('Error al procesar la asistencia:', error);
      this.welcomeTitle = 'Error';
      this.welcomeMessage = 'Ocurrió un problema. Intenta nuevamente.';
    } finally {
      // Ocultar el loader
      this.isLoading = false;
    }
  }
}