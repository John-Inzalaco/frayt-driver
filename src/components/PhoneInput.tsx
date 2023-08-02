import React from 'react';
import { StyleSheet, TextInput, TextStyle } from 'react-native';
import { View, Text, Item, NativeBase } from 'native-base';
import RNPhoneInput from 'react-native-phone-input';
import colors from '@constants/Colors';
import PhoneInputTextField from '@components/PhoneInputTextField';

type State = {
  phoneNumber: Nullable<string>;
  error: Nullable<string>;
  component: any;
};

type Props = {
  phoneNumber: string;
  onChange?: (value: string, error: string | null) => void;
  style?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  itemProps?: Partial<NativeBase.Item>;
};

export default class PhoneInput extends React.Component<Props, State> {
  phoneNumber = React.createRef<RNPhoneInput>();

  constructor(props: Props) {
    super(props);
    const { phoneNumber } = this.props;

    this.state = {
      phoneNumber: this.sanitizePhone(phoneNumber),
      error: null,
      component: null,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    const { style, inputStyle, itemProps } = this.props;

    const component = PhoneInputTextField({
      style,
      inputStyle,
      itemProps,
    }) as unknown as typeof TextInput;

    this.setState({ component });
  }

  sanitizePhone = (phone_number: Nullable<string>) => {
    return phone_number ? phone_number.replace(/[^\d\+]/g, '') : '';
  };

  isValid() {
    const input = this.phoneNumber.current,
      isValid = input.isValidNumber(),
      type = input.getNumberType();

    return isValid && type !== 'FIXED_LINE';
  }

  async handleChange() {
    const { onChange } = this.props,
      input = this.phoneNumber.current,
      phoneNumber = this.sanitizePhone(input.getValue()),
      isValid = input.isValidNumber(),
      type = input.getNumberType();

    let error = null;

    if (!isValid) {
      error = 'Not a valid phone number';
    } else if (type === 'FIXED_LINE') {
      error = 'Cannot be a landline';
    }

    await this.setState({
      phoneNumber,
      error,
    });

    onChange && onChange(phoneNumber, error);
  }

  render() {
    const { errorStyle } = this.props;
    const { phoneNumber, error, component } = this.state;

    return [
      <RNPhoneInput
        ref={this.phoneNumber}
        textComponent={component}
        onChangePhoneNumber={() => this.handleChange()}
        onSelectCountry={() => this.handleChange()}
        value={phoneNumber || undefined}
      />,
      error && (
        <View>
          <Text
            style={
              errorStyle || [styles.text, styles.boldText, styles.warningText]
            }>
            {error}
          </Text>
        </View>
      ),
    ];
  }
}

const styles = StyleSheet.create({
  text: {
    color: colors.darkGray,
    marginBottom: 8,
    marginTop: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  warningText: {
    color: colors.danger,
  },
});
