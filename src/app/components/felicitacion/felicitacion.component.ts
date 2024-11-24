import { Component } from "@angular/core";
import { CommonModule } from "@angular/common"; // Importa CommonModule

@Component({
  selector: "app-felicitacion",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./felicitacion.component.html",
  styleUrl: "./felicitacion.component.css",
})
export class FelicitacionComponent {
  feedbackMessage: string = "¡Felicidades obtuviste un sello!";
  // Clase actual del fondo
  currentBackgroundClass: string = "felicidades";

  // Lista de opciones de fondo
  backgrounds: string[] = [
    "felicidades",
    "sello-lima",
    "sello-ica",
    "sello-chiclayo",
    "sello-huancayo",
  ];

// Diccionario de imágenes para cada fondo
backgroundImages: { [key: string]: string } = {
  'sello-lima': 'imgs/user.png',
  'sello-ica': 'imgs/user.png',
  'sello-chiclayo': 'imgs/user.png',
  'sello-huancayo': 'imgs/user.png',
};

// URL de la imagen actual
currentImage: string = '';

// Método para cambiar el fondo dinámicamente
changeBackground(): void {
  // Selecciona un fondo aleatorio
  const randomIndex = Math.floor(Math.random() * this.backgrounds.length);
  this.currentBackgroundClass = this.backgrounds[randomIndex];

  // Verifica si el fondo actual es un sello y actualiza la imagen
  if (this.backgroundImages[this.currentBackgroundClass]) {
    this.currentImage = this.backgroundImages[this.currentBackgroundClass];
  } else {
    this.currentImage = ''; // Sin imagen para 'felicidades'
  }
}
  // Método para actualizar dinámicamente el texto
  updateFeedback(message: string) {
    this.feedbackMessage = message;
  }
}
