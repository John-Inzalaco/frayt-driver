import React, { Component } from 'react';
import MapMarker from './MapMarker';
import MapViewDirections from 'react-native-maps-directions';
import { Region, Coordinates, getRegionForCoordinates } from '@lib/helpers';
import { GOOGLE_API_KEY } from '@constants/Environment';
import colors from '@constants/Colors';
import Match from '@models/Match';
import NativeMap from '@components/NativeMap';
import { shallowEqual } from '@lib/compare';

import { getCurrentGeoLocation } from '@lib/location';
import { Toast } from 'native-base';

type Props = {
  match: Match;
} & Partial<DefaultProps>;

type DefaultProps = {
  showDirections: boolean;
  showPins: boolean;
  ignoreRegionOnDrag: boolean;
  showsUserLocation: boolean;
  initialRegion: Region;
};

type State = {
  destinationCoords?: Coordinates;
  originCoords?: Coordinates;
  region: Nullable<Region>;
  waypoints: Coordinates[];
};

class MatchMap extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    showDirections: false,
    showPins: true,
    ignoreRegionOnDrag: true,
    showsUserLocation: true,
    initialRegion: {
      latitude: 39.117604,
      longitude: -84.517156,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    },
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      destinationCoords: this.getDestinationCoords(),
      originCoords: this.getOriginCoords(),
      region: null,
      waypoints: this.getWaypoints(),
    };
  }

  async componentDidMount() {
    try {
      const region = await this.getRegion();
      this.setState({ region });
    } catch (e) {
      if (e instanceof Error) {
        Toast.show({ text: e.message });
      }
    }
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const region = await this.getRegion();
    const updatedState: Partial<State> = {};

    if (!shallowEqual(region, this.state.region)) {
      updatedState.region = region;
    }

    if (prevProps.match !== this.props.match) {
      const destinationCoords = this.getDestinationCoords(),
        originCoords = this.getOriginCoords();

      if (
        !shallowEqual(destinationCoords, this.state.destinationCoords) ||
        !shallowEqual(originCoords, this.state.originCoords)
      ) {
        updatedState.destinationCoords = destinationCoords;
        updatedState.originCoords = originCoords;
      }
    }

    if (Object.keys(updatedState).length > 0) {
      this.setState(updatedState as State);
    }
  }

  getOriginCoords(): Coordinates | undefined {
    const { match } = this.props;
    return match.origin_address.lat && match.origin_address.lng
      ? {
          latitude: match.origin_address.lat,
          longitude: match.origin_address.lng,
        }
      : undefined;
  }

  getDestinationCoords(): Coordinates | undefined {
    const { match } = this.props;
    const stops = match.stops.sort((a, b) => a.index - b.index);

    return match.origin_address.lat && match.origin_address.lng
      ? {
          latitude: stops[stops.length - 1].destination_address.lat,
          longitude: stops[stops.length - 1].destination_address.lng,
        }
      : undefined;
  }

  getWaypoints(): Coordinates[] | [] {
    const { match } = this.props;

    let waypoints = [];
    const stops = match.stops.sort((a, b) => a.index - b.index);

    for (let i = 0; i < stops.length - 1; i++) {
      waypoints.push({
        latitude: stops[i].destination_address.lat,
        longitude: stops[i].destination_address.lng,
      });
    }

    return waypoints;
  }

  async getRegion(): Promise<Nullable<Region>> {
    const { originCoords, destinationCoords, waypoints } = this.state;

    if (originCoords && destinationCoords) {
      const currentCoords = await getCurrentGeoLocation();

      const region = getRegionForCoordinates(
        [originCoords, ...waypoints, destinationCoords, currentCoords],
        0.33,
      );

      return region;
    } else {
      return null;
    }
  }

  renderMapDirections() {
    const { showDirections } = this.props;
    const { originCoords, destinationCoords, waypoints } = this.state;

    if (showDirections && originCoords && destinationCoords) {
      return (
        <MapViewDirections
          origin={originCoords}
          destination={destinationCoords}
          waypoints={waypoints}
          apikey={GOOGLE_API_KEY}
          strokeColor={colors.secondary}
          strokeWidth={4}
          optimizeWaypoints={true}
        />
      );
    } else {
      return null;
    }
  }

  renderMatchPins() {
    const { showPins, match } = this.props;
    const { originCoords, destinationCoords } = this.state;

    if (showPins && originCoords && destinationCoords) {
      return [
        <MapMarker coordinate={originCoords} label='P' />,
        match.stops.map((stop) => {
          return (
            <MapMarker
              coordinate={{
                latitude: stop.destination_address.lat,
                longitude: stop.destination_address.lng,
              }}
              label={stop.index + 1}
            />
          );
        }),
      ];
    } else {
      return null;
    }
  }

  render() {
    const { showsUserLocation, ignoreRegionOnDrag, initialRegion } = this.props;
    const { region } = this.state;

    return (
      <NativeMap
        ignoreRegionOnDrag={ignoreRegionOnDrag}
        initialRegion={initialRegion}
        region={region || undefined}
        showsUserLocation={showsUserLocation}>
        {this.renderMatchPins()}
        {this.renderMapDirections()}
      </NativeMap>
    );
  }
}

export default MatchMap;
