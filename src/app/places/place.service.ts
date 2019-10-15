import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
// observable which allows for subscriptions: always gives the latest previously emmited values
import { BehaviorSubject, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  // NOTE  <> descripes generic type and which type of data will eventually endup there
  // private placesModel: Place[] = new BehaviorSubject<Place[]>()  BEFORE / AFTER is below
  private placesModel = new BehaviorSubject<Place[]>(
    [
      new Place(
        'p1',
        'Bell Crescent Mansion',
        'In the heart of Cape Town',
        'https://images.adsttc.com/media/images/5012/26dc/28ba/0d33/b200/019e/large_jpg/stringio.jpg?1414003370',
        129.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
      new Place(
        'p2',
        'Newlands Heights',
        'Honeymoon Chateau',
        'https://www.votre-chateau-de-famille.com/wp-content/uploads/2019/05/BEAUMONT-.jpg',
        189.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
      new Place(
        'p3',
        'Chandeleur Boulevard',
        'Spa Resort',
        'https://s7d2.scene7.com/is/image/ritzcarlton/RCPHUBY_00091?$XlargeViewport100pct$',
        99.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      )
    ]
  );

  get places() {
    // NOTE before observable
    // return [...this.placesModel];
    // now observable which gives us a subscribable object
    return this.placesModel.asObservable();
  }

  fetchplaces() {
    // fetch data from backend
    return this.http
      .get('https://ionic-angular-e6244.firebaseio.com/offer-places.json')
      .pipe(tap(resData => {
        console.log(resData);
      }));
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getPlace(id: string) {
    // return subscribable subject, map(gets what take(gives us))
    return this.places.pipe(
      take(1),
      map(places => {
        return { ...places.find(p => p.id === id) };
      })
    );
  }

  // call method on new.offer coomponent when we submit everything
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    // Math.random().toString() used to generate random userId
    const newPlace = new Place(
      Math.random.toString(),
      title, description,
      'https://listing.pamgolding.co.za/images/properties/201902/334012/H/334012_H_77.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    // for behaviorSubject use next() in place of push
    // this.placesModel.push(newPlace);
    // operators allow us to perform operations on the observable
    // take(1) only take the current lates list of places and do not listen to any future places
    // concat takes old value and adds new value and returns new array

    // NOTE return is used here so that we can create a loader inside the new.offer component
    // tap operator allows us to execute some action that will not change the data in this observable chain
    // and it will also not complete the observable. And now we return the full observable here
    return this.http
      .post<{ name: string }>('https://ionic-angular-e6244.firebaseio.com/offer-places.json', {
        ...newPlace,
        id: null
      })
      .pipe(
        // takes exissting observable resultsand returns new ibservable that replaces old observable in upcoming steps of chain
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          // replace Id with Id from backEnd
          newPlace.id = generatedId;
          this.placesModel.next(places.concat(newPlace));
        })
      );
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(places => {
    //     this.placesModel.next(places.concat(newPlace));
    //   })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    // NOTE take(1) is the latest snapshot of the data
    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
      );
      this.placesModel.next(updatedPlaces);
    }));
  }
}
