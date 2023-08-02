import { authorizedRequest } from '@lib/Request';
import displayError from '@lib/displayError';
import matchTypes, { matchActionTypes } from '@actions/types/matchTypes';
import { Toast } from 'native-base';
import Match from '@models/Match';
import QueryString from 'qs';
import { getReport } from '@actions/userAction';
import { AppThunkAction, ThunkActionBoolean } from '@lib/store';
import { Image } from 'react-native-image-crop-picker';
import { SaveEventParams } from 'react-native-signature-capture';
import { Platform } from 'react-native';
import { updateCurrentLocation } from '@lib/location';
import { NewBarcodeReading } from '@models/BarcodeReading';
import { RootState } from '@reducers/index';
import * as Sentry from '@sentry/react-native';
import moment from 'moment';

interface FileParams {
  filename: string;
  contents: Nullable<string>;
}

export function toggleEnRouteMatch(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.TOGGLING_EN_ROUTE_MATCH,
      matchId,
    });

    try {
      const request = await driverMatchRequest(
        'put',
        getState(),
        matchId,
        `toggle_en_route`,
      );
      const match = request.data.response;

      await dispatch({
        type: matchTypes.TOGGLING_EN_ROUTE_MATCH_SUCCESS,
        match,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.TOGGLING_EN_ROUTE_MATCH_ERROR,
        matchId,
      });

      return false;
    }
  };
}

export function toggleStopEnRoute(
  matchId: string,
  stopId: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.TOGGLING_EN_ROUTE_MATCH,
      matchId,
    });

    try {
      const request = await driverMatchRequest(
        'put',
        getState(),
        matchId,
        `stops/${stopId}/toggle_en_route`,
      );

      const match = request.data.response;

      await dispatch({
        type: matchTypes.TOGGLING_EN_ROUTE_MATCH_SUCCESS,
        match,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.TOGGLING_EN_ROUTE_MATCH_ERROR,
        matchId,
      });

      return false;
    }
  };
}

export function getMatch(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.FETCHING_MATCH,
      matchId,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.get(`driver/matches/${matchId}`);
      const { response } = request.data;

      const match = new Match(response);

      await dispatch({
        type: matchTypes.FETCHING_MATCH_SUCCESS,
        match,
      });

      return true;
    } catch (e) {
      const error = { ...e };

      if ([403, 404].includes(error.response.status)) {
        await dispatch({
          type: matchTypes.FETCHING_MATCH_INACCESSIBLE,
          matchId,
          error,
        });
      } else {
        displayError(e);

        await dispatch({
          type: matchTypes.FETCHING_MATCH_ERROR,
          matchId,
          error,
        });
      }

      return false;
    }
  };
}

export function getAvailableAndRecentMatches(): AppThunkAction {
  return async (dispatch, getState) => {
    return await Promise.all([
      dispatch(getAvailableMatches()),
      dispatch(getRecentlyTakenMatches()),
    ]);
  };
}

export function getAvailableMatches(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.FETCHING_AVAILABLE_MATCHES,
    });

    try {
      const { isUserSignedIn } = getState().userReducer;

      if (!isUserSignedIn) {
        await dispatch({
          type: matchTypes.FETCHING_AVAILABLE_MATCHES_ERROR,
        });
        return false;
      }

      const http = await authorizedRequest();
      const request = await http.get(`driver/matches/available`);
      const { response } = request.data;

      await dispatch({
        type: matchTypes.FETCHING_AVAILABLE_MATCHES_SUCCESS,
        availableMatches: response.results,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.FETCHING_AVAILABLE_MATCHES_ERROR,
      });

      return false;
    }
  };
}

export function getRecentlyTakenMatches(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.FETCHING_TAKEN_MATCHES,
    });

    try {
      const { isUserSignedIn } = getState().userReducer;

      if (!isUserSignedIn) {
        await dispatch({
          type: matchTypes.FETCHING_TAKEN_MATCHES_ERROR,
        });
        return false;
      }

      const http = await authorizedRequest();
      const request = await http.get(`driver/matches/missed`);
      const { response } = request.data;

      await dispatch({
        type: matchTypes.FETCHING_TAKEN_MATCHES_SUCCESS,
        matches: response.results,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.FETCHING_TAKEN_MATCHES_ERROR,
      });

      return false;
    }
  };
}

export function getCompletedMatches(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    try {
      const { completeMatchesCursor, completeMatchesRemaining } =
        getState().matchReducer;

      if (completeMatchesRemaining > 0) {
        const cursor =
          completeMatchesCursor < 0 ? 0 : completeMatchesCursor + 1;

        dispatch({
          type: matchTypes.FETCHING_COMPLETE_MATCHES,
        });

        const params = QueryString.stringify({
          cursor,
        });

        const http = await authorizedRequest();
        const request = await http.get('driver/matches/completed?' + params);
        const { response } = request.data;

        await dispatch({
          type: matchTypes.FETCHING_COMPLETE_MATCHES_SUCCESS,
          completeMatches: response.results,
          completeMatchesCursor: cursor,
          completeMatchesRemaining: response.results.length > 0 ? 1 : 0,
        });
      }

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.FETCHING_COMPLETE_MATCHES_ERROR,
        error: { ...e },
      });

      return false;
    }
  };
}

