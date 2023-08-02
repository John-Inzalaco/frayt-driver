import React from 'react';
import { Item, Label, Input, NativeBase } from 'native-base';
import { TextStyle } from 'react-native';

type Props = {
  style?: TextStyle;
  inputStyle?: TextStyle;
  itemProps?: Partial<NativeBase.Item>;
};

export default function PhoneInputTextField({
  style,
  inputStyle,
  itemProps,
}: Props) {
  return (props: any) => {
    return (
      <Item floatingLabel {...itemProps}>
        <Label style={style}>Phone Number</Label>
        <Input {...props} style={inputStyle} />
      </Item>
    );
  };
}
