import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { ToastController, ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AuthService } from './../../../services/auth.service';
import { UserService } from './../../../services/user.service';
import { ValidationService } from './../../../services/validation.service';

@Component({
  selector: 'app-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.scss'],
})
export class UserChangePasswordComponent implements OnInit {

  form: FormGroup;
  matchError: boolean;
  isSubmitting: boolean;
  submitAttempt: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private userService: UserService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    private location: Location,
    private validationService: ValidationService,
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  async submit() {
    this.submitAttempt = true;

    const { newPassword, confirmPassword } = this.form.value;
    this.matchError = newPassword !== confirmPassword;

    if (!this.form.valid || this.matchError) { return; }

    try {
      this.isSubmitting = true;
      await this.userService.changePassword(this.form.value);
      this.isSubmitting = false;

      const toast = await this.toastCtrl.create({
        duration: 3000,
        color: 'secondary',
        message: 'Your password has been updated!',
      });

      toast.present();
      this.location.back();
    } catch (error) {
      this.validationService.buildServerErrors(this.form, error);
      const message = error.error.message || 'There was an error.';

      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
      });

      toast.present();
      this.isSubmitting = false;
    }
  }

}
