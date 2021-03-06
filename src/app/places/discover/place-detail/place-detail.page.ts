import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';


import { Place } from '../../place.model';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { PlaceService } from '../../place.service';
import { Subscription } from 'rxjs';
import { BookingService } from '../../../bookings/booking.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModalComponent } from '../../../shared/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private placeService: PlaceService,
    // open action sheets when onBookPlace() is triggered
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      // this.place = this.placeService.getPlace(paramMap.get('placeId'));
      this.authService.userId.pipe(take(1),
        switchMap(userId => {
        if (!userId) {
          throw new Error('Found no user!');
        }
        fetchedUserId = userId;
        return this.placeService.getPlace(paramMap.get('placeId'));
      })).subscribe(
          place => {
            this.place = place;
            this.isBookable = place.userId !== fetchedUserId;
            this.isLoading = false;
        }, error => {
          // can get error data from server
          this.alertCtrl.create({
            header: 'An error occured!',
            message: 'Could not load place',
            buttons: [{
              text: 'Okay',
              handler: () => {
                this.router.navigate(['/places/tabs/discover']);
                }
              }
            ]
          }).then(alertEl => alertEl.present());
        });
    });
  }

  onBookPlace() {
    // console.log(this.place);
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // another way of navigating back is calling the pop() method, this will pop the last page off the stack.
    // this.navCtrl.pop();

    // Here we want to open the MODAL! To this we injec the ModalController. Make sure to declare this component
    // in place.detail module under declarations and entryComponents
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            // in this handler you can place code that does whatever, eg. open a model or change routes
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      // componentsProps: gets passed in as a property to the CreateBookingComponent
      componentProps: { selectedPlace: this.place, selectedMode: mode }
    })
    .then(modalEl => {
      modalEl.present();
      // modalEl.onDidDismiss() is a promise for dusmiss methods
      return modalEl.onDidDismiss();
    }).then(resultData => {
      // console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        this.loadingCtrl.create({
          message: 'Booking place...'
        }).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
          ).subscribe(() => {
            loadingEl.dismiss();
            this.router.navigate(['/places/tabs/discover']);
          });
          console.log('>>> Booked!');
        });
      }
    });
  }

  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModalComponent,
      componentProps: {
        center: {lat: this.place.location.lat, lng: this.place.location.lng},
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    }).then(modalEl => {
      modalEl.present();
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
