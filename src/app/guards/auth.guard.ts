import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const tema = route.paramMap.get('tema'); // Obtener el tema de la URL

    // Guardar el tema en AuthService o en Local Storage
    if (tema) {
      // Quitar tema de almacenamiento local antes de guardar el nuevo de la url
      localStorage.removeItem('tema');
      this.authService.setTema(tema);
    }

    const username = this.authService.getUsername();

    // Verificar si el usuario está logueado
    if (!username) {
      // Redirigir al login si no está logueado
      return this.router.createUrlTree(['/login']);
    }

    // Verificar si el usuario ha visto la bienvenida
    const hasSeenWelcome = await this.authService.hasSeenWelcome(username);

    if (hasSeenWelcome) {
      // Si ya vio la bienvenida, permitir el acceso a la trivia
      return true;
    } else {
      // Si no ha visto la bienvenida, redirigir a la pantalla de bienvenida
      return this.router.createUrlTree(['/bienvenida']);
    }
  }
}
