import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'native-base';
import colors from '@constants/Colors';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

type Props = {
  children: Nullable<string>;
  placeholder?: string;
  unit?: string;
  unitMatch?: string;
  icon?: string;
  iconComponent?: Element;
  style?: ViewStyle;
} & Partial<DefaultProps>;

type DefaultProps = {
  disabled: boolean;
};

export default class IconData extends Component<Props> {
  static defaultProps: DefaultProps = {
    disabled: false,
  };
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      children,
      placeholder,
      unit,
      unitMatch,
      icon,
      iconComponent,
      disabled,
      style,
    } = this.props;

    const dataStyles = [disabled && styles.disabledData, styles.data];

    let content;

    if (children && unitMatch) {
      const unitReg = new RegExp(`(${unitMatch})`);
      const strictUnitReg = new RegExp(`^${unitMatch}$`);
      const parts = children.split(unitReg);

      content = parts.map((part) => {
        if (part.match(strictUnitReg)) {
          return <Text style={styles.unit}>{part}</Text>;
        } else {
          return <Text style={dataStyles}>{part}</Text>;
        }
      });
    } else {
      content = [
        <Text style={children ? dataStyles : styles.unit}>
          {children || placeholder}
        </Text>,
        children && unit ? <Text style={styles.unit}> {unit}</Text> : null,
      ];
    }

    return (
      <View style={[styles.wrapper, style]}>
        {iconComponent
          ? iconComponent
          : icon && <FontAwesome5Icon name={icon} style={styles.icon} />}
        {content}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingVertical: 8,
    width: '50%',
  },
  icon: {
    fontSize: 20,
    color: colors.gray,
    marginRight: 8,
  },
  data: {
    fontSize: 17,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  disabledData: {
    color: colors.gray,
  },
  unit: {
    fontSize: 17,
    color: colors.gray,
  },
  disabledUnit: {
    color: colors.gray,
  },
});
