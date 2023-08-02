import { Platform } from 'react-native';

import {
  GOOGLE_API_KEY as G_API_KEY,
  PRD_BASE_URL,
  LOCAL_BASE_URL_ANDROID,
  LOCAL_BASE_URL_IOS,
  PRD_ONESIGNAL_APP_ID,
  DEV_ONESIGNAL_APP_ID,
  DEV_STRIPE_PUBLISH_KEY,
  PRD_STRIPE_PUBLISH_KEY
} from '@env';

// IMPORTANT: Ensure all prod environment variable are included in create-env-file in ci.yml. Any missing variables will cause codepush updates to crash

const LOCAL_BASE_URL =
  Platform.OS === 'android' ? LOCAL_BASE_URL_ANDROID : LOCAL_BASE_URL_IOS;

export const GOOGLE_API_KEY = G_API_KEY;

export const BASE_URL = __DEV__ ? LOCAL_BASE_URL : PRD_BASE_URL;
export const ONESIGNAL_APP_ID = __DEV__
  ? DEV_ONESIGNAL_APP_ID
  : PRD_ONESIGNAL_APP_ID;

export const STRIPE_PUBLISH_KEY = __DEV__
  ? DEV_STRIPE_PUBLISH_KEY
  : PRD_STRIPE_PUBLISH_KEY;
