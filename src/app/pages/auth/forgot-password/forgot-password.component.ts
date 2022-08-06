import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { AUTH_LOGIN_ROUTE } from '../../../shared/routes/auth-routes';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

  form: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private authService: AuthService,
    private validationService: ValidationService,
  ) {
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, this.validationService.emailValidator]],
    });
  }

  async forgotPassword(form: FormGroup): Promise<void> {
    if (!form.valid) {
      return;
    }

    try {
      const { message } = await this.authService.resetPassword(form.value.email);
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'secondary',
      });
      await toast.present();
      form.reset();
    } catch (error) {
      if (error.errors) {
        const { errors: { message } } = error;
        const toast = await this.toastCtrl.create({
          message,
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      } else {
        this.validationService.buildServerErrors(form, error.errors);
      }
    }
  }

  goToLogin(): void {
    this.router.navigate(AUTH_LOGIN_ROUTE);
  }

}
