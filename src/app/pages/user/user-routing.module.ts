import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LegalComponent } from './legal/legal.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { LocationNewComponent } from '../location/location-new/location-new.component';
import { LocationEditComponent } from '../location/location-edit/location-edit.component';
import { UserChangeEmailComponent } from './user-change-email/user-change-email.component';
import { UserAccountMenuComponent } from './user-account-menu/user-account-menu.component';
import { UserChangePasswordComponent } from './user-change-password/user-change-password.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { UserEditPaymentInfoComponent } from './user-edit-payment-info/user-edit-payment-info.component';

import { IsUserLoggedInGuard } from 'src/app/guards/is-user-logged-in.guard';
import { UserHasLocationGuard } from '../../guards/user-has-location.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/user/account',
  },
  {
    path: 'account',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: UserAccountMenuComponent,
  },
  {
    path: 'payment-method',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: UserEditPaymentInfoComponent,
  },
  {
    path: 'new-location',
    pathMatch: 'full',
    component: LocationNewComponent,
  },
  {
    path: 'edit-location',
    pathMatch: 'full',
    canActivate: [UserHasLocationGuard],
    component: LocationEditComponent,
  },
  {
    path: 'change-email',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: UserChangeEmailComponent,
  },
  {
    path: 'change-password',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: UserChangePasswordComponent,
  },
  {
    path: 'detail',
    pathMatch: 'full',
    component: UserDetailComponent,
  },
  {
    path: 'terms-conditions',
    pathMatch: 'full',
    component: TermsAndConditionsComponent,
  },
  {
    path: 'legal',
    pathMatch: 'full',
    component: LegalComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class UserRoutingModule { }
