import { authorizedRequest } from '@lib/Request';
import displayError from '@lib/displayError';
import appTypes from '@actions/types/appTypes';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import Permissions, {
  checkNotifications,
  PERMISSIONS,
  requestNotifications,
} from 'react-native-permissions';
import ActiveTask from '@lib/ActiveTask';
import { loadSavedMatches, getAvailableMatches } from '@actions/matchAction';
import NavigationService from '@lib/NavigationService';
import AsyncStorage from '@react-native-community/async-storage';
import { Platform } from 'react-native';
import { AppThunkAction, ThunkActionBoolean } from '@lib/store';
import { NetInfoState } from '@react-native-community/netinfo';
import { AppSettings } from '@reducers/appReducer';
import { Driver, needsUpdatedDocuments, documentsAwaitingApproval } from '../models/User';

let availableMatchesTask = null;

const isAndroid = Platform.OS === 'android';

const PermissionOSType = {
  notifications: 'notifications',
  location: isAndroid
    ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    : PERMISSIONS.IOS.LOCATION_ALWAYS,
  camera: isAndroid ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
};

export enum PermissionType {
  location = 'location',
  notifications = 'notifications',
  camera = 'camera',
}

export function loadResources(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.LOADING_RESOURCES,
    });

    try {
      await Promise.all([
        Asset.loadAsync([
          require('@src/assets/images/frayt-badge-primary.png'),
          require('@src/assets/images/frayt-badge.png'),
        ]),
        Font.loadAsync({
          'Roboto': require('../../node_modules/native-base/Fonts/Roboto.ttf'),
          'Roboto_medium': require('../../node_modules/native-base/Fonts/Roboto_medium.ttf'),
          // This is the font that we are using for our tab bar
          'Material Icons': require('../../node_modules/native-base/Fonts/MaterialIcons.ttf'),
          // 'Material Icons': require('@expo/vector-icons/fonts/MaterialIcons.ttf'),
          // We include SpaceMono because we use it in HomeScreen.js. Feel free
          // to remove this if you are not using it in your app
          'space-mono': require('@src/assets/fonts/SpaceMono-Regular.ttf'),
        }),
      ]);

      await dispatch({
        type: appTypes.LOADING_RESOURCES_SUCCESS,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: appTypes.LOADING_RESOURCES_ERROR,
      });

      return false;
    }
  };
}

export function completeAppLoad(): AppThunkAction {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.LOADING_APP_SUCCESS,
    });

    await dispatch(loadSavedMatches());

    availableMatchesTask = new ActiveTask(
      () => dispatch(getAvailableMatches()),
      1000 * 60 * 10,
    );
    availableMatchesTask.start();
  };
}

export function updateNetwork(networkState: NetInfoState): AppThunkAction {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.UPDATE_NETWORK,
      networkState,
    });
  };
}

export function checkPermissions(): ThunkActionBoolean {
  return async (dispatch) => {
    try {
      let notification = {};
      let location = {};
      let locationAlways = {};
      let camera = {};

      if (Platform.OS === 'android') {
        location = await Permissions.check(
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        );
        locationAlways = await Permissions.check(
          PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
        );
        notification = (await checkNotifications()).status;
        camera = await Permissions.check(PERMISSIONS.ANDROID.CAMERA);
      } else if (Platform.OS === 'ios') {
        notification = (await checkNotifications()).status;
        locationAlways = await Permissions.check(
          PERMISSIONS.IOS.LOCATION_ALWAYS,
        );
        location = await Permissions.check(
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        );
        camera = await Permissions.check(PERMISSIONS.IOS.CAMERA);
      }

      dispatch({
        type: appTypes.UPDATE_PERMISSIONS_STATUS,
        notification,
        location,
        locationAlways,
        camera,
      });
      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: appTypes.UPDATE_PERMISSIONS_STATUS_ERROR,
      });
      return false;
    }
  };
}

