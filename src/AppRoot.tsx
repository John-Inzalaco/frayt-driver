// Node Modules
import React, { Component } from 'react';
import OneSignal, {
  DeviceState,
  NotificationReceivedEvent,
  OpenedEvent,
} from 'react-native-onesignal';
import * as Sentry from '@sentry/react-native';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import Orientation from 'react-native-orientation';
import SplashScreen from 'react-native-splash-screen';
import { createAppContainer } from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import {
  dismissDriverMessage,
  loadNewFeatures,
  dismissNewFeatures,
} from '@actions/appAction';
import { updateRemoteComponent } from '@components/RemoteComponent';
import GenericModal from '@components/ui/GenericModal';
import { getAppRevision, timeout } from '@lib/helpers';
import { Linking } from 'react-native';
import VersionCheck from 'react-native-version-check';

// Constants
import colors from '@constants/Colors';

// Navigation
import AppNavigator from '@src/navigation/AppNavigator';
import NavigationService, { getActiveRouteName } from '@lib/NavigationService';

// App Library
import { loadSavedUserData, saveOneSignalId } from '@actions/userAction';
import {
  loadResources,
  completeAppLoad,
  updateNetwork,
  loadSettings,
  checkPermissions,
} from '@actions/appAction';
import {
  handleOpenedNotification,
  handleReceivedNotification,
} from '@lib/notification';
import RemoteComponent from '@components/RemoteComponent';
import BackgroundTracking from '@components/BackgroundTracking';
import { RootState } from './reducers';
import { ONESIGNAL_APP_ID } from '@constants/Environment';
// Supress errors in the yellow warning box
// LogBox.ignoreAllLogs();

const AppContainer = createAppContainer(AppNavigator);

type AppRootProps = {
  dispatch: any;
  permissions?: any;
  user?: any;
  skipLoadingScreen?: boolean;
  appLoaded?: boolean;
} & ConnectedProps<typeof connector>;

class AppRoot extends Component<AppRootProps> {
  constructor(props: AppRootProps) {
    super(props);

    OneSignal.setAppId(ONESIGNAL_APP_ID);

    OneSignal.setNotificationWillShowInForegroundHandler(this.onReceived);
    OneSignal.setNotificationOpenedHandler(this.onOpened);
    this.getOneSignalId();
    this.unsubscribeNetwork = NetInfo.addEventListener(
      this.updateNetwork.bind(this),
    );
  }

  unsubscribeNetwork: Nullable<NetInfoSubscription> = null;

  permissionsCheck?: NodeJS.Timeout;

  state = {
    currentScreen: null,
  };

  componentDidMount() {
    Orientation.lockToPortrait();

    this.setRevision();

    this.loadApp();

    this.watchPermissions();

    this.checkPopups();
  }

  componentWillUnmount() {
    if (this.permissionsCheck) {
      clearInterval(this.permissionsCheck);
    }
    OneSignal.clearHandlers();
    this.unsubscribeNetwork ? this.unsubscribeNetwork() : null;
  }

  async setRevision() {
    const rev = await getAppRevision();

    Sentry.setTag('revision', rev);
  }

  watchPermissions() {
    const { dispatch, permissions } = this.props;

    const delay = permissions.locationAlways ? 60 * 1000 : 3 * 1000;

    this.permissionsCheck = setTimeout(async () => {
      await dispatch(checkPermissions());

      this.watchPermissions();
    }, delay);
  }

  async checkPopups() {
    const { dispatch } = this.props;
    const update = __DEV__ ? false : await VersionCheck.needUpdate();
    const newFeatures = await dispatch<any>(loadNewFeatures());
    // const newMessage = await this.props.dispatch(loadDriverMessage());
    const newMessage = false;

    if (update?.isNeeded) {
      this.showPopup(
        'new-version',
        'New Update',
        `Version ${update.latestVersion} is now available. You must update to proceed.`,
        async () => {
          Linking.openURL(update.storeUrl);
        },
      );
    }

    if (newFeatures) {
      this.showPopup(
        'new-features',
        'New Features',
        this.props.newFeatures,
        () => dispatch<any>(dismissNewFeatures()),
      );
      await this.dismissedNewFeatures();
    }

    if (newMessage) {
      this.showPopup(
        'new-message',
        this.props.driverHeadline,
        this.props.driverMessage,
        () => dispatch<any>(dismissDriverMessage()),
      );
      await this.dismissedDriverMessage();
    }
  }

  async dismissedNewFeatures() {
    while (this.props.newFeatures) {
      await timeout(200);
    }
  }

  async dismissedDriverMessage() {
    while (this.props.driverMessage) {
      await timeout(200);
    }
  }

  showPopup(
    type: string,
    title?: string,
    message?: string,
    callback?: Function,
  ) {
    if (title) {
      updateRemoteComponent(
        type,
        <GenericModal
          title={title}
          modalVisible={true}
          message={message}
          hideCancel
          actionText='Okay'
          actionCallback={callback ? callback : undefined}
        />,
      );
      return true;
    } else {
      updateRemoteComponent(type, <View />);
      return false;
    }
  }

  updateNetwork(networkState: NetInfoState) {
    const { dispatch } = this.props;

    dispatch(updateNetwork(networkState));
  }

  onReceived(notification: NotificationReceivedEvent) {
    handleReceivedNotification(notification);
  }

  onOpened(openResult: OpenedEvent) {
    handleOpenedNotification(openResult.notification);
  }

  async getOneSignalId() {
    const { dispatch } = this.props;
    const device = await OneSignal.getDeviceState();
    if (device) {
      dispatch(saveOneSignalId(device));
    }
  }

  _handleLoadingError = (error) => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    const { dispatch } = this.props;

    dispatch(completeAppLoad());
  };

  async loadApp() {
    const { dispatch } = this.props;
    await dispatch(loadResources());
    await dispatch(loadSavedUserData());
    await dispatch(loadSettings());
    this._handleFinishLoading();
    SplashScreen.hide();
  }

  render() {
    const { skipLoadingScreen, appLoaded } = this.props;
    const { currentScreen } = this.state;

    if (!appLoaded && !skipLoadingScreen) {
      return null;
    } else {
      return (
        <View style={styles.container}>
          <BackgroundTracking />
          {Platform.OS === 'ios' && <StatusBar barStyle='light-content' />}
          <AppContainer
            ref={(navigatorRef) =>
              NavigationService.setTopLevelNavigator(navigatorRef)
            }
            onNavigationStateChange={(prevState, currentState, _action) => {
              const currentScreen = getActiveRouteName(currentState);
              const prevScreen = getActiveRouteName(prevState);

              if (prevScreen !== currentScreen) {
                this.setState({ currentScreen });
              }
            }}
          />
          <RemoteComponent name='fixed-footer' currentScreen={currentScreen} />
          <RemoteComponent name='new-features' currentScreen={currentScreen} />
          <RemoteComponent name='new-message' currentScreen={currentScreen} />
          <RemoteComponent name='new-version' currentScreen={currentScreen} />
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});

const connector = connect(({ userReducer, appReducer }: RootState) => ({
  appLoaded: appReducer.appLoaded,
  permissions: appReducer.permissions,
  user: userReducer.user,
  driverHeadline: appReducer.driverHeadline,
  driverMessage: appReducer.driverMessage,
  newFeatures: appReducer.newFeatures,
}));

export default connector(AppRoot);
