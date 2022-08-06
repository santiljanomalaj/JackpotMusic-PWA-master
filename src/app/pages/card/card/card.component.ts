import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

import { CardService } from '../../../services/card.service';
import { GameService } from '../../../services/game.service';
import { ParamService } from '../../../services/param.service';
import { SettingsService } from '../../../services/settings.service';

import { Card } from '../card';
import { Game } from '../../game/game';
import { Round } from '../../game/round';
import { GameEvent } from '../../game/game-event';
import { Settings } from '../../settings/settings';
import { SettingTypes } from '../../settings/setting-types';

import { findIndex } from '../../../shared/functions/findIndex';

import {
  gameEndedByHostEvent,
  gameEndedEvent,
  jackpotWinnerEvent,
  roundEndedEvent,
} from '../../../shared/constants/game-events';
import { ELocalNotificationTriggerUnit, LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { JACKPOT_WINNER_ROUTE } from '../../../shared/routes/game-route';
import { TERMS_CONDITIONS_ROUTE, USER_DETAIL_ROUTE } from '../../../shared/routes/user-routes';
import * as _ from 'lodash';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('isClicked', [
      state('correct', style({
        backgroundColor: '#242527',
        boxShadow: 'none',
        opacity: '0',
        display: 'none',
      })),
      state('incorrect', style({
        border: '1px solid #E01075',
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, #000000 100%)',
        backgroundColor: 'rgba(216, 42, 126, 0.19)',
      })),
      state('default', style({})),
      transition('default => correct', animate('1500ms ease-in')),
      transition('default => incorrect', animate('100ms ease-in')),
      transition('incorrect => default', animate('100ms ease-out')),
    ]),
    trigger('showFooter', [
      state('inactive', style({ height: '0%' })),
      state('active', style({})),
      transition('active => inactive', animate('500ms ease-in'))
    ])
  ],
})
export class CardComponent implements OnInit, OnDestroy {

  showFooter: string = 'active';
  isDisplayingAlert: boolean = false;
  pageTitle: string = 'Jackpot Music Game';
  gameEndAlert: boolean = false;
  
  game: Game;
  playerCard: Card;
  settings: Settings;
  currentRound: Round;
  settingTypes: SettingTypes;
  subscriptions: Subscription[] = [];

  pageTitleInterval: any;
  jackpotThreshold: number;
  jackpotMoneyTotal: number;
  jackpotRequiredSongCount: number;
  winningCode: string | null;

  constructor(
    private router: Router,
    private storage: Storage,
    private params: ParamService,
    private vibration: Vibration,
    public gameService: GameService,
    private cardService: CardService,
    private alertCtrl: AlertController,
    private settingsService: SettingsService,
    private localNotifications: LocalNotifications
  ) {
    this.endGameHandler = this.endGameHandler.bind(this);
    this.closeAlertHandler = this.closeAlertHandler.bind(this);
    this.initSubscriptions();
    this.scrollHandler = _.debounce(this.scrollHandler, 50);
    this.winningCode = null;
  }

  async ngOnInit(): Promise<void> {
    if (!this.game) {
      this.router.navigate(USER_DETAIL_ROUTE);
      return;
    }
    await this.initGame();
    this.eventDispatcher();
  }

  ionViewDidEnter() {
    // Start rotating the page title
    this.rotatePageTitle();
  }

