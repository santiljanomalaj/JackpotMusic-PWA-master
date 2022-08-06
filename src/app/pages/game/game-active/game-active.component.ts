import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { GameService } from '../../../services/game.service';
import { SongService } from '../../../services/song.service';
import { ParamService } from '../../../services/param.service';
import { SettingsService } from '../../../services/settings.service';
import { ConstantsService } from '../../../services/constants.service';

import { Game } from '../game';
import { Round } from '../round';
import { GameEvent } from '../game-event';
import { Settings } from '../../settings/settings';
import { SettingTypes } from '../../settings/setting-types';

import {
  gameEndedEvent,
  jackpotWinnerEvent,
  roundEndedEvent,
} from '../../../shared/constants/game-events';
import { TERMS_CONDITIONS_ROUTE } from '../../../shared/routes/user-routes';

const MUTED_LOBBY_MUSIC_VOLUME = 0.05;
const LOBBY_MUSIC_FADE_DURATION = 3000;

@Component({
  selector: 'app-game-active',
  templateUrl: './game-active.component.html',
  styleUrls: ['./game-active.component.scss'],
})
export class GameActiveComponent implements OnInit, OnDestroy {

  settings: Settings;
  settingsTypes: SettingTypes;

  game: Game;
  gameInterval: any;
  currentRound: Round;
  currentSongTitle: string;
  currentSongArtist: string;
  currentSongNumber: number = 1;
  isDisplayingAlert: boolean = false;

  subscriptions: Subscription[] = [];

  @ViewChild('songAudio', { static: false }) audioRef: ElementRef<HTMLAudioElement>;
  @ViewChild('soundClipAudio', { static: false }) soundClipAudioRef: ElementRef<HTMLAudioElement>;

  constructor(
    private router: Router,
    private params: ParamService,
    public gameService: GameService,
    private songService: SongService,
    private alertCtrl: AlertController,
    private constants: ConstantsService,
    private settingsService: SettingsService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.retrieveSettings();
    this.retrieveGame();
    this.retrieveCurrentRound();
    await this.startGame();
    this.eventDispatcher();
  }

  retrieveSettings() {
    this.settingsTypes = this.settingsService.types;
    const subscription = this.settingsService.settings.subscribe(
      (settings) => this.settings = settings
    );
    this.subscriptions.push(subscription);
  }

  retrieveGame() {
    const subscription = this.gameService.game.subscribe(
      (game) => {
        this.game = game
      }
    );
    this.subscriptions.push(subscription);
  }

  retrieveCurrentRound() {
    const subscription = this.gameService.currentRound.subscribe(
      (currentRound) => this.currentRound = currentRound
    );
    this.subscriptions.push(subscription);
  }

  async displayEventAlert({ alertMessage = '', buttons = [], styleClass = '', backdropDismiss = false }) {
    const alert = await this.alertCtrl.create({
      buttons,
      backdropDismiss,
      cssClass: `fancy-alert ${styleClass}`,
      message: `<img alt="Jackpot Music Game Logo" src="assets/images/Vertical_white.svg" />${alertMessage}`,
    });
    await alert.present();
  }

  eventDispatcher() {
    const subscription = this.gameService.eventEmitter.subscribe(({ key, data }) => {
      switch (key) {
        // Listen for when the round ends to update the UI
        // Only stop the game runner if there was a winner
        case roundEndedEvent:
          this.roundEndedEventDispatcher(data);
          break;

        // Jackpot winner - nothing to do but play sound
        case jackpotWinnerEvent:
          this.jackpotWinnerEventDispatcher();
          break;

        // Listen for when the game ends to update the UI
        case gameEndedEvent:
          this.gameEndedEventDispatcher(data);
          break;
      }
    });

    this.subscriptions.push(subscription);
  }

