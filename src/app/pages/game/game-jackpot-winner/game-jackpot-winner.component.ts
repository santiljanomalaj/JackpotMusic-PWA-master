import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GameService } from '../../../services/game.service';
import { ParamService } from '../../../services/param.service';
import { USER_DETAIL_ROUTE } from '../../../shared/routes/user-routes';

@Component({
  selector: 'app-game-jackpot-winner',
  templateUrl: './game-jackpot-winner.component.html',
  styleUrls: ['./game-jackpot-winner.component.scss'],
})
export class GameJackpotWinnerComponent implements OnInit {

  form: FormGroup;
  gameId: string;
  cardId: string;
  isLoading: boolean = false;
  isOfAge: boolean;
  submitAttempt: boolean = false;

  constructor(
    private router: Router,
    private params: ParamService,
    private formBuilder: FormBuilder,
    private gameService: GameService,
    private alertCtrl: AlertController,
  ) {
  }

  ngOnInit() {
    // Get the game id
    const data = this.params.get('contactInfo');
    this.gameId = data.gameId;
    this.cardId = data.cardId;

    // Create a blank form
    this.form = this.formBuilder.group({
      firstName: ['', Validators.compose([Validators.required])],
      phone: ['', Validators.compose([Validators.required])],
    });
  }

  /**
   * Send Jackpot info for user to server
   */
  async submit() {
    try {
      this.submitAttempt = true;
      if (!this.form.valid) { return; }

      this.isLoading = true;
      const response = await this.gameService.sendWinnerData(this.gameId, this.cardId, this.form.value);
      this.isLoading = false;

      const alert = await this.alertCtrl.create({
        message: `<img src="assets/images/Vertical_white.svg"><h1>Sent!</h1><p>${ response.message }</p>`,
        cssClass: 'fancy-alert outline',
        backdropDismiss: false,
        buttons: ['Dismiss'],
      });
      await alert.present();

      // Go ahead and navigate while the pop-up is displaying
      await this.router.navigate(USER_DETAIL_ROUTE, { replaceUrl: true });
    } catch (error) {
      console.error(error);

      const alert = await this.alertCtrl.create({
        message: 'There was an error storing your information',
        backdropDismiss: false,
        buttons: ['Dismiss'],
      });
      await alert.present();

      this.isLoading = false;
    }
  }

}
