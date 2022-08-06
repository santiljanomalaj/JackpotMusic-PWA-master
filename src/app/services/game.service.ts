import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ConstantsService } from './constants.service';

import { User } from '../pages/user/user';
import { Game } from '../pages/game/game';
import { Round } from '../pages/game/round';
import { GameEvent } from '../pages/game/game-event';
import { findIndex } from '../shared/functions/findIndex';

import {
  gameEndedByHostEvent,
  gameEndedEvent,
  jackpotWinnerEvent,
  roundEndedEvent,
} from '../shared/constants/game-events';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  games: Game[] = [];
  songInfo: any = {};
  nowPlaying: any = {};
  gameData: Array<{}> = [];
  eventEmitter = new Subject<GameEvent>();
  checkForCurrentRoundInterval = false;
  game: BehaviorSubject<Game> = new BehaviorSubject<Game>(null);
  categories: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  currentRound: BehaviorSubject<Round> = new BehaviorSubject<Round>({ name: 'roundOne', playerCount: 0 });

  constructor(
    private http: HttpClient,
    private constants: ConstantsService,
  ) {
  }

  isGameActive(gameId) {
    return this.game.getValue() && this.game.getValue()._id === gameId;
  }
  public didGameStart() {
    const now = moment();
    const hasStarted = moment(this.game.getValue().startTime).isSameOrBefore(now);
    return hasStarted;
  }

  async create(object: string): Promise<Game> {
    const url = `${this.constants.API_BASE_URL}/games`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.http.post<Game>(url, object, { headers }).toPromise();
  }

  /**
   * Delete an object via API
   * If it exists, remove object from this.cards
   * @param id  The id for the object to be deleted
   * @returns Response of the request
   */
  async delete(id: string): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/games/${id}`;
    await this.http.delete<any>(url).toPromise();
    const index = findIndex(this.games, (current) => current._id === id);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
  }

  async getCategories(): Promise<void> {
    const categories = this.categories.value;
    if (categories && categories.length > 0) { return; }
    const url = `${this.constants.API_BASE_URL}/songs/categories`;
    const newCategories = await this.http.get<string[]>(url).toPromise();
    this.categories.next(newCategories.sort());
  }

  async startGame(gameId: string): Promise<Game> {
    const url = `${this.constants.API_BASE_URL}/games/startGame?gameId=${gameId}`;
    return await this.http.get<Game>(url).toPromise();
  }

  async startRound(gameId: string): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/games/startRound?gameId=${gameId}`;
    return await this.http.get<any>(url).toPromise();
  }

  buildGameObject(form: FormGroup): {} {
    const newGame = {};
    for (const key in form.value) {
      if (form.value.hasOwnProperty(key)) {
        newGame[key] = form.value[key];
      }
    }
    return newGame;
  }

  storeGameObject(object: {}): void {
    this.gameData.push(object);
  }

  async timestampTest(gameId: string, songId: string): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/games/${gameId}/addStartAndEndTimestamps/${songId}`;
    return await this.http.post<any>(url, {}).toPromise();
  }

  async getCurrentRound(gameId: string): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/games/${gameId}/currentRound`;
    const round = await this.http.get<Round>(url).toPromise();

    if (round.currentlyPlayingSong) {
      this.songInfo = round.currentlyPlayingSong._song;
    }

    if (round.terminatedAt) {
      const event = new GameEvent(gameEndedByHostEvent);
      this.eventEmitter.next(event);
    }

    if (round.currentlyPlayingSongIndex < 0) {
      round.currentlyPlayingSongIndex = 0;
    }
    const currentRound = this.currentRound.value;
    const didRoundChange = round.name !== currentRound.name
    if (didRoundChange) {
      await this.manageChangeOfRound(round, currentRound, gameId)
    }
    this.currentRound.next(round);
  }
  async manageChangeOfRound(round: Round, currentRound: Round, gameId: string) {
    const didGameFinish = round.roundData.roundThree.finishedAt
    if (didGameFinish) {
      await this.manageEndOfGame(round, gameId)
    } else {
      this.manageEndOfRound(round, currentRound)
    }
  }
  async manageEndOfGame(round: Round, gameId: string) {
    if (round.roundData.roundThree._jackpotCard) {
      await this.getGame(gameId, round);
    } else {
      const { _winningCard: winningCard, winningCode } = round.roundData.roundThree;
      this.emitRoundEnded(gameEndedEvent, winningCard, winningCode);
    }
  }
  manageEndOfRound(round: Round, currentRound: Round) {
    const { roundOne, roundTwo, roundThree } = round.roundData
    const didRoundOneFinish = roundOne.finishedAt && !roundTwo.startedAt
    const didRoundTwoFinish = roundTwo.finishedAt && !roundThree.startedAt
    if (didRoundOneFinish || didRoundTwoFinish) {
      const { _winningCard: winningCard, winningCode } = round.roundData[currentRound.name]
      this.emitRoundEnded(roundEndedEvent, winningCard, winningCode)
    }
  }

  emitRoundEnded(roundEvent: string, winningCard, winningCode) {
    const event = new GameEvent(roundEvent, { winningCard, winningCode });
    this.eventEmitter.next(event);
  }

  async getGame(gameId: string, round: Round): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/games/${gameId}`;
    const game = await this.http.get<Game>(url).toPromise();

    // if event has not been published
    if (!game.jackpotWinnerEventPublished) {
      const event = new GameEvent(jackpotWinnerEvent, {});
      this.eventEmitter.next(event);
      await this.sendWinnerEvent(gameId);
    } else {
      // Otherwise show the user that someone else has won the jackpot
      const { _winningCard: winningCard, winningCode } = round.roundData.roundThree;
      this.emitRoundEnded(gameEndedEvent, winningCard, winningCode);
    }
  }

  async sendWinnerEvent(gameId: string): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/games/${gameId}/saveJackpotWinnerEvent`;
    return await this.http.post<any>(url, {}).toPromise();
  }

  startListeningForCurrentRound(gameId: string) {
    this.checkForCurrentRoundInterval = true;
    this.listenForCurrentRound(gameId);
  }

  async listenForCurrentRound(gameId: string) {
    while (this.checkForCurrentRoundInterval) {
      await this.getCurrentRound(gameId).catch(console.log);
    }
  }

  stopListeningForCurrentRound() {
    this.checkForCurrentRoundInterval = false;
  }

  async resetGame(gameId: string): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/games/resetGame/${gameId}`;
    return await this.http.get<any>(url).toPromise();
  }

  async terminateGame(gameId: string): Promise<any> {
    const url = `${this.constants.API_BASE_URL}/games/terminateGame/${gameId}`;
    return await this.http.get<any>(url).toPromise();
  }

  async sendWinnerData(gameId: string, cardId: string, userData: any) {
    const url = `${this.constants.API_BASE_URL}/games/${gameId}/saveJackpotWinnerData`;
    userData.cardId = cardId;
    return await this.http.post<any>(url, userData).toPromise();
  }

  /**
   * Returns the pretty round name based on the
   * round name coming from the server
   * @param roundName The round name from the server
   */
  prettyRoundName(roundName: string) {
    switch (roundName) {
      case 'roundOne':
        return 'Round One';
      case 'roundTwo':
        return 'Round Two';
      case 'roundThree':
        return 'Round Three';
      default:
        return 'Round';
    }
  }
  async sendJacpotWinnerData(winnderData: any){
    const url = `${this.constants.API_BASE_URL}/games/sendJacpotWinnerDataWithMail`;
    return await this.http.post<any>(url, winnderData).toPromise();
  }
  sendGameWinnerData(winnderData : any){
    this.sendJacpotWinnerData(winnderData)
  }
  /**
   * Updates a game
   * @param gameData Game data object
   */
  async update(gameData: any): Promise<Game> {
    const url = `${this.constants.API_BASE_URL}/games/${gameData._id}`;
    return await this.http.put<Game>(url, gameData).toPromise();
  }

  /**
   * Returns true if the user can edit the game
   * @param user User object
   * @param game Game object
   */
  userHasAccessToGame(user: User, game: Game) {
    return user._location && user._location._id === game._location && game._location._id;
  }

  async getActiveGameFilenames(id: string) {
    const url = `${this.constants.API_BASE_URL}/games/lobby/${id}`;
    return await this.http.get<string[][]>(url).toPromise();
  }

}
