import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import TabBarIcon from '@components/TabBarIcon';
import HomeScreen from '@screens/HomeScreen';
import LoginScreen from '@screens/auth/AuthScreen';
import DriveScreen from '@screens/matches/DriveScreen';
import MatchesScreen from '@screens/matches/MatchesScreen';
import MyMatchesScreen from '@screens/matches/MyMatchesScreen';
import MatchScreen from '@screens/matches/MatchScreen';
import AccountScreen from '@screens/account/AccountScreen';
import EditAccountScreen from '@screens/account/EditAccountScreen';
import EditVehicleScreen from '@screens/account/EditVehicleScreen';
import EditSchedulesScreen from '@screens/account/EditSchedulesScreen';
import colors from '@constants/Colors';
import withOverlays from '@components/ui/AppOverlays';
import MatchSignatureScreen from '@screens/matches/MatchSignatureScreen';
import ScanBarcodesScreen from '@screens/matches/ScanBarcodesScreen';
import MatchCancelScreen from '@screens/matches/MatchCancelScreen';
import MatchUnablePickupScreen from '@screens/matches/MatchUnablePickupScreen';
import MatchEnRouteScreen from '@screens/matches/MatchEnRouteScreen';
import SupportScreen from '@screens/help/SupportScreen';
import PaymentsScreen from '@screens/account/PaymentsScreen';
import NotificationsScreen from '@screens/account/NotificationsScreen';
import EditPasswordScreen from '@screens/account/EditPasswordScreen';
import UpdateProfilePhotoScreen from '@screens/setupAccount/UpdateProfilePhotoScreen';
import ScheduleScreen from '@screens/account/ScheduleScreen';
import ChatButton from '@components/ChatButton';
import UndeliverableStopScreen from '@screens/matches/UndeliverableStopScreen';
import DocumentsPreviewScreen from '@screens/account/DocumentsPreviewScreen';
import UploadDocumentScreen from '@screens/account/UploadDocumentScreen';

const defaultNavigationOptions = {
  headerTintColor: colors.primaryText,
  headerStyle: {
    backgroundColor: colors.headerBackground,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerRight: () => <ChatButton />,
  // This centers the header on Android
  // But it's off-center when the back-button renders
  /* headerTitleStyle: {
    alignSelf: 'center',
    textAlign: 'center',
    flexGrow: 1,
  }, */
};

// Home / Splash Screen
const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarVisible: false,
  header: 'null',
};

// Login
const LoginStack = createStackNavigator({
  Login: LoginScreen,
});

