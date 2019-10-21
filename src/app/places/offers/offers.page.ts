import { Component, OnInit, OnDestroy } from '@angular/core';

import { PlaceService } from '../place.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  // simple spinner, not overlay
  isLoading = false;
  private placesSub: Subscription;

  constructor(private placeService: PlaceService, private router: Router) { }

  ngOnInit() {
    // before
    // this.offers = this.placeService.places;
    this.placesSub = this.placeService.places.subscribe(places => {
      // remember to clear subscription to avoid memory leaks
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    // triggers fetchPlaces() method in PlaceService
    this.placeService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing Item', offerId);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
