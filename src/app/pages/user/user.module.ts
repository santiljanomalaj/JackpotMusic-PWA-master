import { NgModule } from '@angular/core';

import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../../shared/modules/shared.module';

import { LegalComponent } from './legal/legal.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { LocationNewComponent } from '../location/location-new/location-new.component';
import { UserChangeEmailComponent } from './user-change-email/user-change-email.component';
import { UserAccountMenuComponent } from './user-account-menu/user-account-menu.component';
import { LocationFormComponent } from '../location/location-form/location-form.component';
import { AutocompleteComponent } from '../../components/autocomplete/autocomplete.component';
import { StripeDropInComponent } from '../../components/stripe-drop-in/stripe-drop-in.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { UserChangePasswordComponent } from './user-change-password/user-change-password.component';
import { UserEditPaymentInfoComponent } from './user-edit-payment-info/user-edit-payment-info.component';
import { LocationEditComponent } from '../location/location-edit/location-edit.component';

@NgModule({
  imports: [
    SharedModule,
    UserRoutingModule,
  ],
  declarations: [
    LegalComponent,
    UserDetailComponent,
    LocationNewComponent,
    AutocompleteComponent,
    LocationEditComponent,
    LocationFormComponent,
    StripeDropInComponent,
    UserAccountMenuComponent,
    UserChangeEmailComponent,
    UserChangePasswordComponent,
    TermsAndConditionsComponent,
    UserEditPaymentInfoComponent,
  ]
})
export class UserModule {}
