import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { Text } from 'native-base';

import colors, { colorObjs } from '@constants/Colors';
import Layout from '@constants/Layout';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import {
  withNavigationFocus,
  NavigationScreenProp,
  NavigationFocusInjectedProps,
} from 'react-navigation';
import NavigationService from '@lib/NavigationService';
import ActionButton from '@components/ui/ActionButton';
import { openSettings } from '@lib/settings';
import { RootState } from '@reducers/index';
const OFF_TRANS = 0;
const ON_TRANS = 1;
const ANIMATION_DURATION = 200;

type Props = {
  navigation: NavigationScreenProp<any>;
} & Partial<DefaultProps> &
  ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

type DefaultProps = {
  value: boolean;
};

type State = {
  showInfo: boolean;
  infoHeight: number;
  status: Nullable<Status>;
  statusTransition: Animated.Value;
  infoTransition: Animated.Value;
};

type StatusDetail = {
  description: string;
  icon: Element;
  info?: string;
  action?: () => void;
  actionLabel?: string;
};

type Status =
  | 'OFFLINE'
  | 'NEW_MATCHES'
  | 'LACKING_LOCATION_PERMISSIONS'
  | 'LACKING_NOTIFICATION_PERMISSIONS'
  | 'NOT_DEFAULT_DEVICE';

