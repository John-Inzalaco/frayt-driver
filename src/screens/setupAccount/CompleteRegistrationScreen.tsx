import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, Image, StatusBar } from 'react-native';
import { Container, Text } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';
import { completeUserRegistration, signOutUser } from '@actions/userAction';
import { tryToNavigateToMain } from '@actions/appAction';
import { ScrollView } from 'react-native-gesture-handler';
import ActionButton from '@components/ui/ActionButton';

var { width } = Dimensions.get('window');

class CompleteRegistrationScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  async completeRegistration() {
    const { dispatch } = this.props;

    const completed = await dispatch(completeUserRegistration());

    if (completed) {
      dispatch(tryToNavigateToMain());
    }
  }

  async goBack() {
    const { navigation, dispatch } = this.props;
    if (navigation) {
      const parent = navigation.dangerouslyGetParent(),
        index = parent ? parent.state.index : 0;

      if (index > 0) {
        navigation.goBack();

        return true;
      }
    }

    dispatch(signOutUser());
    return false;
  }

  render() {
    const { completingUserRegistration } = this.props;

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
            <Text style={styles.header}>Let's get started!</Text>
            <Text style={styles.text}>
              Now let's check to make sure your device is ready.
            </Text>
            <ActionButton
              label='Finish'
              type='light'
              size='large'
              style={styles.button}
              loading={completingUserRegistration}
              disabled={completingUserRegistration}
              onPress={this.completeRegistration.bind(this)}
              block
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
  user: state.userReducer.user,
  completingUserRegistration: state.userReducer.completingUserRegistration,
}))(CompleteRegistrationScreen);
