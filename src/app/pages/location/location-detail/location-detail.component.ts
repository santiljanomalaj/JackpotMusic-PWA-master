import * as moment from 'moment';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';
import { GameService } from '../../../services/game.service';
import { ParamService } from '../../../services/param.service';
import { LocationService } from '../../../services/location.service';

import { Location } from '../location';
import { Game } from '../../game/game';
import { GAME_DETAILS_ROUTE, GAME_NEW_ROUTE } from '../../../shared/routes/game-route';
import { TERMS_CONDITIONS_ROUTE, USER_ACCOUNT_ROUTE } from '../../../shared/routes/user-routes';
@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss'],
})
export class LocationDetailComponent implements OnInit {

  isLoading: boolean;

  constructor(
    private router: Router,
    private params: ParamService,
    public authService: AuthService,
    private gameService: GameService,
    public locationService: LocationService
  ) { }

  ngOnInit() {
    this.isLoading = true;
  }

  async ionViewWillEnter() {
    await this.findOne();
  }

  /**
   * Retrieves one item and sets to this.location
   */
  async findOne(refresher?: any): Promise<void> {
    if (this.authService.currentUser && this.authService.currentUser._location) {
      const locationId = this.params.get('id') || this.authService.currentUser._location._id;

      try {
        const response = await this.locationService.get(locationId);
        this.isLoading = false;
        this.locationService.location = response;

        if (refresher) { refresher.target.complete(); }
      } catch (error) {
        console.error(error);
        this.isLoading = false;
      }
    }
  }

  /**
   * Returns an array of upcoming games
   * This will filter all of the upcoming games out of
   * the returned array of all games on the location
   * @param location The location
   * @returns array of games
   */
  upcomingGamesForLocation(location: Location) {
    if (!location.games || !location.games.length) { return []; }
    return location.games.filter((game) => !this.isDisabled(game));
  }

  /**
   * Returns an array of past games
   * This will filter all of the past games out of
   * the returned array of all games on the location
   * @param location The location
   * @returns array of games
   */
  pastGamesForLocation(location: Location) {
    if (!location.games || !location.games.length) {
      return [];
    }

    return location.games.filter((game) => this.isDisabled(game));
  }

  sortByDateDesc(array: Array<Game>): Array<Game> {
    return array.sort((a, b) => {
      const dateA: any = new Date(a.startTime);
      const dateB: any = new Date(b.startTime);
      return dateB - dateA;
    });
  }

  /**
   * Returns boolean if the game is finished, i.e. if the game has a finishedAt property with a
   * value and the startTime is less than 55 minutes ago
   * @param game The game
   */
  isFinished(game: Game) {
    return !!game.finishedAt || moment(game.startTime).isBefore(moment().subtract(55, 'minutes'));
  }

  /**
   * Returns boolean if the game is terminated
   * @param game The game
   */
  isTerminated(game: Game) {
    return !!game.terminatedAt;
  }

  /**
   * Returns boolean if the game is both terminated and finished
   * @param game The game
   */
  isDisabled(game: Game) {
    return this.isTerminated(game) || this.isFinished(game);
  }

  /**
   * Go to the game detail page
   * Send the game so we don't have to make another network request
   * To prevent needing to get populate or get the _location
   * for the game again, just attach the location to this game
   * @param game The game
   * @param location The location
   */
  async goToGameDetailPage(game: Game, location: Location) {
    game._location = location;
    this.gameService.game.next(game);
    await this.router.navigate(GAME_DETAILS_ROUTE);
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
   * Go to new game page
   */
  async goToNewGamePage() {
    await this.router.navigate(GAME_NEW_ROUTE);
  }

  /**
   * Go to account page
   */
  async gotoAccountPage() {
    await this.router.navigate(USER_ACCOUNT_ROUTE);
  }

  /**
   * Go to terms and conditions page
   */
  async goToTermsAndConditionsPage() {
    await this.router.navigate(TERMS_CONDITIONS_ROUTE);
  }

}
