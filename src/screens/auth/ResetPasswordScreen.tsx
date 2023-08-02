import React from 'react';
import { StyleSheet, Dimensions, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Container,
  Form,
  Label,
  Input,
  Item,
  Toast,
} from 'native-base';
import colors from '@constants/Colors';
import { sendResetPassword, updateOneSignalId } from '@actions/userAction';
import ActionButton from '@components/ui/ActionButton';
import { timeout } from '@lib/helpers';
import { tryToNavigateToMain } from '@actions/appAction';

var { width } = Dimensions.get('window');

class ResetPasswordScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: this.props.navigation.state.params.email,
      currentPassword: this.props.navigation.state.params.currentPassword,
      newPassword: '',
      confirmNewPassword: '',
      submitted: false,
    };
  }

  async _submitForm() {
    const { dispatch } = this.props;
    const { email, currentPassword, newPassword, confirmNewPassword } =
      this.state;

    if (!newPassword || newPassword == '') {
      Toast.show({
        text: 'Password is empty.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    if (!confirmNewPassword || confirmNewPassword == '') {
      Toast.show({
        text: 'Must confirm your password.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Toast.show({
        text: 'Passwords do not match.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    const success = await dispatch(
      sendResetPassword(currentPassword, newPassword, confirmNewPassword),
    );
    if (success) {
      this.setState({ submitted: true });

      // we'll wait a few seconds for our success screen to show
      // before navigating them away
      await timeout(4000);

      dispatch(tryToNavigateToMain(email, newPassword));
      dispatch(updateOneSignalId());
    }
  }
  componentDidMount() {
    const { email, currentPassword } = this.state;

    // If they exit the app while on this screen, we may not still have their old credentials in the state
    // So we'll send them back to the login screen

    if (!email || email == '' || !currentPassword || currentPassword == '') {
      this.props.navigation.navigate('Login');
    }
  }

  _renderForm() {
    const { newPassword, confirmNewPassword } = this.state;
    const { sendingPasswordReset } = this.props;

    return (
      <View style={styles.center}>
        <Text style={styles.header}>Change Password</Text>
        <Text style={styles.subHeader}>
          We've reset your password, so now you must change our temporary
          password before proceeding.
        </Text>
        <Form>
          <Item floatingLabel>
            <Label style={styles.inputLabel}>New Password</Label>
            <Input
              keyboardType='default'
              secureTextEntry={true}
              onChangeText={(newPassword) => this.setState({ newPassword })}
              style={styles.input}
            />
          </Item>
          <Item floatingLabel>
            <Label style={styles.inputLabel}>Confirm Password</Label>
            <Input
              keyboardType='default'
              secureTextEntry={true}
              onChangeText={(confirmNewPassword) =>
                this.setState({ confirmNewPassword })
              }
              style={styles.input}
            />
          </Item>
          <ActionButton
            label='Confirm'
            size='large'
            type='light'
            block
            disabled={sendingPasswordReset}
            loading={sendingPasswordReset}
            style={styles.button}
            onPress={this._submitForm.bind(this)}
          />
        </Form>
      </View>
    );
  }

  _renderSuccess() {
    const { email } = this.state;

    return (
      <View style={styles.center}>
        <Text style={styles.header}>Password successfully changed!</Text>
        <Text style={styles.subHeader}>
          We will now log you in momentarily.
        </Text>
      </View>
    );
  }

  render() {
    const { submitted } = this.state;
    return (
      <Container>
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          {submitted ? this._renderSuccess() : this._renderForm()}
        </KeyboardAvoidingView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 20,
  },
  center: {
    width: width,
    padding: 20,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  subHeader: {
    textAlign: 'center',
    color: colors.white,
    marginTop: 15,
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.white,
  },
  input: {
    color: colors.white,
  },
});

export default connect((state) => ({
  sendingPasswordReset: state.userReducer.sendingPasswordReset,
}))(ResetPasswordScreen);
