import { combineReducers } from 'redux';
import matchReducer, { MatchesState } from '@reducers/matchReducer';
import userReducer, { UserState } from '@reducers/userReducer';
import appReducer, { AppState } from '@reducers/appReducer';

export type IdedStates<T = boolean> = {
  [k: string]: T;
};

export type RequestError = { [k: string]: any };

export type IdedRequestErrors = {
  [k: string]: RequestError;
};

type RequestResponse = { [k: string]: any };

export type IdedRequestResponses = {
  [k: string]: RequestResponse;
};
export interface RootState {
  matchReducer: MatchesState;
  userReducer: UserState;
  appReducer: AppState;
}

const app = combineReducers({
  matchReducer,
  appReducer,
  userReducer,
});

export default app;
