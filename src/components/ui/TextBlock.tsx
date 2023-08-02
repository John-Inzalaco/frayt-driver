import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Text } from 'native-base';
import colors, { colorObjs } from '@constants/Colors';

export default class TextBlock extends React.Component {
  propTypes = {
    icon: PropTypes.string,
  };

  render() {
    const { icon, children } = this.props;

    return (
      <View style={styles.block}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.text}>{children}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 4,
    borderColor: colorObjs.lightGray.darken(0.1).toString(),
    borderWidth: 1,
    backgroundColor: colors.lightGray,
  },
  icon: {
    paddingRight: 12,
  },
  text: {
    flexShrink: 1,
  },
});
