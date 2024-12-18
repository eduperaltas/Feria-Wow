import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { TriviaService } from '../../services/trivia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-send-mail',
  standalone: true,
  templateUrl: './send-mail.component.html',
  styleUrl: './send-mail.component.css',
})
export class SendMailComponent {
  loading: boolean = false; // Variable para manejar el estado de carga

  constructor(private triviaService: TriviaService,
      private router: Router,) {}

  // Función principal: Obtener datos y descargar archivo Excel
  async processAndDownloadData() {
    this.loading = true; // Activar la barra de carga y deshabilitar el botón
    try {
      console.log('Obteniendo datos de Firestore...');
      const data = await this.triviaService.getUsersWithFiveSellos();

      console.log('Generando archivo Excel...');
      this.generateAndDownloadFile(data);

      console.log('Archivo generado y descargado correctamente.');
    } catch (error) {
      console.error('Error en el proceso:', error);
    } finally {
      this.loading = false; // Desactivar la barra de carga y habilitar el botón
    }
  }

  // Generar y descargar el archivo Excel
  generateAndDownloadFile(data: any[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `usuarios_${new Date().toISOString()}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Función conectada al botón
  downloadExcel(): void {
    if (!this.loading) {
      console.log('Iniciando proceso de descarga del archivo...');
      this.processAndDownloadData();
    }
  }
  logout() {
    // Eliminar datos de usuario en localStorage
    localStorage.clear();
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}