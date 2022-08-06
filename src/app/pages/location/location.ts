import { Game } from '../game/game';

export class Location {
  _id: string;
  name: string;
  location: any;
  updatedAt: Date;
  createdAt: Date;
  games: [Game];
}
