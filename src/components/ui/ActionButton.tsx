import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TextStyle,
  ViewStyle,
} from 'react-native';
import colors, { colorObjs } from '@constants/Colors';
import Color from 'color';

const ANIMATION_DURATION = 150;
const ORIGINAL_TRANS = 0;
const SUCCESS_TRANS = 1;
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const firstDefined = (...vars: any[]) => {
  for (const variable of vars) {
    if (typeof variable !== 'undefined') return variable;
  }

  return null;
};

type ActionButtonType =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'darkBlue'
  | 'success'
  | 'danger'
  | 'inverse'
  | 'light'
  | 'gray'
  | 'disabled'
  | 'disabled.hollow';
type ActionButtonSize = 'large' | 'small' | 'default';

type ActionButtonTypeStyles = {
  backgroundColor?: { [key in ActionButtonType]?: Color | string };
  color?: { [key in ActionButtonType]?: Color | string };
  borderColor?: { [key in ActionButtonType]?: Color | string };
  shadowOpacity?: { [key in ActionButtonType]?: number };
  fontWeight?: { [key in ActionButtonType]?: 'bold' };
};

type ActionButtonSizeStyles = {
  fontSize: { [key in ActionButtonSize]?: number };
  padding: { [key in ActionButtonSize]?: number };
};

type ActionButtonColors = {
  backgroundColor: Color | string;
  borderColor: Color | string;
  color: Color | string;
};

type ActionButtonStatus = {
  disabled: boolean;
  type: ActionButtonType;
  size: ActionButtonSize;
};

type AnimateFromToFn = (from: any, to: any) => Animated.AnimatedInterpolation;

type Props = {
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  label?: string | Text;
  renderLabel?: (styles: TextStyle[], animatedStyles: TextStyle[]) => Element;
  before?: (
    status: ActionButtonStatus,
    colors: ActionButtonColors,
    animateFromTo: AnimateFromToFn,
  ) => Element | Element[];
  onPress?: Function;
  onDisabledPress?: Function;
} & Partial<DefaultProps>;

type DefaultProps = ActionButtonStatus &
  ActionButtonStatus & {
    align: 'center';
    loading: boolean;
    animate: boolean;
    hollow: boolean;
    shrink: boolean;
    block: boolean;
    hollowBackground: Color | string;
  };

export default class ActionButton extends Component<Props> {
  static defaultProps: DefaultProps = {
    type: 'default',
    size: 'default',
    align: 'center',
    loading: false,
    disabled: false,
    animate: true,
    block: false,
    shrink: false,
    hollow: false,
    hollowBackground: 'transparent',
  };

  transition: Animated.Value;

  constructor(props: Props) {
    super(props);

    this.transition = new Animated.Value(ORIGINAL_TRANS);
  }

  animateOn() {
    Animated.timing(this.transition, {
      duration: ANIMATION_DURATION,
      toValue: SUCCESS_TRANS,
      useNativeDriver: false,
    }).start();
  }

  animateOff() {
    Animated.timing(this.transition, {
      duration: ANIMATION_DURATION,
      toValue: ORIGINAL_TRANS,
      useNativeDriver: false,
    }).start();
  }

  pressIn() {
    this.animateOn();
  }

  pressOut() {
    this.animateOff();
  }

  componentWillReceiveProps(nextProps: Props) {
    // this.wasDisabled = this.props.disabled;

    if (nextProps.disabled !== this.props.disabled) {
      if (nextProps.disabled) {
        this.animateOn();
      } else {
        this.animateOff();
      }
    }
  }

