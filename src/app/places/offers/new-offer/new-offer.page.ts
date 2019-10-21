import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { PlaceService } from '../../place.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  // inject services in constructor
  constructor(private placeService: PlaceService, private router: Router, private loaderCtrl: LoadingController) { }

  ngOnInit() {
    // Below is a reactive forms module
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)]
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }

  onCreatedOffer() {
    // console.log('creating offered place...');
    if (!this.form.valid) {
      return;
    }
    // show loading spinner
    this.loaderCtrl.create({
      message: 'Creating place...'
    }).then(loadingEl => {
      loadingEl.present();
      // after checking validity, we need to pass user input
      console.log('>>>FORM', this.form);
      this.placeService.addPlace(
        this.form.value.title,
        this.form.value.description,
        +this.form.value.price,
        new Date(this.form.value.dateFrom),
        new Date(this.form.value.dateTo)
      ).subscribe(() => {
        loadingEl.dismiss();
        // only interested when this is fires, because that means it's done adding a place and then we can
        // reset and change routes
        // once we're done addind we reset the form
        this.form.reset();
        // then we change routes
        this.router.navigate(['/places/tabs/offers']);
      });
    });
  }

}
