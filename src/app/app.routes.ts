import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { TriviaComponent } from './components/trivia/trivia.component';
import { FelicitacionComponent } from './components/felicitacion/felicitacion.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'trivia/:tema', component: TriviaComponent, canActivate: [AuthGuard] }, // Aplicamos el guard aquí
  { path: 'felicitacion', component: FelicitacionComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
