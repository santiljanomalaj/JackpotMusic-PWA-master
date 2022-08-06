import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Location } from '../location';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss'],
})
export class LocationFormComponent implements OnInit {

  @Input() location: Location;
  @Input() submitFunction: (location: Location) => Promise<void>;

  form: FormGroup;
  newLocation: any;
  submitAttempt: boolean = false;
  submitted: boolean = false;
  constructor(
    public formBuilder: FormBuilder,
    public locationService: LocationService,
  ) { }

  ngOnInit() {
    this.createBlankForm();
    this.refreshFormValues();
  }

  createBlankForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      address: [''],
    });
  }

  refreshFormValues() {
    if (!this.location) { return; }

    this.form.setValue({
      name: this.location.name,
      address: this.location.location.formatted_address,
    });
  }
  isLocationSelected() {
    const locationExists = this.location && this.location.location.formatted_address;
    const newLocationExists = this.newLocation && this.newLocation.formatted_address;
    return locationExists || newLocationExists;
  }
  public isFormValid() {
    return this.form.valid && (this.isLocationSelected());
  }
  submit() {
    this.submitAttempt = true;
    if (!this.isFormValid()) {
      this.submitted = false;
      return;
    }
    this.submitted = true;
    if (!this.form.valid || !this.submitFunction) { return; }

    const formValue = this.form.value;
    for (const key in formValue) {
      if (formValue.hasOwnProperty(key)) {
        this.locationService.location[key] = formValue[key];
      }
    }

    this.locationService.location.location = this.newLocation;
    this.submitFunction(this.locationService.location);
  }

  locationSelected(location: any) {
    if (location.formatted_address) {
      this.newLocation = location;
    }
  }

  changeLocation() {
    this.newLocation = null;
    this.location = null;
  }

}
