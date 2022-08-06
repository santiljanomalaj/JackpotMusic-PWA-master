import { ValidationService } from './../../services/validation.service';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'control-errors',
  templateUrl: './control-errors.component.html',
  styleUrls: ['./control-errors.component.scss'],
})
export class ControlErrorsComponent {

  @Input() control: FormControl;

  constructor(private vs: ValidationService) { }

  errorMessage() {
    if (!this.control.touched) { return null; }

    const { errors } = this.control;

    for (const propertyName in errors) {
      if (errors.hasOwnProperty(propertyName)) {
        return this.vs.getValidatorErrorMessage(propertyName, errors[propertyName]);
      }
    }

    return null;
  }

}
