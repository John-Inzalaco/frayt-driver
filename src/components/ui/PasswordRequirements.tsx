import React from 'react';
import { Text } from 'native-base';
import { StyleSheet } from 'react-native';

export class PasswordRequirements extends React.Component {
  render() {
    return (
      <Text style={styles.text}>
        Password must meet the following requirements:
        {'\n'} • Be a minimum of 8 characters long
        {'\n'} • Contain at least one number
        {'\n'} • Contain at least one special character
      </Text>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    marginTop: 16,
    marginBottom: 8,
  },
});
