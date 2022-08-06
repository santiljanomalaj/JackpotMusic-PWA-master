import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { USER_DETAIL_ROUTE } from '../../../shared/routes/user-routes';

@Component({
  selector: 'app-game-runner-prep',
  templateUrl: './game-runner-prep.component.html',
  styleUrls: ['./game-runner-prep.component.scss'],
})
export class GameRunnerPrepComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }

  async finish(): Promise<void> {
    await this.router.navigate(USER_DETAIL_ROUTE);
  }

}
