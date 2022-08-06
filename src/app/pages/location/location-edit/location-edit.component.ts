import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LocationService } from '../../../services/location.service';

import { Location } from '../location';

@Component({
  selector: 'app-location-edit',
  templateUrl: './location-edit.component.html',
  styleUrls: ['./location-edit.component.scss'],
})
export class LocationEditComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    public locationService: LocationService,
  ) {
  }

  ngOnInit() {
    // Set the location to the authenticated user's location
    this.locationService.location = this.authService.currentUser._location;

    // Bind 'this' since the submit function is a callback
    this.submit = this.submit.bind(this);
  }

  async submit(location: Location): Promise<void> {
    if (!location) { return; }

    try {
      await this.locationService.update(location);
      await this.router.navigate([''], { replaceUrl: true });
    } catch (error) {
      console.error(error);
    }
  }

}
