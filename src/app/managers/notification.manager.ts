import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Push, PushObject, PushOptions } from '@ionic-native/push/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import * as AndroidSettings from '../../../google-services.json';

@Injectable()
export class NotificationManager {

  private pushObject: PushObject;
  private idNotification: number = 0;

  constructor(
    private push: Push,
    private platform: Platform,
    public alert: AlertController,
    private localNotification: LocalNotifications,
  ) {
  }

  isiOS = (): boolean => this.platform.platforms().indexOf('ios') !== -1;

  isAndroid = (): boolean => this.platform.platforms().indexOf('android') !== -1;

  isDesktop = (): boolean => this.platform.platforms().indexOf('desktop') !== -1;

  getIdNotification() {
    return this.idNotification++;
  }

  getPushOptions(): PushOptions {
    const options: PushOptions = {
      android: {},
      browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push',
      },
      ios: {
        alert: true,
        badge: true,
        sound: true,
      },
      windows: {}
    };

    if (this.isAndroid() === true) {
      if (!AndroidSettings.project_info.project_number) { return options; }
      options.android.senderID = `${ AndroidSettings.project_info.project_number }`;
    }

    return options;
  }

  init() {
    this.initLocalNotifications();
    this.initPushNotifications();
  }

  initLocalNotifications() {
    this.localNotification.on('click').subscribe(({ data }) => {
      this.showAlert({ header: data.title, message: data.text });
    });
  }

  initPushNotifications() {
    const options = this.getPushOptions();
    this.pushObject = this.push.init(options);
    this.setOnNotification();
  }

  setOnNotification() {
    this.pushObject.on('notification').subscribe(async (data: any) => {
      const {
        ['pinpoint.notification.title']: header,
        ['pinpoint.notification.body']: message,
      } = data.additionalData;

      if (data.additionalData.foreground) {
        this.showAlert({ header, message });
      }

      this.showNotification({ header, message });
    });
  }

  async showAlert({ header, message = '', buttons = [{ text: 'Dismiss', role: 'cancel' }] }) {
    const alert = await this.alert.create({
      header,
      buttons,
      message,
      cssClass: 'alert',
    });
    await alert.present();
  }

  async showNotification({ header, message = '' }) {
    this.localNotification.schedule({
      id: this.getIdNotification(),
      title: header,
      text: message,
    });
  }

}
