import React from 'react';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';

const HIDDEN_VALUE = 0;
const VISIBLE_VALUE = 1;

export default class ShowHide extends React.Component {
  static propTypes = {
    fade: PropTypes.bool,
    shrink: PropTypes.bool,
    visible: PropTypes.bool,
    animateOnLoad: PropTypes.bool,
    duration: PropTypes.number,
  };

  static defaultProps = {
    fade: true,
    shrink: true,
    visible: true,
    animateOnLoad: true,
    duration: 200,
  };

  state = {
    transition: new Animated.Value(this.getStartValue()),
    visible: this.props.visible,
    height: 0,
  };

  componentDidMount() {
    const { animateOnLoad, visible } = this.props;

    if (animateOnLoad) {
      visible ? this.show() : this.hide();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = this.props;

    if (nextProps.visible !== visible) {
      if (nextProps.visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  getStartValue() {
    const { animateOnLoad, visible } = this.props;

    if (animateOnLoad) {
      return visible ? HIDDEN_VALUE : VISIBLE_VALUE;
    } else {
      return visible ? VISIBLE_VALUE : HIDDEN_VALUE;
    }
  }

  show() {
    const { duration } = this.props;
    this.setState({ visible: true });

    Animated.timing(this.state.transition, {
      duration: duration,
      toValue: VISIBLE_VALUE,
      useNativeDriver: false,
    }).start();
  }

  hide() {
    const { duration } = this.props;

    Animated.timing(this.state.transition, {
      duration: duration,
      toValue: HIDDEN_VALUE,
      useNativeDriver: false,
    }).start(() => {
      this.setState({ visible: false });
    });
  }

  animateFromTo(from, to) {
    const { transition } = this.state;

    return transition.interpolate({
      inputRange: [HIDDEN_VALUE, VISIBLE_VALUE],
      outputRange: [from, to],
    });
  }

  render() {
    const { children, fade, shrink } = this.props;
    const { visible, height } = this.state;
    const onLayout = (e) => {
      this.setState({ height: e.nativeEvent.layout.height });
    };

    const style = {};
    const innerStyle = {};

    if (fade) {
      style.opacity = this.animateFromTo(0, 1);
    }

    if (shrink) {
      innerStyle.marginTop = this.animateFromTo(-height, 0);
      style.overflow = 'hidden';
    }

    return (
      visible && (
        <Animated.View style={style}>
          <Animated.View style={innerStyle} onLayout={onLayout.bind(this)}>
            {children}
          </Animated.View>
        </Animated.View>
      )
    );
  }
}
