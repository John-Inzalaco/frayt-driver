import userTypes from '@actions/types/userTypes';
import { authorizedRequest, unauthorizedRequest } from '@lib/Request';
import AsyncStorage from '@react-native-community/async-storage';
import displayError from '@lib/displayError';
import NavigationService from '@lib/NavigationService';
import User, { DocumentType } from '@models/User';
import { checkForSetupScreens, tryToNavigateToMain } from '@actions/appAction';
import {
  getLiveMatches,
  getCompletedMatches,
  getAvailableMatches,
} from '@actions/matchAction';
import Match from '@models/Match';
import { throwStripeProfileErrors } from '@actions/helpers/userActionHelpers';

import * as Sentry from '@sentry/react-native';
import { updateCurrentLocation } from '@lib/location';
import { AppThunkAction, ThunkActionBoolean } from '@lib/store';
import decode from 'jwt-decode';
import matchTypes from '@actions/types/matchTypes';
import Intercom from 'react-native-intercom';
import { Toast } from 'native-base';
import { Dispatch } from 'redux';
import { Image } from 'react-native-image-crop-picker';
import DeviceInfo from 'react-native-device-info';
import { getRevision } from '@lib/helpers';
import { DeviceState } from 'react-native-onesignal';

export function updateOneSignalId(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    const delay = 1 * 60 * 1000;
    const retry = async () => {
      if (!(await dispatch(updateOneSignalId()))) {
        setTimeout(retry, delay);
      }
    };

    dispatch({
      type: userTypes.UPDATING_ONE_SIGNAL,
    });

    try {
      const { oneSignalId } = getState().userReducer;

      if (oneSignalId) {
        const payload = {
          device_uuid: DeviceInfo.getUniqueId(),
          device_model: DeviceInfo.getDeviceId(),
          player_id: oneSignalId,
          os: DeviceInfo.getSystemName(),
          os_version: DeviceInfo.getSystemVersion(),
          is_tablet: DeviceInfo.isTablet(),
          is_location_enabled: await DeviceInfo.isLocationEnabled(),
          app_version: DeviceInfo.getVersion(),
          app_revision: await getRevision(),
          app_build_number: DeviceInfo.getBuildNumber(),
        };

        const http = await authorizedRequest();
        const response = await http.post('driver/devices', { device: payload });

        await dispatch({
          type: userTypes.UPDATING_ONE_SIGNAL_SUCCESS,
          device: response.data.response,
        });

        return true;
      } else {
        setTimeout(retry, delay);
        return false;
      }
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_ONE_SIGNAL_ERROR,
      });

      try {
        setTimeout(retry, delay);
      } catch (e) { }

      return false;
    }
  };
}

export function saveOneSignalId(device: DeviceState): AppThunkAction {
  return async (dispatch) => {
    Intercom.sendTokenToIntercom(device.userId);
    dispatch({
      type: userTypes.SAVE_ONE_SIGNAL_ID,
      playerId: device.userId,
    });
  };
}

export function setUserPassword(
  password: string,
  password_confirmation: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_PASSWORD,
    });

    try {
      const http = await authorizedRequest();
      await http.put('driver', {
        password,
        password_confirmation,
      });

      await dispatch({
        type: userTypes.UPDATING_USER_PASSWORD_SUCCESS,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_USER_PASSWORD_ERROR,
      });

      return false;
    }
  };
}

export function updateUserPassword(
  current_password: string,
  password: string,
  password_confirmation: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_PASSWORD,
    });

    try {
      const http = await authorizedRequest();
      await http.put('driver', {
        current_password,
        password,
        password_confirmation,
      });

      await dispatch({
        type: userTypes.UPDATING_USER_PASSWORD_SUCCESS,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_USER_PASSWORD_ERROR,
      });

      return false;
    }
  };
}

export function updateUserDocument(
  img: Image,
  expiration_date: Date | null,
  type: DocumentType,
) {
  return async (dispatch: Dispatch, getState) => {
    const { user } = getState().userReducer;
    dispatch({ type: userTypes.UPDATING_USER_DOCUMENT });

    try {
      const http = await authorizedRequest();
      await http.put(`drivers/${user.id}/photo`, {
        photo: { document: img.data, type, expiration_date },
      });

      dispatch({
        type: userTypes.UPDATING_USER_DOCUMENT_SUCCESS,
      });

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.UPDATING_USER_DOCUMENT_ERROR,
      });

      return false;
    }
  };
}

