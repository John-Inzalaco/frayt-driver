import MatchesCollection from '@models/MatchesCollection';
import createReducer from '@lib/reducers';
import Match from '@models/Match';
import {
  IdedStates,
  IdedRequestErrors,
  IdedRequestResponses,
  RequestError,
} from '@reducers/index';

import { MatchActionType } from '@actions/types/matchTypes';

export interface MatchesState {
  // Match local loading
  loadingSavedMatches: boolean;

  // is Match requesting
  fetchingLiveMatches: boolean;
  fetchingCompleteMatches: boolean;
  fetchingAvailableMatches: boolean;
  fetchingMatch: IdedStates;
  updatingMatchStatus: IdedStates<MatchActionType>;
  updatingEnRouteMatch: IdedStates;

  // Match request errors
  fetchingMatchError: IdedRequestErrors;
  matchStatusError: IdedRequestErrors;
  fetchingCompleteMatchesError: Nullable<RequestError>;

  // Match request success
  matchStatusSuccess: IdedRequestResponses;

  // is Match set initialized
  completeMatchesInitialized: boolean;
  liveMatchesInitialized: boolean;
  availableMatchesInitialized: boolean;

  // Match set cursor
  completeMatchesCursor: number;

  // Match set remaining
  completeMatchesRemaining: number;

  // Match sets
  newMatches: MatchesCollection;
  matches: MatchesCollection;
  recentMatches: MatchesCollection;
}

const initialState: MatchesState = {
  // Saved Matches
  loadingSavedMatches: false,
  // Complete Matches
  fetchingCompleteMatches: false,
  completeMatchesInitialized: false,
  completeMatchesCursor: -1,
  completeMatchesRemaining: 1,
  fetchingCompleteMatchesError: null,
  // Live Matches
  liveMatchesInitialized: false,
  fetchingLiveMatches: false,
  // Available Matches
  availableMatchesInitialized: false,
  fetchingAvailableMatches: false,
  // Single Matches
  fetchingMatch: {},
  fetchingMatchError: {},
  updatingMatchStatus: {},
  updatingEnRouteMatch: {},
  matchStatusError: {},
  matchStatusSuccess: {},
  // Match lists
  newMatches: new MatchesCollection(),
  matches: new MatchesCollection(),
  recentMatches: new MatchesCollection(),
};

