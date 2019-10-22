import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  // object/tool that angular gives us for interacting with the dom
  Renderer2
} from '@angular/core';

import { environment } from '../../../environments/environment';

import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})


export class MapModalComponent implements OnInit, AfterViewInit  {
  @ViewChild('map', { static: false }) mapElementRef: ElementRef;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2
  ) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      // this is now what we work with. all google maps methods included in here.
      const mapEl = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: {lat: -34.397, lng: 150.644 },
        zoom: 16
      });

      // method for just the first initial load, third argument is the function exectuded
      googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.renderer.addClass(mapEl, 'visible');
      });

      map.addListener('click', event => {
        // event that gets fired up on this click
        const selectedCoords = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        this.modalCtrl.dismiss(selectedCoords);
      });
    }).catch(err => {
       console.log(err);
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      // if this is the case then we know the javascript SDK has been loaded before and we should not load it again.
      // therefore return a promise that instantly resolves.
      // This will the entry point to the maps javasript SDK that exposes all the functions
      return Promise.resolve(googleModule.maps);
    }
    // first time we execute this the google map would've not been loaded
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule =  win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }

}