  roundEndedEventDispatcher({ winningCode }) {
    if (this.isDisplayingAlert) { return; }
    if (winningCode) {
      this.handleRoundWinner(winningCode)
    } else {
      this.handleRoundNoWinner()
    }
  }
  handleRoundWinner(winningCode: string) {
    this.isDisplayingAlert = true;
    this.audioRef.nativeElement.pause();
    clearInterval(this.gameInterval);

    // Play sound for end of round
    this.playSoundClip('roundEndedWinner');

    this.displayEventAlert({
      styleClass: 'outline',
      backdropDismiss: true,
      alertMessage: (
        `<h1>Winner!</h1>
        <p>There was a winner for this round! Confirm the winner by checking their device.</p>
        <h1>${winningCode}</h1>`
      ),
      buttons: [
        {
          text: 'Start next round',
          handler: () => {
            this.startNextRound(this.game);
            this.isDisplayingAlert = false;
          },
        },
      ]
    });
  }
  handleRoundNoWinner() {
    this.audioRef.nativeElement.pause();
    this.isDisplayingAlert = true;
    clearInterval(this.gameInterval);

    // Play sound for end of round
    this.playSoundClip('roundEndedNoWinner');
    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: `<h1>Round Over!</h1><p>There wasn't a winner. You can continue to the next round.</p>`,
      buttons: [
        {
          text: 'Start next round',
          handler: () => {
            this.startNextRound(this.game);
            this.isDisplayingAlert = false;
          },
        },
      ]
    });
  }
  gameEndedEventDispatcher({ winningCode }) {
    if (winningCode) {
      return this.handleGameEndedWinner(winningCode)
    } else {
      return this.handleGameEndedNoWinner()
    }
  }
  async handleGameEndedWinner(winningCode: string) {
    if (this.isDisplayingAlert) { return; }

    this.isDisplayingAlert = true;
    this.audioRef.nativeElement.pause();
    await clearInterval(this.gameInterval);

    // Play sound for end of round
    await this.playSoundClip('gameEndedWinner');

    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: (
        `<h1>Winner!</h1>
        <p>There was a winner for this round! The game is over, but first confirm the winner by checking their device.</p>
        <h1>${winningCode}</h1>`
      ),
      buttons: [{
        text: 'Exit Game',
        handler: () => {
          this.router.navigate([''], { replaceUrl: true });
          this.gameService.game.next(null);
          this.gameService.stopListeningForCurrentRound();
          this.isDisplayingAlert = false;
        },
      }],
    });
  }
  async handleGameEndedNoWinner() {
    if (this.isDisplayingAlert) { return; }

    this.isDisplayingAlert = true;
    clearInterval(this.gameInterval);
    await this.playSoundClip('roundEndedNoWinner');

    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: `<h1>Game Over!</h1><p>There wasn't a winner. You can exit the game now.</p>`,
      buttons: [
        {
          text: 'Exit Game',
          handler: () => {
            this.router.navigate([''], { replaceUrl: true });
            this.gameService.game.next(null);
            this.gameService.stopListeningForCurrentRound();
            this.isDisplayingAlert = false;
          },
        }
      ]
    });
  }
  async jackpotWinnerEventDispatcher() {
    if (this.isDisplayingAlert) { return; }

    this.isDisplayingAlert = true;
    clearInterval(this.gameInterval);
    await this.playSoundClip('jackpotWinner');

    this.displayEventAlert({
      styleClass: 'outline',
      alertMessage: `<h1>Winner!</h1><p>There was a jackpot winner for this round! The game is over.</p>`,
      buttons: [
        {
          text: 'Exit Game',
          handler: () => {
            this.router.navigate([''], { replaceUrl: true });
            this.gameService.game.next(null);
            this.gameService.stopListeningForCurrentRound();
            this.isDisplayingAlert = false;
          },
        }
      ]
    });
  }




  async startNextRound(game: any) {
    try {
      // Make a request to start the next round
      await this.gameService.startRound(game._id);

      // We need to make sure that we have the current round
      // Go ahead and call it here (even though it may be getting called in the interval)
      await this.gameService.getCurrentRound(game._id);

      // Set current round data
      const currentRoundName = this.currentRound.name;

      // Set the current song number from the server
      // This is in case the user refreshes the app and needs to start where they left off
      this.currentSongNumber = this.currentRound.currentlyPlayingSongIndex + 1;
      this.currentSongArtist = game.roundData[currentRoundName].master[this.currentSongNumber - 1]._song.artist;
      this.currentSongTitle = game.roundData[currentRoundName].master[this.currentSongNumber - 1]._song.title;

      this.gameTest(game);
      this.playPreRoundAnnouncement(currentRoundName);
    } catch (error) {
      console.error(error);
    }
  }

  async startListeningForSongEnded(game: Game) {
    // We need to make sure that we have the current round
    // Go ahead and call it here (even though it may be getting called in the interval)
    await this.gameService.getCurrentRound(game._id);

    // Set current round data
    const currentRoundName = this.currentRound.name;

    // Set the current song number from the server
    // This is in case the user refreshes the app and needs to start where they left off
    this.currentSongNumber = (this.currentRound.currentlyPlayingSongIndex || 0) + 1;

    this.currentSongArtist = game.roundData[currentRoundName].master[this.currentSongNumber - 1]._song.artist;
    this.currentSongTitle = game.roundData[currentRoundName].master[this.currentSongNumber - 1]._song.title;

    this.audioRef.nativeElement.addEventListener('error', (error) => {
      this.nextSong(game);
    });

    this.audioRef.nativeElement.addEventListener('ended', async () => {
      this.nextSong(game);
    });
  }

  /**This method is used for simulating a running game
    * Some of this logic will remain in the finished app (will be updated soon)
    * @param game an instance of a Game object
    */
  async gameTest(game: Game) {
    try {
      const roundName = this.currentRound.name;
      const song = game.roundData[roundName].master[this.currentSongNumber - 1 || 0]._song;
      this.playSong(song);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @param song Details from the song
   */
  async playSong(song: any): Promise<void> {
    if (!this.isDisplayingAlert) {
      const url = `${this.constants.AWS_S3_BASE_URL}${song.filename}`;
      this.audioRef.nativeElement.src = await this.songService.retrieveSong(url);
      this.audioRef.nativeElement.play();
    } else {
      this.audioRef.nativeElement.pause();
    }
  }

  /**
   * Plays the explanatory pre-round announcements before any songs play
   * @param roundName the current round's name
   */
  async playPreRoundAnnouncement(roundName: string) {
    await this.audioRef.nativeElement.pause();
    if (roundName === 'roundThree') {
      await this.playSoundClip('roundThreeAnnouncement');
    } else if (roundName === 'roundTwo') {
      await this.playSoundClip('roundTwoAnnouncement');
    } else if (roundName === 'roundOne') {
      await this.playSoundClip('roundOneAnnouncement');
    }
    const eventHandler = async () => {
      try {
        await this.gameService.getCurrentRound(this.game._id);
        this.game = this.gameService.game.getValue();
        const round = this.game.roundData[roundName].master;
        if (round.length <= this.currentSongNumber - 1) {
          return;
        }
        const song = round[this.currentSongNumber - 1]._song;
        console.log('playSong', 'playPreRoundAnnouncement')
        await this.playSong(song);
        this.soundClipAudioRef.nativeElement.removeEventListener('ended', eventHandler)
      } catch (error) {
        console.error(error);
      }
    }
    this.soundClipAudioRef.nativeElement.addEventListener('ended', eventHandler);
  }

  async startGame() {
    // Use gameId to prevent there not being an ID and allowing a user
    // to still be able to quit a game using this ID
    if (!this.game && !this.game._id) { return; }

    try {
      const game = await this.gameService.startGame(this.game._id);
      this.gameService.game.next(game);
      await this.startListeningForSongEnded(game);

      this.gameTest(game);
      this.gameService.startListeningForCurrentRound(game._id);
      this.playPreRoundAnnouncement(this.currentRound.name);
    } catch (error) {
      const message = error.error.message || 'There was an error retrieving the active game';
      const alert = await this.alertCtrl.create({
        message,
        header: 'Error',
        cssClass: 'error',
        backdropDismiss: true,
        buttons: [
          {
            text: 'Dismiss',
            handler: () => this.router.navigate([''], { replaceUrl: true })
          }
        ]
      });
      await alert.present();
    }
  }

  /**
   * Play a sound clip
   * @param soundClip string
   */
  playSoundClip(soundClip: string = 'testSound') {
    let source = null;
    switch (soundClip) {
      case 'testSound':
        source = 'assets/audio/louder_files/a_if_you_can_hear_this.mp3';
        break;
      case 'roundEndedWinner':
        source = 'assets/audio/louder_files/k_we_have_a_winner.mp3';
        break;
      case 'roundEndedNoWinner':
        source = 'assets/audio/louder_files/j_nobody_won.mp3';
        break;
      case 'gameEndedWinner':
        source = 'assets/audio/louder_files/k_we_have_a_winner.mp3';
        break;
      case 'jackpotWinner':
        source = 'assets/audio/louder_files/l_we_have_a_jackpot_winner.mp3';
        break;
      case 'noJackpotWinner':
        source = 'assets/audio/louder_files/j_nobody_won.mp3';
        break;
      case 'tenMinuteAnnouncement':
        source = 'assets/audio/louder_files/b_10_minutes.mp3';
        break;
      case 'fiveMinuteAnnouncement':
        source = 'assets/audio/louder_files/c_five_minutes.mp3';
        break;
      case 'roundOneAnnouncement':
        source = 'assets/audio/louder_files/d_round_1_start.mp3';
        break;
      case 'roundTwoAnnouncement':
        source = 'assets/audio/louder_files/e_round_2_start.mp3';
        break;
      case 'roundThreeAnnouncement':
        source = 'assets/audio/louder_files/f_round_3_start.mp3';
        break;
      case 'fiveSongsLeft':
        source = 'assets/audio/louder_files/g_5_songs_left.mp3';
        break;
      case 'twoSongsLeft':
        source = 'assets/audio/louder_files/h_2_songs_left.mp3';
        break;
      case 'oneSongLeft':
        source = 'assets/audio/louder_files/i_1_song_left.mp3';
        break;
      default:
        source = 'assets/audio/louder_files/a_if_you_can_hear_this.mp3';
        break;
    }
    this.songService.fadeAudio(this.audioRef.nativeElement, 1, 0, LOBBY_MUSIC_FADE_DURATION, () => {
      this.audioRef.nativeElement.pause();
      this.audioRef.nativeElement.volume = 1;

      this.soundClipAudioRef.nativeElement.src = source;
      this.soundClipAudioRef.nativeElement.load();
      this.soundClipAudioRef.nativeElement.play();
    });
  }

  async nextSong(game: Game) {
    // Set current round data
    let currentRoundName;
    let currentRoundLength;

    try {
      currentRoundName = this.currentRound.name;
      currentRoundLength = game.roundData[currentRoundName].master.length;

      if (!currentRoundName) {
        clearInterval(this.gameInterval);
        return;
      }

      // Display the next song as now playing, but set finished at to the "previous" playing song
      this.gameService.nowPlaying = game.roundData[currentRoundName].master[this.currentSongNumber] || this.gameService.nowPlaying;

      await this.gameService.timestampTest(game._id, game.roundData[currentRoundName].master[this.currentSongNumber - 1]._song._id);

      // Increase to the next song
      ++this.currentSongNumber;

      if (this.isDisplayingAlert) {
        this.audioRef.nativeElement.pause();
      }

      if (this.currentSongNumber > currentRoundLength) {
        // Check if the round has ended or if the game has ended
        // TODO: Check against object name instead of string for 'roundThree'
        if (this.isRoundThree()) {
          const event = new GameEvent(gameEndedEvent, game.roundData[currentRoundName]);
          this.gameService.eventEmitter.next(event);
        }

      } else {
        // Check to see if the Jackpot is over (can't win anymore)
        // The jackpot can still be won while the final jackpot threshold song is played
        // If the jackpot is won before this, we don't have to worry about this being played
        if (this.currentSongNumber ===
          this.settings[this.settingsTypes.JACKPOT_THRESHOLD] + 1 &&
          this.isRoundThree()) {

          await this.audioRef.nativeElement.pause();

          await this.playSoundClip('noJackpotWinner');

          this.soundClipAudioRef.nativeElement.addEventListener('ended', async () => {
            if (!this.isDisplayingAlert) {
              console.log('play', 'nextSong-else')
              await this.playSong(this.gameService.nowPlaying._song);
            }
          });

          // Jackpot countdown announcement checks start here
        } else if (this.checkForJackpotWarnings(4)) {

          await this.audioRef.nativeElement.pause();

          await this.playSoundClip('fiveSongsLeft');

          this.resumePlayAfterAnnouncements();

        } else if (this.checkForJackpotWarnings(1)) {

          await this.audioRef.nativeElement.pause();

          await this.playSoundClip('twoSongsLeft');

          this.resumePlayAfterAnnouncements();

        } else if (this.checkForJackpotWarnings(0)) {

          await this.audioRef.nativeElement.pause();

          await this.playSoundClip('oneSongLeft');

          this.resumePlayAfterAnnouncements();

        } else {
          // default playback behavior
          this.updateSongInfo();
          console.log('play', 'nextSong-default')
          await this.playSong(this.gameService.nowPlaying._song);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  checkForJackpotWarnings(songsLeft: number) {
    return this.currentSongNumber ===
      (this.settings[this.settingsTypes.JACKPOT_THRESHOLD] - songsLeft) &&
      this.isRoundThree();
  }

  isRoundThree() {
    return this.currentRound.name === 'roundThree';
  }

  /**
   * Listens for the end of the announcement audio and restarts the music, updating the UI accordingly
   */
  async resumePlayAfterAnnouncements() {
    this.soundClipAudioRef.nativeElement.addEventListener('ended', async () => {
      this.updateSongInfo();
      console.log('play', 'resumePlayAfterAnnouncements')
      await this.playSong(this.gameService.nowPlaying._song);
    });
  }

  updateSongInfo() {
    this.currentRound = this.gameService.currentRound.value;
    this.currentSongArtist = this.gameService.nowPlaying._song.artist;
    this.currentSongTitle = this.gameService.nowPlaying._song.title;
  }

  /**
   * Go to the rules page
   */
  goToRulesPage() {
    this.router.navigate(TERMS_CONDITIONS_ROUTE);
  }

  async quitGame(gameId: string) {
    try {
      if (this.isDisplayingAlert) { return; }

      this.isDisplayingAlert = true;
      this.displayEventAlert({
        styleClass: 'outline',
        alertMessage: '<h1>Are you sure want to end this game?</h1><p>The game will end immediately and there will be no winners.</p>',
        buttons: [
          {
            text: 'Exit Game',
            handler: () => {
              this.gameService.terminateGame(gameId);
              this.gameService.game.next(null);
              this.gameService.stopListeningForCurrentRound();
              clearInterval(this.gameInterval);
              this.router.navigate([''], { replaceUrl: true });
              this.isDisplayingAlert = false;
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              this.isDisplayingAlert = false;
            },
          },
        ]
      });
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscriptions) => subscriptions.unsubscribe());
    this.gameService.stopListeningForCurrentRound();
    this.audioRef.nativeElement.muted = true
    this.soundClipAudioRef.nativeElement.muted = true
  }

}
