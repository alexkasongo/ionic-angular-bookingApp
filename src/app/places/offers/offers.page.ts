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
  private placesSub: Subscription;

  constructor(private placesService: PlaceService, private router: Router) { }

  ngOnInit() {
    // before
    // this.offers = this.placesService.places;
    this.placesSub = this.placesService.places.subscribe(places =>{
      // remember to clear subscription to avoid memory leaks
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.placesService.fetchplaces().subscribe();
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