LoginStack.navigationOptions = {
  tabBarLabel: 'Login',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-person${focused ? '' : '-outline'}`
          : 'md-person'
      }
    />
  ),
};

// Drive
const DriveStack = createStackNavigator(
  {
    Drive: withOverlays(DriveScreen),
    Matches: {
      screen: withOverlays(MatchesScreen),
      navigationOptions: () => ({
        title: 'Available Matches',
      }),
    },
    Match: {
      screen: withOverlays(MatchScreen),
      navigationOptions: () => ({
        title: 'Available Match',
      }),
    },
  },
  {
    defaultNavigationOptions: {
      ...defaultNavigationOptions,
      title: 'Drive',
    },
    navigationOptions: {
      tabBarLabel: 'Drive',
      tabBarIcon: ({ focused }) => (
        <TabBarIcon focused={focused} name={'md-speedometer'} />
      ),
    },
  },
);

const SubMatchesStack = createStackNavigator(
  {
    MyMatches: withOverlays(MyMatchesScreen),
    MyMatch: {
      screen: withOverlays(MatchScreen),
    },
  },
  {
    defaultNavigationOptions,
  },
);

// Matches
const MatchesStack = createStackNavigator(
  {
    Matches: {
      screen: SubMatchesStack,
    },
    MatchSignature: {
      screen: MatchSignatureScreen,
    },
    MatchEnRoute: {
      screen: MatchEnRouteScreen,
    },
    MatchCancel: {
      screen: MatchCancelScreen,
    },
    MatchUnablePickup: {
      screen: MatchUnablePickupScreen,
    },
    UndeliverableStop: {
      screen: UndeliverableStopScreen,
    },
    ScanBarcodes: {
      screen: ScanBarcodesScreen,
    },
  },
  {
    mode: 'modal',
    headerMode: 'none',
    navigationOptions: ({ navigation }) => {
      const fullScreens = [
        'MatchCancel',
        'MatchUnablePickup',
        'MatchSignature',
        'MatchEnRoute',
        'ScanBarcodes',
        'UndeliverableStop',
      ];
      let tabBarVisible = true;

      if (navigation.state.routes.length > 1) {
        navigation.state.routes.map((route) => {
          if (fullScreens.includes(route.routeName)) {
            tabBarVisible = false;
          }
        });
      }

      return {
        tabBarVisible,
        tabBarLabel: 'Matches',
        tabBarIcon: ({ focused }) => (
          <TabBarIcon
            focused={focused}
            name={Platform.OS === 'ios' ? `ios-list-sharp` : 'md-list-sharp'}
          />
        ),
      };
    },
  },
);

// Account
const AccountStack = createStackNavigator(
  {
    Account: withOverlays(AccountScreen),
    EditAccount: {
      screen: withOverlays(EditAccountScreen),
      navigationOptions: {
        title: 'Edit Account',
      },
    },
    EditProfile: {
      screen: withOverlays(UpdateProfilePhotoScreen),
      navigationOptions: {
        title: 'Update Profile Picture',
      },
    },
    EditPassword: {
      screen: withOverlays(EditPasswordScreen),
      navigationOptions: {
        title: 'Change Password',
      },
    },
    EditVehicle: {
      screen: withOverlays(EditVehicleScreen),
      navigationOptions: {
        title: 'Edit Cargo Capacity',
      },
    },
    EditSchedules: {
      screen: withOverlays(EditSchedulesScreen),
      navigationOptions: {
        title: 'Edit Schedules',
      },
    },
    DocumentsPreview: {
      screen: withOverlays(DocumentsPreviewScreen),
      navigationOptions: {
        title: 'Documents',
      },
    },
    UploadDocument: {
      screen: withOverlays(UploadDocumentScreen),
      navigationOptions: {
        title: 'Upload Replacement',
      },
    },
    Schedule: {
      screen: withOverlays(ScheduleScreen),
      navigationOptions: {
        title: 'Schedule',
      },
    },
    Payments: {
      screen: withOverlays(PaymentsScreen),
      navigationOptions: {
        title: 'Payment History',
      },
    },
    EditNotifications: {
      screen: withOverlays(NotificationsScreen),
      navigationOptions: {
        title: 'Notifications',
      },
    },
  },
  {
    defaultNavigationOptions: {
      ...defaultNavigationOptions,
      title: 'Account',
    },
    navigationOptions: {
      tabBarLabel: 'Account',
      tabBarIcon: ({ focused }) => (
        <TabBarIcon focused={focused} name={'md-person'} />
      ),
    },
  },
);

const SubSupportStack = createStackNavigator(
  {
    Help: withOverlays(SupportScreen),
  },
  {
    defaultNavigationOptions: {
      ...defaultNavigationOptions,
      title: 'Help',
    },
  },
);

const SupportStack = createStackNavigator(
  {
    Help: {
      screen: SubSupportStack,
    },
  },
  {
    mode: 'modal',
    transparentCard: true,
    headerMode: 'none',
    defaultNavigationOptions: {
      ...defaultNavigationOptions,
      gestureResponseDistance: { vertical: 200, horizontal: 0 },
      title: 'Help',
    },
    navigationOptions: ({ navigation }) => {
      const fullScreens: any[] = [];
      let tabBarVisible = true;

      if (navigation.state.routes.length > 0) {
        navigation.state.routes.map((route) => {
          if (fullScreens.includes(route.routeName)) {
            tabBarVisible = false;
          }
        });
      }

      return {
        tabBarVisible,
        tabBarLabel: 'Help',
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} name='md-help-circle' />
        ),
      };
    },
  },
);

// Tab Navigation
const navigator =
  Platform.OS === 'android'
    ? createMaterialBottomTabNavigator(
        {
          DriveStack,
          MatchesStack,
          AccountStack,
          SupportStack,
        },
        {
          activeColor: colors.tabIconSelected,
          inactiveColor: colors.gray,
          shifting: false,
          barStyle: { backgroundColor: colors.background },
        },
      )
    : createBottomTabNavigator({
        DriveStack,
        MatchesStack,
        AccountStack,
        SupportStack,
      });

export default navigator;
