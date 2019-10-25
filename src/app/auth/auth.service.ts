import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userIsAuthenticated = true;
  private userIdentification = 'xyz';

  get authenticatedUser() {
    return this.userIsAuthenticated;
  }

  get userId() {
    // method for this is added in places service
    return this.userIdentification;
  }

  constructor(private http: HttpClient) { }

  signup(email: string, password: string) {
    return this.http.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      // tslint:disable-next-line: object-literal-shorthand
      {email: email, password: password, returnSecureToken: true}
     );
  }

  onLogin() {
    this.userIsAuthenticated = true;
  }

  logout() {
    this.userIsAuthenticated = false;
  }
}

