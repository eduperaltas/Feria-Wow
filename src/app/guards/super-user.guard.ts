import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SuperUserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    try {
      // Obtener el usuario logueado
      const username = this.authService.getUsername();

      if (!username) {
        console.warn('No hay usuario logueado. Redirigiendo al login.');
        // Guardar la URL donde intentó acceder y redirigir al login
        return this.router.createUrlTree(['/login'], { queryParams: { nextUrl: state.url } });
      }

      // Verificar si el usuario es SuperUser
      const isSuperUser = await this.authService.isSuperUser(username);

      if (isSuperUser) {
        console.log('Acceso permitido: Usuario es SuperUser.');
        return true; // Permitir acceso a la ruta protegida
      } else {
        console.warn('Acceso denegado: Usuario no tiene permisos de SuperUser.');
        // Redirigir a una página de acceso denegado
        return this.router.createUrlTree(['/pasaporte']);
      }
    } catch (error) {
      console.error('Error en el guard SuperUser:', error);
      // Redirigir al login si ocurre un error inesperado
      return this.router.createUrlTree(['/login'], { queryParams: { nextUrl: state.url } });
    }
  }
}