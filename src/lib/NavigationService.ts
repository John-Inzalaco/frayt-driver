import {
  NavigationActions,
  NavigationContainerComponent,
  StackActions,
} from 'react-navigation';

let _navigator: NavigationContainerComponent | null;

function setTopLevelNavigator(
  navigatorRef: NavigationContainerComponent | null,
) {
  _navigator = navigatorRef;
}

function navigate(routeName: string, params = {}) {
  if (_navigator && current() != routeName) {
    _navigator.dispatch(
      NavigationActions.navigate({
        routeName,
        params,
      }),
    );
  }
}

function replace(routeName: string, params = {}) {
  if (_navigator) {
    _navigator.dispatch(
      StackActions.replace({
        routeName,
        params,
      }),
    );
  }
}

function reset(stack, route, params = {}) {
  if (_navigator) {
    const resetAction = StackActions.reset({
      key: stack,
      index: 0,
      actions: [NavigationActions.navigate({ routeName: stack })],
    });

    _navigator.dispatch(resetAction);

    replace(route);
  }
}

function dispatch(action) {
  if (_navigator) {
    _navigator.dispatch(action);
  }
}

function getState() {
  if (_navigator) {
    return _navigator.state;
  }
}

function current() {
  if (_navigator) {
    let nav = _navigator.state.nav;
    while (typeof nav.index !== 'undefined') {
      nav = nav.routes[nav.index];
    }

    return nav.routeName;
  } else {
    return false;
  }
}

export function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];

  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}

export default {
  getState,
  dispatch,
  navigate,
  current,
  setTopLevelNavigator,
  reset,
};
