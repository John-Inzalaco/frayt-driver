import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import colors from '@constants/Colors';
import { Platform } from 'react-native';

export default class TabBarIcon extends React.Component {
  render() {
    let inactiveColor =
      Platform.OS === 'android' ? colors.gray : colors.tabIconDefault;
    return (
      <Icon
        name={this.props.name}
        size={26}
        style={{ marginBottom: -3 }}
        color={this.props.focused ? colors.tabIconSelected : inactiveColor}
      />
    );
  }
}
