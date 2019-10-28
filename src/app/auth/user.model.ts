 export class User {
      constructor(
          public id: string,
          public email: string,
          private fireToken: string,
          private tokenExpirationDate: Date
        ) {
      }

      get token() {
          if (!this.tokenExpirationDate || this.tokenExpirationDate <= new Date()) {
            return null;
          }
          return this.fireToken;
      }

      get tokenDuration() {
        // if we don't have a token
        if (!this.token) {
          return 0;
        }
        // return 2000;
        // difference in miliseconds between token time and current time
        return this.tokenExpirationDate.getTime() - new Date().getTime();
      }
 }
