import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    // Almacenar la URL a la que el usuario quiere acceder
    const nextUrl = state.url;
  
    const username = this.authService.getUsername();
  
    // Verificar si el usuario está logueado
    if (!username) {
      // Redirigir al login y pasar el query param nextUrl
      return this.router.createUrlTree(["/login"], { queryParams: { nextUrl } });
    }
  
    // Verificar si el usuario ha visto la bienvenida
    const hasSeenWelcome = await this.authService.hasSeenWelcome(username);
  
    if (hasSeenWelcome) {
      // Si ya vio la bienvenida, permitir el acceso
      if(nextUrl){
      return true;} else{
        return this.router.createUrlTree(["/pasaporte"]);
      }
    } else {
      // Si no ha visto la bienvenida, redirigir a la pantalla de bienvenida
      return this.router.createUrlTree(["/bienvenida"], { queryParams: { nextUrl } });
    }
  }
}
