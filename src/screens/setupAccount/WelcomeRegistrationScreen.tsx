import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, Image, StatusBar } from 'react-native';
import { Container, Text } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';
import { signOutUser } from '@actions/userAction';
import { ScrollView } from 'react-native-gesture-handler';
import ActionButton from '@components/ui/ActionButton';
import { getNextSetupScreen } from '@actions/appAction';

var { width } = Dimensions.get('window');

class WelcomeRegistrationScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  async navigateToPassword() {
    const { navigation, dispatch } = this.props;

    const nextScreen = dispatch(getNextSetupScreen());
    const navigateTo =
      nextScreen === 'WelcomeRegistration' ? 'UpdatePassword' : nextScreen;

    navigation.navigate(navigateTo);
  }

  async signOut() {
    const { dispatch } = this.props;

    dispatch(signOutUser());
    return false;
  }

  render() {
    const { signingOutUser } = this.props;

    return (
      <Container>
        <StatusBar barStyle='light-content' />
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.wrapper}>
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
            <Text style={styles.header}>Welcome!</Text>
            <Text style={styles.text}>
              We see it’s your first time logging into the new Driver app.
              Whether you are a new driver or are just switching over from the
              old app, please take a few moments to get your account setup.
              It’ll only take you a few minutes.
            </Text>
            <ActionButton
              label='Get Started'
              type='light'
              size='large'
              style={styles.button}
              disabled={signingOutUser}
              onPress={this.navigateToPassword.bind(this)}
              block
            />
            <ActionButton
              label='Cancel'
              type='light'
              size='large'
              style={styles.button}
              disabled={signingOutUser}
              loading={signingOutUser}
              onPress={this.signOut.bind(this)}
              block
              hollow
            />
          </View>
        </ScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 30,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.secondaryText,
    marginBottom: 16,
  },
  text: {
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginVertical: 12,
  },
});

export default connect((state) => ({
  signingOutUser: state.userReducer.signingOutUser,
}))(WelcomeRegistrationScreen);
