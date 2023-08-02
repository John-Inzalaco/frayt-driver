import React from 'react';
import { StyleSheet, ViewProps, ViewStyle } from 'react-native';
import RNPickerSelect, { Item } from 'react-native-picker-select';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors, { colorObjs } from '@constants/Colors';
import { Text, View, Textarea } from 'native-base';

type InputValue = Nullable<string>;

type SelectProps = {
  items: Item[];
  value?: InputValue;
  placeholder?: Item;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  otherValue?: Nullable<string>;
  otherPlaceholder?: string;
  otherInput?: typeof React.Component;
  otherInputWrapper?: (input: JSX.Element) => JSX.Element;
  otherStyle?: Partial<ViewStyle>;
} & ViewProps;

type SelectState = {
  value: InputValue;
  label: Nullable<string>;
  other: Nullable<string>;
  isOther: boolean;
};

export default class Select extends React.Component<SelectProps, SelectState> {
  picker = React.createRef();
  state = {
    value: null,
    label: null,
    other: null,
    isOther: false,
  };

  componentDidMount() {
    const { placeholder, value } = this.props;
    const val = value ? value : placeholder ? placeholder.value : null;
    this.changeValue(val);
  }

  compileItem(item?: Item, color = colors.text): Nullable<Item> {
    if (item) {
      if (typeof item === 'string') {
        return {
          label: item,
          value: item,
          color,
        };
      } else {
        return {
          ...item,
          color: item.color ? item.color : color,
        };
      }
    } else {
      return null;
    }
  }

  async changeValue(newValue: InputValue) {
    const { value } = this.state;
    const { onValueChange, otherValue } = this.props;

    if (value !== newValue) {
      this.setState({ value: newValue });
    }

    if (otherValue === newValue) {
      this.changeOtherValue('');
    } else {
      onValueChange && onValueChange(newValue || '');
    }
  }

  changeOtherValue(newValue: InputValue) {
    const { other } = this.state;
    const { onValueChange } = this.props;

    if (other !== newValue) {
      this.setState({ other: newValue });
    }

    onValueChange && onValueChange(newValue || '');
  }

  renderOtherInput() {
    const {
      otherValue,
      otherPlaceholder,
      otherInput: Input,
      otherInputWrapper,
      otherStyle,
      disabled,
    } = this.props;
    const { value } = this.state;

    let input = null;

    if (value === otherValue) {
      input = Input ? (
        <Input
          style={otherStyle}
          disabled={disabled}
          onChangeText={this.changeOtherValue.bind(this)}
        />
      ) : (
        <Textarea
          style={otherStyle}
          placeholder={otherPlaceholder}
          disabled={disabled}
          onChangeText={this.changeOtherValue.bind(this)}
          rowSpan={2}
          bordered={false}
          underline={false}
        />
      );

      input = otherInputWrapper ? otherInputWrapper(input) : input;
    }

    return input;
  }

  render() {
    const {
      items: rawItems,
      placeholder: rawPlaceholder,
      style,
      value,
      disabled,
      ...props
    } = this.props;
    const items = rawItems.map((item) => this.compileItem(item)) as Item[];
    const placeholder = this.compileItem(rawPlaceholder);
    const item = items.find((i) => i.value === value);
    const label =
      placeholder?.value === value
        ? placeholder?.label
        : item?.label || item?.value;

    return (
      <View style={styles.pickerWrapper}>
        <RNPickerSelect
          value={value}
          style={{ ...selectStyles, style }}
          items={items}
          placeholder={placeholder || undefined}
          Icon={() => <FontAwesome5 name='angle-down' style={styles.icon} />}
          onValueChange={this.changeValue.bind(this)}
          disabled={disabled}
          {...props}>
          <View style={[styles.labelWrapper, disabled && { opacity: 0.7 }]}>
            <Text style={styles.label}>{label}</Text>
            <FontAwesome5 name='angle-down' style={styles.icon} />
          </View>
        </RNPickerSelect>
        {this.renderOtherInput()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    color: colors.text,
    marginBottom: -10,
    lineHeight: 22,
    fontSize: 22,
  },
  label: {
    color: colors.text,
  },
  pickerWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  labelWrapper: {
    padding: 12,
    borderRadius: 4,
    borderColor: colors.gray,
    borderWidth: 1,
    shadowRadius: 2,
    shadowOpacity: 0.25,
    shadowColor: colorObjs.darkGray.toString(),
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: colorObjs.offWhite.toString(),
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const selectStyles = StyleSheet.create({
  inputIOS: {
    color: colors.text,
    padding: 12,
    borderRadius: 4,
    borderColor: colors.gray,
    borderWidth: 1,
    shadowRadius: 2,
    shadowOpacity: 0.25,
    shadowColor: colorObjs.darkGray.toString(),
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: colorObjs.offWhite.toString(),
    marginBottom: 10,
  },
});
