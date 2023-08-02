import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import colors from '@constants/Colors';
import PropTypes from 'prop-types';

const ANIMATION_DURATION = 300;
const START_TRANS = 0;
const END_TRANS = 1;

export default class ScreenIndicator extends React.Component {
  static propTypes = {
    screen: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /** `steps` should be an array of the following object
     *  {
     *      screen: string.required
     *      name: string.optional,
     *  }
     */
    steps: PropTypes.arrayOf(PropTypes.object).isRequired,
    startFrom: PropTypes.number,
    endAt: PropTypes.number,
  };

  static defaultProps = {
    startFrom: 0,
    endAt: 10,
    screen: null,
    steps: [],
  };

  state = {
    step: 0,
    prevProgress: 0,
    progress: 0,
  };

  progressTransition = new Animated.Value(START_TRANS);

  async componentDidMount() {
    const step = this.getStep();
    await this.setState({
      step,
      progress: this.getProgress(step),
    });
    this.animateProgress();
  }

  async componentWillReceiveProps(nextProps) {
    const { steps } = this.props;
    const step = this.getStep(nextProps);

    if (step !== this.state.step || steps !== nextProps.steps) {
      const progress = this.getProgress(step, nextProps.steps);
      const prevProgress = this.state.progress;
      if (progress !== prevProgress) {
        await this.setState({ step, progress, prevProgress });
        this.animateProgress();
      } else {
        this.setState({ step });
      }
    }
  }

  animateProgress() {
    Animated.timing(this.progressTransition, {
      toValue: START_TRANS,
      duration: 0,
      useNativeDriver: false,
    }).start();

    Animated.timing(this.progressTransition, {
      duration: ANIMATION_DURATION,
      toValue: END_TRANS,
      useNativeDriver: false,
    }).start();
  }

  getStep(props = this.props) {
    const { steps, screen } = props;

    let step = {};

    if (screen !== null && screen !== undefined) {
      if (steps[screen]) {
        step = steps[screen];
        step.index = screen;
      } else {
        step.index = steps.findIndex((s) => s.screen === screen);
        step = {
          ...step,
          ...steps[step.index],
        };
      }
    }

    return step.index >= 0 ? step : null;
  }

  getProgress(step, steps = this.props.steps) {
    return step ? (step.index + 1) / steps.length : 0;
  }

  render() {
    const { startFrom, endAt } = this.props;
    const { progress, prevProgress } = this.state;
    const startWidth = startFrom + prevProgress * (100 - startFrom - endAt);
    const endWidth = startFrom + progress * (100 - startFrom - endAt);

    const width = this.progressTransition.interpolate({
      inputRange: [START_TRANS, END_TRANS],
      outputRange: [startWidth + '%', endWidth + '%'],
    });

    return (
      <View style={styles.wrapper}>
        <Animated.View style={[styles.indicator, { width }]} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  indicator: {
    height: 5,
    backgroundColor: colors.secondary,
  },
});
