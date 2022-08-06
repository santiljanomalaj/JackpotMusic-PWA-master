import { Component, OnInit, EventEmitter, Output, NgZone } from '@angular/core';

declare var google;

@Component({
  selector: 'autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit {

  focus: boolean = false;
  @Output() select: any = new EventEmitter<any>();

  autocomplete: any;
  autocompleteItems: any;
  geocoder: any = new google.maps.Geocoder();
  autocompleteService: any = new google.maps.places.AutocompleteService();

  constructor(private zone: NgZone) {
    this.clearSearchBarAndResults();
  }

  ngOnInit() { }

  clearSearchBarAndResults() {
    this.autocompleteItems = [];
    this.autocomplete = { query: '' };
  }

  chooseItem(location: any) {
    this.geocoder.geocode(
      { placeId: location.place_id },
      (results: any, status: any) => {
        this.zone.run(
          () => {
            const result = results[0];
            this.select.emit(result);
            this.clearSearchBarAndResults();
          }
        );
      }
    );
  }

  updateSearch() {
    if (this.autocomplete.query === '') {
      this.autocompleteItems = [];
      return;
    }

    const _this = this;

    this.autocompleteService.getPlacePredictions(
      { input: this.autocomplete.query },
      (predictions: any, status: any) => {
        _this.autocompleteItems = [];
        _this.zone.run(
          () => {
            if (predictions && predictions.length) {
              predictions.forEach((prediction: any) => {
                _this.autocompleteItems.push(prediction);
              });
            }
          }
        );
      }
    );
  }

}
