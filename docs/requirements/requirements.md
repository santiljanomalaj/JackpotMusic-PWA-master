# Requirements

The following are the requirements for the development of Jackpot Music Game

## Node.js and NPM

These are needed for the runtime environment and the management of the packages respectively.

**Supported versions are:**

| Node.js      | NPM         |
| :---------:  | :---------: |
| `^10.16.1`   | `^6.11.3`   |

**Installation:**

Download and install the executable in [Node.js](https://nodejs.org/en/) page.

## Angular

This package is the Command Line Interface (CLI) for Angular Framework
[Angular](https://angular.io/docs)

**Supported versions are:**

`^8.1.3`

**Installation:**

Execute in your machine terminal

*Windows:*

``` shell
npm install --global @angular/cli
```

*Mac OS / Linux:*

``` shell
sudo npm install --global @angular/cli
```

## Ionic

This package is the Command Line Interface (CLI) for the hybrid SDK [Ionic](https://ionicframework.com/docs)

**Supported versions are:**

`^5.2.8`

**Installation:**

Execute in your machine terminal

*Windows:*

``` shell
npm install --global ionic
```

*Mac OS / Linux:*

``` shell
sudo npm install --global ionic
```

## Cordova

This package is the Command Line Interface (CLI) for
[Apache Cordova](https://cordova.apache.org/docs/en/latest/)

**Supported versions are:**

`^9.0.0 (cordova-lib@9.0.1)`

**Installation:**

Execute in your machine terminal

*Windows:*

``` shell
npm install --global ionic
```

*Mac OS / Linux:*

``` shell
sudo npm install --global ionic
```

## Android Studio

Mainly to will be used for testing the app on an emulated android device.

**Installation:**

Download and install [Android Studio](https://developer.android.com/studio)

**SDK installation:**

1. Once installed *Android Studio*, start the IDE.
1. Click on *Configure* and then select *SDK Manager*.
1. A window will open, when it does, select the SDK Platforms that you want to use.
1. Press *Apply* and a new window will start download and install the selected SDK Platforms.
1. When the installation is completed, press *Finish* and then *OK*.

**Virtual Device installation:**

1. Once installed *Android Studio*, start the IDE.
1. Click on *Configure* and then select *AVD Manager*.
1. A window will open, when it does, press *Create Virtual Device...*.
1. Follow the wizard.
1. At the end, press *Finish*.
1. The AVD name is target that we will need later.

**Adding CLI (Windows only):**

1. Go to *Environment variables* on your computer.
1. Open *PATH* in *System variables*.
1. Add the following paths:
    * `C:\Users\<username_of_pc>\AppData\Local\Android\Sdk\tools`
    * `C:\Users\<username_of_pc>\AppData\Local\Android\Sdk\tools\bin`
1. Then press *OK*.
