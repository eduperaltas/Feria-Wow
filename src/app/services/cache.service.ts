// src/app/services/cache.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: { [key: string]: any } = {};

  // Método para obtener datos desde el caché
  get(key: string): any {
    return this.cache[key];
  }

  // Método para establecer datos en el caché
  set(key: string, data: any): void {
    this.cache[key] = data;
  }

  // Método para limpiar un dato específico del caché
  clear(key: string): void {
    delete this.cache[key];
  }

  // Método para limpiar todos los datos del caché
  clearAll(): void {
    this.cache = {};
  }
}
