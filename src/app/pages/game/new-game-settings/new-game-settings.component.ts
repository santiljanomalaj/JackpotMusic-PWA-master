import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { isNumeric } from 'rxjs/internal-compatibility';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GameService } from '../../../services/game.service';
import { ParamService } from '../../../services/param.service';
import { AuthService } from '../../../services/auth.service';

import NumberTMap from '../../../shared/models/number-t-map';
import { DEFAULT_PRIZES, OTHER_OPTION_LABEL, ROUND_NAME_MAPPER } from '../../../shared/constants/round-prizes';
import { insertStringAndOrderAsNumber } from '../../../shared/helpers/game-category-prizes.util';
import { Observable, of } from 'rxjs';
import { GAME_RUNNER_PREPARATION_ROUTE } from '../../../shared/routes/game-route';
import { isString } from 'lodash';

@Component({
  selector: 'app-new-game-settings',
  templateUrl: './new-game-settings.component.html',
  styleUrls: ['./new-game-settings.component.scss'],
})
export class NewGameSettingsComponent implements OnInit, OnDestroy {

  startTime: any;
  form: FormGroup;
  isTest: boolean;
  totalGameNumber: number;
  currentGameNumber: number = 1;
  selectOptions: {} = {
    cssClass: 'selectAlert'
  };
  isSubmitting: boolean = false;
  roundsKeys: number[] = Object.keys(ROUND_NAME_MAPPER).map((key) => +key);

  categories: Observable<string[]>;
  otherOptionValue: string = OTHER_OPTION_LABEL;
  roundPrizeMapper: NumberTMap<string> = ROUND_NAME_MAPPER;
  defaultPrizes: string[] = DEFAULT_PRIZES;

  constructor(
    private router: Router,
    private params: ParamService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private gameService: GameService,
    private alertCtrl: AlertController,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.retrieveParams();
    this.initForm();
    await this.retrieveCategories();
  }

  retrieveParams() {
    this.isTest = this.params.get('isTest');
    this.startTime = this.params.get('startTime');
    this.totalGameNumber = this.params.get('numberOfGames');
  }

  initForm(): void {
    this.form = this.formBuilder.group(
      {
        category: ['', [Validators.required]],
        roundOnePrize: ['', [Validators.required]],
        roundTwoPrize: ['', [Validators.required]],
        roundThreePrize: ['', [Validators.required]]
      }
    );
  }

  async retrieveCategories(): Promise<void> {
    this.gameService.categories.subscribe((categories) => this.categories = of(categories));
    await this.gameService.getCategories();
  }

  async goToNextGame(form: FormGroup): Promise<void> {
    if (form.valid) {
      const game = this.gameService.buildGameObject(form);
      this.gameService.storeGameObject(game);
      this.form.reset();
      ++this.currentGameNumber;
    }
  }

  async submit(form: FormGroup): Promise<void> {
    if (!form.valid) {
      return;
    }

    this.isSubmitting = true;

    const game = this.gameService.buildGameObject(form);
    this.gameService.storeGameObject(game);
    let date_ob = new Date();
    let local_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let mon = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let date = ("0" + date_ob.getDate()).slice(-2);
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    const allGameData = {
      isTest: this.isTest,
      startTime: this.startTime.toDate(),
      gameObjects: this.gameService.gameData,
      local_timezone:local_timezone,
      mon:mon,
      date:date,
      hours:hours,
      minutes:minutes
    };

    const body = JSON.stringify(allGameData);

    try {
      const response = await this.gameService.create(body);
      // Concat the response to our collection of games
      this.gameService.gameData = [];
      this.gameService.games.concat(response);

      await this.router.navigate(GAME_RUNNER_PREPARATION_ROUTE);
    } catch (error) {
      const message = error.error.message || 'There was an error';
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message,
        cssClass: 'error',
        buttons: [{ text: 'Dismiss', role: 'cancel' }],
      });

      await alert.present();
    }
  }

  async otherPrizeDialog(roundIndex: number) {
    const prizeRoundLbl = this.roundPrizeMapper[roundIndex];
    const value = this.form.get(prizeRoundLbl).value.trim();
    if (value === this.otherOptionValue) {
      const alert = await this.alertCtrl.create(
        {
          header: `Round ${ roundIndex } prize`,
          inputs: [
            {
              name: 'value',
              placeholder: 'Prize'
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.updateFormValue(prizeRoundLbl, 'closed');
              }
            },
            {
              text: 'Ok',
              handler: (data) => {
                this.updateFormValue(prizeRoundLbl, data.value);
              }
            }
          ],
        }
      );
      await alert.present();
    }
  }

  updateFormValue(formControlName: string, value:string) {
    const { defaultPrizes, form } = this;
    if (isString(value) && value!="closed") {
      if (defaultPrizes.indexOf(value) === -1) {
        this.defaultPrizes = insertStringAndOrderAsNumber(defaultPrizes, value);
      }
      if(/\d/.test(value))
        form.patchValue({ [formControlName]: "$ " + value });
      else 
        form.patchValue({ [formControlName]: value });
    } 
    else {
      form.patchValue({ [formControlName]: null });
    }
  }

  async ngOnDestroy(): Promise<void> {
    this.params.remove('isTest');
    this.params.remove('startTime');
    this.params.remove('numberOfGames');
  }

}
