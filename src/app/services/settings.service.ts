import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ConstantsService } from './constants.service';

import { Settings } from '../pages/settings/settings';
import { SettingTypes } from '../pages/settings/setting-types';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings: BehaviorSubject<Settings>;

  types: SettingTypes = {
    JACKPOT_AMOUNT: 'jackpot_amount',
    PRICE_PER_GAME: 'price_per_game',
    PRICE_PER_USER: 'price_per_user',
    JACKPOT_THRESHOLD: 'jackpot_threshold',
    JACKPOT_REQUIRED_SONG_COUNT: 'jackpot_required_song_count',
  };

  constructor(
    private http: HttpClient,
    private constants: ConstantsService,
  ) {
    this.settings = new BehaviorSubject<Settings>({});
  }

  /**
   * Gets all settings from the server
   * The response is an object with the key being the property (matches types above)
   * and the value is the value of the property
   */
  async getAll(): Promise<void> {
    const url = `${this.constants.API_BASE_URL}/settings`;
    const response = await this.http.get<{ settings: Settings }>(url).toPromise();
    this.settings.next(response.settings);
  }

}
