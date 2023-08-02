import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from 'native-base';
import colors from '@constants/Colors';

export default class SectionHeading extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{this.props.title}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    width: '94%',
    marginLeft: '3%',
    marginBottom: 10,
    borderBottomColor: colors.text,
  },
  text: {
    color: colors.text,
    fontWeight: '600',
    padding: 5,
    borderBottomWidth: 5,
    fontSize: 20,
    borderBottomColor: colors.text,
    width: '80%',
  },
});
