export default function createReducer<S = any>(
  reductions: any,
  initialState: S,
) {
  return (state: S = initialState, action: any): S => {
    if (reductions.hasOwnProperty(action.type)) {
      const newState = reductions[action.type](action, state);
      return {
        ...state,
        ...newState,
      };
    } else {
      return state;
    }
  };
}
