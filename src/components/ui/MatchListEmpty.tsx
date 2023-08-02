import React, { PureComponent } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Content } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';

type Props = {
  body: string | Element;
};

class MatchListEmpty extends PureComponent<Props> {
  render() {
    const { body } = this.props;
    const bodyComp =
      React.isValidElement(body) || Array.isArray(body) ? (
        body
      ) : (
        <Text style={styles.emptyBody}>{body}</Text>
      );

    return (
      <Content padder style={styles.emptyWrapper}>
        {bodyComp}
      </Content>
    );
  }
}

const styles = StyleSheet.create({
  emptyWrapper: {
    backgroundColor: colors.offWhite,
    padding: 8,
    margin: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 4,
  },
  emptyBody: {
    fontWeight: 'bold',
  },
});

export default connect((state) => ({}))(MatchListEmpty);
