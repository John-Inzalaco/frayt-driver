import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Root, StyleProvider } from 'native-base';

import AppRoot from '@src/AppRoot';
import store from '@src/lib/store';
import getTheme from '@src/native-base-theme/components';
import commonColor from '@src/native-base-theme/variables/commonColor';

import * as Sentry from '@sentry/react-native';

import * as Font from 'expo-font';
import { StyleSheet } from 'react-native';
import { Toast } from 'native-base';
import codePush from 'react-native-code-push';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

StyleSheet.setStyleAttributePreprocessor('fontFamily', Font.processFontFamily);

Sentry.init({
  dsn: 'https://fd324ad5c06f416bb02ab7dd52e86800@sentry.io/1777326',
  environment: __DEV__ ? 'develop' : 'production',
});

type AppProps = {
  skipLoadingScreen: boolean;
};

class App extends Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
  }

  componentWillUnmount() {
    // Should fix toast error. See https://github.com/GeekyAnts/NativeBase/issues/1790 for details.
    if (Toast.toastInstance != null && Toast.toastInstance.root != null) {
      Toast.hide();
    }
  }

  render() {
    return (
      <Root>
        <Provider store={store}>
          <StyleProvider style={getTheme(commonColor)}>
            <ActionSheetProvider>
              <AppRoot skipLoadingScreen={this.props.skipLoadingScreen} />
            </ActionSheetProvider>
          </StyleProvider>
        </Provider>
      </Root>
    );
  }
}

export default codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
})(App);
