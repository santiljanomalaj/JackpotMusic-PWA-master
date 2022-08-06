import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConstantsService } from './constants.service';

import { User } from '../pages/user/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: User;

  constructor(
    private http: HttpClient,
    private constants: ConstantsService,
  ) { }

  async get(id: string): Promise<User> {
    const url = `${this.constants.API_BASE_URL}/users/${id}`;
    const user = await this.http.get<User>(url).toPromise();
    return user;
  }

  async create(object: {}): Promise<User> {
    const url = `${this.constants.API_BASE_URL}/users/signup`;
    const user = await this.http.post<User>(url, object).toPromise();
    return user;
  }

  /**
   * Submit payment token to server for saving a payment method
   * @param object Stripe token object
   */
  async submitPaymentToken(object: any): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/users/me/stripePaymentSetup`;
    return await this.http.post<any>(url, object).toPromise();
  }

  /**
   * Updates the current user with '/me' via API
   * @param object  The object to be updated
   * @returns Response of the request
   */
  async updateMe(object: any): Promise<User> {
    const url = `${this.constants.API_BASE_URL}/users/me`;
    const user = await this.http.put<User>(url, object).toPromise();
    if (user) { this.user = user; }
    return user;
  }

  /**
   * Securly changes the password for a user
   * @param object The user's passwords
   * @returnS Response of the request
   */
  async changePassword(body): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/users/me/password`;
    const response = await this.http.put<any>(url, body).toPromise();
    return response;
  }

  /**
   * Returns true if the user has admin as a role
   * @param user User object
   */
  isAdmin(user: User): boolean {
    return user.roles && user.roles.indexOf('admin') !== -1;
  }

}
