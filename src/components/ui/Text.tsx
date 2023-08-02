import React, { Component } from 'react';
import { Text as NBText } from 'native-base';
import colors from '@constants/Colors';

export default class Text extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { style, children, ...props } = this.props;

    const styles = [style, { color: colors.text }];
    return (
      <NBText style={styles} {...props}>
        {children}
      </NBText>
    );
  }
}
