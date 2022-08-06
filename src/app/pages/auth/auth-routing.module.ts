import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { UserNotLoggedInGuard } from '../../guards/user-not-logged-in.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/game',
  },
  {
    path: 'signup',
    pathMatch: 'full',
    canActivate: [UserNotLoggedInGuard],
    component: SignupComponent,
  },
  {
    path: 'login',
    pathMatch: 'full',
    canActivate: [UserNotLoggedInGuard],
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    pathMatch: 'full',
    component: ForgotPasswordComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {
}
