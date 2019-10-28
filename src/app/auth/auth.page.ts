import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseDate } from './auth.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alerCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl.create({keyboardClose: true, message: 'Logging in...'})
    .then(loadingEl => {
      loadingEl.present();
      let authObs: Observable<AuthResponseDate>;
      if (this.isLogin) {
        authObs = this.authService.onLogin(email, password);
      } else {
        authObs = this.authService.signup(email, password);
      }
      authObs.subscribe(resData => {
        console.log(resData);
        this.isLoading = false;
        loadingEl.dismiss();
        this.router.navigateByUrl('/places/tabs/discover');
      },
      errorRes => {
        loadingEl.dismiss();
        const code = errorRes.error.error.message;
        // console.log('>>>', errorRes);
        let message = 'Could not sign you up. please try again.';
        if (code === 'EMAIL_EXISTS') {
          message = 'This email  address exists already!';
        } else if (code === 'EMAIL_NOT_FOUND') {
          message = 'Email address could not be found.';
        } else if (code === 'INVALID_PASSWORD') {
          message = 'This password is not correct.';
        }
        this.showAlert(message);
      });
    }); 
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    // console.log('>>>You Clicked Me!', form);
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
  }

  private showAlert(message: string) {
    this.alerCtrl.create({
      header: 'Authentication failed',
      message: message,
      buttons: ['okay']
    })
    .then(alertEl => {
      alertEl.present()
    });
  }
}
