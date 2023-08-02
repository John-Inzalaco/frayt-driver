import { MatchState } from '@models/Match';

const matchTypes = {
  TOGGLING_EN_ROUTE_MATCH: 'TOGGLING_EN_ROUTE_MATCH',
  TOGGLING_EN_ROUTE_MATCH_SUCCESS: 'TOGGLING_EN_ROUTE_MATCH_SUCCESS',
  TOGGLING_EN_ROUTE_MATCH_ERROR: 'TOGGLING_EN_ROUTE_MATCH_ERROR',
  FETCHING_LIVE_MATCHES: 'FETCHING_LIVE_MATCHES',
  FETCHING_LIVE_MATCHES_SUCCESS: 'FETCHING_LIVE_MATCHES_SUCCESS',
  FETCHING_LIVE_MATCHES_ERROR: 'FETCHING_LIVE_MATCHES_ERROR',
  FETCHING_AVAILABLE_MATCHES: 'FETCHING_AVAILABLE_MATCHES',
  FETCHING_AVAILABLE_MATCHES_SUCCESS: 'FETCHING_AVAILABLE_MATCHES_SUCCESS',
  FETCHING_AVAILABLE_MATCHES_ERROR: 'FETCHING_AVAILABLE_MATCHES_ERROR',
  FETCHING_TAKEN_MATCHES: 'FETCHING_TAKEN_MATCHES',
  FETCHING_TAKEN_MATCHES_SUCCESS: 'FETCHING_TAKEN_MATCHES_SUCCESS',
  FETCHING_TAKEN_MATCHES_ERROR: 'FETCHING_TAKEN_MATCHES_ERROR',
  FETCHING_COMPLETE_MATCHES: 'FETCHING_COMPLETE_MATCHES',
  FETCHING_COMPLETE_MATCHES_SUCCESS: 'FETCHING_COMPLETE_MATCHES_SUCCESS',
  FETCHING_COMPLETE_MATCHES_ERROR: 'FETCHING_COMPLETE_MATCHES_ERROR',
  UPDATING_MATCH_STATUS: 'UPDATING_MATCH_STATUS',
  UPDATING_MATCH_STATUS_SUCCESS: 'UPDATING_MATCH_STATUS_SUCCESS',
  UPDATING_MATCH_STATUS_ERROR: 'UPDATING_MATCH_STATUS_ERROR',
  LOADING_SAVED_MATCHES: 'LOADING_SAVED_MATCHES',
  LOADING_SAVED_MATCHES_SUCCESS: 'LOADING_SAVED_MATCHES_SUCCESS',
  LOADING_SAVED_MATCHES_ERROR: 'LOADING_SAVED_MATCHES_ERROR',
  FETCHING_MATCH: 'FETCHING_MATCH',
  FETCHING_MATCH_SUCCESS: 'FETCHING_MATCH_SUCCESS',
  FETCHING_MATCH_ERROR: 'FETCHING_MATCH_ERROR',
  FETCHING_MATCH_INACCESSIBLE: 'FETCHING_MATCH_INACCESSIBLE',
  VIEWING_MATCHES_SCREEN: 'VIEWING_MATCHES_SCREEN',
  REJECT_MATCH: 'REJECT_MATCH',
  CLEAR_MATCHES: 'CLEAR_MATCHES',
};

export default matchTypes;

type TypeList<T extends string> = { [k in T]: T };

export const matchStatusTypes: TypeList<MatchState> = {
  canceled: 'canceled',
  admin_canceled: 'admin_canceled',
  driver_canceled: 'driver_canceled',
  pending: 'pending',
  scheduled: 'scheduled',
  inactive: 'inactive',
  assigning_driver: 'assigning_driver',
  accepted: 'accepted',
  en_route_to_pickup: 'en_route_to_pickup',
  arrived_at_pickup: 'arrived_at_pickup',
  picked_up: 'picked_up',
  completed: 'completed',
  charged: 'charged',
  en_route_to_return: 'en_route_to_return',
  arrived_at_return: 'arrived_at_return',
};

export type MatchActionType =
  | MatchState
  | 'driver_canceled'
  | 'driver_rejected'
  | 'unable_to_pickup'
  | 'signed';

export const matchActionTypes: TypeList<MatchActionType> = {
  ...matchStatusTypes,
  driver_canceled: 'driver_canceled',
  driver_rejected: 'driver_rejected',
  unable_to_pickup: 'unable_to_pickup',
  signed: 'signed',
};
