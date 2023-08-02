import { createStackNavigator } from 'react-navigation-stack';
import colors from '@constants/Colors';
import RouterScreen from '@screens/RouterScreen';
import UpdatePasswordScreen from '@screens/setupAccount/UpdatePasswordScreen';
import UpdateProfilePhotoScreen from '@screens/setupAccount/UpdateProfilePhotoScreen';
import UpdateCargoCapacityScreen from '@screens/setupAccount/UpdateCargoCapacityScreen';
import SetupWallet from '@screens/setupAccount/SetupWalletScreen';
import CompleteRegistrationScreen from '@screens/setupAccount/CompleteRegistrationScreen';
import WelcomeRegistrationScreen from '@screens/setupAccount/WelcomeRegistrationScreen';
import UpdateLoadUnloadScreen from '@screens/setupAccount/UpdateLoadUnloadScreen';
import UpdateAgreementsScreen from '@screens/setupAccount/UpdateAgreementsScreen';
import EditAddressScreen from '@screens/account/EditAddressScreen';
import SetupScreen from '@screens/auth/SetupScreen';
import EditPhoneScreen from '@screens/account/EditPhoneScreen';

const SetupAccountPrimaryStack = createStackNavigator(
  {
    Router: RouterScreen,
    WelcomeRegistration: WelcomeRegistrationScreen,
    UpdatePassword: UpdatePasswordScreen,
    UpdateProfilePhoto: UpdateProfilePhotoScreen,
    UpdateLoadUnload: UpdateLoadUnloadScreen,
    UpdateCargoCapacity: UpdateCargoCapacityScreen,
    SetupWallet: SetupWallet,
    UpdateAgreements: UpdateAgreementsScreen,
    CompleteRegistration: CompleteRegistrationScreen,
    Setup: SetupScreen,
  },
  {
    defaultNavigationOptions: {
      title: 'Onboarding',
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: colors.secondary,
        elevation: null,
      },
      headerBackTitle: 'Back',
      headerLeft: null,
    },
  },
);

// Home / Splash Screen
const SetupAccountStack = createStackNavigator(
  {
    SetupAccount: {
      screen: SetupAccountPrimaryStack,
    },
    EditAddress: EditAddressScreen,
    EditPhone: EditPhoneScreen,
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

export default SetupAccountStack;
