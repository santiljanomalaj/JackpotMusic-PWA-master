import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';

import { NotificationManager } from './managers/notification.manager';
import { CacheManager } from './managers/cache.manager';

import { SettingsService } from './services/settings.service';
import { AuthService } from './services/auth.service';
import { PwaService } from './services/pwa.service';
import { USER_DETAIL_ROUTE } from './shared/routes/user-routes';
import * as Sentry from '@sentry/browser';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private platform: Platform,
    private cache: CacheManager,
    private statusBar: StatusBar,
    private pwaService: PwaService,
    private authService: AuthService,
    private push: NotificationManager,
    private splashScreen: SplashScreen,
    private settingsService: SettingsService,
    private insomnia: Insomnia
  ) {
    this.initializeApp();
    this.settingsService.getAll().catch(console.error);
  }

  async ngOnInit(): Promise<void> {
    const isAuthenticated = await this.authService.checkAuthentication();
    if (isAuthenticated) {
      await this.router.navigate(USER_DETAIL_ROUTE);
    }
    this.insomnia.keepAwake()
      .then(() => console.log('insomnia activated'))
      .catch((error) => {
        Sentry.withScope(scope => {
          Sentry.captureException(error);
        });
      });
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      /*
      * App task 1 - Cache host app
      * Setting the TTL for cache and cleaning expired cache
      */
      this.cache.setTTL(60 * 60 * 2); // The cache will remain for 2 hours
      await this.cache.clearExpired();

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.push.init();
    });
  }

  async ngOnDestroy(): Promise<void> {
    await this.cache.clearAll();
  }

}
