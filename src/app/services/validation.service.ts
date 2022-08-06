import { Injectable } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {
    this.emailValidator = this.emailValidator.bind(this);
    this.passwordValidator = this.passwordValidator.bind(this);
    this.creditCardValidator = this.creditCardValidator.bind(this);
  }

  /**
   * The server returns mongoose formatted errors (object with property names and errors)
   * Get the property name from the error and match it to a control
   * @param form The form to add errors
   * @param errors Error object from server
   */
  buildServerErrors(form: FormGroup, errors: any) {
    const serverErrors = errors.errors;
    for (const error in serverErrors) {
      if (serverErrors.hasOwnProperty(error)) {
        form.controls[error].setErrors({ server: serverErrors[error].message });
      }
    }
  }

  getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const validationMessages: {} = {
      required: 'Required',
      invalidCreditCard: 'Is invalid credit card number',
      invalidEmailAddress: 'Invalid email address',
      invalidPassword: 'Invalid password. Password must be at least 6 characters long, and contain a number.',
      minlength: `Minimum length ${validatorValue.requiredLength}`,
      server: `${validatorValue}`,
    };

    return validationMessages[validatorName];
  }

  validate(control: FormControl, regex: RegExp, errorProperty: string) {
    return (
      control.value && control.value.match(regex)
        ? null
        : ({ [errorProperty]: true })
    );
  }

  creditCardValidator(control: FormControl) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    // tslint:disable-next-line:max-line-length
    const regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
    return this.validate(control, regex, 'invalidCreditCard');
  }

  emailValidator(control: FormControl) {
    // RFC 2822 compliant regex
    // tslint:disable-next-line:max-line-length
    const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return this.validate(control, regex, 'invalidEmailAddress');
  }

  passwordValidator(control: FormControl) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    const regex = /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/;
    return this.validate(control, regex, 'invalidPassword');
  }

}
