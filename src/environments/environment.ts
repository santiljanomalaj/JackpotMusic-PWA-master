// This file can be replaced during build by using the `fileReplacements` array.
// `ionic build --prod` replaces `environment.ts` with `environment.prod.ts`.
// `ionic build --configuration=staging` replaces `environment.ts` with `environment.stage.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  staging: false,
  development: true,
};

export const ENV = {
  JMG_ENV: 'development',
  API_BASE_URL: 'http://localhost:3000/api',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_loGak7bRjDx4N3pLp7F7e5ZT007zwQ6Hys',
  AWS_S3_BASE_URL: 'https://jmg-music.s3-us-west-2.amazonaws.com/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
