import { Howl } from 'howler';
import * as moment from 'moment';
import { Router, RoutesRecognized } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import { GameService } from '../../../services/game.service';
import { SongService } from '../../../services/song.service';
import { AuthService } from '../../../services/auth.service';
import { ConstantsService } from '../../../services/constants.service';

import { Game } from '../game';
import { Subscription } from 'rxjs';
import { GAME_ACTIVE_ROUTE, GAME_CARD_ROUTE, GAME_LOCATION_DETAIL_ROUTE } from '../../../shared/routes/game-route';
import { filter, pairwise, take } from 'rxjs/operators';

const MUTED_LOBBY_MUSIC_VOLUME = 0.05;
const LOBBY_MUSIC_FADE_DURATION = 3000;

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss'],
})
export class GameDetailComponent implements OnDestroy {

  game: Game;
  testSoundAudio: any;
  lobbyMusicAudio: any;
  userIsGameRunner: boolean;
  lobbyMusicLoaded: boolean;
  oneMinuteWarningAudio: any;
  tenMinuteWarningAudio: any;
  fiveMinuteWarningAudio: any;
  lobbyMusicHasStarted: boolean;
  announcementClipInterval: any;
  gameSubscription: Subscription;
  audioLoaded: boolean = false;

  constructor(
    private router: Router,
    public authService: AuthService,
    public alert: AlertController,
    public gameService: GameService,
    private songService: SongService,
    private constants: ConstantsService,

  ) {
    this.initAttributes();
  }

  ionViewWillEnter(): void {
    // if (this.router.routerState.snapshot.url==="") {
    //   this.goToList()
    // }
    this.router.events
      .pipe(filter((e: any) => e instanceof RoutesRecognized),
        pairwise()
      ).pipe(take(1)).subscribe((e: any) => {
        this.goToList() // previous url
      });
    const started = this.didGameStart();
    if (started) {
      this.redirectToGame();
    } else {
      this.waitForGame();
    }
  }
  private waitForGame() {
    if (this.userIsGameRunner) {
      this.initSongs();
      this.loadAudio();
      this.songService.saveRoundsOnCache(this.game._id);
      this.playLobbyMusic();
      this.startAnnouncementClipInterval();
    }
  }

  private playLobbyMusic() {
    if (!this.lobbyMusicAudio.playing()) {
      this.lobbyMusicAudio.play();
    }
  }

  private didGameStart() {
    const now = moment();
    const roundOneStartTime = this.game.roundData.roundOne.startedAt;
    const hasStarted = moment(this.game.startTime).isSameOrBefore(now);
    const startedBeforePlanned = roundOneStartTime ? moment(roundOneStartTime).isSameOrBefore(now) : false
    return hasStarted || startedBeforePlanned;
  }
  private redirectToGame() {
    if (this.userIsGameRunner) {
      this.goToGame();
    } else {
      this.goToCard();
    }
  }

  async initAttributes() {
    this.lobbyMusicLoaded = false;
    this.lobbyMusicHasStarted = false;
    this.gameSubscription = this.gameService.game.subscribe((game) => {
      if (this.game && this.game._id && ((game && this.game._id !== game._id) || !game)) {
        this.songService.deleteGameSongs(this.game._id);
      }
      this.game = game;
      const currentUser = this.authService.currentUser;
      this.userIsGameRunner = this.game && currentUser && currentUser._id === this.game._createdBy;
    });
  }
  private getLobbyMusicURL() {
    const wrongUrlComingFromBE = 'https://jackpot-music-game.s3.amazonaws.com/';
    return this.game.lobbyMusicUrl.replace(wrongUrlComingFromBE, this.constants.AWS_S3_BASE_URL).replace(' ', '+');
  }

  initSongs() {
    this.lobbyMusicAudio = new Howl({
      src: [this.getLobbyMusicURL()],
      html5: true,
      loop: true,
      volume: 1.0,
      autoplay: false,
      preload: false,
    });

    this.lobbyMusicAudio.on('load', () => {
      this.lobbyMusicLoaded = true;
    });

    this.testSoundAudio = new Howl({
      src: ['assets/audio/louder_files/a_if_you_can_hear_this.mp3'],
      volume: 1.0,
      autoplay: false,
      preload: false,
    });

    this.testSoundAudio.on('end', () => {
      if (!this.lobbyMusicAudio.playing()) {
        this.lobbyMusicAudio.play();
      }
    });

    this.oneMinuteWarningAudio = new Howl({
      src: ['assets/audio/louder_files/Alan_Parsons_Project_Sirius_Shorter.mp3'],
      volume: 1.0,
      autoplay: false,
      preload: false,
    });

    this.fiveMinuteWarningAudio = new Howl({
      src: ['assets/audio/louder_files/c_five_minutes.mp3'],
      volume: 1.0,
      autoplay: false,
      preload: false,
    });

    this.tenMinuteWarningAudio = new Howl({
      src: ['assets/audio/louder_files/b_10_minutes.mp3'],
      volume: 1.0,
      autoplay: false,
      preload: false,
    });
    this.audioLoaded = true;
  }

  goToGame(): void {
    this.unloadAudio();
    this.router.navigate(GAME_ACTIVE_ROUTE);
  }
  goToList(): void {
    this.unloadAudio();
    this.router.navigate(GAME_LOCATION_DETAIL_ROUTE);
  }

