import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-account-menu',
  templateUrl: './user-account-menu.component.html',
  styleUrls: ['./user-account-menu.component.scss'],
})
export class UserAccountMenuComponent implements OnInit {

  constructor(
    private router: Router,
    public authService: AuthService,
  ) { }

  ngOnInit() {}

  async logout() {
    await this.authService.logout();
    await this.router.navigate(['']);
  }

}
