import * as Sentry from '@sentry/react-native';
import { Toast } from 'native-base';
import store from '@lib/store';
import { signOutUser } from '@actions/userAction';

type ErrorHandler = (error: {}) => void;
type ErrorActionList = Record<number, ErrorHandler>;

const defaultErrorMessages = {
  401: 'Your session has expired. Log in to continue.',
  500: 'There was an error on our part. Please try again later.',
};

const defaultErrorActions: ErrorActionList = {
  401: (error) => {
    store.dispatch(signOutUser());
  },
};

export default async function displayError(
  errorResponse,
  { actions = {}, messages = {}, awaitAction = true } = {},
  asAlert = false,
) {
  const errorMessages = { ...defaultErrorMessages, ...messages },
    errorActions: ErrorActionList = { ...defaultErrorActions, ...actions },
    error = { ...errorResponse };

  let message, action, statusCode;

  try {
    statusCode = error.response.status;
    if (error.response.data.error) {
      message = error.response.data.error.message;
    } else {
      message = error.response.data.message || error.response.data.body.message;
    }
  } catch (e) {
    if (error.code === 'ECONNABORTED') {
      message = 'Unable to connect to our servers.  Please try again later.';
    } else if (error.isAxiosError) {
      message =
        'There was an issue connecting to our servers.  Please try again.';
    } else if (error.isOfflineMode) {
      message = null;
    } else {
      message = 'There was an unspecified error that occurred.';

      console.warn(errorResponse, error);

      Sentry.captureException(errorResponse);
    }
    console.warn(errorResponse, error);
  }

  message = message || errorMessages[statusCode] || null;
  action = action || errorActions[statusCode] || null;

  if (action) {
    awaitAction ? await action(error) : action(error);
  }

  if (message) {
    if (asAlert) {
      alert(message);
    } else {
      Toast.toastInstance &&
        Toast.show({
          text: message,
          buttonText: 'Okay',
          duration: 5000,
        });
    }
  }
}
