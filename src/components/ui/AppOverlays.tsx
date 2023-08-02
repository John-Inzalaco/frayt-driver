import React from 'react';
import NotificationBar from '@components/ui/NotificationBar';

export default function withOverlays(Screen) {
  const comp = (props) => [
    <NotificationBar navigation={props.navigation} />,
    <Screen {...props} />,
  ];

  comp['navigationOptions'] = Screen.navigationOptions;

  return comp;
}