  initSubscriptions() {
    this.retrieveSettings();
    this.retrieveGame();
    this.retrieveCurrentRound();
  }
  async initGame() {
    try {
      await this.storage.ready();
      this.createPlayerCard();
      this.gameService.startListeningForCurrentRound(this.game._id);
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error || 'There was an error creating a player card.',
        cssClass: 'error',
        buttons: ['Dismiss'],
      });
      await alert.present();
    }
  }

  closeAlertHandler() {
    return {
      text: 'Close',
    };
  }

  endGameHandler() {
    return {
      text: 'Close',
      handler: () => {
        this.isDisplayingAlert = false;
        this.scheduleEndgameNotification();
        this.router.navigate([''], { replaceUrl: true });
        this.gameService.game.next(null);
        this.gameService.stopListeningForCurrentRound();
        this.storage.remove('currentCardId');
        this.storage.remove('LOCATION');
      },
    };
  }

  scheduleEndgameNotification() {
    if (this.game) {
      const { category } = this.game;
      this.localNotifications.schedule({
        id: Date.now(),
        title: 'Jackpot Music Game',
        text: `Thanks for participating on ${category} category`,
        trigger: { in: 18, unit: ELocalNotificationTriggerUnit.HOUR }
      });
    }
  }

  eventDispatcher() {
    const subscription = this.gameService.eventEmitter.subscribe(({ key, data }) => {
      console.log('card.component', 'eventDispatcher', key, data)
      switch (key) {
        // Listen for when the round ends to update the UI
        case roundEndedEvent:
          this.roundEndedEventDispatcher(data);
          break;

        // Listen for a jackpot winner
        case jackpotWinnerEvent:
          this.jackpotWinnerEventDispatcher(data);
          break;

        // Listen for when the game ends to update the UI
        case gameEndedEvent:
          this.gameEndedEventDispatcher(data);
          break;

        // Listen for when the round is ended by the host
        case gameEndedByHostEvent:
          this.gameEndedByHostEventDispatch();
          break;
      }
    });

    this.subscriptions.push(subscription);
  }

  roundEndedEventDispatcher({ winningCard }) {
    if (winningCard) {
      this.displayWinnerModal(winningCard)
    } else {
      this.displayNoWinnerModal()
    }
  }

  displayNoWinnerModal() {
    if (this.isDisplayingAlert) { return; }
    this.displayEventAlert({
      styleClass: 'outline',
      buttons: [this.closeAlertHandler()],
      alertMessage: `<h1>Round Ended!</h1><p>There wasn't a winner. Get ready for the next round!</p>`,
    });
  }

  displayWinnerModal(winningCard: string) {
    const isWinner = winningCard === this.playerCard._id
    if (isWinner && this.winningCode) {
      this.displayEventAlert({
        styleClass: 'outline',
        buttons: [this.closeAlertHandler()],
        alertMessage: `<h1>You Win!</h1><p>Show this screen to the game runner to collect your prize!</p><h1>${this.winningCode}</h1>`,
      });
    } else {
      this.displayEventAlert({
        buttons: [this.closeAlertHandler()],
        alertMessage: `<h1>Round Ended!</h1><p>Someone else won this round. Get ready for the next round!</p>`,
      });
    }
    this.winningCode = null;
  }

  async jackpotWinnerEventDispatcher(data) {
    this.gameEndAlert = true;
    if (this.isDisplayingAlert) { return; }
    if(data.gameId && data.cardId){
      const alert = await this.alertCtrl.create(
        {
          inputs: [
            {
              name: 'name',
              placeholder: 'Name'
            },
            {
              name: 'phoneNumber',
              placeholder: 'Phone Number'
            },
            {
              name: 'email',
              placeholder: 'Email'
            }
          ],
          message: '<img alt="Jackpot Music Game Logo" src="assets/images/Vertical_white.svg" /><h1>JACKPOT!!!</h1><p>You won the jackpot! Please provide your contact info so you can collect your money.</p>',
          backdropDismiss: false,
          cssClass: 'fancy-alert outline phone-dialog',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.isDisplayingAlert = false;
                this.router.navigate(JACKPOT_WINNER_ROUTE);
                this.gameService.stopListeningForCurrentRound();
                this.storage.remove('currentCardId');
                this.storage.remove('LOCATION');
              }
            },
            {
              text: 'Ok',
              handler: async (data) => {
                const game_data = await this.storage.get('LOCATION')
                const location = game_data.location.formatted_address
                const jackpotPrize = "$" + this.jackpotMoneyTotal
                this.gameService.sendGameWinnerData({location:location, phoneNumber: data.phoneNumber, name:data.name, email:data.email, jackpotPrize:jackpotPrize})
                if(data){
                  this.isDisplayingAlert = false;
                  this.router.navigate(JACKPOT_WINNER_ROUTE);
                  this.gameService.stopListeningForCurrentRound();
                  this.storage.remove('currentCardId');
                  this.storage.remove('LOCATION');
                }
              }
            }
          ],
        }
      );
      await alert.present();
    }
    else{
      this.router.navigate(JACKPOT_WINNER_ROUTE);
      this.gameService.stopListeningForCurrentRound();
    }
  }

  gameEndedEventDispatcher({ winningCard }) {
    if (winningCard) {
      this.handleGameEndedWinner(winningCard)
    } else {
      this.handleGameEndedNoWinner()
    }
  }



  handleGameEndedWinner(winningCard: boolean) {
    if (this.isDisplayingAlert || this.gameEndAlert) { return; }
    const isWinner = winningCard === this.playerCard._id
    this.isDisplayingAlert = true;
    if (isWinner) {
      this.displayEventAlert({
        buttons: [this.endGameHandler()],
        alertMessage: `<h1>You Win!</h1><p>Show this screen to the game runner to collect your prize!</p><h1>${this.winningCode}</h1>`,
      });
    } else {
      this.displayEventAlert({
        buttons: [this.endGameHandler()],
        alertMessage: `<h1>Game Over!</h1><p>Someone else won this round. Thanks for playing!</p>`,
      });
    }
  }
  handleGameEndedNoWinner() {
    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: `<h1>Game Over!</h1><p>No one won this round. Thanks for playing!</p>`,
      buttons: [
        {
          text: 'Exit Game',
          handler: () => {
            this.router.navigate([''], { replaceUrl: true });
            this.gameService.game.next(null);
            this.gameService.stopListeningForCurrentRound();
            this.storage.remove('currentCardId');
          },
        }
      ],
    });
  }

  gameEndedByHostEventDispatch() {
    if (this.isDisplayingAlert) { return; }
    this.isDisplayingAlert = true;
    this.displayEventAlert({
      buttons: [this.endGameHandler()],
      alertMessage: ` <h1>Game over!</h1><p>The game was ended by the host.</p>`,
    });
  }

  async displayEventAlert({ alertMessage = '', buttons = [], styleClass = '' }) {
    const alert = await this.alertCtrl.create({
      buttons,
      backdropDismiss: false,
      cssClass: `fancy-alert ${styleClass}`,
      message: `<img alt="Jackpot Music Game Logo" src="assets/images/Vertical_white.svg" />${alertMessage}`,
    });
    await alert.present();
  }

  /**
   * Starts an interval to constantly switch the page title
   */
  rotatePageTitle() {
    this.pageTitleInterval = setInterval(
      () => {
        this.pageTitle = this.pageTitle === this.game.category ?
          this.gameService.prettyRoundName(this.currentRound.name) :
          this.pageTitle === this.gameService.prettyRoundName((this.currentRound.name))
            ? `${this.currentRound.currentRoundPrize} coupon` : this.game.category;
      },
      5000,
    );
  }

  /**
   * Will update the card UI if someone accidentally refreshes their screen and returns to the game in progress
   * @param card an instance of a Card object
   */
  updateCardUI(card: Card) {
    card.roundOne.forEach((songObj) => songObj.localStatus = songObj.selectionStatus);
    card.roundTwo.forEach((songObj) => songObj.localStatus = songObj.selectionStatus);
    card.roundThree.forEach((songObj) => songObj.localStatus = songObj.selectionStatus);
  }

  /**
   * Based on a song's selectionStatus property, will set the appropriate CSS for a correct/incorrect selection
   * @param songObject an anonymous object on a player's card that holds reference to a song, ClickedAt timestamp, and selectionStatus
   */
  async songIsClicked(songObject: any) {
    songObject.isLoading = true;
    try {
      const songId = songObject._song._id;
      const response = await this.cardService.addSongTimestamp(this.playerCard._id, songId);
      if (!this.currentRound.name) { return; }

      const roundName = this.currentRound.name;
      const clickedSongObject = response[roundName].find(({ _song: { _id } }) => _id === songId);
      if (!clickedSongObject) { return; }

      // Set the song statuses based on the response from the server
      // The selectionStatus will always match the server
      // The localStatus is used for UI updates (disabling and animation)
      songObject.localStatus = clickedSongObject.selectionStatus;
      songObject.selectionStatus = clickedSongObject.selectionStatus;

      if (clickedSongObject.selectionStatus === this.cardService.SELECTION_STATUSES.incorrect) {
        setTimeout(
          () => {
            songObject.localStatus = this.cardService.SELECTION_STATUSES.default;
            songObject.isDisabled = false;
          },
          3000,
        );
        songObject.isLoading = false;
        this.vibration.vibrate(400);
      }

      if (clickedSongObject.selectionStatus === this.cardService.SELECTION_STATUSES.correct) {
        // This was correct, check to see if the user is the winner
        // Check for the jackpot winner
        if (response._gameId.roundData[roundName]._jackpotCard === this.playerCard._id) {
          const eventData = { gameId: response._gameId._id, cardId: this.playerCard._id };
          const event = new GameEvent(jackpotWinnerEvent, eventData);
          this.gameService.eventEmitter.next(event);
          clickedSongObject.isLoading = false;
        } else {
          // Check for a round winner
          // If this isn't a jackpot winner, it can still be a round winner
          if (response._gameId.roundData[roundName]._winningCard === this.playerCard._id) {
            this.winningCode = response._gameId.roundData[roundName].winningCode
            clickedSongObject.isLoading = false;
          }
        }
        this.vibration.vibrate(150);
      }
    } catch (error) {
      console.error(error);
      songObject.isLoading = false;
    }
  }

  /**
   * Based on a song's localStatus (front-end only), will set the appropriate image source for checkboxes
   * @param songObject an anonymous object on a player's card that holds reference to a song, ClickedAt timestamp, and selectionStatus
   */
  setCheckboxImage(songObject: any) {
    switch (songObject.localStatus) {
      case this.cardService.SELECTION_STATUSES.incorrect:
        return songObject.localStatus = this.cardService.SELECTION_STATUSES.incorrect;
      case this.cardService.SELECTION_STATUSES.correct:
        return songObject.localStatus = this.cardService.SELECTION_STATUSES.correct;
      default:
        return songObject.localStatus = this.cardService.SELECTION_STATUSES.default;
    }
  }

  quitRound() {
    const quit = this.endGameHandler();
    quit.text = 'Quit Game';
    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: '<p>Are you sure you want to quit this game?</p>',
      buttons: [
        quit,
        { text: 'Go Back', role: 'cancel' },
      ],
    });
  }

  getSongInfo() {
    if (!this.gameService.songInfo) { return; }
    const { title, artist } = this.gameService.songInfo;
    this.displayEventAlert({
      buttons: ['Dismiss'],
      styleClass: 'outline',
      alertMessage: `<h1 class="song-title">${title}</h1><p>${artist}</p>`,
    });
  }

  /**
   * Returns true if the game has a startedAt for the currentRound
   */
  gameHasStarted() {
    return (
      this.currentRound &&
      this.currentRound.roundData &&
      this.currentRound.roundData.roundOne.startedAt
    );
  }

  /**
   * Returns true if the game is in between rounds one and two
   * waiting for the host to start the next round
   */
  isWaitingForRoundTwo() {
    return (
      this.gameHasStarted() &&
      this.currentRound.roundData.roundOne.finishedAt &&
      !this.currentRound.roundData.roundTwo.startedAt
    );
  }

  /**
   * Returns true if the game is in between rounds two and three
   * waiting for the host to start the next round
   */
  isWaitingForRoundThree() {
    return (
      this.isWaitingForRoundTwo() &&
      this.currentRound.roundData.roundTwo.finishedAt &&
      this.currentRound.roundData.roundThree.startedAt
    );
  }

  /**
   * Return true or false if the game's startTime is in the past
   * @param game The game
   */
  isGameStartTimeInPast(game: Game) {
    return moment(game.startTime).isBefore();
  }

  /**
   * Return the number of songs the user has gotten correct
   * Filter all songs with the correct status for the round
   */
  correctSongCount() {
    const songs = this.playerCard[this.currentRound.name];
    const correctSongs = songs.filter((song) => song.selectionStatus === this.cardService.SELECTION_STATUSES.correct);
    return correctSongs.length;
  }

  /**
   * Return the song number for the currently playing song (e.g., 10 out of 25)
   */
  currentSongNumber() {
    if (!this.currentRound || !this.currentRound.currentlyPlayingSong) { return 0; }

    // Find the index of the currently playing song within the master song playlist to get the song number
    const masterSongs = this.game.roundData[this.currentRound.name].master;
    const { _song: { _id } } = this.currentRound.currentlyPlayingSong;
    const songIndex = findIndex(masterSongs, (o) => o._song === _id);
    return songIndex + 1;
  }

  /**
   * Return boolean if the current round is round three
   * Used to update the UI
   */
  isRoundThree() {
    return this.currentRound.name === 'roundThree';
  }

  /**
   * Go to rules page
   */
  goToRulesPage() {
    this.router.navigate(TERMS_CONDITIONS_ROUTE);
  }

  /**
   * Hide the footer after the user scrolls
   * The footer reminds the user to scroll (yes that is correct)
   * @param event The scroll event
   */
  async scrollHandler(event: any) {
    const scrollElement = await event.target.getScrollElement();
    const scrollHeight = scrollElement.scrollHeight - scrollElement.clientHeight;
    const currentScrollDepth = event.detail.scrollTop;
    const targetPercent = 80;
    const triggerDepth = ((scrollHeight / 100) * targetPercent);
    if (currentScrollDepth > triggerDepth) {
      this.showFooter = 'inactive';
    }
  }

  /**
   * Clear the page title interval
   */
  clearPageTitleInterval() {
    clearInterval(this.pageTitleInterval);
  }

  ionViewDidLeave() {
    // Stop rotating the page title
    this.clearPageTitleInterval();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscriptions) => subscriptions.unsubscribe());
  }

  private retrieveGame() {
    const subscription = this.gameService.game.subscribe(
      (game) => this.game = game
    );
    this.subscriptions.push(subscription);
  }

  private retrieveCurrentRound() {
    const subscription = this.gameService.currentRound.subscribe(
      (currentRound) => this.currentRound = currentRound
    );
    this.subscriptions.push(subscription);
  }

  private retrieveSettings() {
    this.settingTypes = this.settingsService.types;
    const subscription = this.settingsService.settings.subscribe(
      (settings) => {
        this.settings = settings;
        this.jackpotRequiredSongCount = settings["jackpot_required_song_count"]
        this.jackpotMoneyTotal = settings['jackpot_amount']
        this.jackpotThreshold = settings['jackpot_threshold']
      }
    );
    this.subscriptions.push(subscription);
  }

  private async createPlayerCard() {
    // retrieve the player's card ID from browser storage
    const localCardId = await this.storage.get('currentCardId');

    // both gameId and cardId need to be sent to the server in order to create player cards
    // if cardId is null, server will skip the retrieval step and use gameId to create a new card
    // otherwise, it will find the existing card and send the most recent version of it back to the client
    this.playerCard = await this.cardService.create({ _gameId: this.game._id, cardId: localCardId });

    this.cardService.card = this.playerCard;

    // checks to make sure that the card returned from the server matches the ID saved in browser storage
    if (this.playerCard._id === localCardId) {
      this.updateCardUI(this.playerCard);
    } else {
      // if the ID's don't match, overwrite the old ID in browser storage with the new one
      await this.storage.set('currentCardId', this.playerCard._id);
    }
  }

}
