import { Toast } from 'native-base';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

type ErrorMessageProps = {
  touched: any;
  errors: any;
  field: string;
};

export const humanReadableKey = (error: string) =>
  error
    .split('_')
    .map(
      (letter) => letter[0].toUpperCase() + letter.substring(1).toLowerCase(),
    )
    .join(' ');

export const formErrorsToast = (errors: any) => {
  if (Object.keys(errors).length) {
    let message = '';
    for (const [key, value] of Object.entries(errors)) {
      message = `${humanReadableKey(key)}: ${value}\n${message}`;
    }
    Toast.show({ text: message, duration: 3000 });
  }
};

export function ErrorMessage({ touched, errors, field }: ErrorMessageProps) {
  return errors[field] && touched[field] ? (
    <Text style={styles.errorMsg}>{errors[field]}</Text>
  ) : null;
}

const styles = StyleSheet.create({
  errorMsg: {
    color: '#FFAAAA',
    paddingTop: 10,
    fontWeight: 'bold',
  },
});
