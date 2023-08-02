import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, StatusBar, Linking } from 'react-native';
import { Container, Form, Text, Item, Label, Input, Switch } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { createUserPaymentInfo } from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Mask, { MaskInput } from '@lib/Mask';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { getNextSetupScreen } from '@actions/appAction';
import { RootState } from '@reducers/index';
import { NavigationScreenProp } from 'react-navigation';

var { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

type ScreenState = {
  ssn: string;
  agree_tos: boolean;
  isValid: boolean;
};

type MaskedInputs = {
  ssn?: MaskInput<string>;
};

class SetupWalletScreen extends Component<ScreenProps, ScreenState> {
  inputs: MaskedInputs = {};

  state = {
    ssn: '',
    agree_tos: false,
    isValid: false,
  };

  componentDidMount() {
    const isValid = this.isValid();
    this.setState({ isValid });
    this.updateFooter();
  }

  componentDidUpdate(prevProps: ScreenProps, prevState: ScreenState) {
    const isValid = this.isValid();
    if (isValid !== prevState.isValid) {
      this.setState({ isValid });
    }
    this.updateFooter();
  }

  updateFooter() {
    const { updatingUserPaymentInfo, navigation } = this.props;
    const { isValid } = this.state;
    const disabled = updatingUserPaymentInfo || !isValid;

    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={this.createWallet.bind(this)}
        loading={updatingUserPaymentInfo}
        disabled={disabled}
        navigation={navigation}
      />,
      { navigation },
    );
  }

  isValid(): boolean {
    const { agree_tos } = this.state;
    const { user } = this.props;
    const { ssn } = this.inputs;

    return user.has_wallet || (!!ssn?.props.isValid() && agree_tos);
  }

  async createWallet() {
    const { ssn, agree_tos } = this.state;
    const { dispatch, navigation, user } = this.props;

    const updated = await dispatch<any>(
      createUserPaymentInfo(ssn, agree_tos, true),
    );

    if (updated) {
      navigation.navigate(dispatch<any>(getNextSetupScreen()));
    }
  }

  async openTOS() {
    const tosURL = 'https://www.branchapp.com/terms';
    const supported = await Linking.canOpenURL(tosURL);

    if (supported) {
      Linking.openURL(tosURL);
    }
  }

  render() {
    const { updatingUserPaymentInfo, user } = this.props;
    const { ssn, agree_tos } = this.state;
    const inputDisabled = updatingUserPaymentInfo;

    const ssnInput = Mask.presets.ssn?.applyDirectlyToInput(Input, {
      onChangeText: (ssn) => this.setState({ ssn }),
      value: ssn,
      keyboardType: 'number-pad',
      returnKeyType: 'done',
      disabled: inputDisabled,
      style: styles.monoText,
    });

    this.inputs.ssn = ssnInput;

    return (
      <Container style={styles.container}>
        <StatusBar barStyle='light-content' />
        <KeyboardAwareScrollView extraScrollHeight={80}>
          <View style={styles.scrollView}>
            <Text style={styles.header}>Setup Payments</Text>
            <Text style={styles.text}>
              We've partnered with Branch to offer you faster turnaround on your
              payouts. You'll now be paid on the same day, and be able to spend
              that money instantly. To setup your Branch wallet, we need to
              verify your Social Security Number. Once verified, you will
              receive an email with instructions on claiming your wallet.
            </Text>
            <Form>
              <Item floatingLabel>
                <Label>Social Security #</Label>
                {ssnInput}
              </Item>
              <View style={styles.tosWrapper}>
                <Switch
                  trackColor={{
                    true: colors.secondary,
                  }}
                  ios_backgroundColor={colors.gray}
                  style={styles.smallSwitch}
                  value={agree_tos}
                  onValueChange={(agree_tos) => this.setState({ agree_tos })}
                />
                <View style={styles.tosTextWrapper}>
                  <Text style={styles.tosText}>
                    I have read and agree to Branch's{' '}
                  </Text>
                  <TouchableOpacity onPress={this.openTOS.bind(this)}>
                    <Text style={[styles.tosText, styles.link]}>
                      Terms of Service
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Form>
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  spacedMonoText: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  monoText: {
    fontVariant: ['tabular-nums'],
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  smallSwitch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    flexShrink: 0,
  },
  tosWrapper: {
    flexDirection: 'row',
    paddingTop: 30,
    flexWrap: 'wrap',
  },
  tosTextWrapper: {
    flexGrow: 1,
  },
  link: {
    color: colors.secondary,
  },
  tosText: {
    fontSize: 13,
    // flexShrink: 1,
  },
  scrollView: {
    width: width,
    paddingHorizontal: 20,
    paddingVertical: 30,
    flex: 1,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 8,
  },
  finePrint: {
    fontSize: 12,
    color: colors.darkGray,
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: -12,
  },
  inputGroup: {
    flex: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  rowHeader: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 10,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserPaymentInfo: userReducer.updatingUserPaymentInfo,
}));

export default connector(SetupWalletScreen);
