import React from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import MatchList from '@components/ui/MatchList';
import colors from '@constants/Colors';
import { getLiveMatches, getCompletedMatches } from '@actions/matchAction';
import Match from '@models/Match';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

class MyMatchesScreen extends React.Component<ScreenProps> {
  static navigationOptions = {
    title: 'Matches',
    headerTintColor: 'white',
  };

  async componentDidMount() {
    this.getCompleteMatches();
    this.getLiveMatches();
  }

  componentDidUpdate(prevProps: ScreenProps) {
    const { navigation } = this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (params && (!prevParams || params.matchId !== prevParams.matchId)) {
      this.attemptNavigation();
    }
  }

  async getLiveMatches() {
    const { dispatch, fetchingLiveMatches } = this.props;

    if (!fetchingLiveMatches) {
      dispatch<any>(getLiveMatches());
    }
  }

  async getCompleteMatches() {
    const { dispatch, fetchingCompleteMatches, fetchingCompleteMatchesError } =
      this.props;

    if (
      !fetchingCompleteMatches &&
      ![404, 500].includes(fetchingCompleteMatchesError?.response?.status)
    ) {
      dispatch<any>(getCompletedMatches());
    }
  }

  attemptNavigation() {
    const { navigation } = this.props,
      { params } = navigation.state;

    if (params && params.matchId) {
      navigation.navigate('MyMatch', {
        id: params.matchId,
      });
    }
  }

  renderMatches() {
    const { navigation, fetchingLiveMatches, fetchingCompleteMatches } =
      this.props;

    return (
      <View style={styles.listContainer}>
        <MatchList
          groups={[
            {
              title: 'Active Matches',
              emptyText: 'You have no active Matches',
              showWhenEmpty: true,
              parameters: (match: Match) => match.isLive(),
              sort: (a: Match, b: Match) => {
                const aEnRoute = a.isEnRoute(),
                  bEnRoute = b.isEnRoute();
                return aEnRoute === bEnRoute ? 0 : aEnRoute ? -1 : 1;
              },
            },
            {
              title: ({ firstVisibleGroupItem: m }) => {
                if (m) {
                  let recentCompletedMonth = m.delivered_at
                    ? m.delivered_at.format("MMM 'YY")
                    : 'Archived';
                  return `Past Matches - ${recentCompletedMonth}`;
                } else {
                  return `Past Matches`;
                }
              },
              parameters: (match: Match) => match.isComplete(),
              sort: (a: Match, b: Match) => {
                const aDate: number = a.completed_at
                    ? parseInt(a.completed_at.format('x'))
                    : 0,
                  bDate: number = b.completed_at
                    ? parseInt(b.completed_at.format('x'))
                    : -1;
                return bDate - aDate;
              },
            },
          ]}
          refreshing={fetchingLiveMatches}
          onRefresh={this.getLiveMatches.bind(this)}
          navigation={navigation}
          refreshTitle='Loading your Matches...'
          onEndReached={this.getCompleteMatches.bind(this)}
          onEndReachedThreshold={0.001}
          loadingMore={fetchingCompleteMatches}
        />
      </View>
    );
  }

  render() {
    return <View style={styles.container}>{this.renderMatches()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});

const connector = connect(({ matchReducer }: RootState) => ({
  fetchingLiveMatches: matchReducer.fetchingLiveMatches,
  liveMatchesInitialized: matchReducer.liveMatchesInitialized,
  fetchingCompleteMatches: matchReducer.fetchingCompleteMatches,
  completeMatchesInitialized: matchReducer.completeMatchesInitialized,
  fetchingCompleteMatchesError: matchReducer.fetchingCompleteMatchesError,
}));

export default connector(MyMatchesScreen);
