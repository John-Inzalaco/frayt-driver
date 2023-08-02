import React, { Component } from 'react';
import Switch from '@components/ui/Switch';
import {
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
  ViewProperties,
  StyleProp,
  ViewStyle,
} from 'react-native';
import colors, { colorObjs } from '@constants/Colors';
import { Tooltip } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';

const ANIMATION_DURATION = 200;
const OFF_TRANS = 0;
const ON_TRANS = 1;

interface TypeStateStyle {
  backgroundColor?: string;
  color?: string;
}

interface TypeStyle {
  on: TypeStateStyle;
  off: TypeStateStyle;
}

interface TypeStyles {
  default: TypeStyle;
  primary: TypeStyle;
}

export interface BlockSwitchProps extends ViewProperties {
  type: keyof TypeStyles;
  disabled: boolean;
  unclickable: boolean;
  loading: boolean;
  value: boolean;
  light: boolean;
  onValueChange?: (v: boolean) => void;
  subLabel?: string;
  tooltip?: React.ReactElement<{}>;
  tooltipWidth?: number;
  tooltipHeight?: number;
  description?: React.ReactElement<{}> | string;
  containerStyles?: StyleProp<ViewStyle>;
}

interface BlockSwitchState {
  isActive: boolean;
  transition: Animated.Value;
  typeStyle: TypeStyle;
}

export default class BlockSwitch extends Component<
  BlockSwitchProps,
  BlockSwitchState
> {
  static defaultProps: BlockSwitchProps = {
    value: false,
    type: 'default',
    light: false,
    disabled: false,
    unclickable: false,
    loading: false,
    tooltipWidth: 250,
    tooltipHeight: 40,
  };

  static typeStyles: TypeStyles = {
    default: {
      on: {
        backgroundColor: colors.lightGray,
        color: colors.darkGray,
      },
      off: {
        backgroundColor: colors.lightGray,
        color: colors.darkGray,
      },
    },
    primary: {
      off: {
        backgroundColor: colorObjs.lightGray.darken(0.1).toString(),
        color: colors.gray,
      },
      on: {
        backgroundColor: colors.secondary,
        color: colors.white,
      },
    },
  };

  constructor(props: BlockSwitchProps) {
    super(props);

    const { value, type } = this.props;

    this.state = {
      isActive: value,
      transition: new Animated.Value(value ? ON_TRANS : OFF_TRANS),
      typeStyle: this.getTypeStyle(type),
    };
  }

  componentDidUpdate(prevProps: BlockSwitchProps) {
    const { type } = this.props;
    if (prevProps.type !== type) {
      this.setState({ typeStyle: this.getTypeStyle(type) });
    }
  }

  componentWillReceiveProps(nextProps: BlockSwitchProps) {
    if (nextProps.value !== this.state.isActive) {
      this.animateIsActive(nextProps.value);
    }
  }

  getTypeStyle(type: keyof TypeStyles): TypeStyle {
    if (type === 'default') {
      return BlockSwitch.typeStyles[type];
    } else {
      return {
        ...BlockSwitch.typeStyles.default,
        ...BlockSwitch.typeStyles[type],
      };
    }
  }

  animateIsActive(willBeActive: boolean) {
    const { isActive, transition } = this.state;
    this.setState({ isActive: willBeActive });
    Animated.timing(transition, {
      duration: ANIMATION_DURATION,
      toValue: isActive ? OFF_TRANS : ON_TRANS,
      useNativeDriver: false,
    }).start();
  }

  animateFromTo(from: any, to: any) {
    const { transition } = this.state;

    return transition.interpolate({
      inputRange: [OFF_TRANS, ON_TRANS],
      outputRange: [from, to],
    });
  }

  onValueChange(value: boolean) {
    const { onValueChange } = this.props;

    this.animateIsActive(value);
    onValueChange && onValueChange(value);
  }

  render() {
    const { isActive, typeStyle } = this.state;
    const {
        loading,
        children,
        disabled,
        unclickable,
        style,
        light,
        subLabel,
        tooltip,
        tooltipWidth,
        tooltipHeight,
        description,
        containerStyles,
      } = this.props,
      backgroundColor = this.animateFromTo(
        light ? colors.white : typeStyle.off.backgroundColor,
        typeStyle.on.backgroundColor,
      ),
      color = this.animateFromTo(typeStyle.off.color, typeStyle.on.color),
      icon = loading ? (
        <ActivityIndicator
          size='small'
          color={isActive ? typeStyle.on.color : typeStyle.off.color}
          style={styles.indicator}
        />
      ) : null,
      opacity = disabled ? 0.7 : 1;

    return (
      <View style={containerStyles}>
        <TouchableWithoutFeedback
          onPress={() => this.onValueChange(!this.state.isActive)}
          disabled={disabled || unclickable}>
          <Animated.View
            style={[styles.wrapper, { backgroundColor, opacity }, style]}>
            {!!description && (
              <Animated.Text style={[styles.description, { color }]}>
                {description}
              </Animated.Text>
            )}
            <Animated.Text style={[styles.label, { color }]}>
              {children}
            </Animated.Text>
            {!!subLabel && (
              <Animated.Text style={[styles.subLabel, { color }]}>
                {subLabel}
              </Animated.Text>
            )}
            {!!tooltip && (
              <View style={styles.tooltip}>
                <Tooltip
                  height={tooltipHeight}
                  width={tooltipWidth}
                  backgroundColor={colors.primary}
                  withPointer={false}
                  popover={tooltip}>
                  <Icon
                    size={26}
                    name='md-information-circle-outline'
                    color={colors.lightGray}
                  />
                </Tooltip>
              </View>
            )}
            <View style={styles.switchWrapper}>
              {icon}
              <Switch
                value={this.state.isActive}
                disabled={disabled || unclickable}
                controlled={true}
              />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    width: '100%',
  },
  switchWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  indicator: {
    marginHorizontal: 12,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    flexShrink: 0,
  },
  subLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    flexGrow: 1,
    marginLeft: 5,
  },
  tooltip: {
    flexShrink: 0,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  description: {
    paddingBottom: 5,
    width: '100%',
  },
});
