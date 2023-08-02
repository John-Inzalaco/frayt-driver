import React, { Component } from 'react';
import { View } from 'react-native';

import { Marker } from 'react-native-maps';
import Match from '@models/Match';
import { Driver } from '@models/User';
import { NavigationScreenProp } from 'react-navigation';
import { updateCurrentLocation } from '@lib/location';
import NativeMap from '@components/NativeMap';
import DriverLocationMarker from '@components/DriverLocationMarker';

type Props = {
  user: Driver;
  matches: Match[];
  navigation: NavigationScreenProp<{}>;
} & Partial<DefaultProps>;

type DefaultProps = {
  updating: boolean;
};

type State = {};

class DriverMap extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    updating: false,
  };

  nativeMap = React.createRef<NativeMap>();

  constructor(props: Props) {
    super(props);

    this.updateLocation = this.updateLocation.bind(this);
  }

  componentDidMount() {
    const { user } = this.props;
    if (!user.current_location) {
      this.updateLocation();
    }
  }

  async centerOnDriver() {
    await this.nativeMap?.current?.centerOnCoords();
  }

  updateLocation() {
    updateCurrentLocation();
    this.centerOnDriver();
  }

  renderMatchMarkers() {
    const { navigation, matches } = this.props;
    let matchPinsView = null;

    if (matches.length > 0) {
      // If available Matches are passed down, display them on the map
      const matchPins = matches
        .map((item: Match) => {
          return item ? (
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.origin_address.lat,
                longitude: item.origin_address.lng,
              }}
              tracksViewChanges={false}
              title={`Pickup in ${item.origin_address.city}, ${item.origin_address.state_code}`}
              description={
                item.isMultiStop()
                  ? `${item.stops.length} stops - Dropoff in ${
                      item.stops[item.stops.length - 1].destination_address.city
                    }, ${
                      item.stops[item.stops.length - 1].destination_address
                        .state
                    }`
                  : `Dropoff in ${
                      item.stops[item.stops.length - 1].destination_address.city
                    }, ${
                      item.stops[item.stops.length - 1].destination_address
                        .state
                    }`
              }
              onCalloutPress={() => {
                navigation.navigate('Matches', { matchId: item.id });
              }}
            />
          ) : null;
        })
        .filter((item: any) => item);

      matchPinsView = <View>{matchPins}</View>;
    }

    return matchPinsView;
  }

  render() {
    const { user, updating } = this.props;
    const { current_location } = user;
    let region = current_location
      ? {
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
          longitude: current_location.lng,
          latitude: current_location.lat,
        }
      : undefined;

    return (
      <NativeMap ref={this.nativeMap} region={region} showsUserLocation={false}>
        <DriverLocationMarker
          user={user}
          callback={this.updateLocation}
          updating={updating}
        />
        {this.renderMatchMarkers()}
      </NativeMap>
    );
  }
}

export default DriverMap;
