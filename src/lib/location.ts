import store from '@lib/store';
import { saveLocationUpdates } from '@actions/userAction';
import Geolocation, { GeoError } from 'react-native-geolocation-service';
import { Coordinates } from '@lib/helpers';
import { Toast } from 'native-base';

export async function getCurrentGeoLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    const state = store.getState();
    const { updatingUserLocation, user } = state.userReducer;
    if (updatingUserLocation) {
      if (user && user.current_location) {
        resolve({
          latitude: user.current_location.lat,
          longitude: user.current_location.lng,
        });
      } else {
        reject('Already updating location and no location is cached.');
      }
    } else {
      Geolocation.getCurrentPosition(
        ({ coords }) => {
          resolve({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        },
        (error: GeoError) => {
          reject(error);
        },
        {
          accuracy: { android: 'balanced', ios: 'nearestTenMeters' },
          enableHighAccuracy: false,
          timeout: 10000,
        },
      );
    }
  });
}

export async function updateCurrentLocation(): Promise<Coordinates | boolean> {
  const state = store.getState();
  const { isUserSignedIn } = state.userReducer;
  const { location } = state.appReducer.permissions;

  if (isUserSignedIn) {
    if (location) {
      try {
        const { latitude, longitude } = await getCurrentGeoLocation();

        return await store.dispatch<any>(
          saveLocationUpdates(latitude, longitude),
        );
      } catch (error) {
        if (error instanceof Error) {
          Toast.show({ text: error.message });
        } else if (typeof error === 'string') {
          Toast.show({ text: error });
        } else {
          const err = error as any;
          Toast.show({
            text: err.message ?? 'Unable to verify current location',
          });
        }
        return false;
      }
    }
  }
  return false;
}
