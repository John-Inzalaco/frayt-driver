# Frayt Driver App

## Building & Running the App

### Configuration

#### Environment

You'll need to create `.env` to store environment config and secrets. Request the file content from one of your other team members

#### Font Awesome Pro

Font Awesome Pro requires a token to verify the authenitcity of an app. We store this in an environment variable.

To add this environment variable in unix based systems, add the following to your `~/.zshrc`, replacing <THE_TOKEN> with the token provided to you by a senior dev:

```bash
export FRAYT_FONT_AWESOME_TOKEN="<THE_TOKEN>"
```

### Dependencies

#### Install ASDF tools

```
asdf install
```

Run `npm i` in the project directory

### Startup Packager

Run `npm install` from the project directory
Run `npm start -- --reset-cache` from the project directory

### iOS

Navigate to `/ios` in your command line and run `pod install`

Open `/ios/frayt.xcworkspace` in Xcode. **_ Make sure you open frayt.xcworkspace and NOT frayt.xcodeproj _**

Use Xcode to build, install and run the project on your test device or simulator. (this will happen by default if you click the big "Play" button in Xcode.)

If no errors occur, the app should be running successfully in the iOS simulator

### Android

#### M1 Mac Troubleshooting
If `npm start` gives an out of memory error, set your terminal to run in x86 mode and reinstall NodeJS and node_modules.

```
arch -x86_64 /bin/zsh
asdf uninstall nodejs 12.22.1
rm -rf node_modules
asdf install
npm install
```

If it says it can't see your ANDROID_SDK_ROOT environment variable, create the file `frayt-driver/android/local.properties` and add the following
```
sdk.dir = /Users/{my mac's username}/Library/Android/sdk
```

#### Startup Emulator

Follow setup instructions for Android environment: https://reactnative.dev/docs/environment-setup

To list available emulators run `emulator -list-avds`. If none are shown, one will need installed from Android Studio's SDK manager
**_ Make sure you select Q API Level 29 from the following screen after choosing a device in Android Studios AVD Manager _**

##### Emulator Startup Options:

1. Start up an emulator from the command line `emulator -avd Emulator_Name`
2. Start up an emulator from Android Studio by selecting it from the device dropdown next to the "Play" button.

#### Running on a Physical Android Device

1. Ensure `adb` is in your path
2. Plug in the device via USB and enable USB debugging
3. Run `adb devices` to see the name of your device (ie, FA69E0307292)
4. Run `adb -s <name-of-device> reverse tcp:4000 tcp:4000` so it can access localhost:4000
5. Change `LOCAL_BASE_URL_ANDROID` in `.env` to `LOCAL_BASE_URL_ANDROID='http://localhost:4000/api/internal/v2.1/'`
6. Run `npm start -- --reset-cache` for it to use the new env variable
7. Run `npm run android` or click play in Android Studio

#### Build App

Before building, first run `npx jetify` at the project root.

##### Build App Options

1. `npm run android` from frayt-driver root folder
2. "Play" button in Android Studio

If no errors occur, the app should now be installed on your Android emulator.

## Deploying the App OTA

### Dependencies

Install the App Center CLI globally by running:
`npm install -g appcenter-cli`

Then login into App Center CLI by running:
`appcenter login`

### Deployment

Navigate to project root in your command line and run the following:

`appcenter codepush release-react -a elijah-frayt.com/$app_name -d $target -t $binary_version`

`$app_name` should be `Frayt-Driver-IOS` for iOS and `Frayt-Driver-Android` for Android.

`$target` can be either `Staging` or `Production`

`$binary_version` can be left off unless you want to set it to a different version than what the current build is. Example `-t 1.3.7`

### Testing

To test an OTA update before sending it out, simply run the app in the staging environment. You will want to ensure that when you build the staging bundle that it does not include the changes you want to test.

#### Build iOS Staging

Set the scheme in the upper left corner to `frayt - staging`
Set the target to the right of the scheme to any simulator or connected device

#### Build Android Staging

After starting up an emulator, navigate to project root in your command line and run the following:

- `npx jetify && cd android && ./gradlew installReleaseStaging`

#### Deploying Staging OTA

Once you the app is built use git to re-implement the changes you want to test and deploy the update to app center using the `Staging` target.

### Deploying Production OTA

After testing a staging OTA update, you can login to App Center in your browser and navigate to the current app.
Once in the app, navigate to `Distribute` > `Codepush` and select the staging release that you want to deploy to production. (Note: if you don't see it, ensure that you are viewing staging releases)
Once viewing the release, click the `Promote` button in the top right and select `Production`

## Deploying the App to the Store

### iOS App Store

#### Generating the Bundle

Navigate to project root in your command line and run the following:

- `npm i`
- `cd ios && pod install`

#### Compiling the Archive

Open the `.xcworkspace` file located in `/ios` in Xcode.
Go to the `Frayt` project and under `General` increase the build number for all targets by one. If necessary update the version number as well. The build number as well as the version number must match across all targets.
Set the scheme in the upper left corner to `frayt`
Set the target to the right of the scheme to `Generic iOS Device`
In the menu, go to `Product` > `Archive`

#### Uploading the Archive

In the menu, go to `Window` > `Organizer` (&#8997;+&#8679;+&#8984;+O)
Select the archive you just compiled, and in the right side bar click `Distrubute App`
There will be several options you will have to select from here.

- Method of distribution: `App Store Connect`
- Destination: `Upload`
- App Store Connect Distribution options:
  - Include bitcode for iOS content: `true`
    Upload your app's symbols to receive symbolicated reports from Apple: `true`
- Re-sign: `Automatically manage signing`

Once through those steps, press the `Upload` button to submit to App Store Connect

### Android Google Play

In the menu, go to `Build` > `Generate Signed APK / Bundle`
Select `Android App Bundle`, and hit next. (You can also generate an APK to install it on your physical device for testing)

- Key Store Path: You will need our `frayt.release.keystore` file, and select it.
- Key Alias: `driver`
- You will need the passwords to the keystore and the driver key.
- Feel free to toggle "Remember passwords" to on
- You can toggle `Export encrypted key [...]` to off, as that's only necessary for the first time you upload a build to the Play Store.

Hit next again

- Destination Folder: Choose any location for where the `*.abb` file will be built
- Build varient: `release`

Hit finish and find your new `*.abb` file.

- Go to the [Play Store Console](https://developer.android.com/distribute/console) and sign in.
- Choose the Frayt Driver app.
- Click `App Releases` under `Release Management` on the sidebar.
- Click `Manage` on the Production Track.
- Click `Create Release`
- Add your `*.abb` file under `Android App Bundles and APKs to add`
- Add your release notes at the bottom

Hit Review, then Rollout To Production if everything looks fine.

## Branch & Version Management

As a general rule, follow this workflow for creating and deploying branches and tags

- New branch from `develop`
- Merge new branch back into `develop`
- When ready for the next release to be pushed to Google Play and the App Store, merge `develop` into `master`
- Create a tag on master matching the following format `git tag v1.1.0`, where `1.1.0` is the current version
- Push tag to remote `git push origin --tags`
- Android and iOS version should match
- On the `master` branch be sure to have version/build committed to Git
- Merge changes made on `master` back into `develop`
