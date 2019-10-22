import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userIsAuthenticated = true;
  private userIdentification = 'abc';

  get authenticatedUser() {
    return this.userIsAuthenticated;
  }

  get userId() {
    // method for this is added in places service
    return this.userIdentification;
  }

  constructor() { }

  onLogin() {
    this.userIsAuthenticated = true;
  }

  logout() {
    this.userIsAuthenticated = false;
  }
}

