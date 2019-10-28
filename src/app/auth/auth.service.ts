import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { map, tap } from 'rxjs/operators';

// defines the type/form of data we expect to get back
export interface AuthResponseDate {
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
export class AuthService {
  private fireUser =  new BehaviorSubject<User>(null) ;
  pipe: any;

  get authenticatedUser() {
    // !! two exclamation marks force a convervation to a boolean
    // therefore code below returns a boolean that is true or false depending on whether we have a token or not
    return this.fireUser.asObservable().pipe(map(user => {
      // check if there is a user, if so then return the token
        if (User) {
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

  constructor(private http: HttpClient) { }

  signup(email: string, password: string) {
    return this.http.post<AuthResponseDate>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      // tslint:disable-next-line: object-literal-shorthand
      {email: email, password: password, returnSecureToken: true}
     ).pipe(tap(this.setUserData).bind(this));
  }

  onLogin(email: string, password: string) {
    // this.userIsAuthenticated = true;
    return this.http.post<AuthResponseDate>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
        environment.firebaseAPIKey
      }`,
      {email: email, password: password}
    ).pipe(tap(this.setUserData).bind(this));
  }

  logout() {
    this.fireUser.next(null);
  }

  private setUserData(userData: AuthResponseDate) {
    // convert expiration time in milliseconds
    const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this.fireUser.next(new User(
      userData.localId,
      userData.email,
      userData.idToken,
      expirationTime
      ));
    }
}

