import {
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
  EasingFunction,
} from 'react-native';

type Style = ViewStyle | TextStyle;

export interface Formats {
  [name: string]: FormatComponents;
}

export type FormatsFunction<F> = (vars: any) => F;

function isFormatsFunction<F>(
  arg: F | FormatsFunction<F>,
): arg is FormatsFunction<F> {
  return arg instanceof Function;
}

export interface FormatComponents {
  [name: string]: FormatStatesBase;
}

export interface FormatStatesBase {
  [name: string]: Style;
}

export interface PressableFormatStates {
  default: Style;
  focus: Style;
  disabled: Style;
}

export interface ToggleableFormatStates {
  on: Style;
  off: Style;
}

export enum ToggleableStates {
  on = 'on',
  off = 'off',
}

export enum PressableStates {
  default = 'default',
  focus = 'focus',
  disabled = 'disabled',
}

interface FormatAnimatorOptions<S> {
  duration: number;
  easing: EasingFunction;
  startState?: keyof S;
}

export default class FormatAnimator<F, C, S> {
  static defaultOptions = {
    duration: 150,
    easing: Easing.ease,
  };

  public duration: number;
  public easing: EasingFunction;
  public startState: keyof S | undefined;

  constructor(
    public formats: FormatsFunction<F> | F,
    public stateValues: { [key in keyof S]: number },
    options: Partial<FormatAnimatorOptions<S>> = {},
  ) {
    const combinedOptions: FormatAnimatorOptions<S> = {
      ...FormatAnimator.defaultOptions,
      ...options,
    };
    const { duration, startState, easing } = combinedOptions;

    this.duration = duration;
    this.easing = easing;
    this.startState = startState;
  }

  create(format: keyof F, state: keyof S): FormatAnimation<F, C, S> {
    return new FormatAnimation(this, format, state);
  }
}

export class FormatAnimation<F, C, S> {
  public animationValue: Animated.Value;
  public currentValue: number;

  constructor(
    public animator: FormatAnimator<F, C, S>,
    public format: keyof F,
    public currentState: keyof S,
  ) {
    this.currentValue = this.getStateValue();

    this.animationValue = new Animated.Value(this.currentValue);

    this.getAnimatedStyles.bind(this);
    this.getStyles.bind(this);
  }

  interpolate(prop: keyof Style, stateStyles: S) {
    const { stateValues } = this.animator;
    let range: { input: number; output: any }[] = [];

    for (const state in stateValues) {
      const stateValue = stateValues[state];
      const styles = stateStyles[state] as Style;

      range[stateValue] = {
        input: stateValue,
        output: styles[prop],
      };

      range = [...range].filter((r) => r);
    }

    return this.animationValue.interpolate({
      inputRange: range.map((set) => set.input),
      outputRange: range.map((set) => set.output),
    });
  }

  getStateValue(state = this.currentState): number {
    const { stateValues } = this.animator;

    return stateValues[state];
  }

  setState(stateName: keyof S) {
    const { duration, easing } = this.animator;

    this.currentState = stateName;
    this.currentValue = this.getStateValue();

    Animated.timing(this.animationValue, {
      toValue: this.currentValue,
      duration,
      easing,
      useNativeDriver: false,
    }).start();
  }

  getAnimatedStyles(compName: keyof C, vars: any = null) {
    const statesStyles = this.getStatesStyles(compName, vars);
    const stateStyles = statesStyles[this.currentState];
    const props = Object.keys(stateStyles);
    const styles: { [key in keyof Style]?: any } = {};

    for (const prop of props) {
      styles[prop as keyof Style] = this.interpolate(
        prop as keyof Style,
        statesStyles,
      );
    }

    return styles;
  }

  getStatesStyles(compName: keyof C, vars: any = null): S {
    const { animator } = this;
    const { format: formatKey } = this;
    const formats: F = isFormatsFunction(animator.formats)
      ? animator.formats(vars)
      : animator.formats;
    const components = formats[formatKey] as unknown as C,
      states = components[compName] as unknown as S;

    return states;
  }

  getStyles(
    compName: keyof C,
    state: keyof S = this.currentState,
    vars: any = null,
  ): Style {
    const states = this.getStatesStyles(compName, vars),
      styles = states[state];

    return styles;
  }
}
