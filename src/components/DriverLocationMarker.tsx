import React, { Component } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';

import { Callout, Marker } from 'react-native-maps';
import colors, { colorObjs } from '@constants/Colors';
import { Driver } from '@models/User';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { Text } from 'native-base';
import LoadingText from '@components/ui/LoadingText';

import moment from 'moment';
// import Animated, { Easing } from 'react-native-reanimated';

type Props = {
  user: Driver;
  callback: () => void;
} & Partial<DefaultProps>;

type DefaultProps = {
  updating: boolean;
};

type State = {
  calloutDescription: string | Element;
  calloutCallback: (() => void) | undefined;
  pulseValue: Animated.Value;
};

class DriverLocationMarker extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    updating: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      calloutDescription: UpdateLocationText,
      calloutCallback: props.callback,
      pulseValue: new Animated.Value(1),
    };
  }

  pulseAnimation: Nullable<Animated.CompositeAnimation> = null;

  runPulseAnimation() {
    this.pulseAnimation?.stop();
    this.pulseAnimation = Animated.loop(
      Animated.timing(this.state.pulseValue, {
        toValue: 0,
        duration: 2500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
    );

    this.pulseAnimation.start();
  }

  componentDidMount() {
    this.runPulseAnimation();
  }

  componentDidUnMount() {
    this.pulseAnimation?.stop();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.runPulseAnimation();
    const { updating, callback } = this.props;
    if (prevProps.updating !== updating && !updating) {
      this.setState({
        calloutDescription: UpdatedLocationText,
        calloutCallback: undefined,
      });
      setTimeout(
        () =>
          this.setState({
            calloutDescription: UpdateLocationText,
            calloutCallback: callback,
          }),
        15000,
      );
    }
  }

  render() {
    const { user, updating } = this.props;
    const { calloutDescription, calloutCallback, pulseValue } = this.state;

    if (user.current_location) {
      const { lat, lng } = user.current_location,
        pulseDiameter = pulseValue.interpolate({
          inputRange: [0, 1],
          outputRange: [120, 0],
        }),
        pulseRadius = pulseValue.interpolate({
          inputRange: [0, 1],
          outputRange: [60, 0],
        });

      return (
        <Marker
          key={`${user.id}_${moment().unix()}`}
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          tracksViewChanges={false}
          onCalloutPress={calloutCallback}>
          <View style={styles.driverPulseWrapper}>
            <Animated.View
              style={[
                styles.driverPulse,
                {
                  opacity: pulseValue,
                  width: pulseDiameter,
                  height: pulseDiameter,
                  borderRadius: pulseRadius,
                },
              ]}
            />
          </View>
          <View style={styles.driverMarker}>
            <FontAwesome5Icon name={user.vehicle_icon} color={colors.white} />
          </View>
          <Callout style={styles.calloutWrapper}>
            <View>
              <Text style={styles.calloutHeader}>My Location</Text>
              {user.current_location.created_at && (
                <Text style={styles.updatedAtText}>
                  Updated {user.current_location.created_at.fromNow()}
                </Text>
              )}

              <LoadingText
                label='Updating location'
                inactiveLabel={calloutDescription}
                inline
                loading={updating}
                textStyle={styles.calloutDescription}
                style={styles.calloutDescriptionWrapper}
              />
            </View>
          </Callout>
        </Marker>
      );
    }

    return null;
  }
}

export default DriverLocationMarker;

const styles = StyleSheet.create({
  driverMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  calloutWrapper: {
    width: 175,
  },
  calloutHeader: {
    fontWeight: 'bold',
  },
  calloutDescription: {
    textAlign: 'left',
    color: colors.gray,
  },
  updateLocationText: {
    color: colors.secondary,
  },
  calloutDescriptionWrapper: {
    justifyContent: 'flex-start',
  },
  updatedAtText: {
    fontSize: 12,
  },
  driverPulse: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderRadius: 0,
    backgroundColor: colorObjs.secondary.fade(0.8).toString(),
  },
  driverPulseWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    top: 15,
  },
});

const UpdateLocationText = (
  <Text style={styles.updateLocationText}>Click to update</Text>
);
const UpdatedLocationText = 'Location updated';
