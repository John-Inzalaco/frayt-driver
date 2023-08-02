import React, { Component } from 'react';
import colors, { colorObjs } from '@constants/Colors';
import {
  TouchableWithoutFeedback,
  Animated,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import FormatAnimator, {
  ToggleableFormatStates,
  ToggleableStates,
  FormatAnimation,
} from '@lib/FormatAnimator';

interface SwitchFormats {
  primary: SwitchFormatComponents;
  secondary: SwitchFormatComponents;
}

interface SwitchFormatComponents {
  circle: ToggleableFormatStates;
  slider: ToggleableFormatStates;
}

interface SwitchProps {
  onValueChange?: Function;
  circleSize: number;
  sliderPadding: number;
  sliderLength: number;
  format: keyof SwitchFormats;
  value: boolean;
  disabled: boolean;
  controlled: boolean;
  style: ViewStyle;
}

interface SwitchState {
  value: boolean;
  state: ToggleableStates;
}

interface SwitchAnimationVars {
  slideDistance: number;
}

export default class Switch extends Component<SwitchProps, SwitchState> {
  static defaultProps: Partial<SwitchProps> = {
    circleSize: 24,
    sliderPadding: 3,
    sliderLength: 54,
    format: 'secondary',
    disabled: false,
    value: false,
    controlled: false,
  };

  public animation: FormatAnimation<
    SwitchFormats,
    SwitchFormatComponents,
    ToggleableFormatStates
  >;

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
      state: this.props.value ? ToggleableStates.on : ToggleableStates.off,
    };

    this.animation = animationStyles.create(
      this.props.format,
      this.state.state,
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { value } = this.props;

    let state: any = {};
    if (prevProps.value !== value || prevState.value !== this.state.value) {
      state.value = prevProps.value !== value ? value : this.state.value;
      state.state = state.value ? ToggleableStates.on : ToggleableStates.off;
    }

    if (Object.keys(state).length > 0) {
      this.animation.setState(state.state);

      this.setState(state);
    }
  }

  handlePress() {
    const { onValueChange } = this.props;
    const { value } = this.state;
    const newValue = !value;

    this.setState({ value: newValue });

    onValueChange && onValueChange(newValue);
  }

  renderSwitch() {
    const { circleSize, sliderPadding, sliderLength } = this.props;

    const { animation } = this;

    const sliderHeight = sliderPadding * 2 + circleSize;
    const slideDistance = sliderLength - sliderPadding * 2 - circleSize;

    const sliderStyle = animation.getAnimatedStyles('slider', {
      slideDistance,
    });
    const circleStyle = animation.getAnimatedStyles('circle', {
      slideDistance,
    });

    return (
      <Animated.View
        style={[
          styles.slider,
          sliderStyle,
          {
            padding: sliderPadding,
            width: sliderLength,
            borderRadius: sliderHeight / 2,
          },
        ]}>
        <Animated.View
          style={[
            circleStyle,
            {
              height: circleSize,
              width: circleSize,
              borderRadius: circleSize / 2,
            },
          ]}
        />
      </Animated.View>
    );
  }

  render() {
    const { style, controlled, disabled } = this.props;

    return controlled ? (
      <View style={style}>{this.renderSwitch()}</View>
    ) : (
      <TouchableWithoutFeedback
        style={style}
        onPress={this.handlePress.bind(this)}
        disabled={disabled}>
        {this.renderSwitch()}
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  slider: {
    // padding: 20
  },
});

const animationStyles = new FormatAnimator<
  SwitchFormats,
  SwitchFormatComponents,
  ToggleableFormatStates
>(
  ({ slideDistance }: SwitchAnimationVars) => ({
    primary: {
      slider: {
        on: {
          backgroundColor: colorObjs.primary.darken(0.2).toString(),
        },
        off: {
          backgroundColor: colorObjs.gray.toString(),
        },
      },
      circle: {
        on: {
          backgroundColor: colorObjs.primary.darken(0.2).toString(),
        },
        off: {
          backgroundColor: colorObjs.gray.toString(),
        },
      },
    },
    secondary: {
      slider: {
        on: {
          backgroundColor: colorObjs.secondary.darken(0.2).toString(),
        },
        off: {
          backgroundColor: colors.gray,
        },
      },
      circle: {
        on: {
          backgroundColor: colors.offWhite,
          left: slideDistance,
        },
        off: {
          backgroundColor: colors.offWhite,
          left: 0,
        },
      },
    },
  }),
  {
    on: 0,
    off: 1,
  },
);
