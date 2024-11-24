import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  name: string | null = "";

  // Diccionario de imágenes asociadas a los fondos
  sellosImgs: Record<string, string> = {
    "sello-lima": "imgs/user.png",
    "sello-ica": "imgs/wow-circulos.png",
    "sello-chiclayo": "imgs/wow-logo.png",
    "sello-huancayo": "imgs/fondo.png",
  };

  // Diccionario de sellos que tiene el usuario
  sellosUser: Record<string, boolean> = {};

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    // Obtener el nombre de usuario desde el servicio de autenticación
    this.name = this.authService.getName();
    const userId = this.authService.getUsername(); // Asumimos que `userId` siempre existe por el guard

    try {
      // Obtener los parámetros de consulta utilizando `firstValueFrom`
      const queryParams = await firstValueFrom(this.route.queryParams);
      const forceUpt = queryParams["forceUpt"] === "true"; // Convertir a booleano

      // Obtener los sellos del usuario con base en el parámetro
      this.sellosUser = await this.authService.getUserSellos(
        userId!,
        forceUpt || false
      );

      console.log("Sellos obtenidos:", this.sellosUser);
    } catch (error) {
      console.error("Error al obtener los sellos:", error);
    }
  }

  /**
   * Devuelve la URL de la imagen asociada a un sello.
   * @param sello Nombre del sello
   * @returns URL de la imagen del sello o una imagen predeterminada
   */
  getSelloImage(sello: string): string {
    return this.sellosImgs["sello-" + sello] || "imgs/default.png";
  }
}
