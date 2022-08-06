import * as moment from 'moment';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Settings } from '../../settings/settings';
import { SettingTypes } from '../../settings/setting-types';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ParamService } from '../../../services/param.service';
import { SettingsService } from '../../../services/settings.service';
import { GAME_NEW_SETTINGS_ROUTE } from '../../../shared/routes/game-route';

@Component({
  selector: 'app-game-new',
  templateUrl: './game-new.component.html',
  styleUrls: ['./game-new.component.scss'],
})
export class GameNewComponent implements OnInit {

  form: FormGroup;
  settings: Settings;
  numberOfGames: number = 0;
  settingTypes: SettingTypes;
  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private params: ParamService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private settingsService: SettingsService,
  ) {
  }

  ngOnInit() {
    this.initForm();
    this.subscribeToSettings();
  }

  subscribeToSettings() {
    this.settingTypes = this.settingsService.types;
    this.settingsService.settings.subscribe(settings => this.settings = settings);
  }

  initForm() {
    this.form = this.formBuilder.group({
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      isTest: [false],
    });
  }

  async submit() {
    if (!this.form.valid) {
      return;
    }

    // The date variable returns the current time.
    const { date, time, isTest } = this.form.value;
    this.isSubmitting = false;
    let select_date = date.split('T')[0]
    let select_time = time.split('T')[1]
    const selected_date = select_date+'T'+select_time
    const startTime = moment(`${ selected_date }`, 'YYYY-MM-DD h:mm');
    this.params.set('isTest', isTest);
    this.params.set('startTime', startTime);
    this.params.set('numberOfGames', this.numberOfGames);
    await this.router.navigate(GAME_NEW_SETTINGS_ROUTE);
    this.isSubmitting = false;
  }

  public increment(): void {
    ++this.numberOfGames;
  }

  public decrement(): void {
    if (this.numberOfGames > 0) {
      --this.numberOfGames;
    }
  }

  isCurrentUserAdmin() {
    const user = this.authService.currentUser;
    return this.userService.isAdmin(user);
  }

}
