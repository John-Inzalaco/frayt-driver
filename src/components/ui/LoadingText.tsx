import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from 'native-base';
import colors from '@constants/Colors';

type Props = {
  label: string | Element;
  style?: ViewStyle;
  textStyle?: TextStyle;
  inactiveLabel?: string | Element;
} & Partial<DefaultProps>;

type DefaultProps = {
  color: string;
  size: number;
  inline: boolean;
  loading: boolean;
};

type IconSize = 'small' | 'large';

export default class LoadingText extends Component<Props> {
  static defaultProps: DefaultProps = {
    color: colors.darkGray,
    size: 16,
    inline: false,
    loading: true,
  };

  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      label,
      color,
      size,
      inline,
      style,
      textStyle,
      loading,
      inactiveLabel,
    } = this.props;

    let iconSize: IconSize = size! <= 24 ? 'small' : 'large';

    return (
      <View style={[inline && styles.inline, style]}>
        <Text
          style={[
            styles.text,
            {
              color: color,
              fontSize: size,
              lineHeight: size! * 0.75,
              marginRight: inline ? size! * 0.25 : 0,
            },
            textStyle,
          ]}>
          {loading ? label : inactiveLabel}{' '}
        </Text>
        {loading && <ActivityIndicator color={color} size={iconSize} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    margin: 0,
  },
});
