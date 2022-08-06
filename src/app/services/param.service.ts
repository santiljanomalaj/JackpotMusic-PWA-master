import { Injectable } from '@angular/core';

/**
 * Its propuse is to store params when navigation is used
 */

@Injectable({
  providedIn: 'root'
})
export class ParamService {

  private params: {} = {};

  constructor() { }

  set(key: string, value: any): void {
    this.params[key] = value;
  }

  get(key: string): any {
    return this.params[key];
  }

  remove(key: string): void {
    delete this.params[key];
  }

  exists(key: string): boolean {
    return !!this.params[key];
  }

  clear(): void {
    this.params = {};
  }

}
