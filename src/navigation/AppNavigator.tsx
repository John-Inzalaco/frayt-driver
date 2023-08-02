import { createSwitchNavigator } from 'react-navigation';

import SplashNavigator from './SplashNavigator';
import AuthLoadingNavigator from './AuthLoadingNavigator';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import SetupAccountNavigator from './SetupAccountNavigator';
import PopupNavigator from './PopupNavigator';
import ApplyNavigator from './ApplyNavigator';

export default createSwitchNavigator(
  {
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Intro: SplashNavigator,
    AuthLoading: AuthLoadingNavigator,
    Main: MainTabNavigator,
    Auth: AuthNavigator,
    SetupAccount: SetupAccountNavigator,
    Popup: PopupNavigator,
    Apply: ApplyNavigator,
  },
  {
    initialRouteName: 'AuthLoading',
  },
);
