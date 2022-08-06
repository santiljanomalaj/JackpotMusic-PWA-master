import { NgModule } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { GameRoutingModule } from './game-routing.module';
import { SharedModule } from '../../shared/modules/shared.module';

import { CardComponent } from '../card/card/card.component';
import { GameNewComponent } from './game-new/game-new.component';
import { GameEditComponent } from './game-edit/game-edit.component';
import { GameTimerComponent } from './game-timer/game-timer.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { GameActiveComponent } from './game-active/game-active.component';
import { GameRunnerPrepComponent } from './game-runner-prep/game-runner-prep.component';
import { LocationListComponent } from '../location/location-list/location-list.component';
import { NewGameSettingsComponent } from './new-game-settings/new-game-settings.component';
import { LocationDetailComponent } from '../location/location-detail/location-detail.component';
import { GameJackpotWinnerComponent } from './game-jackpot-winner/game-jackpot-winner.component';


@NgModule({
  imports: [
    SharedModule,
    MomentModule,
    GameRoutingModule,
  ],
  declarations: [
    CardComponent,
    GameNewComponent,
    GameEditComponent,
    GameTimerComponent,
    GameActiveComponent,
    GameDetailComponent,
    LocationListComponent,
    GameRunnerPrepComponent,
    LocationDetailComponent,
    NewGameSettingsComponent,
    GameJackpotWinnerComponent,
  ],
  providers: [
    Geolocation,
    Vibration,
  ],
})
export class GameModule { }
