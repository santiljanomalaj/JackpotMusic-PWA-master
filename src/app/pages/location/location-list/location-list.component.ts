import * as moment from 'moment';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { Game } from '../../game/game';
import { Settings } from '../../settings/settings';
import { SettingTypes } from '../../settings/setting-types';
import { GameService } from '../../../services/game.service';
import { SettingsService } from '../../../services/settings.service';
import { LocationService } from '../../../services/location.service';
import { GAME_DETAILS_ROUTE } from '../../../shared/routes/game-route';
import { TERMS_CONDITIONS_ROUTE } from '../../../shared/routes/user-routes';
import { AUTH_SIGN_UP_ROUTE } from '../../../shared/routes/auth-routes';
import { Storage } from '@ionic/storage'
@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
})
export class LocationListComponent implements OnInit {

  isLoading: boolean;
  isRefreshing: boolean;
  canLoadMore: boolean;
  currentPage: number;
  itemsPerPage: number;

  deferredPrompt: any;

  settings: Settings;
  settingTypes: SettingTypes;

  constructor(
    private router: Router,
    private gameService: GameService,
    private geolocation: Geolocation,
    public locationService: LocationService,
    private settingsService: SettingsService,
    private storage: Storage
  ) {
    this.currentPage = 0;
    this.itemsPerPage = 20;

    // Set to false to prevent findAll running in both ngOnInit and infinite scroll
    this.canLoadMore = false;
  }

  ngOnInit() {
    this.locationService.locations = [];
    this.settingTypes = this.settingsService.types;
    this.settingsService.settings.subscribe((settings) => this.settings = settings);
    this.findAll();
  }

  /**
   * Get the current location for the user
   * Cache the location for 5 minutes and timeout after 1 minute
   * If there is an error, return an empty lat and long
   */
  async getCurrentLocation(): Promise<{ lat: number, long: number }> {
    let lat: number;
    let long: number;

    try {
      const options = { timeout: 20000, maximumAge: 300000 };
      const response = await this.geolocation.getCurrentPosition(options);
      lat = response.coords.latitude;
      long = response.coords.longitude;
    } catch (error) {
      console.log(error);
    }

    return { lat, long };
  }

  /**
   * Retrieves items and item count and manages infinite scroll for lists
   * * @param infiniteScroll The optional infiniteScroll event
   * * @param refresher The optional refresher event
   */
  async findAll(infiniteScroll?: any, refresher?: any) {
    this.isLoading = true;
    const skip = this.itemsPerPage * this.currentPage;

    // Wait to get the user's current location
    const { lat, long } = await this.getCurrentLocation();

    const params = new HttpParams();
    params.set('limit', `${this.itemsPerPage}`);
    params.set('skip', `${skip}`);
    params.set('lat', `${lat}`);
    params.set('long', `${long}`);

    try {
      const response = await this.locationService.query(params);
      this.currentPage += 1;

      // Once the number of items returned is less than items per page it's time to stop
      if (response.length < this.itemsPerPage) {
        this.canLoadMore = false;
      }

      // Concat the response to our model list data
      this.locationService.locations = this.locationService.locations.concat(response);

      // Stop the infiniteScroll and refresher when complete
      if (infiniteScroll) { infiniteScroll.target.complete(); }
      if (refresher) { refresher.target.complete(); }
      this.isLoading = false;
      this.isRefreshing = false;
    } catch (error) {
      this.canLoadMore = false;
      this.isLoading = false;
      this.isRefreshing = false;
      console.log(error.message);
    }
  }

  /**
   * Refresh list by setting variables back to our blank state
   * @param refresher The refresher event
   */
  refreshList(refresher?: any): void {
    this.isRefreshing = true;
    this.canLoadMore = true;
    this.currentPage = 0;
    this.locationService.locations = [];
    this.findAll(refresher);
  }

  /**
   * Determines if game should display the join game button
   * Should show if game is within 15 minutes of starting
   * @param game The game object
   */
  shouldShowJoinGameHero(game: Game) {
    return moment(game.startTime) <= moment().add(15, 'minutes');
  }

  /**
   * Go to game detail
   * This button is within a ion-item that has nav push,
   * so need to make sure it only goes to the game detail
   * To prevent needing to get populate or get the _location
   * for the game again, just attach the location to this game
   * @param game The game object
   * @param location The location object
   * @param event Event
   */
  goToGameDetailPage(game: Game, location: Location, event: Event) {
    this.storage.set("LOCATION", location)
    event.stopPropagation();
    game._location = location;
    this.gameService.game.next(game);
    this.router.navigate(GAME_DETAILS_ROUTE);
  }

  /**
   * Return true or false if game's start time is in the past
   * @param game The game
   */
  isGamePast(game: Game) {
    const roundOneStartTime = game.roundData.roundOne.startedAt;
    return moment(game.startTime).isBefore() || roundOneStartTime ? moment(roundOneStartTime).isBefore() : false;
  }
  getStartTime(game: Game) {
    const roundOneStartTime = game.roundData.roundOne.startedAt;
    return roundOneStartTime ? roundOneStartTime : game.startTime;
  }

  /**
   * Go to rules page
   */
  goToRulesPage() {
    this.router.navigate(TERMS_CONDITIONS_ROUTE);
  }

  /**
   * Go to signup page
   */
  goToSignupPage() {
    this.router.navigate(AUTH_SIGN_UP_ROUTE);
  }

}
