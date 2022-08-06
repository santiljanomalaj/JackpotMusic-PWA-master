import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ValidationService } from '../../../services/validation.service';
import { NEW_LOCATION_ROUTE } from '../../../shared/routes/user-routes';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  form: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastCtrl: ToastController,
    private validationService: ValidationService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      displayName: ['', Validators.required],
      email: ['', [Validators.required, this.validationService.emailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async register(form: FormGroup) {
    if (!form.valid) { return; }

    this.isSubmitting = true;

    try {
      const { displayName, email, password } = form.value;
      const user = await this.userService.create({ displayName, email, password });
      await this.authService.setToken(user.token);
      this.authService.currentUser = user;
      await this.router.navigate(NEW_LOCATION_ROUTE, { replaceUrl: true });
    } catch (error) {
      const message = error.error.message || 'There was an error.';
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
      });

      await toast.present();

      this.validationService.buildServerErrors(form, error);
      this.isSubmitting = false;
    }
  }

}
