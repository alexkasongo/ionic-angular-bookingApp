import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-location-pickers',
  templateUrl: './location-pickers.component.html',
  styleUrls: ['./location-pickers.component.scss'],
})
export class LocationPickersComponent implements OnInit {

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
        this.getAddress(modalData.data.lat, modalData.data.lng).subscribe(
          (address) => {
            console.log('>>>Address: ', address);
          }
         );
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
}
