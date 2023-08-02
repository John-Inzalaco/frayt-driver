import React from 'react';
import colors from '@constants/Colors';
import MatchStop from '@models/MatchStop';
import { RootState } from '@reducers/index';
import { StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import ActionButton from './ui/ActionButton';
import Match from '@models/Match';
import { NavigationScreenProp } from 'react-navigation';
import { matchActionTypes } from '@actions/types/matchTypes';

type Props = {
  stop: MatchStop;
  match: Match;
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

const UndeliverableStopButton = ({
  match,
  stop,
  navigation,
  updatingMatchStatus: { [match.id]: updatingMatchStatus },
  updatingEnRouteMatch: { [match.id]: updatingEnRoute },
}: Props) => {
  const undeliverable = async () => {
    navigation.navigate('UndeliverableStop', { match, stop });
  };

  if (['signed', 'en_route', 'arrived'].includes(stop.state)) {
    return (
      <ActionButton
        size='large'
        type='danger'
        hollow
        block
        hollowBackground={colors.white}
        style={styles.button}
        loading={updatingMatchStatus === matchActionTypes.completed}
        disabled={!!updatingMatchStatus || !!updatingEnRoute}
        label='Unable to Deliver'
        onPress={undeliverable}
      />
    );
  }

  return null;
};

const connector = connect(({ matchReducer }: RootState) => ({
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  updatingMatchStatus: matchReducer.updatingMatchStatus,
  matchStatusError: matchReducer.matchStatusError,
  matchStatusSuccess: matchReducer.matchStatusSuccess,
}));

export default connector(UndeliverableStopButton);

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    marginHorizontal: 4,
    borderWidth: 0,
    shadowOpacity: 0,
  },
});
