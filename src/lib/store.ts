import thunk from 'redux-thunk';
import { createStore, applyMiddleware, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import reducers, { RootState } from '@reducers/index';

export type AppThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type ThunkActionBoolean = AppThunkAction<Promise<boolean>>;

const store = createStore(reducers, applyMiddleware(thunk));
export default store;
