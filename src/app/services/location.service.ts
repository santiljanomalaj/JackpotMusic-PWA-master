import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ConstantsService } from './constants.service';

import { Location } from '../pages/location/location';
import { findIndex } from '../shared/functions/findIndex';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  location: Location;
  locations: Location[] = [];

  constructor(
    private http: HttpClient,
    private constants: ConstantsService,
  ) { }

  /**
   * Retrieves a single object via API
   * @param id The id for the object to be retrieved
   * @returns Response of the request
   */
  async get(id: string): Promise<Location> {
    const url = `${this.constants.API_BASE_URL}/locations/${id}`;
    const location = await this.http.get<Location>(url).toPromise();
    return location;
  }

  /**
   * Retrieves all objects matching a query via API
   * @param params The parameters for the query
   * @returns Response of the request
   */
  async query(params: HttpParams): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/locations`;
    const response = await this.http.get<{ locations: Location[] }>(url, { params }).toPromise();
    return response.locations;
  }

  /**
   * Creates a new object via API
   * Adds the new object to this.locations
   * @param location The location object to be created
   * @returns Response of the request
   */
  async create(location: Location): Promise<Location> {
    const url = `${this.constants.API_BASE_URL}/locations`;
    const _location = await this.http.post<Location>(url, location).toPromise();
    this.locations.unshift(_location);
    return _location;
  }

  /**
   * Updates an object via API
   * If it exists, updates the matching object in this.locations
   * @param location The object to be updated
   * @returns Response of the request
   */
  async update(location: Location): Promise<Location> {
    const url = `${this.constants.API_BASE_URL}/locations/${this.location._id}`;
    this.location = await this.http.put<Location>(url, location).toPromise();

    const index = findIndex(this.locations, (current) => current._id === this.location._id);
    if (index !== -1) {
      this.locations[index] = this.location;
    }

    return this.location;
  }

  /**
   * Delete an object via API
   * If it exists, remove object from this.locations
   * @param id The id for the object to be deleted
   * @returns Response of the request
   */
  async delete(id: string): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/locations/${id}`;
    await this.http.delete<any>(url).toPromise();

    const index = findIndex(this.locations, (current) => current._id === this.location._id);
    if (index !== -1) {
      this.locations.splice(index, 1);
    }
  }

}
