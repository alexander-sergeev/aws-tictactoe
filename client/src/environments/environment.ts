// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  auth: {
    oauthDiscoveryUrl: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ngrUIuuiv/.well-known/openid-configuration',
    issuer: 'https://tictactoe-app-2021.auth.eu-north-1.amazoncognito.com',
    clientId: '43uab7jk9kn3riq5s5curark2i',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
