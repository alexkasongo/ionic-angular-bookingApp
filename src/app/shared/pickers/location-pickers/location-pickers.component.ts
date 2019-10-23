import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { PlaceLocation } from '../../../places/location.model';
import { of } from 'rxjs';

@Component({
  selector: 'app-location-pickers',
  templateUrl: './location-pickers.component.html',
  styleUrls: ['./location-pickers.component.scss'],
})
export class LocationPickersComponent implements OnInit {
  // @Output makes it listenable from outside, EventEmitter is a generic type, will eventually emmit PlaceLocation
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) { }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        // console.log(modalData.data);
        // switchMap takes takes observable one and returns a new observable
        const pickedLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };
        this.isLoading = true;
        this.getAddress(modalData.data.lat, modalData.data.lng).pipe(switchMap(address => {
          // method that yields a screenshot
          // first store the address coords and snapshot link
          pickedLocation.address = address;
          // 'of' creates an observable that can be wrapped around any which is instantly emmited
          return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
        })).subscribe(staticMapImageUrl => {
          pickedLocation.staticMapImageUrl = staticMapImageUrl;
          this.selectedLocationImage = staticMapImageUrl;
          this.isLoading = false;
          // emmit picked location via locationPick
          this.locationPick.emit(pickedLocation);
        });
      });
      modalEl.present();
    });
  }
  private getAddress(lat: number, lng: number) {
    // now we can send a regular http request to an api end
    return this.http.get<any>(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat}, ${lng}&key=${environment.googleMapsAPIKey}`
    ).pipe(map(geoData => {
      console.log(geoData);
      if (!geoData || !geoData.results || geoData.results.length === 0) {
        return null;
      }
      return geoData.results[0].formatted_address;
    }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;
  }
}
