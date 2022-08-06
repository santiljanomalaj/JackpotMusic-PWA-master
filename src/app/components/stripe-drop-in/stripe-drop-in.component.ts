import { Component, OnInit, Input } from '@angular/core';

import { ToastController } from '@ionic/angular';

import { AuthService } from './../../services/auth.service';
import { UserService } from './../../services/user.service';
import { ConstantsService } from './../../services/constants.service';

declare var Stripe: any;

const style = {
  base: {
    color: '#000',
    fontWeight: 200,
    fontSize: '16px',
    '::placeholder': {
      color: '#7b7b81',
    },
  },
};

@Component({
  selector: 'stripe-drop-in-payment',
  templateUrl: './stripe-drop-in.component.html',
  styleUrls: ['./stripe-drop-in.component.scss'],
})
export class StripeDropInComponent implements OnInit {

  isSubmitting: boolean;
  @Input() buttonText: string;
  @Input() submitFunction: () => any;

  constructor(
    public authService: AuthService,
    public userService: UserService,
    public constants: ConstantsService,
    private toastCtrl: ToastController,
  ) { }

  ngOnInit() {
    this.stripeSetup();
  }

  stripeSetup() {
    const stripeKey = this.constants.STRIPE_PUBLISHABLE_KEY;
    const stripe = Stripe(stripeKey);
    const elements = stripe.elements();

    // Create an instance of the card Element
    const card = elements.create('card', { style });
    // Add an instance of the card Element into the `card-element` <div>
    card.mount('#card-element');

    // Get token from Stripe
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const result = await stripe.createToken(card);

      if (result.error) {
        // Inform the user if there was an error
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.error.message || 'There was an error';
        return;
      }

      this.isSubmitting = true;

      try {
        // Send the token to our server
        await this.userService.submitPaymentToken(result.token);
        // Call the function passed in as an input
        if (this.submitFunction) {
          this.submitFunction();
        }
      } catch (error) {
        const message = error.error.message || 'There was an error.';
        const toast = await this.toastCtrl.create({
          message,
          duration: 3000,
          position: 'bottom',
          showCloseButton: true,
          color: 'danger',
        });
        await toast.present();

        this.isSubmitting = false;
      }

    });
  }

}
