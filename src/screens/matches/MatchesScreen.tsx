import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { Text, View, Toast } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MatchList from '@components/ui/MatchList';
import colors from '@constants/Colors';
import { getAvailableMatches, matchesScreenViewed } from '@actions/matchAction';
import { NavigationScreenProp, withNavigationFocus } from 'react-navigation';
import { saveLocationUpdates } from '@actions/userAction';
import { getCurrentGeoLocation } from '@lib/location';
import { RootState } from '@reducers/index';

type Props = {
  navigation: NavigationScreenProp<{}>;
  isFocused: boolean;
} & ConnectedProps<typeof connector>;

type State = {
  refreshing: boolean;
  lastMatchRefresh: Nullable<Date>;
};

class MatchesScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      refreshing: false,
      lastMatchRefresh: null,
    };
  }

  async refreshMatches() {
    const { dispatch } = this.props;

    try {
      this.setState({ refreshing: true, lastMatchRefresh: new Date() });

      const { latitude, longitude } = await getCurrentGeoLocation();

      if (latitude && longitude) {
        await dispatch<any>(saveLocationUpdates(latitude, longitude));
        await Promise.all([dispatch<any>(getAvailableMatches())]);
      } else {
        Toast.show({
          text: 'Unable to locate your current position',
          duration: 5000,
        });
      }

      this.setState({ refreshing: false });
    } catch (e) {
      if (e instanceof Error) {
        Toast.show({ text: e.message, duration: 5000 });
      }
      console.warn(e);
      this.setState({ refreshing: false });
    }
  }

  timeSinceLastRefresh() {
    const { lastMatchRefresh } = this.state;

    return (
      (new Date().getTime() -
        (lastMatchRefresh ? lastMatchRefresh.getTime() : 0)) /
      1000
    );
  }

  async componentDidMount() {
    const { fetchingAvailableMatches } = this.props;

    if (!fetchingAvailableMatches) {
      this.refreshMatches();
    }

    this.attemptNavigation();
  }

  componentDidUpdate(prevProps: Props) {
    const { isFocused, fetchingAvailableMatches, navigation, dispatch } =
        this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (isFocused) {
      dispatch<any>(matchesScreenViewed());
    }

    if (params && (!prevParams || params.matchId !== prevParams.matchId)) {
      this.attemptNavigation();
    } else if (prevProps.isFocused !== isFocused && isFocused) {
      if (!fetchingAvailableMatches && this.timeSinceLastRefresh() > 60) {
        this.refreshMatches();
      }
    }
  }

  attemptNavigation() {
    const { navigation } = this.props,
      { params } = navigation.state;

    if (params && params.matchId) {
      navigation.navigate('Match', {
        id: params.matchId,
      });
    }
  }

  renderMatches() {
    const { navigation, user } = this.props;
    const { refreshing } = this.state;

    const emptyBody = user.current_location ? (
      [
        <Text style={{ marginBottom: 20 }}>
          There are no Matches available in your area. You can try again later
          by swiping up to refresh.
        </Text>,
        <Text style={{ marginBottom: 20 }}>
          Right now, Frayt is primarily operating in these cities:
        </Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Akron'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Albany'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Atlanta'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Charlotte'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Chicago'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Cincinnati'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Cleveland'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Columbus'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Dayton'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Denver'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Detroit'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Flint'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Fort Lauderdale'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Fort Wayne'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Grand Rapids'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Orlando'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Indianapolis'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Lexington'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Louisville'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Long Island'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Miami'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Michigan City'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Nashville'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  New Jersey'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  NYC'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Oklahoma City'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Philadelphia'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Pittsburgh'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  South Bend'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Syracuse'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Tampa'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Toledo'}</Text>,
        <Text style={{ marginBottom: 3 }}>{'  •  Youngstown'}</Text>,
      ]
    ) : (
      <Text>
        We were unable to find your current location. Please ensure that
        location is enabled and location permissions are granted to find nearby
        matches.
      </Text>
    );

    return (
      <MatchList
        groups={[
          {
            title: 'Available Matches',
            parameters: (match) => match.isAvailable(),
            emptyText: emptyBody,
            showWhenEmpty: true,
          },
          // {
          //   title: 'Recent Matches',
          //   matches: recentMatches.toArray(),
          // },
        ]}
        refreshing={refreshing}
        navigation={navigation}
        onEndReachedThreshold={0.5}
        refreshTitle='Checking for Matches...'
        onRefresh={this.refreshMatches.bind(this)}
        emptyBody={emptyBody}
      />
    );
  }

  render() {
    const { matches, availableMatchesInitialized } = this.props,
      availableMatches = matches.getAvailable();

    let availableCountText: Element | string = '';

    if (!availableMatchesInitialized) {
      availableCountText = (
        <Text>
          <Ionicons name='md-refresh-circle' size={16} color={colors.white} />
          <Text style={{ marginLeft: 10, color: colors.white }}>
            {' '}
            Loading...
          </Text>
        </Text>
      );
    } else {
      let available =
        availableMatches.length > 0 ? availableMatches.length : 'No';
      availableCountText = `${available} Matches Available`;
    }

    return (
      <View style={styles.container}>
        <View style={styles.button}>
          <Text style={{ color: colors.white, fontWeight: 'bold' }}>
            {availableCountText}
          </Text>
        </View>
        {this.renderMatches()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
    color: colors.white,
    alignSelf: 'stretch',
    paddingLeft: 10,
    paddingTop: 15,
    paddingBottom: 15,
  },
  header: {
    color: colors.text,
    fontWeight: '600',
    padding: 5,
    borderBottomWidth: 5,
    fontSize: 20,
    borderBottomColor: colors.text,
    width: '80%',
  },
  inlineWrapper: {
    flexDirection: 'row',
  },
});

const connector = connect(({ userReducer, matchReducer }: RootState) => ({
  user: userReducer.user,
  matches: matchReducer.matches,
  updatingUserLocation: userReducer.updatingUserLocation,
  fetchingAvailableMatches: matchReducer.fetchingAvailableMatches,
  availableMatchesInitialized: matchReducer.availableMatchesInitialized,
  newMatches: matchReducer.newMatches,
}));

export default withNavigationFocus(connector(MatchesScreen));
