import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { Container, Form, Text, Item, Label, Input } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { setUserPassword } from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { getNextSetupScreen } from '@actions/appAction';
import { RootState } from '@reducers/index';
import { NavigationScreenProp } from 'react-navigation';
import { PasswordRequirements } from '@components/ui/PasswordRequirements';

var { width } = Dimensions.get('window');

type Props = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

type State = {
  password: string;
  confirm_password: string;
};

class UpdatePasswordScreen extends Component<Props, State> {
  state = {
    password: '',
    confirm_password: '',
  };

  componentDidMount() {
    this.updateFooter();
  }

  componentDidUpdate() {
    this.updateFooter();
  }

  updateFooter() {
    const { password, confirm_password } = this.state;
    const { updatingUserPassword, navigation } = this.props;
    const disabled =
      !password || password !== confirm_password || updatingUserPassword;

    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={this.updatePassword.bind(this)}
        loading={updatingUserPassword}
        disabled={disabled}
        navigation={navigation}
      />,
      { navigation },
    );
  }

  async updatePassword() {
    const { confirm_password, password } = this.state;
    const { dispatch, navigation } = this.props;

    const didReset = await dispatch<any>(
      setUserPassword(password, confirm_password),
    );

    if (didReset) {
      await this.setState({
        password: '',
        confirm_password: '',
      });

      navigation.replace(dispatch<any>(getNextSetupScreen()));
    }
  }

  render() {
    const { password, confirm_password } = this.state;

    return (
      <Container>
        <StatusBar barStyle='light-content' />
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          <View style={styles.center}>
            <Text style={styles.header}>Update Password</Text>
            <Form>
              <Item floatingLabel>
                <Label style={styles.inputLabel}>New Password</Label>
                <Input
                  secureTextEntry={true}
                  onChangeText={(password) => this.setState({ password })}
                  autoCapitalize='none'
                  style={styles.input}
                  value={password}
                />
              </Item>
              <Item floatingLabel last>
                <Label style={styles.inputLabel}>Confirm New Password</Label>
                <Input
                  secureTextEntry={true}
                  onChangeText={(confirm_password) =>
                    this.setState({ confirm_password })
                  }
                  autoCapitalize='none'
                  style={styles.input}
                  value={confirm_password}
                />
              </Item>
            </Form>
            <PasswordRequirements />
          </View>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 20,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
  },
  inputLabel: {
    color: colors.gray,
  },
  input: {
    color: colors.text,
  },
  button: {
    marginTop: 20,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserPassword: userReducer.updatingUserPassword,
}));

export default connector(UpdatePasswordScreen);
