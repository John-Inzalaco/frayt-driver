import { Linking, Platform } from 'react-native';
import AndroidOpenSettings from 'react-native-android-open-settings';

export async function openSettings(
  catchMessage = 'Unable to open app settings',
) {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await AndroidOpenSettings.applicationSettings();
    }
  } catch (e) {
    console.warn(e);
    alert(catchMessage);
  }
}
