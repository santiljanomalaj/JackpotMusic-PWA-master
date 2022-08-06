export class GameEvent {

  data: any;
  key: string;

  constructor(key: string, data: any = null) {
    this.key = key;
    this.data = data;
  }

}