let reductions = {
  CLEAR_MATCHES: () => {
    return {
      newMatches: new MatchesCollection(),
      matches: new MatchesCollection(),
      recentMatches: new MatchesCollection(),
    };
  },
  // User En Route Match
  TOGGLING_EN_ROUTE_MATCH: ({ matchId }, { updatingEnRouteMatch }) => {
    return {
      updatingEnRouteMatch: {
        ...updatingEnRouteMatch,
        [matchId]: true,
      },
    };
  },
  TOGGLING_EN_ROUTE_MATCH_SUCCESS: (
    { match },
    { matches: prevMatches, updatingEnRouteMatch },
  ) => {
    delete updatingEnRouteMatch[match.id];

    const matches = prevMatches.clone().add(match);

    return {
      updatingEnRouteMatch: { ...updatingEnRouteMatch },
      matches: matches,
    };
  },
  TOGGLING_EN_ROUTE_MATCH_ERROR: ({ matchId }, { updatingEnRouteMatch }) => {
    delete updatingEnRouteMatch[matchId];

    return {
      updatingEnRouteMatch: { ...updatingEnRouteMatch },
    };
  },
  // Get Match
  FETCHING_MATCH: ({ matchId }, { fetchingMatchError, fetchingMatch }) => {
    delete fetchingMatchError[matchId];

    return {
      fetchingMatch: {
        ...fetchingMatch,
        [matchId]: true,
      },
      fetchingMatchError: { ...fetchingMatchError },
    };
  },
  FETCHING_MATCH_SUCCESS: (
    { match },
    { matches: prevMatches, fetchingMatch },
  ) => {
    delete fetchingMatch[match.id];

    const matches = prevMatches.clone().add(match);

    return {
      fetchingMatch: { ...fetchingMatch },
      matches: matches,
      newMatches: matches
        .clone()
        .syncToDB(false)
        .removeWhere(
          (match) => !match.isAvailable() || prevMatches.exists(match.id),
        ),
    };
  },
  FETCHING_MATCH_INACCESSIBLE: (
    { matchId, error },
    { matches: prevMatches, fetchingMatchError, fetchingMatch },
  ) => {
    delete fetchingMatch[matchId];

    const matches = prevMatches.clone().remove(matchId);

    return {
      matches: matches,
      fetchingMatch: { ...fetchingMatch },
      fetchingMatchError: {
        ...fetchingMatchError,
        [matchId]: error,
      },
    };
  },
  FETCHING_MATCH_ERROR: (
    { matchId, error },
    { fetchingMatchError, fetchingMatch },
  ) => {
    delete fetchingMatch[matchId];

    return {
      fetchingMatch: { ...fetchingMatch },
      fetchingMatchError: {
        ...fetchingMatchError,
        [matchId]: error,
      },
    };
  },
  // Available Matches
  FETCHING_AVAILABLE_MATCHES: () => ({
    fetchingAvailableMatches: true,
  }),
  FETCHING_AVAILABLE_MATCHES_SUCCESS: (action, { matches: prevMatches }) => {
    const matches = prevMatches
      .clone()
      .removeWhere((match) => match.isAvailable())
      .addSet(action.availableMatches);

    return {
      fetchingAvailableMatches: false,
      availableMatchesInitialized: true,
      matches,
      newMatches: matches
        .clone()
        .syncToDB(false)
        .removeWhere(
          (match) => !match.isAvailable() || prevMatches.exists(match.id),
        ),
    };
  },
  FETCHING_AVAILABLE_MATCHES_ERROR: (action, { matches }) => ({
    fetchingAvailableMatches: false,
    newMatches: new MatchesCollection(),
    matches: matches.clone().removeWhere((match) => match.isAvailable()),
  }),
  // TAKEN Matches
  FETCHING_TAKEN_MATCHES: () => ({
    fetchingTakenMatches: true,
  }),
  FETCHING_TAKEN_MATCHES_SUCCESS: (action, state) => ({
    fetchingTakenMatches: false,
    recentMatches: new MatchesCollection([], false).addSet(action.matches),
  }),
  FETCHING_TAKEN_MATCHES_ERROR: (action, { matches }) => ({
    fetchingTakenMatches: false,
  }),
  // Live Matches
  FETCHING_LIVE_MATCHES: () => ({
    fetchingLiveMatches: true,
  }),
  FETCHING_LIVE_MATCHES_SUCCESS: (action, { matches, ...state }) => ({
    fetchingLiveMatches: false,
    liveMatchesInitialized: true,
    matches: matches
      .clone()
      .removeWhere((match) => match.isLive())
      .addSet(action.liveMatches),
  }),
  FETCHING_LIVE_MATCHES_ERROR: (action, state) => ({
    fetchingLiveMatches: false,
  }),
  // Complete Matches
  FETCHING_COMPLETE_MATCHES: () => ({
    fetchingCompleteMatches: true,
  }),
  FETCHING_COMPLETE_MATCHES_SUCCESS: (action, state) => {
    const matches = state.matches.clone();

    if (state.completeMatchesCursor < 0)
      matches.removeWhere((match) => match.isComplete());

    matches.addSet(action.completeMatches);

    return {
      fetchingCompleteMatches: false,
      completeMatchesInitialized: true,
      completeMatchesCursor: action.completeMatchesCursor,
      completeMatchesRemaining: action.completeMatchesRemaining,
      matches,
    };
  },
  FETCHING_COMPLETE_MATCHES_ERROR: ({ error }, { matches }) => ({
    fetchingCompleteMatches: false,
    fetchingCompleteMatchesError: error,
  }),
  VIEWING_MATCHES_SCREEN: () => ({
    newMatches: new MatchesCollection(),
  }),
  // Update Match
  UPDATING_MATCH_STATUS: (action, state) => {
    const { status, matchId } = action,
      { updatingMatchStatus, matchStatusError, matchStatusSuccess } = state;

    delete matchStatusError[matchId];
    delete matchStatusSuccess[matchId];

    return {
      updatingMatchStatus: {
        ...updatingMatchStatus,
        [matchId]: status,
      },
      matchStatusError: { ...matchStatusError },
      matchStatusSuccess: { ...matchStatusSuccess },
    };
  },
  UPDATING_MATCH_STATUS_SUCCESS: (action, state) => {
    const { match, removeMatch } = action,
      { updatingMatchStatus, matchStatusSuccess, matches } = state;

    if (removeMatch) {
      delete updatingMatchStatus[removeMatch];

      return {
        matchStatusSuccess: {
          ...matchStatusSuccess,
          [removeMatch]: true,
        },
        updatingMatchStatus: { ...updatingMatchStatus },
        matches: matches.clone().remove(removeMatch),
      };
    } else if (match) {
      const m = new Match(match);
      delete updatingMatchStatus[m.id];

      return {
        matchStatusSuccess: {
          ...matchStatusSuccess,
          [m.id]: true,
        },
        updatingMatchStatus: { ...updatingMatchStatus },
        matches: matches.clone().add(m),
      };
    } else {
      return state;
    }
  },
  UPDATING_MATCH_STATUS_ERROR: (action, state) => {
    const { matchId, error } = action,
      { updatingMatchStatus, matchStatusError } = state;

    delete updatingMatchStatus[matchId];

    return {
      updatingMatchStatus: { ...updatingMatchStatus },
      matchStatusError: {
        ...matchStatusError,
        [matchId]: error,
      },
    };
  },
  LOADING_SAVED_MATCHES: () => ({
    loadingSavedMatches: true,
  }),
  LOADING_SAVED_MATCHES_SUCCESS: ({ matches }, state) => ({
    loadingSavedMatches: false,
    matches: new MatchesCollection(matches),
    completeMatchesInitialized: matches.length > 0,
    liveMatchesInitialized: matches.length > 0,
  }),
  LOADING_SAVED_MATCHES_ERROR: (action, state) => ({
    loadingSavedMatches: false,
  }),
  REJECT_MATCH: ({ matchId }) => ({
    matches: matches.clone().remove(matchId),
  }),
};

const matchReducer = createReducer<MatchesState>(reductions, initialState);

export default matchReducer;
