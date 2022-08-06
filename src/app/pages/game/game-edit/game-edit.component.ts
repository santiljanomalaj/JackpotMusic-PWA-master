import * as moment from 'moment';
import { Observable, of, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AlertController } from '@ionic/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GameService } from '../../../services/game.service';

import { Game } from '../game';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.scss'],
})
export class GameEditComponent implements OnInit, OnDestroy {

  game: Game;
  form: FormGroup;
  selectOptions: {} = {
    cssClass: 'selectAlert',
  };
  categories: Observable<string[]>;
  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private gameService: GameService,
    private alertCtrl: AlertController,
  ) {
  }

  async ngOnInit(): Promise<void> {
    const gameSub = this.gameService.game.subscribe((game) => this.game = game);
    const categorySub = this.gameService.categories.subscribe(
      (categories) => this.categories = of(categories)
    );
    this.subscriptions = [gameSub, categorySub];
    this.initForm();
    await this.gameService.getCategories();
  }

  initForm() {
    this.form = this.formBuilder.group({
      date: [moment(this.game.startTime).format('YYYY-MM-DD'), [Validators.required]],
      time: [moment(this.game.startTime).format('HH:mm'), [Validators.required]],
      category: [this.game.category, [Validators.required]],
      roundOnePrize: [this.game.roundData.roundOne.prize, [Validators.required]],
      roundTwoPrize: [this.game.roundData.roundTwo.prize, [Validators.required]],
      roundThreePrize: [this.game.roundData.roundThree.prize, [Validators.required]],
    });
  }

  async submit() {
    if (!this.game || !this.form.valid) { return; }

    const { roundOne, roundTwo, roundThree } = this.game.roundData;
    const { date, time, category, roundOnePrize, roundTwoPrize, roundThreePrize } = this.form.value;
    const startTime = moment(`${ date } ${ time }`, 'YYYY-MM-DD HH:mm');

    const updatedGameData = {
      startTime,
      category,
      _id: this.game._id,
      roundData: {
        roundOne: {
          prize: roundOnePrize,
          master: roundOne.master,
        },
        roundTwo: {
          prize: roundTwoPrize,
          master: roundTwo.master,
        },
        roundThree: {
          prize: roundThreePrize,
          master: roundThree.master,
        },
      },
    };

    try {
      const game = this.game;
      this.game = await this.gameService.update(updatedGameData);
      this.game._location = game._location;
      this.gameService.game.next(this.game);
      this.location.back();
    } catch (error) {
      const message = 'There was an error.';
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message,
        cssClass: 'error',
        buttons: ['Dismiss'],
      });
      await alert.present();
    }
  }

  async deleteGame(game: Game) {
    const alert = await this.alertCtrl.create({
      message: `<img src="assets/images/Vertical_white.svg">
                <h1>Delete this game?</h1>
                <p>Are you sure you want to delete this game?</p>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete Game',
          handler: async () => {
            await this.gameService.delete(game._id).catch(console.log);
            await this.router.navigate([''], { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

}