  getTypeStyle(
    styleName: keyof ActionButtonTypeStyles,
    interpolated: boolean = false,
  ) {
    const { type, disabled, hollow } = this.props;

    let style = activeStyles[styleName],
      inactiveStyle = inactiveStyles[styleName],
      inactivePropValue,
      startOption: ActionButtonType = disabled
        ? hollow
          ? 'disabled.hollow'
          : 'disabled'
        : type,
      option: ActionButtonType = disabled
        ? hollow
          ? 'disabled.hollow'
          : 'disabled'
        : type;

    inactivePropValue = inactiveStyle
      ? firstDefined(inactiveStyle[option], inactiveStyle.default)
      : null;

    let styleValue = style
      ? firstDefined(style[option], style.default, inactivePropValue)
      : inactivePropValue;

    if (interpolated) {
      let startStyleValue = inactiveStyle
        ? firstDefined(
            inactiveStyle[startOption],
            inactiveStyle.default,
            inactivePropValue,
          )
        : inactivePropValue;

      if (typeof startStyleValue.string !== 'undefined') {
        startStyleValue = startStyleValue.string();
      }

      if (typeof styleValue.string !== 'undefined') {
        styleValue = styleValue.string();
      }

      return this.animatedFromTo(startStyleValue, styleValue);
    } else {
      return styleValue;
    }
  }

  getSizeStyle(styleName: keyof ActionButtonSizeStyles) {
    const { size } = this.props;

    return firstDefined(
      sizeStyles[styleName][size],
      sizeStyles[styleName].default,
    );
  }

  getStyle(
    styleName: keyof ActionButtonSizeStyles | keyof ActionButtonTypeStyles,
    interpolated = false,
  ) {
    if (sizeStyles.hasOwnProperty(styleName)) {
      return this.getSizeStyle(styleName as keyof ActionButtonSizeStyles);
    } else {
      return this.getTypeStyle(
        styleName as keyof ActionButtonTypeStyles,
        interpolated,
      );
    }
  }

  animatedFromTo(from: any, to: any): Animated.AnimatedInterpolation {
    return this.transition.interpolate({
      inputRange: [ORIGINAL_TRANS, SUCCESS_TRANS],
      outputRange: [from, to],
    });
  }

  renderText() {
    const { label, renderLabel, textStyle, animate, hollow } = this.props;

    let text: Element | string | undefined = label,
      color = hollow
        ? this.getStyle('borderColor', animate)
        : this.getStyle('color', animate),
      paddingHorizontal = this.getStyle('padding'),
      fontSize = this.getStyle('fontSize'),
      fontWeight = this.getStyle('fontWeight'),
      animatedTextStyles = [
        styles.text,
        textStyle,
        { color, paddingHorizontal, fontSize, fontWeight },
      ],
      textStyles = [
        styles.text,
        textStyle,
        {
          color: hollow ? this.getStyle('borderColor') : this.getStyle('color'),
          paddingHorizontal,
          fontSize,
          fontWeight,
        },
      ];

    if (renderLabel) {
      text = renderLabel(textStyles, animatedTextStyles);
    } else if (typeof text === 'string' || text instanceof String) {
      text = <Animated.Text style={animatedTextStyles}>{text}</Animated.Text>;
    }

    return text;
  }

  renderBefore() {
    const { animate, hollow, hollowBackground, disabled, size, before, type } =
      this.props;

    const colors: ActionButtonColors = {
      backgroundColor: hollow
        ? hollowBackground
        : this.getStyle('backgroundColor', animate),
      borderColor: hollow
        ? this.getStyle('backgroundColor', animate)
        : this.getStyle('borderColor', animate),
      color: hollow ? this.getStyle('borderColor') : this.getStyle('color'),
    };
    const status: ActionButtonStatus = {
      disabled,
      size,
      type,
    };

    if (before) {
      return before(status, colors, this.animatedFromTo.bind(this));
    }
  }

