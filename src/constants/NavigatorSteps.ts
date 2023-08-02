type NavigatorStep = {
  screen: string;
};

export enum NavigatorStepEnum {
  Registration = 'Registration',
  Preapproval = 'Preapproval',
}

export const registrationSteps: NavigatorStep[] = [
  {
    screen: 'UpdatePassword',
  },
  {
    screen: 'UpdateProfilePhoto',
  },
  {
    screen: 'UpdateLoadUnload',
  },
  {
    screen: 'SetupWallet',
  },
];

export const preapprovalSteps: NavigatorStep[] = [
  { screen: 'QuestionnaireScreen' },
  { screen: 'InfoScreen' },
  { screen: 'PersonalScreen' },
  { screen: 'VehicleScreen' },
  { screen: 'VehiclePhotosScreen' },
  { screen: 'PayoutsScreen' },
  { screen: 'BackgroundCheckScreen' },
  { screen: 'DatScreen' },
];

export const navigatorSteps = {
  Registration: registrationSteps,
  Preapproval: preapprovalSteps,
};
