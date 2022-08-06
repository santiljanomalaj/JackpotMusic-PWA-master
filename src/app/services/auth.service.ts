import { Subject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../pages/user/user';
import { UserService } from './user.service';
import { ConstantsService } from './constants.service';

export const TOKEN_KEY = 'TOKEN_KEY';

export const EVENT_USER_LOGGED_IN = 'user:logged-in';
export const EVENT_USER_LOGGED_OUT = 'user:logged-out';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User = null;
  eventEmitter = new Subject<any>();

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private userService: UserService,
    private constants: ConstantsService,
  ) {
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  async checkAuthentication(): Promise<boolean> {
    try {
      const token = await this.storage.get(TOKEN_KEY);
      if (!token) { return; }
      await this.getCurrentUser();
    } catch (error) {
      console.log(error);
    }
    return this.isAuthenticated();
  }

  async login(email: string, password: string): Promise<any> {
    const url = `${ this.constants.API_BASE_URL }/auth/login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = `email=${ encodeURIComponent(email) }&password=${ encodeURIComponent(password) }`;
    const { token } = await this.http.post<{ token: string }>(url, body, { headers }).toPromise();
    await this.setToken(token);
    await this.getCurrentUser();
    this.eventEmitter.next(EVENT_USER_LOGGED_IN);
  }

  async setToken(token: string): Promise<any> {
    return await this.storage.set(TOKEN_KEY, token);
  }

  async getCurrentUser(): Promise<User> {
    this.currentUser = await this.userService.get('me');
    return this.currentUser;
  }

  async logout(): Promise<void> {
    await this.storage.remove(TOKEN_KEY);
    this.currentUser = null;
    this.eventEmitter.next(EVENT_USER_LOGGED_OUT);
  }

  async resetPassword(email: string): Promise<{ message: string }> {
    const url = `${ this.constants.API_BASE_URL }/users/me/forgot`;
    return await this.http.put<{ message: string }>(url, { email })
      .toPromise();
  }

}
