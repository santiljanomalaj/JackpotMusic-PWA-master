import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';

import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserHasLocationGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot):
    boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const { currentUser } = this.authService;

    if (currentUser === null || !currentUser._location) {
      this.router.navigate(['']);
      return false;
    }

    return true;
  }

}