export function updateUserProfilePhoto(photo) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_PROFILE_PHOTO,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', {
        profile_photo: photo.data,
      });
      const { profile_image } = request.data.response;

      await dispatch({
        type: userTypes.UPDATING_USER_PROFILE_PHOTO_SUCCESS,
        profile_image,
      });

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.UPDATING_USER_PROFILE_PHOTO_ERROR,
      });

      return false;
    }
  };
}

export function updateUserLoadUnload(can_load) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_LOAD_UNLOAD,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', {
        can_load,
      });

      await dispatch({
        type: userTypes.UPDATING_USER_LOAD_UNLOAD_SUCCESS,
        can_load: can_load,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_USER_LOAD_UNLOAD_ERROR,
      });

      return false;
    }
  };
}

export function updateUserCargoCapacity(measurements) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_CARGO_CAPACITY,
    });

    try {
      const { user } = getState().userReducer;

      const http = await authorizedRequest();
      const request = await http.put(`driver/vehicles/${user.vehicle?.id}`, {
        ...measurements,
      });

      await dispatch({
        type: userTypes.UPDATING_USER_CARGO_CAPACITY_SUCCESS,
        capacityMeasurements: measurements,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_USER_CARGO_CAPACITY_ERROR,
      });

      return false;
    }
  };
}

export function updateAgreements(agreements: string[]): ThunkActionBoolean {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: userTypes.UPDATING_AGREEMENTS,
      });

      const http = await authorizedRequest();
      const request = await http.post('agreement_documents/driver', {
        agreements: agreements.map((agreement) => ({
          document_id: agreement,
          agreed: true,
        })),
      });

      const { agreement_documents } = request.data;

      await dispatch({
        type: userTypes.UPDATING_AGREEMENTS_SUCCESS,
        pending_agreements: agreement_documents,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_AGREEMENTS_ERROR,
      });

      return false;
    }
  };
}

export function createUserPaymentInfo(
  ssn: string | null,
  agree_to_tos: boolean,
  handleErrors: boolean = false,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_PAYMENT_INFO,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', { ssn, agree_to_tos });

      const { wallet_state } = request.data.response;
      await dispatch({
        type: userTypes.UPDATING_USER_PAYMENT_INFO_SUCCESS,
        wallet_state,
      });

      return true;
    } catch (e) {
      displayError(e);

      const error = { ...e };
      throwStripeProfileErrors(error.request, handleErrors);

      await dispatch({
        type: userTypes.UPDATING_USER_PAYMENT_INFO_ERROR,
      });

      return false;
    }
  };
}

export function dismissUserCargoCapacity() {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.DISMISSING_USER_CARGO_CAPACITY,
    });

    try {
      const { user } = getState().userReducer;
      const http = await authorizedRequest();
      const request = await http.patch(
        `driver/vehicles/${user.vehicle?.id}/dismiss_capacity`,
      );
      const { capacity_dismissed_at } = request.data.response;

      await dispatch({
        type: userTypes.DISMISSING_USER_CARGO_CAPACITY_SUCCESS,
        capacity_dismissed_at,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.DISMISSING_USER_CARGO_CAPACITY_ERROR,
      });

      return false;
    }
  };
}

export function completeUserRegistration() {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.COMPLETING_USER_REGISTRATION,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', { state: 'registered' });
      const { state } = request.data.response;

      await dispatch({
        type: userTypes.COMPLETING_USER_REGISTRATION_SUCCESS,
        state,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.COMPLETING_USER_REGISTRATION_ERROR,
      });

      return false;
    }
  };
}

export function finishUserApplication(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FINISHING_USER_APPLICATION,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', { state: 'pending_approval' });
      const { state } = request.data.response;

      await dispatch({
        type: userTypes.FINISHING_USER_APPLICATION_SUCCESS,
        state,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.FINISHING_USER_APPLICATION_ERROR,
      });

      return false;
    }
  };
}

export function getUser(checkForSetup = true): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FETCHING_USER,
    });

    try {
      const { isUserSignedIn, userId } = getState().userReducer;

      if (isUserSignedIn) {
        const http = await authorizedRequest(),
          request = await http.get('driver'),
          { response: userData } = request.data,
          user = User.new(userData);

        await dispatch({
          type: userTypes.FETCHING_USER_SUCCESS,
          user,
        });

        const { email, first_name, last_name, phone_number, id } = user;

        Intercom.registerIdentifiedUser({ userId: id });
        Intercom.updateUser({
          email,
          name: `${first_name} ${last_name}`,
          phone: phone_number,
          custom_attributes: {
            contact_type: 'driver',
          },
        });

        if (checkForSetup) {
          dispatch(checkForSetupScreens());
        }

        return true;
      } else {
        await dispatch(signOutUser());
        return false;
      }
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.FETCHING_USER_ERROR,
      });

      return false;
    }
  };
}

