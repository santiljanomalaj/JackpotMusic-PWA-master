import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { InsertCardService } from '../services/insert-card.service';

@Injectable({
  providedIn: 'root'
})
export class IsCreditCardIn implements CanActivate {
  constructor(
    private router: Router,
    private insertedCardService: InsertCardService
  ) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  Promise<boolean> {
    return new Promise((resolve, reject) => {
        this.insertedCardService.hasCreditCard().then(res => {
            if (!res) {
                this.router.navigate(['/user/payment-method']);
                return resolve(false);
            }
            return resolve(true);
        });
    });
  }
}
