import { createStackNavigator } from 'react-navigation-stack';

import AuthLoadingScreen from '@screens/auth/AuthLoadingScreen';

// Home / Splash Screen
const LoadingStack = createStackNavigator({
  Loading: AuthLoadingScreen,
});

LoadingStack.navigationOptions = {
  tabBarLabel: 'Login',
  tabBarVisible: false,
  header: 'null',
};

export default LoadingStack;
