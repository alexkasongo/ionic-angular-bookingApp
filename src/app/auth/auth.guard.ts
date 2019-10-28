import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  // we can inject services into services by adding a constructor
  constructor(private authService: AuthService, private router: Router) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {

      return this.authService.authenticatedUser.pipe(
        take(1),
        switchMap(isAuthenTicated => {
          // if not authenticated then try autologing from services
          if (!isAuthenTicated) {
            return this.authService.autoLogin();
          }
          // returns new observable
          return of(isAuthenTicated);
        }),
        tap( isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
      }));
  }
}
