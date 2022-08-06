# config.xml

It is a global configuration file that controls many aspects of a cordova application's behavior.

You can find more information on [Cordova - Config.xml](https://cordova.apache.org/docs/en/latest/config_ref/)

## Important information

This is information must not be changed because either would change an important build 
configuration or it is referenced somewhere else in the project.

1. `widget` tag's id must be set `com.jackpotmusic.game` due that is how the package name set in
   [Firebase Console Manager](https://console.firebase.google.com/project/jackpotmusicgame-50e39/settings/general/android:com.jackpotmusic.game)
   in the 'Your apps' section.
1. Inside `widget` tag there is a tag call name.
   It must be exactly like this `<name>Jackpot Music Game</name>`
1. Inside `widget` tag there are two tags call `platform`. These tags must include a `resource-file`
   at the end of each tag.
    1. `<platform name="android">` tag must include
       `<resource-file src="google-services.json" target="app/google-services.json" />`
    1. `<platform name="ios">` tag must include
       `<resource-file src="GoogleService-Info.plist" target="GoogleService-Info.plist" />` 
