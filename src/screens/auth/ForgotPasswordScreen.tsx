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
import { requestResetPassword } from '@actions/userAction';
import ActionButton from '@components/ui/ActionButton';

var { width } = Dimensions.get('window');

class ForgotPasswordScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: this.props.navigation.state.params.email,
      submitted: false,
    };
  }

  async _submitForm() {
    const { dispatch } = this.props;
    const { email } = this.state;

    if (!email || email == '') {
      Toast.show({
        text: 'Email is empty.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    const success = await dispatch(requestResetPassword(email));
    if (success) {
      this.setState({ submitted: true });
    }
  }

  _renderForm() {
    const { email } = this.state;
    const { requestingPasswordReset } = this.props;

    return (
      <View style={styles.center}>
        <Text style={styles.header}>Forgot Your Password?</Text>
        <Text style={styles.subHeader}>
          Enter your email and we'll send you a temporary password to reset it.
        </Text>
        <Form>
          <Item floatingLabel>
            <Label style={styles.inputLabel}>Email</Label>
            <Input
              keyboardType='email-address'
              onChangeText={(email) => this.setState({ email })}
              autoCapitalize='none'
              style={styles.input}
              value={email}
            />
          </Item>
          <ActionButton
            label='Send Email'
            size='large'
            type='light'
            block
            disabled={requestingPasswordReset}
            loading={requestingPasswordReset}
            style={styles.button}
            onPress={this._submitForm.bind(this)}
          />
          <ActionButton
            label='Cancel'
            size='large'
            disabled={requestingPasswordReset}
            loading={requestingPasswordReset}
            type='light'
            block
            hollow
            onPress={() => this.props.navigation.goBack()}
          />
        </Form>
        {/* Check your email for a link to reset your password! */}
      </View>
    );
  }

  _renderSuccess() {
    const { email } = this.state;

    return (
      <View style={styles.center}>
        <Text style={styles.header}>Check your email!</Text>
        <Text style={styles.subHeader}>
          We've sent an email to {email} if there's an account associated with
          that email.
        </Text>
        <ActionButton
          label='Return'
          size='large'
          type='light'
          block
          style={styles.button}
          onPress={() => this.props.navigation.goBack()}
        />
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
  requestingPasswordReset: state.userReducer.requestingPasswordReset,
}))(ForgotPasswordScreen);