class NotificationBar extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    value: false,
  };

  state = {
    showInfo: false,
    infoHeight: -1,
    status: null,
    statusTransition: new Animated.Value(
      this.props.value ? ON_TRANS : OFF_TRANS,
    ),
    infoTransition: new Animated.Value(this.props.value ? ON_TRANS : OFF_TRANS),
  };

  componentDidMount() {
    const status = this.getStatus();

    if (status) {
      this.animateStatusState(status);
    }
  }

  componentDidUpdate() {
    const newStatus = this.getStatus(),
      { isFocused } = this.props,
      { showInfo, status } = this.state;

    if (!isFocused && showInfo) {
      this.closeInfo();
    }

    if (status !== newStatus) {
      this.animateStatusState(newStatus);
    }
  }

  getStatus(): Nullable<Status> {
    const {
      offlineMode,
      newMatches,
      permissions,
      isDefaultDevice,
      updatingOneSignalId,
    } = this.props;

    let status = null;

    if (offlineMode) {
      status = statusTypes.OFFLINE;
    } else if (newMatches.length() > 0) {
      status = statusTypes.NEW_MATCHES;
    } else if (!permissions.locationAlways) {
      status = statusTypes.LACKING_LOCATION_PERMISSIONS;
    } else if (!isDefaultDevice && !updatingOneSignalId) {
      status = statusTypes.NOT_DEFAULT_DEVICE;
    } else if (!permissions.notifications) {
      status = statusTypes.LACKING_NOTIFICATION_PERMISSIONS;
    }

    return status;
  }

  hasStatus() {
    return !!this.state.status;
  }

  getStatusDetails(): Nullable<StatusDetail> {
    const { status } = this.state;
    if (this.hasStatus()) {
      return statusDetails[status!] || {};
    } else {
      return null;
    }
  }

  toggleInfo() {
    this.animateInfoState({
      showInfo: !this.state.showInfo,
      infoHeight: -1,
    });
  }

  closeInfo() {
    this.animateInfoState({
      showInfo: false,
      infoHeight: -1,
    });
  }

  animateInfoState(state: Pick<State, 'showInfo' | 'infoHeight'>) {
    const { infoTransition, showInfo } = this.state;

    if (showInfo) {
      Animated.timing(infoTransition, {
        duration: ANIMATION_DURATION,
        toValue: showInfo ? OFF_TRANS : ON_TRANS,
        useNativeDriver: false,
      }).start(() => {
        this.setState(state);
      });
    } else {
      this.setState(state);

      Animated.timing(infoTransition, {
        duration: ANIMATION_DURATION,
        toValue: showInfo ? OFF_TRANS : ON_TRANS,
        useNativeDriver: false,
      }).start();
    }
  }

  animateStatusState(status: Status) {
    const { statusTransition } = this.state,
      hasStatus = this.hasStatus();

    if (hasStatus) {
      Animated.timing(statusTransition, {
        duration: ANIMATION_DURATION,
        toValue: hasStatus ? OFF_TRANS : ON_TRANS,
        useNativeDriver: false,
      }).start(() => {
        this.setState({ status });
      });
    } else {
      this.setState({ status });

      Animated.timing(statusTransition, {
        duration: ANIMATION_DURATION,
        toValue: hasStatus ? OFF_TRANS : ON_TRANS,
        useNativeDriver: false,
      }).start();
    }
  }

  infoAnimateFromTo(from: any, to: any) {
    const { infoTransition } = this.state;

    return infoTransition.interpolate({
      inputRange: [OFF_TRANS, ON_TRANS],
      outputRange: [from, to],
    });
  }

  statusAnimateFromTo(from: any, to: any) {
    const { statusTransition } = this.state;

    return statusTransition.interpolate({
      inputRange: [OFF_TRANS, ON_TRANS],
      outputRange: [from, to],
    });
  }

  infoContent() {
    const { infoHeight } = this.state,
      statusDetails = this.getStatusDetails();

    if (statusDetails?.info) {
      let opacity = this.infoAnimateFromTo(0, 1),
        marginTop = this.infoAnimateFromTo(-infoHeight, 0);

      const isCalc = infoHeight >= 0,
        style = {
          paddingBottom: Layout.window.height,
          backgroundColor: colorObjs.darkGray.fade(0.5).toString(),
        },
        viewStyle: ViewStyle = Platform.select({
          ios: {
            marginBottom: -infoHeight - Layout.window.height,
            position: isCalc ? 'relative' : 'absolute',
            opacity: isCalc ? 1 : 0,
          },
          android: {
            opacity: isCalc ? 1 : 0,
            zIndex: -1,
          },
          default: {},
        }),
        infoWrapperStyle = Platform.select({
          ios: {
            marginTop,
          },
          android: {
            height: Layout.window.height,
          },
        });

      const onLayout = (e: LayoutChangeEvent) => {
        this.setState({ infoHeight: e.nativeEvent.layout.height });
      };

      return (
        <View style={viewStyle}>
          <TouchableWithoutFeedback onPressIn={this.closeInfo.bind(this)}>
            <Animated.View style={[style, { opacity }]}>
              <Animated.View
                style={[styles.infoWrapper, infoWrapperStyle]}
                onLayout={onLayout.bind(this)}>
                <Text style={styles.infoText}>{statusDetails.info}</Text>
                {!!statusDetails.action && (
                  <ActionButton
                    label={statusDetails.actionLabel || 'Click Here'}
                    type='secondary'
                    onPress={statusDetails.action.bind(this)}
                    style={[styles.infoActionButton, { zIndex: 2 }]}
                    block
                  />
                )}
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      );
    } else {
      return null;
    }
  }

  moreInfo() {
    const statusDetails = this.getStatusDetails();

    if (statusDetails?.info) {
      return (
        <View style={styles.moreInfo}>
          <FontAwesome5
            name='info-circle'
            style={[styles.notificationText, styles.moreInfoIcon]}
          />
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    if (this.hasStatus()) {
      const { showInfo } = this.state,
        statusDetails = this.getStatusDetails(),
        moreInfo = this.moreInfo(),
        infoContent = showInfo ? this.infoContent() : null,
        action = statusDetails?.info
          ? this.toggleInfo.bind(this)
          : statusDetails?.action?.bind(this),
        textAlign = moreInfo ? 'left' : 'center',
        marginTop = this.statusAnimateFromTo(-50, 0),
        opacity = this.statusAnimateFromTo(0, 1);

      return (
        <View style={styles.wrapper}>
          <Animated.View style={{ marginTop, opacity }}>
            <TouchableOpacity
              style={styles.statusWrapper}
              onPress={action}
              activeOpacity={action ? 0.7 : 1}>
              <Text
                style={[
                  styles.notificationText,
                  styles.statusText,
                  { textAlign },
                ]}>
                {statusDetails?.icon} {statusDetails?.description}
              </Text>
              {moreInfo}
            </TouchableOpacity>
          </Animated.View>
          <View>{infoContent}</View>
        </View>
      );
    } else {
      return null;
    }
  }
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  statusWrapper: {
    backgroundColor: colors.secondary,
    // borderBottomColor: colorObjs.secondary.darken(0.2),
    // borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    shadowColor: colors.darkGray,
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  infoWrapper: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 100,
  },
  infoText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  notificationText: {
    color: colors.white,
    fontSize: 16,
  },
  statusText: {
    flexGrow: 1,
  },
  moreInfo: {
    flexShrink: 1,
  },
  moreInfoIcon: {
    fontSize: 18,
  },
  infoActionButton: {
    marginTop: 20,
    marginBottom: 0,
  },
});