export function signOutUser(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.SIGNING_OUT_USER,
    });

    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('sessionToken');
      await AsyncStorage.removeItem('sessionExpiry');
      await Match.delete();
      Intercom.logout();

      NavigationService.navigate('Login');

      await dispatch({
        type: userTypes.SIGNING_OUT_USER_SUCCESS,
      });

      await dispatch({
        type: matchTypes.CLEAR_MATCHES,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.SIGNING_OUT_USER_ERROR,
      });

      await dispatch({
        type: matchTypes.CLEAR_MATCHES,
      });

      return false;
    }
  };
}

export function signInUser(email, password) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.SIGNING_IN_USER,
    });

    try {
      const http = await unauthorizedRequest();
      const request = await http.post('sessions/drivers', {
        email: email,
        password: password,
      });

      const { token, driver: userData } = request.data.response;
      const { sub: user_id, exp: expires } = decode(token);
      const user = User.new(userData);

      Sentry.addBreadcrumb({
        category: 'auth',
        message: `Manually logged in: ${user.first_name} ${user.last_name}, id: ${user_id}`,
        level: Sentry.Severity.Info,
      });

      await AsyncStorage.setItem('userId', user_id);
      await AsyncStorage.setItem('sessionToken', token);
      await AsyncStorage.setItem('sessionExpiry', String(expires));
      await AsyncStorage.setItem('user', JSON.stringify(user));

      await dispatch({
        type: userTypes.SIGNING_IN_USER_SUCCESS,
        user,
        userId: user_id,
        sessionToken: token,
        email: email,
        sessionExpiry: String(expires),
      });

      const { isUserSignedIn } = getState().userReducer;
      dispatch(tryToNavigateToMain(email, password));

      if (isUserSignedIn) {
        dispatch(tryToNavigateToMain(email, password));
        dispatch(updateOneSignalId());
        if (['registered', 'approved'].includes(user.state)) {
          updateCurrentLocation().then(() => {
            dispatch(getLiveMatches());
            dispatch(getCompletedMatches());
            dispatch(getUser());
            dispatch(getAvailableMatches());
          });
        }
        dispatch(getReport());
      }

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.SIGNING_IN_USER_ERROR,
      });

      return false;
    }
  };
}

export function registerUser(email, code) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.REGISTERING_USER,
    });

    try {
      const http = await unauthorizedRequest();
      const request = await http.post('sessions/drivers', {
        email,
        code,
      });
      const { token, driver: userData } = request.data.response;
      const { sub: user_id, exp: expires } = decode(token);
      const user = User.new(userData);

      await AsyncStorage.setItem('userId', user_id);
      await AsyncStorage.setItem('sessionToken', token);
      await AsyncStorage.setItem('sessionExpiry', String(expires));
      await AsyncStorage.setItem('user', JSON.stringify(user));

      await dispatch({
        type: userTypes.REGISTERING_USER_SUCCESS,
        user,
        userId: user_id,
        sessionToken: token,
        sessionExpiry: String(expires),
      });

      dispatch(tryToNavigateToMain());
      dispatch(updateOneSignalId());

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.REGISTERING_USER_ERROR,
      });

      return false;
    }
  };
}

// TODO: email/code is just filler
// may need a new endpoint for this, investigation needed
export function createUnapprovedUser(userInfo) {
  return async (dispatch, _getState) => {
    dispatch({
      type: userTypes.CREATING_UNAPPROVED_USER,
    });

    try {
      const http = await unauthorizedRequest();
      const request = await http.post('drivers', userInfo);
      const { token, driver: userData } = request.data.response;
      const { sub: user_id, exp: expires } = decode(token);
      const user = User.new(userData);

      await AsyncStorage.setItem('userId', user_id);
      await AsyncStorage.setItem('sessionToken', token);
      await AsyncStorage.setItem('sessionExpiry', String(expires));
      await AsyncStorage.setItem('user', JSON.stringify(user));

      await dispatch({
        type: userTypes.CREATING_UNAPPROVED_USER_SUCCESS,
        user,
        userId: user_id,
        sessionToken: token,
        sessionExpiry: String(expires),
      });

      dispatch(updateOneSignalId());

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.CREATING_UNAPPROVED_USER_ERROR,
      });

      return false;
    }
  };
}