  async startGameEarly(): Promise<void> {
    const gameStart = new Date(this.game.startTime);
    let hours = gameStart.getHours();
    let ampm = 'AM';
    const minutes = gameStart.getMinutes();
    if (hours > 12) {
      hours -= 12;
      ampm = 'PM';
    }
    const alert = await this.alert.create({
      message: `Are you sure you want to start the game that was set to start at ${hours}:${minutes} ${ampm}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => true
        },
        {
          text: 'Ok',
          handler: () => {
            this.unloadAudio();
            this.router.navigate(GAME_ACTIVE_ROUTE);
            return true;
          }
        }
      ],
    });
    await alert.present();
  }

  goToCard(): void {
    this.router.navigate(GAME_CARD_ROUTE);
  }

  ionViewDidLeave() {
    this.unloadAudio();
    this.stopAnnouncementClipInterval();
  }

  testSound() {
    if (!this.userIsGameRunner) {
      return;
    }

    if (this.lobbyMusicAudio.playing()) {
      this.lobbyMusicAudio.pause();
    }

    if (!this.testSoundAudio.playing()) {
      this.testSoundAudio.play();
    }
  }

  isCloseToStartTimeForGame(game: Game, time: number = 60) {
    return game ? moment(game.startTime).isBefore(moment().add(time, 'minutes')) : false;
  }

  loadAudio() {
    this.lobbyMusicAudio.load();
    this.testSoundAudio.load();
    this.oneMinuteWarningAudio.load();
    this.fiveMinuteWarningAudio.load();
    this.tenMinuteWarningAudio.load();
  }

  unloadAudio() {
    if (this.audioLoaded) {
      this.lobbyMusicAudio.unload();
      this.testSoundAudio.unload();
      this.oneMinuteWarningAudio.unload();
      this.fiveMinuteWarningAudio.unload();
      this.tenMinuteWarningAudio.unload();
    }
  }

  fadeAudio(audio: any, from: number, to: number, duration: number, callback: any = null) {
    this.songService.fadeAudio(audio, from, to, duration, callback);
  }

  /**
   * Play sounds at different intervals before the game starts
   * The interval must match the value for .isSame (e.g., seconds, minutes, etc.)
   */
  startAnnouncementClipInterval() {
    this.announcementClipInterval = setInterval(
      () => {
        const now = moment();
        const gameStartTime = moment(this.game.startTime)
          .subtract(1, 'seconds')
          .isSame(now, 'second');
        const oneMinuteWarning = moment(this.game.startTime)
          .subtract(40, 'seconds')
          .isSame(now, 'second');
        const fiveMinuteWarning = moment(this.game.startTime)
          .subtract(5, 'minutes')
          .isSame(now, 'second');
        const tenMinuteWarning = moment(this.game.startTime)
          .subtract(10, 'minutes')
          .isSame(now, 'second');

        // 60 minutes before start of game only
        const startLobbyMusic =
          now.isSameOrAfter(moment(this.game.startTime).subtract(60, 'minutes')) &&
          now.isSameOrBefore(moment(this.game.startTime));

        // Check if game already started
        if (moment(this.game.startTime).isSameOrBefore(now)) {
          this.goToGame();
        }

        if (startLobbyMusic && this.userIsGameRunner) {
          if (gameStartTime) {
            this.stopAnnouncementClipInterval();
            setTimeout(
              () => {
                this.goToGame();
              },
              1000
            ); // match offset in gameStartTime
          } else if (oneMinuteWarning) {
            this.fadeAudio(this.lobbyMusicAudio, 1, 0, LOBBY_MUSIC_FADE_DURATION, () => {
              this.lobbyMusicAudio.stop();
              this.tenMinuteWarningAudio.load();
              this.oneMinuteWarningAudio.play();
            });
          } else if (fiveMinuteWarning) {
            this.fadeAudio(this.lobbyMusicAudio, 1, MUTED_LOBBY_MUSIC_VOLUME, LOBBY_MUSIC_FADE_DURATION, () => {
              this.tenMinuteWarningAudio.load();
              this.fiveMinuteWarningAudio.play();
              this.fiveMinuteWarningAudio.on('end', () => {
                this.lobbyMusicAudio.fade(MUTED_LOBBY_MUSIC_VOLUME, 1, LOBBY_MUSIC_FADE_DURATION);
              });
            });
          } else if (tenMinuteWarning) {
            this.fadeAudio(this.lobbyMusicAudio, 1, MUTED_LOBBY_MUSIC_VOLUME, LOBBY_MUSIC_FADE_DURATION, () => {
              this.tenMinuteWarningAudio.load();
              this.tenMinuteWarningAudio.play();
              this.tenMinuteWarningAudio.on('end', () => {
                this.lobbyMusicAudio.fade(MUTED_LOBBY_MUSIC_VOLUME, 1, LOBBY_MUSIC_FADE_DURATION);
              });
            });
          } else if (!this.lobbyMusicHasStarted) {
            if (!this.lobbyMusicAudio.playing()) {
              this.lobbyMusicAudio.play();
            }
            this.lobbyMusicHasStarted = true;
          }
        }
      },
      1000
    );
  }

  /**
   * Clear the interval
   */
  stopAnnouncementClipInterval() {
    clearInterval(this.announcementClipInterval);
  }

  ngOnDestroy(): void {
    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }
  }

}
