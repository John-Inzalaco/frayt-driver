import React from 'react';
import { StyleSheet, InputAccessoryView, Platform } from 'react-native';
import PropTypes, { number } from 'prop-types';
import { Text, View } from 'native-base';
import {
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import CustomProp from '@lib/CustomProp';
import colors, { colorObjs } from '@constants/Colors';
export default class NumberInput extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    minimum: PropTypes.number,
    maximum: PropTypes.number,
    precision: CustomProp.inRangeOf(0, Infinity),
    step: PropTypes.number,
    snap: PropTypes.bool,
    onChange: PropTypes.func,
    append: PropTypes.string,
    prepend: PropTypes.string,
    digits: CustomProp.inRangeOf(0, 15),
    fixedLength: PropTypes.bool,
    commas: PropTypes.bool,
    label: PropTypes.string,
    defaultValue: PropTypes.number,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    snap: false,
    fixedLength: false,
    append: '',
    prepend: '',
    precision: Infinity,
    commas: false,
  };

  state = {
    value: null,
    textValue: null,
    isFocused: false,
    selection: {
      start: Infinity,
      end: Infinity,
    },
    inputId:
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
  };

  componentDidMount() {
    const { value, defaultValue, precision } = this.props;
    this.updateValue(
      defaultValue === undefined || defaultValue === null
        ? value === undefined || value === null
          ? null
          : value.toFixed(precision)
        : defaultValue.toFixed(precision),
    );
  }

  componentWillReceiveProps(nextProps) {
    const { value } = this.props;
    if (nextProps.value !== value) {
      this.updateValue(nextProps.value);
    }
  }

  isFixedLength() {
    const { precision, fixedLength } = this.props;
    return fixedLength && precision < Infinity;
  }

  reduceValue(rawValue) {
    const {
      minimum,
      maximum,
      snap,
      step,
      precision,
      append,
      prepend,
      digits,
      commas,
    } = this.props;
    const { isFocused } = this.state;
    const isFixed = this.isFixedLength();
    const isSet = (v) => {
      return v !== undefined && v !== null;
    };

    let value = null,
      stringValue = '';

    if (rawValue) {
      const escReg = /[.*+?^${}()|[\]\\]/g;
      const appendReg = new RegExp(`^${append.replace(escReg, '\\$&')}`);
      const prependReg = new RegExp(`${prepend.replace(escReg, '\\$&')}$`);

      let initialValue = `${rawValue}`.replace(/[^\d.-]/g, '');
      let decimalLength = 0;

      if (!isFixed) {
        initialValue = initialValue
          .replace(appendReg, '')
          .replace(prependReg, '');
      }
      let [integer = '', decimalPoint = '', decimal = ''] =
        initialValue.split(/(\.)/g);

      if (isFixed) {
        if (decimal.length > precision) {
          const offset = decimal.length - precision;
          integer = integer + decimal.substring(0, offset);
          decimal = decimal.substring(offset);
        }

        if (decimal.length < precision) {
          const offset = integer.length + decimal.length - precision;
          decimal = integer.substring(offset) + decimal;
          integer = integer.substring(0, offset);
        }

        if (isSet(digits) && integer.length > digits) {
          decimal = integer.substring(digits) + decimal;
          decimal = decimal.substring(0, precision);
          integer = integer.substring(0, digits);
        }

        value = integer + '.' + decimal;

        value = parseFloat(value);

        const multiplier = Math.pow(10, precision);

        value = Math.round(value * multiplier) / multiplier;
      } else {
        const cleanedDecimal = decimal.substring(0, precision);
        decimalLength = cleanedDecimal.length;
        value = integer.substring(0, digits) + decimalPoint + cleanedDecimal;

        value = parseFloat(value);
      }

      if (!isFixed || !isFocused) {
        if (isSet(minimum)) {
          value = Math.max(minimum, value);
        }

        if (isSet(maximum)) {
          value = Math.min(maximum, value);
        }

        if (snap && isSet(step)) {
          value -= value % step;
        }

        if (!isFixed) {
          stringValue = isNaN(value)
            ? ''
            : decimalLength > 0
            ? value.toFixed(decimalLength)
            : value + decimalPoint;
        }
      }
    }

    if (isFixed) {
      value = isNaN(value) || value === null ? 0 : value;

      stringValue = value.toFixed(precision);
    }

    if (commas) {
      stringValue = stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return {
      value,
      stringValue,
    };
  }

  async onFocus() {
    await this.setState({ isFocused: true });
    this.moveSelection();
  }

  async onBlur() {
    await this.setState({ isFocused: false });
    this.updateValue(this.state.stringValue);
  }

  focus() {
    this.input && this.input.focus();
  }

  blur() {
    this.input && this.input.blur();
  }

  async clear(e) {
    await this.updateValue('');
  }

  async updateSelection({ nativeEvent: { selection } }) {
    const { frozenSelection } = this.state;

    if (frozenSelection) {
      this.setState({ frozenSelection: false });
    } else {
      this.setState({ selection });
    }

    this.moveSelection();
  }

  async updateValue(rawValue) {
    const { onChange, append, prepend } = this.props;
    const { value, stringValue } = this.reduceValue(rawValue);
    const textValue = append + stringValue + prepend;

    this.setState({
      value,
      stringValue,
      textValue,
      frozenSelection: textValue !== rawValue,
    });

    onChange && onChange(value);
  }

  moveSelection() {
    const { append } = this.props;
    const { selection: oldSelection, stringValue } = this.state;
    const isFixed = this.isFixedLength();
    const startPosition = append.length;
    const endPosition = isFixed
      ? stringValue.length
      : append.length + stringValue.length;
    const position =
      oldSelection.end === oldSelection.start
        ? isFixed
          ? oldSelection.end !== endPosition
            ? endPosition
            : null
          : oldSelection.start < startPosition
          ? startPosition
          : oldSelection.end > endPosition
          ? endPosition
          : null
        : null;
    const selection =
      position === null
        ? oldSelection
        : {
            start: position,
            end: position,
          };

    // if (oldSelection.start !== selection.start && oldSelection.end !== selection.end) {
    // this.input.setNativeProps({selection});
    this.setState({ selection });
    // }
  }

  render() {
    const {
      value: passedValue,
      label,
      minimum,
      maximum,
      step,
      append,
      prepend,
      onChange,
      style,
      focusStyle,
      textStyle,
      focusTextStyle,
      labelStyle,
      focusLabelStyle,
      ...props
    } = this.props;
    const { textValue, stringValue, isFocused, inputId } = this.state;
    const keyboardType =
      Platform.OS === 'ios' && (minimum === undefined || minimum < 0)
        ? 'numbers-and-punctuation'
        : 'numeric';
    const isFixed = this.isFixedLength();
    const focusStyles = [
      styles.wrapper,
      style,
      isFocused && [styles.focusWrapper, focusStyle],
    ];
    const labelStyles = [
      styles.label,
      labelStyle,
      isFocused && [styles.focusLabel, focusLabelStyle],
    ];
    const textStyles = [styles.text, textStyle, isFocused && focusTextStyle];
    let output = [];

    if (isFixed) {
      output.push(
        <TouchableWithoutFeedback
          style={focusStyles}
          onPress={this.focus.bind(this)}>
          {label && <Text style={labelStyles}>{label}</Text>}
          <Text style={textStyles}>{textValue}</Text>
          <TextInput
            onSelectionChange={this.updateSelection.bind(this)}
            onChangeText={this.updateValue.bind(this)}
            onFocus={this.onFocus.bind(this)}
            onBlur={this.onBlur.bind(this)}
            keyboardType={keyboardType}
            value={stringValue}
            ref={(i) => (this.input = i)}
            multiline={true}
            blurOnSubmit={true}
            numberOfLines={1}
            style={styles.hiddenInput}
            inputAccessoryViewID={inputId}
            {...props}
          />
        </TouchableWithoutFeedback>,
      );
    } else {
      output.push(
        <TouchableWithoutFeedback
          style={focusStyles}
          onPress={this.focus.bind(this)}>
          {label && <Text style={labelStyles}>{label}</Text>}
          <TextInput
            onChangeText={this.updateValue.bind(this)}
            onSelectionChange={this.updateSelection.bind(this)}
            onFocus={this.onFocus.bind(this)}
            onBlur={this.onBlur.bind(this)}
            keyboardType={keyboardType}
            value={textValue}
            ref={(i) => (this.input = i)}
            multiline={true}
            blurOnSubmit={true}
            numberOfLines={1}
            style={textStyles}
            {...props}
          />
        </TouchableWithoutFeedback>,
      );
    }

    if (keyboardType === 'decimal-pad' && Platform.OS === 'ios') {
      output.push(
        <InputAccessoryView nativeID={inputId}>
          <View style={styles.inputActionBar}>
            <TouchableOpacity onPress={this.clear.bind(this)}>
              <Text style={styles.inputAction}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.blur.bind(this)}>
              <Text style={styles.inputAction}>Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>,
      );
    }

    return output;
  }
}

const styles = StyleSheet.create({
  inputActionBar: {
    backgroundColor: colors.lightGray,
    borderTopWidth: 1,
    borderColor: colorObjs.lightGray.darken(0.05).toString(),
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputAction: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  hiddenInput: {
    display: Platform.OS === 'ios' ? 'none' : 'flex',
    height: 0,
  },
  wrapper: {
    borderColor: colors.gray,
    borderBottomWidth: 1,
  },
  focusWrapper: {
    borderColor: colors.secondary,
    borderBottomWidth: 2,
  },
  text: {
    color: colors.darkGray,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  label: {
    color: colors.gray,
    fontSize: 14,
  },
  focusLabel: {
    color: colors.secondary,
  },
});