export function loadSavedUserData() {
  return async (dispatch, getState) => {
    const fail = () => {
      dispatch({
        type: userTypes.SIGNING_IN_USER_ERROR,
      });

      dispatch(signOutUser());

      return false;
    };

    dispatch({
      type: userTypes.SIGNING_IN_USER,
    });

    try {
      const userId = await AsyncStorage.getItem('userId'),
        sessionToken = await AsyncStorage.getItem('sessionToken'),
        sessionExpiry = await AsyncStorage.getItem('sessionExpiry'),
        user = await User.getFromStorage();

      if (!userId || !sessionToken || !sessionExpiry) {
        return fail();
      } else {
        Sentry.addBreadcrumb({
          category: 'auth',
          message: `Automatically logged in: ${user.first_name} ${user.last_name}, id: ${userId}`,
          level: Sentry.Severity.Info,
        });

        await dispatch({
          type: userTypes.SIGNING_IN_USER_SUCCESS,
          userId,
          user: user,
          sessionToken,
          sessionExpiry,
        });

        const { isUserSignedIn } = getState().userReducer;

        if (isUserSignedIn) {
          dispatch(updateOneSignalId());
          dispatch(getReport());

          updateCurrentLocation().then(async () => {
            await dispatch(getUser());
            await dispatch(getAvailableMatches());
            await dispatch(getLiveMatches());
            await dispatch(getCompletedMatches());
          });
        }

        return true;
      }
    } catch (e) {
      displayError(e);

      return fail();
    }
  };
}

export function saveLocationUpdates(latitude, longitude) {
  return async (dispatch, getState) => {
    const { isUserSignedIn } = getState().userReducer;

    if (isUserSignedIn) {
      dispatch({
        type: userTypes.UPDATING_USER_LOCATION,
      });

      try {
        const http = await authorizedRequest();
        const request = await http.post('driver/locations', {
          latitude,
          longitude,
        });
        const location = request.data.response;

        dispatch({
          type: userTypes.UPDATING_USER_LOCATION_SUCCESS,
          location,
        });

        return location;
      } catch (e) {
        displayError(e);

        dispatch({
          type: userTypes.UPDATING_USER_LOCATION_ERROR,
        });

        return false;
      }
    }
  };
}

export function saveAccountUpdates(parameters) {
  return async (dispatch, getState) => {
    if (parameters) {
      dispatch({
        type: userTypes.EDITING_USER_ACCOUNT,
      });
      try {
        const http = await authorizedRequest();
        const request = await http.put('driver', parameters);

        dispatch({
          type: userTypes.EDITING_USER_ACCOUNT_SUCCESS,
          editingUserAccountMsg: 'Successfully updated!',
        });

        dispatch(getUser());
        return true;
      } catch (e) {
        displayError(e);

        dispatch({
          type: userTypes.EDITING_USER_ACCOUNT_ERROR,
          editingUserAccountMsg: e.message,
        });
        return false;
      }
    }
  };
}

export function updateAddress(address: UserAddress) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_ADDRESS,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', address);

      const new_address = request.data.response.address;
      const formatted_address = {
        address: new_address.address,
        city: new_address.city,
        state: new_address.state_code,
        zip: new_address.zip,
      };

      dispatch({
        type: userTypes.UPDATING_USER_ADDRESS_SUCCESS,
        address: formatted_address,
      });

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.UPDATING_USER_ADDRESS_ERROR,
        editingUserAccountMsg: e.message,
      });
      return false;
    }
  };
}

export function updatePhone(phone_number: string) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_PHONE,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.put('driver', { phone_number: phone_number });

      dispatch({
        type: userTypes.UPDATING_USER_PHONE_SUCCESS,
        phone_number: request.data.response.phone_number,
      });

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.UPDATING_USER_PHONE_ERROR,
        editingUserAccountMsg: e.message,
      });
      return false;
    }
  };
}

export function getReport(days = null) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FETCHING_USER_REPORT,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.get('driver/reports/driver_payout_report', {
        days: days,
      });

      const { days_30, days_90 } = request.data.response;
      dispatch({
        type: userTypes.FETCHING_USER_REPORT_SUCCESS,
        reports: {
          days_30,
          days_90,
        },
      });

      return true;
    } catch (e) {
      displayError(e);

      dispatch({
        type: userTypes.FETCHING_USER_REPORT_ERROR,
        fetchingUserReport: e.message,
      });
      return false;
    }
  };
}