  render() {
    const {
      type,
      hollowBackground,
      label,
      renderLabel,
      loading,
      disabled,
      style,
      textStyle,
      size,
      animate,
      hollow,
      shrink,
      align,
      block: isBlock,
      onDisabledPress,
      ...props
    } = this.props;

    let color = hollow ? this.getStyle('borderColor') : this.getStyle('color'),
      padding = this.getStyle('padding'),
      backgroundColor = hollow
        ? hollowBackground
        : this.getStyle('backgroundColor', animate),
      borderColor = hollow
        ? this.getStyle('backgroundColor', animate)
        : this.getStyle('borderColor', animate),
      shadowOpacity = this.getStyle('shadowOpacity', animate),
      borderWidth = hollow ? 2 : 1,
      shadowRadius = this.animatedFromTo(2, 0),
      opacity = hollow ? this.animatedFromTo(disabled ? 0.7 : 1, 1) : 1,
      flex = isBlock ? 0 : 1,
      width = shrink ? 'auto' : '100%',
      justifyContent = align,
      buttonStyles = [
        styles.button,
        {
          shadowRadius,
          shadowOpacity,
          backgroundColor,
          padding,
          borderColor,
          flex,
          borderWidth,
          opacity,
          width,
          justifyContent,
        },
        style,
      ],
      icon = loading ? (
        <ActivityIndicator
          size='small'
          color={color}
          style={styles.activityIndicator}
        />
      ) : null;

    const useDisabledAction = disabled && onDisabledPress;
    const onPress = useDisabledAction ? onDisabledPress : this.props.onPress;

    return (
      <AnimatedTouchable
        {...props}
        onPress={onPress}
        style={buttonStyles}
        disabled={useDisabledAction ? false : disabled}
        onPressIn={this.pressIn.bind(this)}
        onPressOut={this.pressOut.bind(this)}
        activeOpacity={1}>
        {this.renderBefore()}
        {this.renderText()}
        {icon}
      </AnimatedTouchable>
    );
  }
}

const sizeStyles: ActionButtonSizeStyles = {
  fontSize: {
    large: 16,
    small: 12,
    default: 14,
  },
  padding: {
    large: 12,
    small: 6,
    default: 8,
  },
};

let inactiveStyles: ActionButtonTypeStyles = {
  backgroundColor: {
    primary: colorObjs.primary,
    secondary: colorObjs.secondary,
    darkBlue: colorObjs.darkBlue,
    success: colorObjs.success,
    danger: colorObjs.danger,
    inverse: colorObjs.darkGray,
    gray: colorObjs.lightGray.darken(0.05),
    default: colorObjs.offWhite,
    disabled: colorObjs.disabled,
  },
  color: {
    primary: colors.primaryText,
    secondary: colors.secondaryText,
    success: colors.successText,
    danger: colors.dangerText,
    inverse: colors.white,
    default: colors.text,
    disabled: colors.disabledText,
  },
  borderColor: {
    primary: colorObjs.primary,
    secondary: colorObjs.secondary,
    success: colorObjs.success,
    danger: colorObjs.danger,
    inverse: colorObjs.darkGray,
    gray: colorObjs.lightGray.darken(0.1),
    default: colorObjs.gray,
    light: colorObjs.white,
    disabled: colorObjs.disabled.darken(0.1),
  },
  shadowOpacity: {
    default: 0.25,
    disabled: 0,
  },
  fontWeight: {
    default: 'bold',
  },
};

let activeStyles: ActionButtonTypeStyles = {
  backgroundColor: {
    primary: colorObjs.primary.lighten(0.3),
    secondary: colorObjs.secondary.lighten(0.3),
    success: colorObjs.success.lighten(0.3),
    danger: colorObjs.danger.lighten(0.4),
    default: colorObjs.offWhite.darken(0.15),
    inverse: colorObjs.darkGray.lighten(0.2),
    disabled: colors.disabled,
  },
  shadowOpacity: {
    default: 0,
  },
};

const styles = StyleSheet.create({
  button: {
    shadowColor: colorObjs.darkGray.toString(),
    shadowOffset: { width: 0, height: 2 },
    borderRadius: 4,
    flexDirection: 'row',
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
  },
  activityIndicator: {
    marginVertical: -4,
  },
});
