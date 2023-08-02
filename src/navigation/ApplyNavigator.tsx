import { createStackNavigator } from 'react-navigation-stack';
import InfoScreen from '@screens/application/InfoScreen';
import QuestionnaireScreen from '@screens/application/QuestionnaireScreen';
import VehicleScreen from '@screens/application/VehicleScreen';
import DatScreen from '@screens/application/DatScreen';
import BackgroundCheckScreen from '@screens/application/BackgroundCheckScreen';
import VerifyIdentityScreen from '@screens/application/VerifyIdentityScreen';
import PersonalScreen from '@screens/application/PersonalScreen';
import PayoutsScreen from '@screens/application/PayoutsScreen';
import VehiclePhotosScreen from '@screens/application/VehiclePhotosScreen';
import ApplicationCompleteScreen from '@screens/application/ApplicationCompleteScreen';
import CreateAccountScreen from '@screens/application/CreateAccountScreen';

export enum ApplySteps {
  Info = 0,
  Questionnaire = 1,
  CreateAccount = 2,
  Personal = 3,
  VerifyIdentity = 4,
  Payouts = 5,
  Vehicle = 6,
  VehiclePhotos = 7,
  BackgroundCheck = 8,
  Dat = 9,
  ApplicationComplete = 10,
}

export default createStackNavigator(
  {
    Info: InfoScreen,
    Questionnaire: QuestionnaireScreen,
    CreateAccount: CreateAccountScreen,
    Personal: PersonalScreen,
    VerifyIdentity: VerifyIdentityScreen,
    Payouts: PayoutsScreen,
    Vehicle: VehicleScreen,
    VehiclePhotos: VehiclePhotosScreen,
    BackgroundCheck: BackgroundCheckScreen,
    Dat: DatScreen,
    ApplicationComplete: ApplicationCompleteScreen,
  },
  {
    defaultNavigationOptions: {
      title: 'Application',
      headerTintColor: 'white',
      headerStyle: {
        backgroundColor: '#151A30',
        elevation: null,
      },
      headerBackTitle: 'Back',
      headerLeft: null,
    },
  },
);
