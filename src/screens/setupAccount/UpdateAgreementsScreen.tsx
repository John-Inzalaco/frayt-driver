import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Container, Form, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { updateAgreements } from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { getNextSetupScreen } from '@actions/appAction';
import { RootState } from '@reducers/index';
import { NavigationScreenProp } from 'react-navigation';
import { AgreementInput } from '@components/AgreementInput';

var { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

type ScreenState = {
  agreements: string[];
};

class UpdateAgreementsScreen extends Component<ScreenProps, ScreenState> {
  constructor(props: ScreenProps) {
    super(props);

    this.state = {
      agreements: [],
    };

    this.updateAgreements = this.updateAgreements.bind(this);
  }

  componentDidMount() {
    this.updateFooter();
  }

  componentDidUpdate(prevProps: ScreenProps) {
    if (prevProps.user.pending_agreements.length === 0) {
      this.nextScreen();
    }
    this.updateFooter();
  }

  updateFooter() {
    const { updatingAgreements, navigation } = this.props;

    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={this.updateAgreements.bind(this)}
        loading={updatingAgreements}
        disabled={updatingAgreements}
        navigation={navigation}
      />,
      { navigation },
    );
  }

  async updateAgreements() {
    const { agreements } = this.state;
    const { dispatch, navigation } = this.props;

    const updated = await dispatch<any>(updateAgreements(agreements));

    if (updated) {
      this.nextScreen();
    }
  }

  nextScreen() {
    const { dispatch, navigation } = this.props;

    navigation.navigate(dispatch<any>(getNextSetupScreen()));
  }

  renderAgreements() {
    const { pending_agreements } = this.props.user;
    const { agreements } = this.state;

    return pending_agreements.map((agreement) => {
      const handleChange = (agreed: boolean) =>
        this.setState({
          agreements: agreed
            ? [...agreements, agreement.id]
            : [...agreements].filter(
                (agreement_id) => agreement_id != agreement.id,
              ),
        });
      return (
        <AgreementInput
          value={agreements.includes(agreement.id)}
          onChange={handleChange}
          agreement={agreement}
        />
      );
    });
  }

  render() {
    return (
      <Container style={styles.container}>
        <StatusBar barStyle='light-content' />
        <KeyboardAwareScrollView extraScrollHeight={80}>
          <View style={styles.scrollView}>
            <Text style={styles.header}>Terms and Agreements</Text>
            <Text style={styles.text}>
              We have updated our terms and conditions. Please read each one
              carefully by clicking the links below.
            </Text>
            <Text style={styles.text}>
              To continue using our services, please agree to our updated terms.
              If you do not agree you can sign out.
            </Text>
            <Form>{this.renderAgreements()}</Form>
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingAgreements: userReducer.updatingAgreements,
}));

export default connector(UpdateAgreementsScreen);
