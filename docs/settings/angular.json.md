# angular.json

Here lays the Angular Workspace Configuration, this file must be at the root level of the project.

You can find more information on
[Angular Workspace Configuration](https://angular.io/guide/workspace-config).

## Important information

This is information must not be changed because either would change an important build
configuration or it is referenced somewhere else in the project.

1. `project name`: The current project name is **app**.
1. `styles`: This is an array with paths of style files, `src/theme/jackpot-theme.scss` must be included
    after the `src/theme/variables.scss` and `src/global.scss` in order to modified the default style theme.
1. `configurations`: There are two created, `production` and `staging`.
    1. Inside both `production` and `staging` there must be a properties:
        1. `fileReplacements` that replace the environment file
           `src/environments/environment.ts`
            to the respective of each environment.
        1. `serviceWorker` must be set in `true`, in order to create the service worker.
        1. `ngswConfigPath` must be set in `ngsw-config.json`, that is the configuration file of the service worker
