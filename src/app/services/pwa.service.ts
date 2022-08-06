import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  promptEvent: any;

  constructor(
    private swUpdate: SwUpdate,
    private alertCtrl: AlertController,
  ) {
    swUpdate.available.subscribe(async () => {
      await this.alert();
    });
  }

  async alert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      backdropDismiss: false,
      cssClass: 'fancy-alert',
      message: `<img alt="Jackpot Music Game Logo" src="assets/images/Vertical_white.svg" />
        <p>There is a new update</p><p>Do you want to update?</p>`,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
        },
        {
          text: 'Update',
          handler: () => {
            window.location.reload();
          }
        }
      ],
    });
    await alert.present();
  }

}
