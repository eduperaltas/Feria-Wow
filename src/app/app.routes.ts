import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { TriviaComponent } from './components/trivia/trivia.component';
import { FelicitacionComponent } from './components/felicitacion/felicitacion.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { QrVerificationComponent } from './components/qr-verification/qr-verification.component';
import { SendMailComponent } from './components/send-mail/send-mail.component';
import { SuperUserGuard } from './guards/super-user.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'pasaporte', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'bienvenida', component: BienvenidaComponent},
  { path: 'trivia/:tema/:sello', component: TriviaComponent, canActivate: [AuthGuard] }, // Aplicamos el guard aquí
  { path: 'felicitacion', component: FelicitacionComponent, canActivate: [AuthGuard]  },
  { path: 'qr-verification/:username', component: QrVerificationComponent, canActivate: [AuthGuard]  },
  { path: 'data', component: SendMailComponent, canActivate: [SuperUserGuard] },
  { path: '', redirectTo: 'pasaporte', pathMatch: 'full' },
];