export function requestResetPassword(email) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.REQUESTING_PASSWORD_RESET,
    });
    try {
      const http = await unauthorizedRequest();
      const request = await http.post('/forgot_password', {
        email,
      });

      await dispatch({
        type: userTypes.REQUESTING_PASSWORD_RESET_SUCCESS,
      });
      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.REQUESTING_PASSWORD_RESET_ERROR,
      });

      return false;
    }
  };
}

export function sendResetPassword(resetCode, password, passwordConfirmation) {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.SENDING_PASSWORD_RESET,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.post('/reset_password', {
        password_reset_code: resetCode,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      await dispatch({
        type: userTypes.SENDING_PASSWORD_RESET_SUCCESS,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.SENDING_PASSWORD_RESET_ERROR,
      });

      return false;
    }
  };
}

// Unused, but may be needed when we are able to get better payment history data from Stripe
function _createTestPayments() {
  let payments = [];

  const paymentAmount = Math.floor(Math.random() * 1000);

  for (let paymentIdx = 0; paymentIdx < paymentAmount; paymentIdx++) {
    let date = new Date(Date.now() - Math.random() * 1000000000000);
    payments.push({
      id: paymentIdx + 1,
      date: date,
      amount: Math.random() * 100,
    });
  }
  payments.sort(
    (a, b) =>
      // sort by descending date
      b.date - a.date,
  );
  return payments;
}

export function getPaymentHistory(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FETCHING_USER_PAYMENT_HISTORY,
    });
    try {
      const http = await authorizedRequest();
      const request = await http.get('driver/reports/driver_payment_history');
      const { payouts_complete, payouts_future } = request.data.response;

      await dispatch({
        type: userTypes.FETCHING_USER_PAYMENT_HISTORY_SUCCESS,
        complete: payouts_complete,
        future: payouts_future,
        payments: _createTestPayments(),
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.FETCHING_USER_PAYMENT_HISTORY_ERROR,
      });

      return false;
    }
  };
}

export function updateAcceptingScheduleOpportunities(
  accepting: boolean,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES,
    });

    try {
      const http = await authorizedRequest();
      await http.put('driver', {
        schedule_notifications_opt_in: accepting.toString(),
      });

      await dispatch({
        type: userTypes.UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES_SUCCESS,
        accepting_schedule_opportunities: accepting,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: userTypes.UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES_ERROR,
      });

      return false;
    }
  };
}

export function getSchedule(scheduleId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FETCHING_SCHEDULE,
      scheduleId,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.get(`schedules/${scheduleId}`);
      const { response } = request.data;

      await dispatch({
        type: userTypes.FETCHING_SCHEDULE_SUCCESS,
        schedule: response,
      });

      return true;
    } catch (e) {
      const error = { ...e };

      if ([403, 404].includes(error.response.status)) {
        await dispatch({
          type: userTypes.FETCHING_SCHEDULE_INACCESSIBLE,
          scheduleId,
          error,
        });
      } else {
        displayError(e);

        await dispatch({
          type: userTypes.FETCHING_SCHEDULE_ERROR,
          scheduleId,
          error,
        });
      }

      return false;
    }
  };
}

export function getAvailableSchedules(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.FETCHING_AVAILABLE_SCHEDULES,
    });

    try {
      const { isUserSignedIn } = getState().userReducer;

      if (!isUserSignedIn) {
        await dispatch({
          type: userTypes.FETCHING_AVAILABLE_SCHEDULES_ERROR,
        });
        return false;
      }

      const http = await authorizedRequest();
      const request = await http.get('driver/schedules/available');
      const { response } = request.data;

      await dispatch({
        type: userTypes.FETCHING_AVAILABLE_SCHEDULES_SUCCESS,
        availableSchedules: response,
      });

      return true;
    } catch (e) {
      const error = { ...e };

      if ([403, 404].includes(error.response.status)) {
        await dispatch({
          type: userTypes.FETCHING_AVAILABLE_SCHEDULES_INACCESSIBLE,
          error,
        });
      } else {
        displayError(e);

        await dispatch({
          type: userTypes.FETCHING_AVAILABLE_SCHEDULES_ERROR,
          error,
        });
      }

      return false;
    }
  };
}

