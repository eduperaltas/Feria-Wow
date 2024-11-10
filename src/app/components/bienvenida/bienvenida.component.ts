import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css']
})
export class BienvenidaComponent implements OnInit {
  username: string | null = '';
  name: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    // Obtener el nombre de usuario desde el servicio de autenticación
    this.username = this.authService.getUsername();
    this.name = this.authService.getName();

    if (this.username) {
      // Marcar en Firestore que el usuario ha visto la bienvenida
      await this.authService.markWelcomeAsSeen(this.username);
    } else {
      // Si no hay sesión activa, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  // Función para continuar después de la bienvenida
  continue() {
    const tema = this.authService.getTema(); // Obtener el tema guardado de LocalStorage

    if (tema) {
      // Si existe un tema, redirigir a la trivia de ese tema
      this.router.navigate([`/trivia/${tema}`]);
    } else {
      // Si no hay un tema guardado, simplemente no hacer nada (o puedes agregar una acción adicional aquí si deseas)
      console.log('No hay tema guardado. Permanecer en la página de bienvenida o ejecutar otra lógica.');
    }
  }
}
