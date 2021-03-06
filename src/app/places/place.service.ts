import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
// observable which allows for subscriptions: always gives the latest previously emmited values
import { BehaviorSubject, from, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlaceService {
  // NOTE  <> descripes generic type and which type of data will eventually endup there
  // private placesModel: Place[] = new BehaviorSubject<Place[]>()  BEFORE / AFTER is below
  private placesModel = new BehaviorSubject<Place[]>([]);

  get places() {
    // NOTE before observable
    // return [...this.placesModel];
    // now observable which gives us a subscribable object
    return this.placesModel.asObservable();
  }

  fetchPlaces() {
    // fetch data from backend
    return this.http
      .get< {[key: string]: PlaceData} >('https://ionic-angular-e6244.firebaseio.com/offer-places.json')
      // map() takes the response of the observable and allows us to return new data that will be wrapped in an observable
      // switchMap returns a new observable, map returns non observable data
      .pipe(map(resData => {
        // trasform into array
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId,
              resData[key].location
            ));
          }
        }
        return places;
        // return [];
      }),
      tap(places => {
        this.placesModel.next(places);
      })
    );
  }

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getPlace(id: string) {
    // This is where we get a single place.
    // return subscribable subject, map(gets what take(gives us))
    return this.http
      .get<PlaceData>(
        `https://ionic-angular-e6244.firebaseio.com/offer-places/${id}.json`
      ).pipe(
        map(placeData => {
          return new Place(
            id,
            placeData.title,
            placeData.description,
            placeData.imageUrl,
            placeData.price,
            new Date(placeData.availableFrom),
            new Date(placeData.availableTo),
            placeData.userId,
            placeData.location
          );
        })
      );
  }

  uploadImage(image: File) {
    // send http request here to our rest api
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.http.post<{imageUrl: string, imagePath: string }>(
      'https://us-central1-ionic-angular-e6244.cloudfunctions.net/storeImage',
      uploadData
    );
  }

  // call method on new.offer coomponent when we submit everything
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let newPlace: Place;
    // Math.random().toString() used to generate random userId
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No user found!');
      }
      newPlace = new Place(
        Math.random.toString(),
        title, description,
        imageUrl,
        price,
        dateFrom,
        dateTo,
        userId,
        location
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
        });
    }),
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
    let updatedPlaces: Place[];
    // NOTE take(1) is the latest snapshot of the data
    return this.places.pipe(
      take(1), switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          // of(wrapps any value and returns an observable)
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(`https://ionic-angular-e6244.firebaseio.com/offer-places/${placeId}.json`,
        // copy the whole place and overide the iD
        { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(resData => {
        console.log('>>>Update response Data', resData);
        this.placesModel.next(updatedPlaces);
      })
    );
  }
}