export function acceptScheduleOpportunity(
  scheduleId: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.ACCEPTING_SCHEDULE,
      scheduleId,
    });

    try {
      const http = await authorizedRequest();

      const request = await http.put(`schedules/${scheduleId}`, {
        opt_in: 'true',
      });
      const schedule = request.data.response;

      await dispatch({
        type: userTypes.ACCEPTING_SCHEDULE_SUCCESS,
        schedule,
      });

      return true;
    } catch (e) {
      displayError(e, {}, true);

      await dispatch({
        type: userTypes.ACCEPTING_SCHEDULE_ERROR,
        scheduleId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function rejectScheduleOpportunity(
  scheduleId: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.REJECTING_SCHEDULE,
      scheduleId,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.patch(`schedules/${scheduleId}`, {
        opt_in: 'false',
      });
      const schedule = request.data.response;

      await dispatch({
        type: userTypes.REJECTING_SCHEDULE_SUCCESS,
        schedule,
      });

      return true;
    } catch (e) {
      displayError(e, {}, true);

      await dispatch({
        type: userTypes.REJECTING_SCHEDULE_ERROR,
        scheduleId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function sendTestNotification(): (dispatch: any) => Promise<boolean> {
  return async (dispatch) => {
    dispatch({
      type: userTypes.SENDING_TEST_NOTIFICATION,
    });

    try {
      const http = await authorizedRequest();
      await http.post('driver/send_test_notification', {});

      await dispatch({
        type: userTypes.SENDING_TEST_NOTIFICATION_SUCCESS,
      });

      Toast.show({
        text: 'Notification sent successfuly',
      });

      return true;
    } catch (error: any) {
      await dispatch({
        type: userTypes.SENDING_TEST_NOTIFICATION_ERROR,
      });

      const message =
        error?.response?.data?.message || 'Failed to send test notification.';

      Toast.show({ text: 'Error: ' + message });

      Sentry.captureMessage(message);

      return false;
    }
  };
}

export function charge_background_check(
  paymentMethod: any,
  payment_intent: any = null
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: userTypes.CREATING_PAYMENT_METHOD,
    });

    try {
      const http = await authorizedRequest();
      const { data } = await http.post('driver/background_checks', {
        method_id: paymentMethod?.id,
        intent_id: payment_intent
      });

      const { payment_intent_error } = data;

      if (payment_intent_error) {
        // Error creating or confirming PaymentIntent
        throw Error(payment_intent_error);
      }

      await dispatch({
        type: userTypes.CREATING_PAYMENT_METHOD_SUCCESS,
      });

      return data;
    } catch (error: any) {
      Sentry.captureMessage(JSON.stringify(error));
      await dispatch({
        type: userTypes.CREATING_PAYMENT_METHOD_ERROR,
        error: { ...error },
      });

      const message =
        error?.response?.data?.payment_intent_error || 'Failed to process your payment';

      Toast.show({ text: 'Error: ' + message });

      Sentry.captureMessage(message);

      return false;
    }
  };
}

export function createVehicle(
  params: any,
): (dispatch: any) => Promise<boolean> {
  return async (dispatch) => {
    dispatch({
      type: userTypes.EDITING_USER_ACCOUNT,
    });

    try {
      const http = await authorizedRequest();
      await http.post('driver/vehicles', { vehicle: params });

      await dispatch({
        type: userTypes.EDITING_USER_ACCOUNT_SUCCESS,
      });

      dispatch(getUser());

      return true;
    } catch (error: any) {
      await dispatch({
        type: userTypes.EDITING_USER_ACCOUNT_ERROR,
        error: { ...error },
      });

      const message =
        error?.response?.data?.message || 'Failed to create your vehicle';
      Toast.show({ text: 'Error: ' + message });
      Sentry.captureMessage(message);

      return false;
    }
  };
}

export function updateVehicle(
  id: any,
  params: any,
): (dispatch: any) => Promise<boolean> {
  return async (dispatch) => {
    dispatch({
      type: userTypes.EDITING_USER_ACCOUNT,
    });

    try {
      const http = await authorizedRequest();
      await http.put(`driver/vehicles/${id}`, { vehicle: params });

      await dispatch({
        type: userTypes.EDITING_USER_ACCOUNT_SUCCESS,
      });

      dispatch(getUser());

      return true;
    } catch (error: any) {
      await dispatch({
        type: userTypes.EDITING_USER_ACCOUNT_ERROR,
        error: { ...error },
      });

      const message =
        error?.response?.data?.message || 'Failed to update your vehicle';
      Toast.show({ text: 'Error: ' + message });
      Sentry.captureMessage(message);

      return false;
    }
  };
}
