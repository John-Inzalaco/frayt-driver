import React, { Component } from 'react';

import { Animated, Easing } from 'react-native';

export default class Spin extends Component {
  transition = new Animated.Value(0);

  componentDidMount() {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.transition, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(this.transition, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }

  render() {
    const spin = this.transition.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const color = this.transition.interpolate({
      inputRange: [0, 1],
      outputRange: ['red', 'green'],
    });

    const { children, style, ...props } = this.props;

    return (
      <Animated.View
        style={[
          {
            transform: [{ rotate: spin }],
          },
          style,
        ]}
        {...props}>
        {children}
      </Animated.View>
    );
  }
}
