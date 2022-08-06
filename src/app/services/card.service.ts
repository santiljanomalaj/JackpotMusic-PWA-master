import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Card } from './../pages/card/card';
import { ConstantsService } from './constants.service';

class SelectionStatus {
  default: string;
  correct: string;
  incorrect: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardService {

  card: Card;
  cards: Card[] = [];
  SELECTION_STATUSES: SelectionStatus = {
    default: 'default',
    correct: 'correct',
    incorrect: 'incorrect',
  };

  constructor(
    private http: HttpClient,
    private constants: ConstantsService,
  ) {
  }

  async create(object: {}): Promise<Card> {
    const url = `${ this.constants.API_BASE_URL }/cards`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.http.post<Card>(url, object, { headers }).toPromise();
  }

  async addSongTimestamp(cardId: string, songId: string): Promise<Card> {
    const url = `${ this.constants.API_BASE_URL }/cards/${ cardId }/selectedSong/${ songId }`;
    return await this.http.post<Card>(url, {}).toPromise();
  }

}
