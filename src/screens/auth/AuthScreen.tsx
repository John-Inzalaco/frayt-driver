import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Linking,
  Platform,
} from 'react-native';
import { Container, Form, Text, Item, Label, Input } from 'native-base';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';
import { signInUser } from '@actions/userAction';
import { connect } from 'react-redux';
import SafariView from 'react-native-safari-view';
import AppVersion from '@components/ui/AppVersion';
import { NavigationActions } from 'react-navigation';

var { width } = Dimensions.get('window');

class AuthScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: null,
      password: null,
    };
  }

  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  render() {
    const { navigation, signingInUser, offlineMode } = this.props;
    return (
      <Container>
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          <View style={styles.center}>
            <Image
              source={require('../../assets/images/frayt-badge.png')}
              style={{
                width: 135,
                height: 160,
                marginBottom: 30,
                alignSelf: 'center',
              }}
            />
            <Text style={styles.header}>Login</Text>
            <Form>
              <Item floatingLabel>
                <Label style={styles.inputLabel}>Email</Label>
                <Input
                  keyboardType='email-address'
                  onChangeText={(email) => this.setState({ email })}
                  autoCapitalize='none'
                  style={styles.input}
                />
              </Item>
              <Item floatingLabel last>
                <Label style={styles.inputLabel}>Password</Label>
                <Input
                  keyboardType='default'
                  secureTextEntry={true}
                  onChangeText={(password) => this.setState({ password })}
                  style={styles.input}
                />
              </Item>
              {offlineMode && (
                <Text style={styles.text}>
                  Your device does not have a network connection. To login
                  connect to Wi-Fi or a cellular network.
                </Text>
              )}
              <ActionButton
                label='Login'
                size='large'
                type='light'
                block
                onPress={this.signIn.bind(this)}
                disabled={signingInUser || offlineMode}
                loading={signingInUser}
                style={styles.button}
              />
              <ActionButton
                label='Forgot Your Password?'
                size='large'
                disabled={signingInUser || offlineMode}
                type='light'
                block
                hollow
                onPress={() =>
                  navigation.navigate('ForgotPassword', {
                    email: this.state.email,
                  })
                }
              />
              <ActionButton
                label='Apply'
                size='large'
                disabled={signingInUser || offlineMode}
                type='light'
                block
                hollow
                onPress={() => {
                  navigation.navigate(
                    'Apply',
                    {},
                    NavigationActions.navigate({
                      routeName: 'Info',
                    }),
                  );
                }}
              />
            </Form>
          </View>
          <AppVersion style={styles.versionText} />
        </KeyboardAvoidingView>
      </Container>
    );
  }

  async applyOnline() {
    if (Platform.OS !== 'ios') {
      Linking.openURL('https://frayt.com/apply');
      return;
    }
    SafariView.isAvailable()
      .then(
        SafariView.show({
          url: 'https://frayt.com/apply',
        }),
      )
      .catch((error) => {
        Linking.openURL('https://frayt.com/apply');
      });
  }

  async signIn() {
    const { dispatch } = this.props;
    const { email, password } = this.state;

    dispatch(signInUser(email.trim(), password));
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
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
    color: 'white',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    marginTop: 24,
  },
  inputLabel: {
    color: colors.white,
  },
  input: {
    color: colors.white,
  },
  button: {
    marginTop: 20,
  },
  buttonText: {
    color: 'black',
  },
  applyText: {
    marginTop: 12,
    color: colors.white,
    textAlign: 'center',
  },
  versionText: {
    color: colors.white,
    textAlign: 'center',
    position: 'absolute',
    fontSize: 14,
    bottom: 12,
  },
  applyLink: {
    color: colors.offWhite,
    fontWeight: '800',
  },
});

export default connect((state) => ({
  isUserSignedIn: state.userReducer.isUserSignedIn,
  signingInUser: state.userReducer.signingInUser,
  offlineMode: state.appReducer.offlineMode,
}))(AuthScreen);
