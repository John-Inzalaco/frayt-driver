import { createStackNavigator } from 'react-navigation-stack';
import EditAddressScreen from '@screens/account/EditAddressScreen';
import EditPhoneScreen from '@screens/account/EditPhoneScreen';
import RouterScreen from '@screens/RouterScreen';

// Matches
const PopupNavigator = createStackNavigator(
  {
    Router: RouterScreen,
    EditUserAddress: {
      screen: EditAddressScreen,
    },
    EditUserPhone: {
      screen: EditPhoneScreen,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
  },
);

export default PopupNavigator;
