import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { connect, ConnectedProps } from 'react-redux';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';
import { NavigationScreenProp, StackActions } from 'react-navigation';
import Match from '@models/Match';
import MatchesCollection from '@models/MatchesCollection';
import { RootState } from '@reducers/index';
import { toggleEnRouteMatch, toggleStopEnRoute } from '@actions/matchAction';

const connector = connect(({ matchReducer }: RootState) => ({
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  matches: matchReducer.matches,
}));

interface NavigationProps {
  id: string;
  onYes?: () => any;
  onNo?: () => any;
}

interface NavigationState {
  params: NavigationProps;
}

interface ScreenProps extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
  matches: MatchesCollection;
}

interface ScreenState {
  matchId: string;
  isEnRoute: boolean;
  match: Nullable<Match>;
}

class MatchEnRouteScreen extends React.Component<ScreenProps, ScreenState> {
  constructor(props: ScreenProps) {
    super(props);

    const { id } = this.props.navigation.state.params,
      match = this.findMatch(id);

    this.state = {
      matchId: id,
      match: match,
      isEnRoute: !!match && match.isEnRoute(),
    };

    this.onYes = this.onYes.bind(this);
    this.onNo = this.onNo.bind(this);
  }

  async componentDidUpdate(prevProps: ScreenProps) {
    const { matches } = this.props;

    if (prevProps.matches !== matches) {
      this.setState({ match: this.findMatch() });
    }
  }

  async setEnRoute(stopId?: string) {
    const { dispatch } = this.props;
    const { matchId } = this.state;

    if (stopId) {
      await dispatch<any>(toggleStopEnRoute(matchId, stopId));
    } else {
      await dispatch<any>(toggleEnRouteMatch(matchId));
    }
  }

  async onYes() {
    const { onYes } = this.props.navigation.state.params;
    const { navigation } = this.props;
    const { match } = this.state;
    const stopId = match?.state === 'picked_up' ? match.stops[0].id : undefined;

    if (onYes) {
      await this.setEnRoute(stopId);
      navigation.dispatch(onYes());
    } else {
      await this.setEnRoute(stopId);
      this.goToMatch();
    }
  }

  onNo() {
    const { onNo } = this.props.navigation.state.params;
    const { navigation } = this.props;

    if (onNo) {
      navigation.dispatch(onNo());
    } else {
      this.goToMatch();
    }
  }

  goToMatch() {
    const { navigation } = this.props;
    navigation.dispatch(
      StackActions.replace({
        routeName: 'Matches',
      }),
    );

    navigation.navigate({
      routeName: 'MyMatch',
      params: {
        id: this.state.matchId,
      },
    });
  }

  findMatch(
    id: string = this.state.matchId,
    matches: MatchesCollection = this.props.matches,
  ) {
    return matches.find(id);
  }

  render() {
    const { matchId } = this.state;
    const {
      updatingEnRouteMatch: { [matchId]: isUpdating },
    } = this.props;

    return (
      <ScrollView contentContainerStyle={styles.root}>
        <FontAwesome5 name='route' style={styles.megaIcon} />
        <Text style={styles.header}>Are you on your way to this Match?</Text>
        <Text style={styles.paragraph}>
          If you are not on your way yet, be sure to mark the match as{' '}
          <Text style={styles.important}>En Route</Text> as soon as you are
          headed toward the pickup or dropoff location.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.important}>Warning:</Text> Dash matches require
          pickup arrival within 60 minutes or at the prescheduled time
          indicated. Arriving untimely at the pickup location will incur a
          penalty and lower your driver rating. Repeat penalties will result in
          a suspension or removal from the FRAYT app.
        </Text>
        <ActionButton
          label='Yes'
          type='secondary'
          size='large'
          disabled={isUpdating}
          loading={isUpdating}
          block
          onPress={this.onYes}
        />
        <ActionButton
          label='No'
          size='large'
          type='inverse'
          hollow
          disabled={isUpdating}
          block
          onPress={this.onNo}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  important: {
    fontWeight: 'bold',
  },
  root: {
    width: '100%',
    flexGrow: 1,
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  picker: {
    backgroundColor: 'red',
    height: 100,
    width: 100,
    borderWidth: 10,
    borderColor: 'blue',
  },
  megaIcon: {
    fontSize: 150,
    color: colors.secondary,
    marginBottom: 10,
  },
  header: {
    color: colors.darkGray,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  other: {
    marginBottom: 20,
  },
});

export default connector(MatchEnRouteScreen);
