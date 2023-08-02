import { createStackNavigator } from 'react-navigation-stack';

import LoginScreen from '@screens/auth/AuthScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ApprovalScreen from '@screens/auth/ApprovalScreen';
import DocumentsPreviewScreen from '@screens/account/DocumentsPreviewScreen';
import UploadDocumentScreen from '@screens/account/UploadDocumentScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@screens/auth/ResetPasswordScreen';

// Home / Splash Screen
const LoginStack = createStackNavigator({
  Login: LoginScreen,
  Register: RegisterScreen,
  Approval: ApprovalScreen,
  ForgotPassword: ForgotPasswordScreen,
  ResetPassword: ResetPasswordScreen,
  UpdateDocuments: DocumentsPreviewScreen,
  UploadDocument: UploadDocumentScreen,
});

LoginStack.navigationOptions = {
  tabBarLabel: 'Login',
  tabBarVisible: false,
  header: 'null',
};

export default LoginStack;
