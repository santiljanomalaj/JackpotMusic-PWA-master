import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';
import { USER_DETAIL_ROUTE } from '../../../shared/routes/user-routes';
import { AUTH_FORGOT_PASSWORD_ROUTE } from '../../../shared/routes/auth-routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private validationService: ValidationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, this.validationService.emailValidator]],
      password: ['', [Validators.required]],
    });
  }

  async login() {
    if (!this.form.valid) { return; }

    this.isSubmitting = true;
    try {
      const { email, password } = this.form.value;
      await this.authService.login(email, password);
      this.form.reset();

      // Go to location view and remove back button
      await this.router.navigate(USER_DETAIL_ROUTE, { replaceUrl: true });
    } catch (error) {
      const message = error.error.message || 'There was an error.';
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
      this.isSubmitting = false;
    }
  }

  goToForgotPassword() {
    this.router.navigate(AUTH_FORGOT_PASSWORD_ROUTE);
  }

}
