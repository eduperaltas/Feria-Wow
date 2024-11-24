import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { TriviaComponent } from './components/trivia/trivia.component';
import { FelicitacionComponent } from './components/felicitacion/felicitacion.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'pasaporte', component: HomeComponent},
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'trivia/:tema/:sello', component: TriviaComponent, canActivate: [AuthGuard] }, // Aplicamos el guard aquí
  { path: 'felicitacion', component: FelicitacionComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
