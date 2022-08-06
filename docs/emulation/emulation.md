# Emulation

This is a breve guide to help you execute Jackpot Music Game in a virtual device.

## Preparations

First of all, you must ensure that the **node_modules** have already been installed, to ensure that open a terminal in the root folder of the project and execute the command `npm install`.

Then, verify you already have all the requirements necessary in the
[Requirements guide](./../requirements/requirements.md).

## Add platforms

Once done with the [preparations](#preparations), keep open a terminal in the root folder of the project to proceed with this section.

The command to add a new platform is:

_Windows_:

``` shell
ionic cordova platform add <platform>
```

_Mac OS / Linux_:

``` shell
sudo ionic cordova platform add <platform>
```

You can replace `<platform>` with either `android` or `ios`.

**Note:** If you encounter a problem, delete the folder `platforms` and try the command again.

## Launch in virtual device

The command to launch Jackpot Music Game in virtual device is:

_Windows_:

``` shell
ionic cordova emulate <platform> --l -c -s --target=<device_id_name> --debug
```

_Mac OS / Linux_:

``` shell
sudo ionic cordova emulate <platform> --l -c -s --target=<device_id_name> --debug
```

## Debug in a virtual device

**Note:** This feature was only tested on Google Chrome browser.

Once the Jackpot Music Game is launched in a virtual device, check your terminal to find the host and the port used in the execution. Generally, `localhost:8100` is used by default.

Now, follow the next steps add the target:

1. Open Google Chrome.
1. Go to `chrome://inspect/#devices`
1. The options `Discover USB devices` and `Discover network targets` must be checked, if they are not, check them.
1. Click on `Port forwarging...`
1. Enter the port in the first input and then enter the host and the port sepatered by a colon in the second input.
1. Press _Done_.
1. Now wait until Jackpot Music Game appers on the screen. You may have to reload the page.
1. When the app is displayed, press `Inspect` and a Dev Tool window will open.
