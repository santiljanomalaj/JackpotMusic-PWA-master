import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, TOKEN_KEY } from '../../../services/auth.service';
import { Storage } from '@ionic/storage';
import { GAME_LOCATION_DETAIL_ROUTE, GAME_LOCATION_LIST_ROUTE } from '../../../shared/routes/game-route';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {

  constructor(
    private router: Router,
    private storage: Storage,
    private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
  }

  async ionViewWillEnter() {
    await this.redirect();
  }

  /**
   * This is the root page for the app
   * Load the current current if there is one and set the new
   * root to either the location list or detail
   */
  async redirect(): Promise<void> {
    // Waiting for the storage to be ready
    await this.storage.ready();

    // The token is retrieved from the storage
    const token = await this.storage.get(TOKEN_KEY);

    if (token) {
      const user = await this.authService.getCurrentUser();
      if (user) {
        await this.router.navigate(GAME_LOCATION_DETAIL_ROUTE);
        return;
      }
    }

    await this.router.navigate(GAME_LOCATION_LIST_ROUTE);
  }

}
