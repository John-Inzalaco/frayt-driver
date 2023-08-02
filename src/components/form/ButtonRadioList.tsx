import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import ActionButton from '@components/ui/ActionButton';
import PropTypes from 'prop-types';

export default class ButtonRadioList extends React.Component {
  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.bool,
          PropTypes.number,
        ]).isRequired,
      }),
    ).isRequired,
    hollow: PropTypes.bool,
    size: PropTypes.string,
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    activeType: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
    defaultType: PropTypes.oneOf(['light', 'default']),
  };

  static defaultProps = {
    multiple: true,
    activeType: 'secondary',
    defaultType: 'default',
    hollow: false,
  };

  state = {
    value: this.props.value || this.props.defaultValue,
  };

  componentWillReceiveProps(nextProps) {
    const { value } = this.state;

    if (nextProps.value !== undefined && nextProps.value !== value) {
      this.setState({ value: nextProps.value });
    }
  }

  setValue(value) {
    const { onChange } = this.props;

    this.setState({ value });
    onChange && onChange(value);
  }

  renderRadio(props, style, animateFromTo) {
    const isActive = props.type === this.props.activeType;

    const radioStyle = {
      backgroundColor: style.backgroundColor,
      borderColor: isActive ? style.color : style.borderColor,
    };

    const innerSize = 12;
    const innerStyle = {
      backgroundColor: isActive ? style.color : 'transparent',
      width: animateFromTo(innerSize, 0),
      height: animateFromTo(innerSize, 0),
      margin: animateFromTo(8 - innerSize / 2, 8),
      borderRadius: animateFromTo(innerSize / 2, 0),
    };

    return (
      <Animated.View style={[styles.radio, radioStyle]}>
        <Animated.View style={[styles.innerRadio, innerStyle]} />
      </Animated.View>
    );
  }

  renderOptions() {
    const { options, hollow, activeType, defaultType, size } = this.props;
    const { value } = this.state;

    return options.map((option) => (
      <ActionButton
        label={option.label}
        type={value === option.value ? activeType : defaultType}
        onPress={() => this.setValue(option.value)}
        hollow={hollow}
        size={size}
        align='flex-start'
        before={this.renderRadio.bind(this)}
        block
      />
    ));
  }

  render() {
    return <View {...this.props}>{this.renderOptions()}</View>;
  }
}

const styles = StyleSheet.create({
  radio: {
    borderRadius: 10,
    height: 20,
    width: 20,
    borderWidth: 2,
  },
});
