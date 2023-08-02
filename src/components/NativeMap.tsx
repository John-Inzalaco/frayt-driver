import React, { Component } from 'react';
import { Dimensions, StyleSheet, InteractionManager } from 'react-native';
import MapView from 'react-native-maps';
import { timeout, Region } from '@lib/helpers';

import { shallowEqual } from '@lib/compare';

const { width } = Dimensions.get('window');

type Props = {
  region?: Region;
} & Partial<DefaultProps>;

type DefaultProps = {
  ignoreRegionOnDrag: boolean;
  initialRegion: Region;
  showsUserLocation: boolean;
  zoomEnabled: boolean;
};

type State = {
  lastRegion: Nullable<Region>;
  allowMapAnimate: boolean;
  isMapReady: boolean;
  loading: boolean;
};

class NativeMap extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    showsUserLocation: false,
    zoomEnabled: true,
    ignoreRegionOnDrag: true,
    initialRegion: {
      latitude: 39.117604,
      longitude: -84.517156,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    },
  };

  mapView: Nullable<MapView>;

  constructor(props: Props) {
    super(props);

    this.state = {
      allowMapAnimate: true,
      lastRegion: null,
      isMapReady: false,
      loading: true,
    };

    this.mapView = null;
  }

  async componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({ loading: false });
    });

    this.animateToRegion();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    this.animateToRegion();
  }

  async animateToRegion() {
    const { region } = this.props;
    const { allowMapAnimate, isMapReady, lastRegion } = this.state;

    // Zoom in on the new region
    if (allowMapAnimate && isMapReady) {
      let currentRegion = region;

      if (currentRegion && !shallowEqual(lastRegion, currentRegion)) {
        // The first time coordinates being set, so go ahead and zoom in on it
        this.mapView?.animateToRegion(currentRegion, 100);
        this.setState({ lastRegion: currentRegion });
      }
    }
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (e) => reject(e),
      );
    });
  }

  userMovedMap() {
    const { ignoreRegionOnDrag } = this.props;
    const { allowMapAnimate } = this.state;

    // Since the user moved the map, we don't want to automatically change where the map view on location updates
    if (allowMapAnimate && ignoreRegionOnDrag) {
      // Make sure we are not endlessly setting it to false
      this.setState({ allowMapAnimate: false });
    }
  }

  async centerOnCoords() {
    await this.setState({ allowMapAnimate: true, lastRegion: null });
    this.animateToRegion();
  }

  onMapLayout = () => {
    timeout(300).then(() => {
      this.setState({ isMapReady: true });
    });
  };

  render() {
    const { children, initialRegion, showsUserLocation, zoomEnabled } =
      this.props;
    return (
      <MapView
        ref={(ref) => {
          this.mapView = ref;
        }}
        style={styles.map}
        showsUserLocation={showsUserLocation}
        zoomEnabled={zoomEnabled}
        initialRegion={initialRegion}
        onMapReady={this.onMapLayout}
        onPanDrag={() => {
          this.userMovedMap();
        }}>
        {children}
      </MapView>
    );
  }
}

export default NativeMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
    minWidth: width,
    minHeight: 1,
    alignSelf: 'stretch',
  },
});
