import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { checkForSetupScreens } from '@actions/appAction';
import { AppState, Platform } from 'react-native';
import { saveLocationUpdates } from '@actions/userAction';
import { RootState } from '@reducers/index';
import * as Sentry from '@sentry/react-native';
import GeoLocation from 'react-native-geolocation-service';
import BackgroundJob from 'react-native-background-actions';
import colors from '@constants/Colors';

interface StateAccuracy {
  EN_ROUTE: {
    android: GeoLocation.AccuracyAndroid;
    ios: GeoLocation.AccuracyIOS;
  };
  ACTIVE: {
    android: GeoLocation.AccuracyAndroid;
    ios: GeoLocation.AccuracyIOS;
  };
  INACTIVE: {
    android: GeoLocation.AccuracyAndroid;
    ios: GeoLocation.AccuracyIOS;
  };
}

interface CanTrackResults {
  result: boolean;
  reason: string;
}

const Accuracy: StateAccuracy = {
  EN_ROUTE: { android: 'balanced', ios: 'bestForNavigation' },
  ACTIVE: { android: 'low', ios: 'hundredMeters' },
  INACTIVE: { android: 'low', ios: 'reduced' },
};

enum MinInterval {
  EN_ROUTE = 30 * 1000,
  ACTIVE = 6 * 60 * 1000,
  INACTIVE = 30 * 60 * 1000,
}

enum DistanceFilter {
  EN_ROUTE = 10,
  ACTIVE = 250,
  INACTIVE = 2000,
}

enum TrackingStatus {
  EN_ROUTE = 'EN_ROUTE',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

type Props = {
  locationPermissions: boolean;
} & ConnectedProps<typeof connector>;

type State = {};

const sleep = (time: any) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), time));

class BackgroundTracking extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.startTracking();
  }

  async componentDidUpdate(prevProps: Props, _prevState: State) {
    const { isUserSignedIn, userInitialized } = this.props;

    if (
      prevProps.isUserSignedIn !== isUserSignedIn ||
      prevProps.userInitialized !== userInitialized
    ) {
      await this.startTracking();
    }
  }

  async backgroundTrackingTask(_taskData: {} | undefined) {
    const trackingStatus = this.getTrackingStatus();
    const options: GeoLocation.GeoOptions = {
      timeout: 10000,
      accuracy: Accuracy[trackingStatus],
      distanceFilter: DistanceFilter[trackingStatus],
      showLocationDialog: true,
      maximumAge: 1000,
    };

    await new Promise(async (_resolve) => {
      while (BackgroundJob.isRunning()) {
        const { result } = await this.canTrack();
        if (result) {
          GeoLocation.getCurrentPosition(
            this.onLocationChange.bind(this),
            this.onLocationChangeError.bind(this),
            options,
          );
        }
        await sleep(MinInterval[this.getTrackingStatus()]);
      }

      Sentry.addBreadcrumb({
        category: 'location',
        message: 'Background tracking has stopped for some reason.',
        level: Sentry.Severity.Info,
      });
    });
  }

  async canTrack(): Promise<CanTrackResults> {
    const { dispatch, locationPermissions, isUserSignedIn, userInitialized } =
      this.props;

    if (!isUserSignedIn || !userInitialized) {
      return { result: false, reason: 'not signed in' };
    }

    if (Platform.OS === 'ios' && !locationPermissions) {
      const locationPermissionResult = await GeoLocation.requestAuthorization(
        'always',
      );

      if (locationPermissionResult !== 'granted') {
        dispatch<any>(checkForSetupScreens());
        return { result: false, reason: 'invalid permissions' };
      }
    }

    if (Platform.OS === 'android' && !locationPermissions) {
      dispatch<any>(checkForSetupScreens());
      return { result: false, reason: 'invalid permissions' };
    }
    return { result: true, reason: 'logged in with location permissions' };
  }

  async startTracking() {
    const options = {
      taskName: 'Background Tracking',
      taskTitle: 'Background Tracking',
      taskDesc: 'Updating location in the background',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: colors.secondary,
      linkingURI: undefined,
    };

    if (!BackgroundJob.isRunning()) {
      BackgroundJob.start(this.backgroundTrackingTask.bind(this), options);
    }
  }

  async saveBackgroundLocation(location: GeoLocation.GeoPosition) {
    const { dispatch } = this.props;
    const { latitude, longitude } = location.coords;

    const updated = await dispatch<any>(
      saveLocationUpdates(latitude, longitude),
    );

    return updated;
  }

  onLocationChange(location: GeoLocation.GeoPosition) {
    Sentry.addBreadcrumb({
      category: 'location',
      message: 'Background location updating.',
      level: Sentry.Severity.Info,
    });
    this.saveBackgroundLocation(location);

    Sentry.addBreadcrumb({
      category: 'location',
      message: 'Background location updated.',
      level: Sentry.Severity.Info,
    });
  }

  onLocationChangeError(error: GeoLocation.GeoError) {
    Sentry.addBreadcrumb({
      category: 'location',
      message: `Failed to update location. Code: ${error.code}, Message: ${error.message}`,
      level: Sentry.Severity.Info,
    });
  }

  getTrackingStatus(): TrackingStatus {
    const { matches, isUserSignedIn, userInitialized } = this.props;

    const isEnRoute = matches.getEnRoute().length > 0;
    const isActive = matches.getLive().length > 0;

    if (isEnRoute) {
      return TrackingStatus.EN_ROUTE;
    } else if (isActive) {
      return TrackingStatus.ACTIVE;
    }

    if (isUserSignedIn && userInitialized) {
      return TrackingStatus.INACTIVE;
    } else {
      return TrackingStatus.EN_ROUTE;
    }
  }

  render = () => {
    return null;
  };
}

const connector = connect(
  ({ appReducer, userReducer, matchReducer }: RootState) => ({
    locationPermissions: appReducer.permissions.location,
    isUserSignedIn: userReducer.isUserSignedIn,
    userInitialized: userReducer.userInitialized,
    user: userReducer.user,
    matches: matchReducer.matches,
  }),
);

export default connector(BackgroundTracking);