export function requestPermission(
  permissionType: PermissionType,
  args: any = null,
): AppThunkAction {
  return async (dispatch, getState) => {
    let status = 'denied';
    switch (permissionType) {
      case 'notifications':
        const notification = await requestNotifications([
          'alert',
          'sound',
          'carPlay',
        ]);
        status = notification.status;
        break;
      default:
        const p = PermissionOSType[permissionType];

        await Permissions.request(p, args);
        break;
    }

    dispatch(checkPermissions());
  };
}

export function getNextSetupScreen(
  defaultToMain = true,
): AppThunkAction<Nullable<string>> {
  return (dispatch, getState) => {
    const { user } = getState().userReducer;

    let setupScreen = null;

    const currentTime = new Date().getTime();
    if (!user.is_password_set) {
      setupScreen = 'WelcomeRegistration';
    } else if (user.state !== 'registered') {
      if (user.pending_agreements.length > 0) {
        setupScreen = 'UpdateAgreements';
      } else if (user.can_load !== false && user.can_load !== true) {
        setupScreen = 'UpdateLoadUnload';
      } else if (
        !user.has_cargo_capacity &&
        (!user.vehicle?.capacity_dismissed_at ||
          currentTime - user.vehicle.capacity_dismissed_at >
          10 * 24 * 60 * 60 * 1000)
      ) {
        // if more than 10 days since dismissal
        setupScreen = 'UpdateCargoCapacity';
      } else if (!user.has_wallet) {
        setupScreen = 'SetupWallet';
      } else {
        setupScreen = 'CompleteRegistration';
      }

      if (setupScreen) {
        return setupScreen;
      }
    }

    if (user.pending_agreements.length > 0) {
      return 'UpdateAgreements';
    }

    if (!user.has_wallet) {
      return 'SetupWallet';
    }

    if (defaultToMain) {
      return 'Main';
    }

    return null;
  };
}

function nextApprovalScreen(user: Driver) {
  if (!user) {
    return 'Info';
  } else if (!user.first_name) {
    return 'Personal';
  } else if (!user.license_number) {
    return 'VerifyIdentity';
  } else if (!user.vehicle) {
    return 'Vehicle';
  } else if (user.vehicle?.images?.length === 0) {
    return 'VehiclePhotos';
  } else if (user.vehicle?.vehicle_class === 4) {
    return 'Dat';
  } else {
    return 'BackgroundCheck';
  }
}

export function checkForSetupScreens(
  email: Nullable<string> = null,
  currentPassword: Nullable<string> = null,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    await dispatch(checkPermissions());

    const { appLoaded, permissions, settings } = getState().appReducer;
    const { userInitialized, user } = getState().userReducer;
    const { location, notifications } = permissions;

    if (appLoaded) {
      if (userInitialized) {
        if (user.state === 'applying') {
          const screen = nextApprovalScreen(user);

          const state = NavigationService.getState();

          const isApplyStack = state?.nav?.routes?.some(
            (r: any, i: number) => r.key === 'Apply' && i === state.nav.index,
          );

          if (!isApplyStack) {
            NavigationService.navigate(screen);
          }
          return true;
        } else if (
          !['approved', 'registered'].includes(user.state) ||
          needsUpdatedDocuments(user) || documentsAwaitingApproval(user)
        ) {
          NavigationService.navigate('Approval');
          return true;
        } else {
          const setupScreen = dispatch(getNextSetupScreen(false));

          if (setupScreen) {
            NavigationService.reset('SetupAccount', setupScreen);
            return true;
          }

          if (user.password_reset_code) {
            NavigationService.navigate('ResetPassword', {
              email,
              currentPassword,
            });
            return true;
          }
        }
      }

      if (!location || !notifications || !settings.appIsSetup) {
        NavigationService.reset('SetupAccount', 'Setup');
        return true;
      }
    }

    return false;
  };
}

export function tryToNavigateToMain(
  email: Nullable<string> = null,
  currentPassword: Nullable<string> = null,
): AppThunkAction {
  return async (dispatch, getState) => {
    const needsSetup = await dispatch(
      checkForSetupScreens(email, currentPassword),
    );

    if (!needsSetup) {
      NavigationService.navigate('Main');
    }
  };
}

