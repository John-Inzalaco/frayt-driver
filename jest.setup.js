import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 4
  }
})