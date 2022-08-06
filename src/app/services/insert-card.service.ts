import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../pages/user/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class InsertCardService {
  currentUser: User = null;
  constructor(
    private userService: UserService,
  ) {
  }
  async hasCreditCard() {
    const currentUser = await this.userService.get('me');
    return !!currentUser.stripeLast4;
  }
}
