import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlaceDetailPage } from './place-detail.page';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { SharedModule } from '../../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: PlaceDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    // unlocks map module component
    SharedModule
  ],
  declarations: [PlaceDetailPage, CreateBookingComponent],
  // entryComponets lets angular know that this will be created programmatically and angular should be prepared to render 
  // this component when required.
  entryComponents: [CreateBookingComponent]
})
export class PlaceDetailPageModule {}
