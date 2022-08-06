import { NgModule, ErrorHandler } from '@angular/core';
import { Push } from '@ionic-native/push/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { RouteReuseStrategy } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BrowserModule } from '@angular/platform-browser';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { RouteNotFoundComponent } from './components/route-not-found/route-not-found.component';

import { NotificationManager } from './managers/notification.manager';
import { CacheManager } from './managers/cache.manager';

import { PwaService } from './services/pwa.service';
import { GameService } from './services/game.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { ParamService } from './services/param.service';
import { SettingsService } from './services/settings.service';
import { ValidationService } from './services/validation.service';
import { HttpAuthInterceptorService } from './services/http-auth-interceptor.service';
import { InsertCardService } from './services/insert-card.service';
import { SentryErrorHandler } from './services/sentry.service';

@NgModule({
  declarations: [
    AppComponent,
    RouteNotFoundComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ServiceWorkerModule.register('./ngsw-worker.js')
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptorService, multi: true },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    LocalNotifications,
    Push,
    ParamService,
    AuthService,
    UserService,
    SettingsService,
    ValidationService,
    NotificationManager,
    CacheManager,
    GameService,
    PwaService,
    InsertCardService,
    Insomnia
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
