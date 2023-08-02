import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from '@screens/HomeScreen';

// Home / Splash Screen
const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarVisible: false,
  header: 'null',
};

export default HomeStack;
