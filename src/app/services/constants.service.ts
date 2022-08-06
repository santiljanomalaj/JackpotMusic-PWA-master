import { Injectable } from '@angular/core';

import { ENV } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  JMG_ENV: string = ENV.JMG_ENV;
  API_BASE_URL: string = ENV.API_BASE_URL;
  AWS_S3_BASE_URL: string = ENV.AWS_S3_BASE_URL;
  SUPPORT_EMAIL: string = 'support@jackpot.game';
  STRIPE_PUBLISHABLE_KEY: string = ENV.STRIPE_PUBLISHABLE_KEY;

  constructor() {
    // Only add dynamic constants here
    // e.g. this.ROOT_URL = window.location.origin;
  }
}
