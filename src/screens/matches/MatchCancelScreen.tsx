import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Text, Input, Item, Label } from 'native-base';
import { connect } from 'react-redux';

import ActionButton from '@components/ui/ActionButton';
import { cancelMatch } from '@actions/matchAction';
import Select from '@components/ui/Select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from '@constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Sentry from '@sentry/react-native';

class MatchCancelScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      match: null,
      reason: null,
      matchId: this.props.navigation.state.params.id,
    };

    this.state.match = this.findMatch();
  }

  async componentDidUpdate(prevProps) {
    const { matches, navigation } = this.props;

    if (prevProps.matches !== matches) {
      const match = this.findMatch();

      if (match) {
        this.setState({ match });
      } else {
        navigation.navigate('MyMatches');
      }
    }
  }

  findMatch() {
    const { matches } = this.props,
      { matchId } = this.state;

    match = matches.find(matchId);

    return match;
  }

  async cancelMatch() {
    const { dispatch, navigation } = this.props;
    const { matchId, reason } = this.state;
    const isCanceled = await dispatch(cancelMatch(matchId, reason));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Canceled match #${this.state.matchId}, reason: ${reason}, result: ${isCanceled}`,
      level: Sentry.Severity.Info,
    });

    if (isCanceled) {
      navigation.navigate('MyMatches');
    }
  }

  render() {
    const { match, reason } = this.state;
    const {
      navigation,
      updatingMatchStatus: { [match.id]: cancelingMatch },
    } = this.props;
    const reasons = [
      "I couldn't find the pickup location",
      "I couldn't contact the shipper",
      'Unexpected traffic or weather',
      'I decided it was not worth it',
      'I had to do something else'
    ];
    const disabled = !!(cancelingMatch || !reason);

    return (
      <KeyboardAwareScrollView>
        <Container style={styles.root}>
          <FontAwesome5 name='ban' style={styles.megaIcon} />
          <Text style={styles.header}>
            Warning: Excessive match cancellations will effect driver account
            status
          </Text>
          <Text style={styles.paragraph}>
            Canceling a Match may negatively affect your account and reduce your
            chance of receiving future Matches.
          </Text>
          <Text style={styles.label}>Cancelation Reason</Text>
          <Select
            placeholder={{
              label: 'Select a reason...',
              value: null,
            }}
            disabled={!!cancelingMatch}
            items={reasons.map((reason) => ({ label: reason, value: reason }))}
            onValueChange={(reason) => this.setState({ reason })}
          />
          <ActionButton
            label='Cancel Match'
            type='danger'
            size='large'
            disabled={disabled}
            loading={!!cancelingMatch}
            block
            onPress={this.cancelMatch.bind(this)}
          />
          <ActionButton
            label='Go Back'
            size='large'
            disabled={!!cancelingMatch}
            block
            onPress={() => {
              navigation.goBack();
            }}
          />
        </Container>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    color: colors.danger,
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

export default connect((state) => ({
  updatingMatchStatus: state.matchReducer.updatingMatchStatus,
  matches: state.matchReducer.matches,
}))(MatchCancelScreen);
