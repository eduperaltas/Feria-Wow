import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-felicitacion",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./felicitacion.component.html",
  styleUrl: "./felicitacion.component.css",
})
export class FelicitacionComponent implements OnInit {
  selloImg: string | null = null;
  selloBackground = '';
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Obtener el parámetro 'sello' desde la URL
    this.route.queryParams.subscribe((params) => {
      const selloParam = params['sello'];
      if (selloParam) {
        this.selloImg = this.backgroundImages[`sello-${selloParam}`] || null;
        this.selloBackground = 'sello-'+selloParam;
      }
    });
  }

  // Mensaje de feedback dinámico
  feedbackMessage: string = "¡Felicidades obtuviste un sello!";

  // Clase actual del fondo
  currentBackgroundClass: string = "felicidades";

  // Diccionario de imágenes asociadas a los fondos
  private readonly backgroundImages: Record<string, string> = {
    "sello-lima": "imgs/user.png",
    "sello-ica": "imgs/wow-circulos.png",
    "sello-chiclayo": "imgs/wow-logo.png",
    "sello-huancayo": "imgs/fondo.png",
  };

  // URL de la imagen actual
  currentImage: string = "";

  /**
   * Maneja la acción del botón para cambiar el fondo o redirigir.
   */
  actionBtn(): void {
    // Si ya estamos en un fondo de sello, redirige al pasaporte
    if (this.isSelloBackground()) {
      this.redirectToPassport();
    } else {
      // Selecciona un fondo de sello aleatorio
      this.setRandomSelloBackground();
    }
  }

  /**
   * Verifica si el fondo actual es un sello.
   * @returns true si el fondo actual corresponde a un sello, de lo contrario false.
   */
  private isSelloBackground(): boolean {
    return this.backgroundImages.hasOwnProperty(this.currentBackgroundClass);
  }

  /**
   * Establece un fondo de sello aleatorio y actualiza la imagen asociada.
   */
  private setRandomSelloBackground(): void {
    this.currentBackgroundClass = this.selloBackground;
    this.updateCurrentImage();
  }

  /**
   * Actualiza la imagen actual basada en el fondo seleccionado.
   */
  private updateCurrentImage(): void {
    this.currentImage = this.selloImg || "";
  }

  /**
   * Redirige a la ventana de pasaporte.
   */
  private redirectToPassport(): void {
    this.router.navigate(["/pasaporte"], { queryParams: { forceUpt: true } });
  }

  /**
   * Actualiza el mensaje de feedback dinámicamente.
   * @param message Nuevo mensaje de feedback.
   */
  updateFeedback(message: string): void {
    this.feedbackMessage = message;
  }
}