import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Text, Input, Item, Label } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import ActionButton from '@components/ui/ActionButton';
import { stopUndeliverable } from '@actions/matchAction';
import Select from '@components/ui/Select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors from '@constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Sentry from '@sentry/react-native';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import MatchStop from '@models/MatchStop';
import Match from '@models/Match';

type ScreenProps = {
  navigation: NavigationScreenProp<{}, { stop: MatchStop; match: Match }>;
} & ConnectedProps<typeof connector>;

type ScreenState = {
  reason: Nullable<string>;
};

class UndeliverableStopScreen extends React.Component<
  ScreenProps,
  ScreenState
> {
  constructor(props: ScreenProps) {
    super(props);

    this.state = { reason: null };

    this.undeliverableStop = this.undeliverableStop.bind(this);
  }

  async componentDidUpdate(prevProps: ScreenProps) {
    const { navigation } = this.props;
    const { match } = navigation.state.params || {};

    if (!match) {
      navigation.navigate('MyMatches');
    }
  }

  async undeliverableStop() {
    const { dispatch, navigation } = this.props;
    const { match, stop } = navigation.state.params || {};
    const { reason } = this.state;

    if (match && stop) {
      const isUndelivered = await dispatch<any>(
        stopUndeliverable(match.id, stop.id, reason),
      );

      if (!isUndelivered) return;

      Sentry.addBreadcrumb({
        category: 'match',
        message: `Undeliverable stop #${stop.id}, reason: ${reason}, result: ${isUndelivered}`,
        level: Sentry.Severity.Info,
      });
    }

    navigation.goBack();
  }

  render() {
    const { reason } = this.state;
    const { match } = this.props.navigation.state.params || {};
    const matchId = match?.id || '';
    const {
      navigation,
      updatingMatchStatus: { [matchId]: updatingMatch },
    } = this.props;
    const reasons = [
      "I couldn't find the delivery location",
      'I was unable to access the delivery location',
      'Safety concern',
      'Missing Item',
      'Other',
    ];
    const disabled = !!(updatingMatch || !reason);

    return (
      <KeyboardAwareScrollView>
        <Container style={styles.root}>
          <FontAwesome5 name='ban' style={styles.megaIcon} />
          <Text style={styles.label}>
            Why are you unable to deliver to this stop?
          </Text>
          <Select
            placeholder={{
              label: 'Select a reason...',
              value: null,
            }}
            disabled={!!updatingMatch}
            items={reasons.map((reason) => ({ label: reason, value: reason }))}
            onValueChange={(reason) => this.setState({ reason })}
            otherValue='Other'
            otherInput={Input}
            otherInputWrapper={(Input) => (
              <Item floatingLabel style={styles.other}>
                <Label>Describe reason</Label>
                {Input}
              </Item>
            )}
          />
          <ActionButton
            label='Unable to Deliver to Stop'
            type='danger'
            size='large'
            disabled={disabled}
            loading={!!updatingMatch}
            block
            onPress={this.undeliverableStop}
          />
          <ActionButton
            label='Go Back'
            size='large'
            disabled={!!updatingMatch}
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
  megaIcon: {
    fontSize: 150,
    color: colors.danger,
    marginBottom: 10,
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

const connector = connect((state: RootState) => ({
  updatingMatchStatus: state.matchReducer.updatingMatchStatus,
}));

export default connector(UndeliverableStopScreen);
