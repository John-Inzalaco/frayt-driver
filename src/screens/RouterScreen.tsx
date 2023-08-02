import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Container } from 'native-base';

import colors from '@constants/Colors';
import { NavigationActions } from 'react-navigation';

export default class RouterScreen extends Component {
  static navigationOptions = {
    title: 'Loading',
  };

  componentDidMount() {
    this.attemptNavigation();
  }

  componentDidUpdate(prevProps) {
    const { navigation } = this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (
      params &&
      (!prevParams || prevParams.navigateTo !== params.navigateTo)
    ) {
      this.attemptNavigation();
    }
  }

  async attemptNavigation() {
    const { navigation } = this.props,
      parent = navigation.dangerouslyGetParent(),
      params = parent ? parent.state.params : null;

    if (params && params.navigateTo) {
      navigation.replace(params.navigateTo, params.params);
    }
  }

  render() {
    return <Container style={styles.container} />;
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    width: '100%',
    height: '100%',
    flex: 1,
  },
});
