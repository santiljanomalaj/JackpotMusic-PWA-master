import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IsUserLoggedInGuard } from '../../guards/is-user-logged-in.guard';
import { UserNotLoggedInGuard } from '../../guards/user-not-logged-in.guard';
import { IsAnonymousGuard } from '../../guards/is-anonymous.guard';
import { IsCreditCardIn } from '../../guards/is-credit-card-in.guard';
import { DefaultGameRedirectionGuard } from '../../guards/default-game-redirection.guard';

import { GameNewComponent } from './game-new/game-new.component';
import { GameEditComponent } from './game-edit/game-edit.component';
import { GameActiveComponent } from './game-active/game-active.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { GameRunnerPrepComponent } from './game-runner-prep/game-runner-prep.component';
import { LocationListComponent } from '../location/location-list/location-list.component';
import { NewGameSettingsComponent } from './new-game-settings/new-game-settings.component';
import { LocationDetailComponent } from '../location/location-detail/location-detail.component';
import { GameJackpotWinnerComponent } from './game-jackpot-winner/game-jackpot-winner.component';
import { CardComponent } from '../card/card/card.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [DefaultGameRedirectionGuard]
  },
  {
    path: 'location-list',
    pathMatch: 'full',
    component: LocationListComponent,
    canActivate: [UserNotLoggedInGuard],
  },
  {
    path: 'location-detail',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: LocationDetailComponent,
  },
  {
    path: 'new',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard, IsCreditCardIn],
    component: GameNewComponent,
  },
  {
    path: 'new-game-settings',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: NewGameSettingsComponent,
  },
  {
    path: 'runner-preparation',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: GameRunnerPrepComponent,
  },
  {
    path: 'details',
    pathMatch: 'full',
    canActivate: [IsAnonymousGuard],
    component: GameDetailComponent,
  },
  {
    path: 'active',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: GameActiveComponent,
  },
  {
    path: 'edit',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: GameEditComponent,
  },
  {
    path: 'jackpot-winner',
    pathMatch: 'full',
    canActivate: [IsUserLoggedInGuard],
    component: GameJackpotWinnerComponent,
  },
  {
    path: 'card',
    pathMatch: 'full',
    canActivate: [IsAnonymousGuard],
    component: CardComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class GameRoutingModule { }
