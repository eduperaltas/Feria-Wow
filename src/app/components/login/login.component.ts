import { Component } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  username: string = "";
  errorMessage: string = ""; // Nueva propiedad para el mensaje de error

  constructor(private authService: AuthService, private router: Router) {}
  async login() {
    this.errorMessage = ""; // Limpiar el mensaje de error al intentar iniciar sesión
  
    if (this.username.trim()) {
      try {
        // Verificar si el usuario existe
        const exists = await this.authService.userExists(this.username);
        if (exists) {
          // Establecer la sesión del usuario
          await this.authService.setUserSession(this.username);
  
          // Verificar si el usuario ha visto la bienvenida
          const hasSeenWelcome = await this.authService.hasSeenWelcome(this.username);
  
          // Obtener la URL de redirección desde los query params
          const queryParams = new URLSearchParams(window.location.search);
          const nextUrl = queryParams.get("nextUrl") || "/home"; // Por defecto redirigir a "/home"
  
          if (hasSeenWelcome) {
            // Redirigir al nextUrl
            this.router.navigateByUrl(nextUrl);
          } else {
            // Navegar a la pantalla de bienvenida y pasar el nextUrl
            this.router.navigate(["/bienvenida"], { queryParams: { nextUrl } });
          }
        } else {
          // Usuario no existe
          this.errorMessage =
            "El usuario no existe. Por favor, intenta con otro nombre.";
        }
      } catch (error) {
        // Manejo de errores generales
        this.errorMessage = "Ocurrió un error al iniciar sesión. Por favor, intenta nuevamente.";
        console.error(error);
      }
    } else {
      // Campo de usuario vacío
      this.errorMessage = "Por favor, ingresa un nombre de usuario.";
    }
  }
}
