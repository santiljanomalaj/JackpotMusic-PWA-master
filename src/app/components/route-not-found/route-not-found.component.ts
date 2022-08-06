import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-route-not-found',
  templateUrl: './route-not-found.component.html',
  styleUrls: ['./route-not-found.component.scss'],
})
export class RouteNotFoundComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
    console.log(this.route.snapshot.url);
  }

  ngOnInit() {}

}
