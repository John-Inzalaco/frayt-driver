import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import ProfileCard from '@components/ui/ProfileCard';
import colors from '@constants/Colors';
import { getAvailableMatches } from '@actions/matchAction';
import MaterialSpinner from '@components/ui/MaterialSpinner';
import {
  NavigationFocusInjectedProps,
  NavigationScreenProp,
} from 'react-navigation';
import { RootState } from '@reducers/index';
import DriverMap from '@components/DriverMap';

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

class DriveScreen extends Component<ScreenProps> {
  static navigationOptions = {
    title: 'Drive',
    headerTintColor: 'white',
  };

  driverMap = React.createRef<DriverMap>();

  constructor(props: ScreenProps) {
    super(props);
  }

  viewMatches = async () => {
    this.props.navigation.navigate('Matches');
  };

  componentDidMount() {
    // same needs done for componentWillUpdate
    this.updateMap();
    this.getMatches();
    this.attemptNavigation();
  }

  componentDidUpdate(prevProps: ScreenProps) {
    const { navigation } = this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (
      params &&
      (!prevParams || prevParams.navigateTo !== params.navigateTo)
    ) {
      this.attemptNavigation();
    }
  }

  getMatches = async () => {
    const { dispatch } = this.props;

    dispatch<any>(getAvailableMatches());
  };

  updateMap() {}

  attemptNavigation() {
    const { navigation } = this.props,
      { params } = navigation.state;
    if (params && params.navigateTo) {
      navigation.navigate(params.navigateTo, params.params);
      navigation.setParams({ navigateTo: null });
    }
  }

  renderMatchesText() {
    const { matches, fetchingAvailableMatches, availableMatchesInitialized } =
        this.props,
      availableMatches = matches.getAvailable(),
      spinner = <MaterialSpinner />;

    if (!availableMatchesInitialized && fetchingAvailableMatches) {
      return (
        <View style={styles.inlineWrapper}>
          {spinner}
          <Text style={{ marginLeft: 2, color: colors.white }}>
            {' '}
            Checking for Matches...
          </Text>
        </View>
      );
    } else {
      let available =
          availableMatches.length > 0 ? availableMatches.length : 'No',
        loading = fetchingAvailableMatches ? spinner : null;
      return (
        <View style={styles.inlineWrapper}>
          {loading}
          <Text style={{ marginLeft: 2, color: colors.white }}>
            {available} {available == 1 ? 'Match' : 'Matches'} Available
          </Text>
        </View>
      );
    }
  }

  centerOnUser() {
    if (this.driverMap) {
      this.driverMap?.current?.centerOnDriver();
      this.setState({ centered: true });
    }
  }

  render() {
    const { user, navigation, matches, updatingUserLocation } = this.props;

    return (
      <Container style={{ backgroundColor: colors.white }}>
        <View style={styles.container}>
          <View style={styles.mapContainer}>
            <ProfileCard user={user} onPress={this.centerOnUser.bind(this)} />
            <DriverMap
              navigation={navigation}
              user={user}
              matches={matches.getAvailable()}
              updating={updatingUserLocation}
              ref={this.driverMap}
            />
          </View>

          <TouchableOpacity
            onPress={this.viewMatches}
            style={styles.matchContainer}>
            {this.renderMatchesText()}
          </TouchableOpacity>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  inlineWrapper: {
    flexDirection: 'row',
  },
  mapContainer: {
    flexGrow: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  matchContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
    color: colors.white,
    alignSelf: 'stretch',
    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 20,
  },
  nextContainer: {
    alignSelf: 'stretch',
  },
  button: {
    backgroundColor: colors.secondary,
  },
});

const connector = connect(
  ({ userReducer, matchReducer, appReducer }: RootState) => ({
    user: userReducer.user,
    updatingUserLocation: userReducer.updatingUserLocation,
    matches: matchReducer.matches,
    fetchingAvailableMatches: matchReducer.fetchingAvailableMatches,
    availableMatchesInitialized: matchReducer.availableMatchesInitialized,
    appLoaded: appReducer.appLoaded,
  }),
);

export default connector(DriveScreen);
