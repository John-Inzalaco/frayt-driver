import axios, { AxiosInstance } from 'axios';
import store from '@lib/store';
import { signOutUser } from '@actions/userAction';
import { BASE_URL } from '@constants/Environment';

const defaultConfig = {
  'baseURL': BASE_URL,
  'timeout': 30000,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export async function authorizedRequest() {
  let token: Nullable<string> = null,
    offlineMode: boolean;

  try {
    token = store.getState().userReducer.sessionToken;
    offlineMode = store.getState().appReducer.offlineMode;
  } catch (error) {
    console.warn('We may not have received our header token for HTTP requests');
    console.error(error);
  }

  return new Promise<AxiosInstance>((resolve, reject) => {
    if (offlineMode) {
      return reject({ isOfflineMode: true });
    } else if (token) {
      const axiosInstance = axios.create({
        ...defaultConfig,
        headers: { Authorization: 'Bearer ' + token },
      });
      return resolve(axiosInstance);
    } else {
      store.dispatch<any>(signOutUser());
    }
  });
}

export function unauthorizedRequest() {
  return axios.create(defaultConfig);
}