export function getLiveMatches(): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.FETCHING_LIVE_MATCHES,
    });

    try {
      const http = await authorizedRequest();
      const request = await http.get('driver/matches/live');
      const { response } = request.data;

      await dispatch({
        type: matchTypes.FETCHING_LIVE_MATCHES_SUCCESS,
        liveMatches: response.results,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.FETCHING_LIVE_MATCHES_ERROR,
      });

      return false;
    }
  };
}

export function arriveAtPickup(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.arrived_at_pickup,
      matchId,
    });

    try {
      const request = await driverMatchRequest('put', getState(), matchId, '', {
          state: 'arrived_at_pickup',
        }),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match,
      });

      Toast.show({
        text: 'Arrived at pickup',
      });

      return true;
    } catch (e) {
      console.log('Error happened while arriving at pickup', e);
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function arriveAtReturn(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.arrived_at_return,
      matchId,
    });

    try {
      const request = await driverMatchRequest('put', getState(), matchId, '', {
          state: 'arrived_at_return',
        }),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match,
      });

      Toast.show({
        text: 'Arrived at return',
      });

      return true;
    } catch (e) {
      console.log('Error happened while arriving at return', e);
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function returned(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.completed,
      matchId,
    });

    try {
      const request = await driverMatchRequest('put', getState(), matchId, '', {
          state: 'returned',
        }),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match,
      });

      Toast.show({
        text: 'Returned',
      });

      return true;
    } catch (e) {
      console.log('Error happened while arriving at return', e);
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function arriveAtDropoff(
  matchId: string,
  stopId: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      matchId,
    });

    try {
      const request = await driverMatchRequest(
          'patch',
          getState(),
          matchId,
          `stops/${stopId}`,
          {
            state: 'arrived',
          },
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match,
      });

      Toast.show({
        text: 'Driver arrived at dropoff',
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function signMatch(
  matchId: string,
  stopId: string,
  signature: SaveEventParams,
  printedName: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.signed,
      matchId,
    });

    try {
      let file = signature.encoded;
      if (Platform.OS === 'android') {
        // for some reason our signature library returns line breaks in the base64 encoding on Android
        // this should remove windows/unix line breaks
        file = file.replace(/(\r\n|\n|\r)/gm, '');
      }

      const request = await driverMatchRequest(
          'patch',
          getState(),
          matchId,
          `stops/${stopId}`,
          {
            state: 'signed',
            receiver_name: printedName,
            image: {
              filename: matchId + '_signature.png',
              contents: file,
            },
          },
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match,
      });

      Toast.show({
        text: 'signed',
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function sendBarcodes(
  matchId: string,
  barcode_readings: NewBarcodeReading[],
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      matchId,
    });

    try {
      await Promise.all(
        barcode_readings.map(async (r) => {
          let params = {
            barcode: r.barcode,
            type: r.type,
            state: r.state,
            photo: typeof r.photo === 'string' ? null : r.photo?.data,
          };

          const http = await authorizedRequest();
          await http.post(
            `driver/matches/${matchId}/stops/${r.item.stop_id}/items/${r.item.id}/barcode_readings`,
            params,
          );
        }),
      );

      const http = await authorizedRequest();
      const request = await http.get(`driver/matches/${matchId}`);
      const match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match: match,
      });

      Toast.show({
        text: 'Barcodes submitted',
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function acceptMatch(matchId: string): AppThunkAction<Promise<boolean>> {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.accepted,
      matchId,
    });

    try {
      const request = await driverMatchRequest(
          'patch',
          getState(),
          matchId,
          '',
          {
            state: 'accepted',
          },
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match: match,
      });

      Toast.show({
        text: 'Match accepted successfully.',
      });

      return true;
    } catch (e) {
      displayError(e, {}, true);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function pickupMatch(
  matchId: string,
  originPhoto: Nullable<Image>,
  billOfLading: Nullable<Image>,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.picked_up,
      matchId,
    });

    try {
      const state = getState(),
        { user } = state.userReducer,
        params: {
          match: string;
          user: string;
          state: string;
          origin_photo?: FileParams;
          bill_of_lading_photo?: FileParams;
        } = {
          match: matchId,
          user: user.id,
          state: 'picked_up',
        };

      if (originPhoto) {
        params.origin_photo = {
          filename: `${matchId}_origin_photo.jpg`,
          contents: originPhoto.data,
        };
      }

      if (billOfLading) {
        params.bill_of_lading_photo = {
          filename: `${matchId}_bill_of_lading.jpg`,
          contents: billOfLading.data,
        };
      }

      const request = await driverMatchRequest(
          'put',
          state,
          matchId,
          '',
          params,
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match: match,
      });

      Toast.show({
        text: 'Picked up',
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function deliverMatch(
  matchId: string,
  destinationPhoto: Nullable<Image>,
  stopId: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      matchId,
    });

    try {
      const state = getState(),
        { user } = state.userReducer,
        params: {
          match: string;
          user: string;
          state: string;
          destination_photo?: FileParams;
        } = {
          match: matchId,
          user: user.id,
          state: 'delivered',
        };

      if (destinationPhoto) {
        params.destination_photo = {
          filename: `${matchId}_destination_photo.jpg`,
          contents: destinationPhoto.data,
        };
      }

      const request = await driverMatchRequest(
          'put',
          state,
          matchId,
          `stops/${stopId}`,
          params,
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match: match,
      });

      dispatch(getReport());

      Toast.show({
        text: 'delivered',
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function stopUndeliverable(
  matchId: string,
  stopId: string,
  reason: Nullable<string>,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      matchId,
    });

    try {
      const request = await driverMatchRequest(
          'put',
          getState(),
          matchId,
          `stops/${stopId}`,
          {
            state: 'undeliverable',
            reason,
          },
        ),
        match = request.data.response;

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        match: match,
      });

      Toast.show({
        text: 'Stop marked as undeliverable. Please return cargo to pickup location.',
        buttonText: 'Okay',
        duration: 5000,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function cancelMatch(
  matchId: string,
  reason: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.driver_canceled,
      matchId,
    });

    try {
      const request = await driverMatchRequest('put', getState(), matchId, '', {
          state: 'cancel',
          reason,
        }),
        { response } = request.data;

      Toast.show({
        text: response.reason,
      });

      dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        removeMatch: matchId,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function unableToPickupMatch(
  matchId: string,
  reason: string,
): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.unable_to_pickup,
      matchId,
    });

    try {
      const request = await driverMatchRequest('put', getState(), matchId, '', {
          state: 'unable_to_pickup',
          reason,
        }),
        { response } = request.data;

      Toast.show({
        text: response.reason,
      });

      dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        removeMatch: matchId,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function rejectMatch(matchId: string): ThunkActionBoolean {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.UPDATING_MATCH_STATUS,
      status: matchActionTypes.driver_rejected,
      matchId,
    });

    try {
      await driverMatchRequest('put', getState(), matchId, '', {
        state: 'rejected',
      });

      Toast.show({
        text: 'You will no longer see this match.',
      });

      dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_SUCCESS,
        removeMatch: matchId,
      });

      return true;
    } catch (e) {
      displayError(e);

      await dispatch({
        type: matchTypes.UPDATING_MATCH_STATUS_ERROR,
        matchId,
        error: { ...e },
      });

      return false;
    }
  };
}

