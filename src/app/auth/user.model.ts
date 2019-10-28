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
 }