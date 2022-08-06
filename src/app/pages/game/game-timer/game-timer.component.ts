import * as moment from 'moment';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'game-timer',
  templateUrl: './game-timer.component.html',
  styleUrls: ['./game-timer.component.scss'],
})
export class GameTimerComponent implements OnInit, OnChanges {

  @Input() startTime: any;

  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';

  private timer: any;

  ngOnInit() {
    if (this.startTime) {
      this.setTimer(moment(this.startTime).toDate());
    }
  }

  ngOnChanges({ startTime: { currentValue } }: SimpleChanges) {
    if (!currentValue) { return; }
    this.setTimer(moment(currentValue).toDate());
  }

  // based on https://www.w3schools.com/howto/howto_js_countdown.asp
  setTimer(date: any): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(
      () => {
        const now = new Date().getTime();
        const distanceFromNow = date - now;

        const timerDays = Math.floor(distanceFromNow / (1000 * 60 * 60 * 24));
        const timerHours = Math.floor((distanceFromNow % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const timerMinutes = Math.floor((distanceFromNow % (1000 * 60 * 60)) / (1000 * 60));
        const timerSeconds = Math.floor((distanceFromNow % (1000 * 60)) / 1000);

        // set separately in order to handle a missing 0 in double-digit display
        this.days = (timerDays < 10) ? `0${timerDays}` : `${timerDays}`;
        this.hours = (timerHours < 10) ? `0${timerHours}` : `${timerHours}`;
        this.minutes = (timerMinutes < 10) ? `0${timerMinutes}` : `${timerMinutes}`;
        this.seconds = (timerSeconds < 10) ? `0${timerSeconds}` : `${timerSeconds}`;

        // terminates the timer and sets it to 00:00:00:00
        if (distanceFromNow < 0) {
          clearInterval(this.timer);
          this.days = '00';
          this.hours = '00';
          this.minutes = '00';
          this.seconds = '00';
        }
      },
      100
    );
  }

}
