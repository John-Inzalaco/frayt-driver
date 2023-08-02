import createReducer from '@lib/reducers';
import { Platform } from 'react-native';

import { NetInfoState } from '@react-native-community/netinfo';

export type PermissionTypes = {
  camera?: boolean;
  hasAskedCamera?: boolean;
  location?: boolean;
  hasAskedLocation?: boolean;
  notifications?: boolean;
  hasAskedNotifications?: boolean;
};

export type AppSettings = {
  appIsSetup?: boolean;
};
export type AppState = {
  permissions: PermissionTypes;
  newFeaturesId: Nullable<string>;
  driverMessageId: Nullable<string>;
  driverHeadline: Nullable<string>;
  driverMessage: Nullable<string>;
  loadingResources: boolean;
  resourcesLoaded: boolean;
  appLoaded: boolean;
  offlineMode: boolean;
  loadingSettings: boolean;
  sendingSupport: boolean;
  loadingDriverMessage: boolean;
  loadingNewFeatures: boolean;
  settings: AppSettings;
  network: NetInfoState | {};
  newFeatures: Nullable<string>;
  isDefaultDevice: boolean;
};

const initialState: AppState = {
  isDefaultDevice: false,
  loadingResources: false,
  resourcesLoaded: false,
  appLoaded: false,
  offlineMode: false,
  loadingSettings: false,
  sendingSupport: false,
  settings: {},
  network: {},
  permissions: {},
  loadingDriverMessage: false,
  driverHeadline: null,
  driverMessage: null,
  driverMessageId: null,
  loadingNewFeatures: false,
  newFeatures: null,
  newFeaturesId: null,
};

let reductions = {
  LOADING_RESOURCES: () => ({
    loadingResources: true,
  }),
  LOADING_RESOURCES_SUCCESS: () => ({
    loadingResources: false,
    resourcesLoaded: true,
  }),
  LOADING_RESOURCES_ERROR: () => ({
    loadingResources: false,
  }),
  LOADING_APP_SUCCESS: () => ({
    appLoaded: true,
  }),
  UPDATE_NETWORK: ({ networkState }) => ({
    offlineMode: !networkState.isConnected,
    network: { ...networkState },
  }),
  UPDATE_PERMISSIONS_STATUS: (
    { location, locationAlways, notification, camera },
    state,
  ) => {
    let permissions = {};

    if (camera) {
      permissions.camera = camera === 'granted';
      permissions.hasAskedCamera = camera !== 'denied';
    }

    if (location) {
      permissions.location = location === 'granted';
      permissions.hasAskedLocation = location !== 'denied';
    }

    if (locationAlways) {
      permissions.locationAlways =
        locationAlways === 'granted' || locationAlways === 'unavailable';
    }

    if (Platform.OS === 'android') {
      permissions.notifications = notification === 'granted';
      permissions.hasAskedNotifications = true;
    } else if (notification) {
      permissions.notifications = notification === 'granted';
      permissions.hasAskedNotifications = notification !== 'denied';
    }

    return {
      permissions: {
        ...state.permissions,
        ...permissions,
      },
    };
  },
  UPDATE_PERMISSIONS_STATUS_ERROR: () => {
    return {
      permissions: {},
    };
  },
  LOADING_SETTINGS: (action, state) => ({
    loadingSettings: true,
  }),
  LOADING_SETTINGS_SUCCESS: ({ settings }, state) => ({
    loadingSettings: false,
    settings: settings || {},
  }),
  LOADING_SETTINGS_ERROR: (action, state) => ({
    loadingSettings: false,
    settings: {},
  }),
  UPDATE_SETTINGS: ({ settings }, state) => ({
    settings: settings || {},
  }),
  SENDING_SUPPORT: (action, state) => ({
    sendingSupport: true,
  }),
  SENDING_SUPPORT_SUCCESS: ({ settings }, state) => ({
    sendingSupport: false,
  }),
  SENDING_SUPPORT_ERROR: (action, state) => ({
    sendingSupport: false,
  }),
  LOADING_DRIVER_MESSAGE: (action, state) => ({
    loadingDriverMessage: true,
  }),
  LOADING_DRIVER_MESSAGE_SUCCESS: ({ headline, message, id }, state) => ({
    loadingDriverMessage: false,
    driverHeadline: headline,
    driverMessage: message,
    driverMessageId: id,
  }),
  LOADING_DRIVER_MESSAGE_ERROR: (action, state) => ({
    loadingDriverMessage: false,
    driverHeadline: null,
    driverMessage: null,
    driverMessageId: null,
  }),
  DISMISS_DRIVER_MESSAGE: (action, state) => ({
    driverHeadline: null,
    driverMessage: null,
    driverMessageId: null,
  }),
  LOADING_NEW_FEATURES: (action, state) => ({
    loadingNewFeatures: true,
  }),
  LOADING_NEW_FEATURES_SUCCESS: ({ message, id }, state) => ({
    loadingNewFeatures: false,
    newFeatures: message,
    newFeaturesId: id,
  }),
  LOADING_NEW_FEATURES_ERROR: (action, state) => ({
    loadingNewFeatures: false,
    newFeatures: null,
    newFeaturesId: null,
  }),
  DISMISS_NEW_FEATURES: (action, state) => ({
    newFeatures: null,
    newFeaturesId: null,
  }),
};

const appReducer = createReducer<AppState>(reductions, initialState);

export default appReducer;
