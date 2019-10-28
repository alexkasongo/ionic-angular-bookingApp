import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { BehaviorSubject, from } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

// defines the type/form of data we expect to get back
export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private fireUser =  new BehaviorSubject<User>(null) ;
  private activeLogoutTime: any;
  pipe: any;

  get authenticatedUser() {
    // !! two exclamation marks force a convervation to a boolean
    // therefore code below returns a boolean that is true or false depending on whether we have a token or not
    return this.fireUser.asObservable().pipe(map(user => {
      // check if there is a user, if so then return the token
        if (user) {
          return !!user.token;
        } else {
          // if no user then return false
          return false;
        }
      })
    );
  }

  get userId() {
    // method for this is added in places service
      return this.fireUser.asObservable().pipe(map(user => {
        if (User) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  // get token() {
  //   return this.fireUser.asObservable().pipe(map(user => {
  //       if (User) {
  //         return user.id;
  //       } else {
  //         return null;
  //       }
  //     })
  //   );
  // }

  constructor(private http: HttpClient) { }

  // retrieve data whenever the app restarts
  autoLogin() {
    // could turn into promise but we'll turn to observable
    return from(Plugins.Storage.get({key: 'authData'})).pipe(
      map(storedData => {
        if (!storedData || !storedData.value ) {
          return null;
        }
        const parsedData = JSON.parse(storedData.value) as {
          token: string;
          tokenExpirationData: string;
          userId: string;
          email: string;
        };
        const expirationTime = new Date(parsedData.tokenExpirationData);
        if (expirationTime <= new Date()) {
          return null;
        }
        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationTime
        );
        return user;
      }),
      tap(user => {
        if (user) {
          this.fireUser.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map(user => {
        return !!user;
      })
    );
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string ) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    if (this.activeLogoutTime) {
      clearTimeout(this.activeLogoutTime);
    } 
    this.fireUser.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTime) {
      clearTimeout(this.activeLogoutTime);
    }
    this.activeLogoutTime = setTimeout(() => {
       this.logout();
    }, duration);
  }

  private setUserData(userData: AuthResponseData) {
    // convert expiration time in milliseconds
    const expirationTime = new Date(
      new Date().getTime() + +userData.expiresIn * 1000
    );
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
    );
    this.fireUser.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      expirationTime.toISOString(),
      userData.email
    );
  }

  private storeAuthData(
    userId: string,
    token: string,
    tokenExpirationDate: string,
    email: string
  ) {
    const data = JSON.stringify({
      userId,
      token,
      tokenExpirationDate,
      email
    });
    Plugins.Storage.set({key: 'authData', value: data});
  }

  ngOnDestroy() {
    if (this.activeLogoutTime) {
      clearTimeout(this.activeLogoutTime);
    }
  }
}
