# Structure of the project

This is documentation of structure of the project, indicating the important information of the project.

## File structure

``` ascii
jackpot-music-pwa
|
|_ docs
|_ e2e
|_ resources
|   |_ android
|   |_ ios
|_ src
|   |_ app
|   |   |_ components
|   |   |_ guards
|   |   |_ managers
|   |   |_ pages
|   |   |_ services
|   |   |_ shared
|   |   |_ app.component.html
|   |   |_ app.component.scss
|   |   |_ app.component.ts
|   |   |_ app.module.ts
|   |   |_ app-routing.module.ts
|   |_ assets
|   |   |_ audio
|   |   |_ icon
|   |   |_ images
|   |   |_ style
|   |_ environment
|   |   |_ environment.prod.ts
|   |   |_ environment.stage.ts
|   |   |_ environment.ts
|   |_ theme
|   |   |_ jackpot-theme
|   |   |_ jackpot-theme.scss
|   |   |_ variables.scss
|   |_ global.scss
|   |_ index.html
|   |_ main.ts
|   |_ manifest.webmanifest
|   |_ polyfills.ts
|   |_ test.ts
|   |_ zone-flags.ts
|_ .gitignore
|_ .stylelintrc
|_ angular.json
|_ browserslist
|_ config.xml
|_ google-services.json
|_ GoogleService-Info.plist
|_ ionic.config.json
|_ karma.conf.js
|_ ngsw-config.json
|_ package.json
|_ Procfile
|_ tsconfig.app.json
|_ tsconfig.json
|_ tsconfig.spec.json
|_ tslint.json
```

## Folder description

1. `docs`: This folder contains relevant information about requirements, tools and standards used in this project.
1. `resources`: It contains the necessary resources on both iOS and Android.
1. `src`: It contains code source and app configuration.
    1. `app`: Here is contained all code source for development.
        1. `components`: Components used throughout the application.
        1. `guards`: Here are hold route regulators
        1. `managers`: This folder contains injectable classes that manage an specific functionality
        1. `pages`: These are all the pages used in the app, it is organized by functionality.
        1. `services`: Injectable classes used mainly for async methods.
        1. `shared`: It contains shared code, constants, modal and modules.
    1. `assets`: This folder contains assets used in the app.
    1. `environments`: Here is the configuration used in each environment.
    1. `theme`: Here is the general style, all the style put in these files will be applied everywhere in the app.