export function loadSettings(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.LOADING_SETTINGS,
    });

    try {
      const rawSettings = await AsyncStorage.getItem('settings');
      const settings = rawSettings ? JSON.parse(rawSettings) : null;

      await dispatch({
        type: appTypes.LOADING_SETTINGS_SUCCESS,
        settings,
      });

      return true;
    } catch (e) {
      await dispatch({
        type: appTypes.LOADING_SETTINGS_ERROR,
      });
      return false;
    }
  };
}

export function updateSetting(
  key: keyof AppSettings,
  value: any,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    const { settings } = getState().appReducer;

    try {
      settings[key] = value;

      await AsyncStorage.setItem('settings', JSON.stringify(settings));

      await dispatch({
        type: appTypes.UPDATE_SETTINGS,
        settings,
      });

      return true;
    } catch (e) {
      displayError(e);
      return false;
    }
  };
}

export function sendSupport(
  comments: string,
  email: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.SENDING_SUPPORT,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.post('wf/create_driver_support_ticket', {
        comments: comments,
        email: email,
      });

      dispatch({
        type: appTypes.SENDING_SUPPORT_SUCCESS,
      });
      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: appTypes.SENDING_SUPPORT_ERROR,
      });

      return false;
    }
  };
}

export function loadDriverMessage(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.LOADING_DRIVER_MESSAGE,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.post('wf/driver_alerts');

      const { headline, message, id } = request.data.response;

      const lastDriverMessageId = await AsyncStorage.getItem(
        'lastDriverMessageId',
      );

      if (
        !lastDriverMessageId ||
        parseInt(lastDriverMessageId) !== parseInt(id)
      ) {
        await dispatch({
          type: appTypes.LOADING_DRIVER_MESSAGE_SUCCESS,
          headline,
          message,
          id,
        });
        return true;
      }
      await dispatch({
        type: appTypes.LOADING_DRIVER_MESSAGE_SUCCESS,
        headline: null,
        message: null,
        id: null,
      });
      return false;
    } catch (e) {
      await dispatch({
        type: appTypes.LOADING_DRIVER_MESSAGE_ERROR,
      });
      return false;
    }
  };
}

export function dismissDriverMessage(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    const state = await getState();
    const { driverMessageId } = state.appReducer;
    await AsyncStorage.setItem('lastDriverMessageId', driverMessageId);
    await dispatch({
      type: appTypes.DISMISS_DRIVER_MESSAGE,
    });

    return true;
  };
}

export function loadNewFeatures(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: appTypes.LOADING_NEW_FEATURES,
    });

    try {
      const http = await authorizedRequest();
      // const request = await http.post('wf/new_features');

      // const { message, id } = request.data.response;
      const message = 'test feature';
      const id = '1';

      const maybeLastNewFeaturesId = await AsyncStorage.getItem(
        'lastNewFeaturesId',
      );
      if (!maybeLastNewFeaturesId) {
        await AsyncStorage.setItem('lastNewFeaturesId', id);
        await dispatch({
          type: appTypes.LOADING_NEW_FEATURES_SUCCESS,
          message: null,
          id: null,
        });
        return false;
      }
      const lastNewFeaturesId = maybeLastNewFeaturesId
        ? JSON.parse(maybeLastNewFeaturesId)
        : 0;

      if (parseInt(lastNewFeaturesId) !== parseInt(id)) {
        await dispatch({
          type: appTypes.LOADING_NEW_FEATURES_SUCCESS,
          message,
          id,
        });
        return true;
      }

      await dispatch({
        type: appTypes.LOADING_NEW_FEATURES_SUCCESS,
        message: null,
        id: null,
      });
      return false;
    } catch (e) {
      await dispatch({
        type: appTypes.LOADING_NEW_FEATURES_ERROR,
      });
      return false;
    }
  };
}

export function dismissNewFeatures(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    const state = await getState();
    const { newFeaturesId } = state.appReducer;
    await AsyncStorage.setItem('lastNewFeaturesId', newFeaturesId);
    await dispatch({
      type: appTypes.DISMISS_NEW_FEATURES,
    });

    return true;
  };
}