const statusTypes: Record<Status, Status> = {
  OFFLINE: 'OFFLINE',
  NEW_MATCHES: 'NEW_MATCHES',
  LACKING_LOCATION_PERMISSIONS: 'LACKING_LOCATION_PERMISSIONS',
  LACKING_NOTIFICATION_PERMISSIONS: 'LACKING_NOTIFICATION_PERMISSIONS',
  NOT_DEFAULT_DEVICE: 'NOT_DEFAULT_DEVICE',
};

const statusDetails: { [k in Status]: StatusDetail } = {
  OFFLINE: {
    description: 'You are in offline mode',
    icon: <Feather style={styles.notificationText} name='wifi-off' />,
    info: `When in offline mode you will be UNABLE to update any information in the app.  This includes all of the following:
  •  Accept/Reject a Match
  •  Change Match Status
  •  Login to the app
  •  Update account information
  •  Refresh Match data

In offline mode you will still be able to access and view any information necessary to get a Match to it's destination.

Your device enters offline mode automatically when no network connection is available.  Offline mode turned off when your network connection resumes.`,
    // The description below will not be applicable until offline mode is completed
    // info:  `When in offline mode the following features are disabled:\n  •  Accept/Reject a match\n  •  Login to the app\n  •  Update account information\n  •  Refresh match data\n\nIn offline mode you will still be able to update the status of a match, recieve signatures, and complete matches.  Changes made offline will be synchronized when your device has reconnected to a network.\n\nYour device enters offline mode automatically when no network connection is available.  Offline mode turned off when your network connection resumes.`
  },
  NEW_MATCHES: {
    action: () => {
      NavigationService.navigate('Drive', {
        navigateTo: 'Matches',
      });
    },
    description: 'New Matches are available',
    icon: <FontAwesome5 style={styles.notificationText} name='truck' />,
  },
  NOT_DEFAULT_DEVICE: {
    action: () => {
      NavigationService.navigate('Account', {
        navigateTo: 'EditNotifications',
      });
    },
    description: 'This device does not receive notifications.',
    icon: <FontAwesome5 style={styles.notificationText} name='bell' />,
  },
  LACKING_NOTIFICATION_PERMISSIONS: {
    action: function () {
      openSettings();
    },
    actionLabel: 'Go to Settings',
    description: 'Insufficient notification permissions',
    icon: (
      <FontAwesome5 style={styles.notificationText} name='location-arrow' />
    ),
    info:
      `Your phone settings are not allowing us to send you push notifications.` +
      Platform.select({
        ios: `Go to Frayt Driver in settings and navigate to Notifications. Ensure notification is set to 'All Frayt Driver notifications'`,
        android: `Go to App Info in Settings and navigate to: Frayt Driver > Permissions > Notifications permission. Select 'Allow push notifications'`,
      }),
  },
  LACKING_LOCATION_PERMISSIONS: {
    action: function () {
      openSettings();
    },
    actionLabel: 'Go to Settings',
    description: 'Insufficient location permissions',
    icon: (
      <FontAwesome5 style={styles.notificationText} name='location-arrow' />
    ),
    info:
      `Your phone settings are not allowing us to track your location in the background during deliveries. This will cause confusion with customers and we recommend turning it on. Shippers securely see your location only when you are engaged in a Match.

` +
      Platform.select({
        ios: `Go to Frayt Driver in settings and navigate to Location. Ensure location is set to 'Always'`,
        android: `Go to App Info in Settings and navigate to: Frayt Driver > Permissions > Location permission. Select 'Allow all the time'`,
      }),
  },
};

const connector = connect(
  ({ appReducer, matchReducer, userReducer }: RootState) => ({
    offlineMode: appReducer.offlineMode,
    newMatches: matchReducer.newMatches,
    permissions: appReducer.permissions,
    isDefaultDevice: userReducer.isDefaultDevice,
    updatingOneSignalId: userReducer.updatingOneSignalId,
  }),
);

export default connector(withNavigationFocus(NotificationBar));
