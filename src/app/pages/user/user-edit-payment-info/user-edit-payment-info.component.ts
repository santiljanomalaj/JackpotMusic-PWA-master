import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

import { Settings } from '../../settings/settings';
import { SettingTypes } from '../../settings/setting-types';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { SettingsService } from '../../../services/settings.service';
import { ConstantsService } from '../../../services/constants.service';
import { USER_DETAIL_ROUTE } from '../../../shared/routes/user-routes';

@Component({
  selector: 'app-user-edit-payment-info',
  templateUrl: './user-edit-payment-info.component.html',
  styleUrls: ['./user-edit-payment-info.component.scss'],
})
export class UserEditPaymentInfoComponent implements OnInit {

  settings: Settings;
  settingTypes: SettingTypes;
  changeCreditCard: boolean = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    public userService: UserService,
    private toastCtrl: ToastController,
    public constants: ConstantsService,
    private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
    this.submit = this.submit.bind(this);
    this.settingTypes = this.settingsService.types;
    this.settingsService.settings.subscribe((settings) => this.settings = settings);
  }

  // Update current user on auth service and user service
  async submit() {
    try {
      const me = await this.authService.getCurrentUser();
      this.authService.currentUser = me;
      this.userService.user = me;

      const toast = await this.toastCtrl.create({
        message: 'Your payment information has been updated!',
        duration: 3000,
        color: 'secondary',
      });

      await toast.present();

      // Navigate back to the game list and set root for account creation
      await this.router.navigate(USER_DETAIL_ROUTE, { replaceUrl: true });

    } catch (error) {
      const message = error.error.message || 'There was an error.';

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'secondary',
      });

      await toast.present();
    }
  }

}
