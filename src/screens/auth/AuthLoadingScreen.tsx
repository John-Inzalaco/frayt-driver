import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Root, Container, Text } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';
import { tryToNavigateToMain } from '@actions/appAction';

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.checkForNavigation();
  }

  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  componentDidUpdate() {
    this.checkForNavigation();
  }

  // Fetch the token from storage then navigate to our appropriate place
  async checkForNavigation() {
    const { navigation, appLoaded, isUserSignedIn, dispatch } = this.props;

    if (appLoaded) {
      if (isUserSignedIn) {
        dispatch(tryToNavigateToMain());
      } else {
        navigation.navigate('Auth');
      }
    }
  }

  // Render any loading content that you like here
  render() {
    return (
      <Container style={styles.container}>
        <View>
          <ActivityIndicator />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  text: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginTop: 200,
  },
});

export default connect((state) => ({
  isUserSignedIn: state.userReducer.isUserSignedIn,
  appLoaded: state.appReducer.appLoaded,
}))(AuthLoadingScreen);
