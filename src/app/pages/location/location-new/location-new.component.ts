import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { Location } from '../location';
import { LocationService } from '../../../services/location.service';
import { USER_ROOT_ROUTE } from '../../../shared/routes/user-routes';

@Component({
  selector: 'app-location-new',
  templateUrl: './location-new.component.html',
  styleUrls: ['./location-new.component.scss'],
})
export class LocationNewComponent implements OnInit {

  constructor(
    private router: Router,
    private locationService: LocationService
  ) {
  }

  ngOnInit() {
    this.submit = this.submit.bind(this);
    this.locationService.location = new Location();
  }

  async submit(location: Location): Promise<void> {
    if (!location) {
      return;
    }

    try {
      await this.locationService.create(location);
      // During account setup, we don't want the user to be able to go back
      await this.router.navigate(USER_ROOT_ROUTE, { replaceUrl: true });
    } catch (error) {
      console.error(error);
    }
  }

}