export function loadSavedMatches() {
  return async (dispatch, getState) => {
    dispatch({
      type: matchTypes.LOADING_SAVED_MATCHES,
    });

    try {
      const matches = await Match.getAll();

      await dispatch({
        type: matchTypes.LOADING_SAVED_MATCHES_SUCCESS,
        matches,
      });

      return true;
    } catch (e) {
      console.warn(e);

      await dispatch({
        type: matchTypes.LOADING_SAVED_MATCHES_ERROR,
      });

      return false;
    }
  };
}

export function matchesScreenViewed() {
  return async (dispatch, getState) => {
    const { newMatches } = getState().matchReducer;
    if (newMatches.length() > 0) {
      dispatch({
        type: matchTypes.VIEWING_MATCHES_SCREEN,
      });
    }
  };
}

async function driverMatchRequest(
  method: 'put' | 'post' | 'patch',
  state: RootState,
  matchId: string,
  url: string = '',
  params: { [key: string]: any } = {},
) {
  const { updatingUserLocation, user } = state.userReducer;
  const useCachedLocation =
    user?.current_location &&
    moment().diff(user.current_location.created_at, 'seconds', true) > 5
      ? true
      : false;

  if (updatingUserLocation) {
    Sentry.addBreadcrumb({
      category: 'location',
      message: `Driver match action did not update location since it is already updating.`,
      level: Sentry.Severity.Info,
    });
    params.location = user.current_location;
  } else if (useCachedLocation) {
    Sentry.addBreadcrumb({
      category: 'location',
      message: `Driver match action did not update location since it was updated within the past 10 seconds.`,
      level: Sentry.Severity.Info,
    });
    params.location = user.current_location;
  } else {
    Sentry.addBreadcrumb({
      category: 'location',
      message: `Driver match action updating location.`,
      level: Sentry.Severity.Info,
    });
    try {
      const geoTimeout = new Promise((_resolve, reject) =>
        setTimeout(
          () => reject(new Error('Timeout retrieving GeoLocation')),
          9000,
        ),
      );
      const updatedLocation = await Promise.race([
        updateCurrentLocation,
        geoTimeout,
      ]);
      params.location = updatedLocation ?? user.current_location;
    } catch (error: any) {
      Toast.show({
        text:
          typeof error.message === 'string'
            ? error.message
            : 'Error while updating geolocation.',
      });
      Sentry.captureMessage(
        error.message ? error.message : 'Error while updating geolocation.',
      );
    }
  }

  const http = await authorizedRequest();
  const result = await http[method](`driver/matches/${matchId}/${url}`, params);
  return result;
}
