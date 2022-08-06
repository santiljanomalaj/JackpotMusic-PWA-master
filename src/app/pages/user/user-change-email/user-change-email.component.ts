import { Component, OnInit } from '@angular/core';

import { ToastController, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-user-change-email',
  templateUrl: './user-change-email.component.html',
  styleUrls: ['./user-change-email.component.scss'],
})
export class UserChangeEmailComponent implements OnInit {

  form: FormGroup;
  isSubmitting: boolean;
  submitAttempt: boolean = false;

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private validatorService: ValidationService,
  ) { }

  ngOnInit() {
    const { email } = this.authService.currentUser || { email: '' };
    this.form = this.formBuilder.group({
      email: [email, [Validators.required, this.validatorService.emailValidator]]
    });
  }

  async submit() {
    this.submitAttempt = true;

    if (!this.form.valid) { return; }

    this.isSubmitting = true;

    try {
      const formData = this.form.value;
      const updatedUser = await this.userService.updateMe(formData);
      this.authService.currentUser = updatedUser;
      this.isSubmitting = false;

      const toast = await this.toastCtrl.create({
        duration: 300,
        color: 'secondary',
        message: 'Your email has been updated!',
      });

      toast.present();

      this.modalCtrl.dismiss();
    } catch (error) {
      this.validatorService.buildServerErrors(this.form, error);
      const message = error.error.message || 'There was an error.';

      const toast = await this.toastCtrl.create({
        message,
        duration: 300,
        color: 'danger',
      });

      toast.present();
      this.isSubmitting = false;
    }
  }

}
