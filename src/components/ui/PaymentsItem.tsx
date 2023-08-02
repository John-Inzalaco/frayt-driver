import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text } from 'native-base';
import { StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import colors from '@constants/Colors';

class PaymentsItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { amount, date, id } = this.props;
    return (
      <ListItem
        title={
          <View>
            <Text>
              <Text style={styles.label}>Date: </Text>
              {date ? date.format('dddd, MMMM Do YYYY') : 'N/A'}
            </Text>
          </View>
        }
        titleStyle={{ fontSize: 15, fontWeight: '500' }}
        titleNumberOfLines={1}
        subtitle={
          <View>
            <Text>
              <Text style={styles.label}>Amount: </Text>${amount.toFixed(2)}
            </Text>
          </View>
        }
        containerStyle={styles.matchContainer}
      />
    );
  }
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
  },
  matchContainer: {
    backgroundColor: colors.offWhite,
    borderTopWidth: 1,
    borderBottomColor: colors.lightGray,
    borderTopColor: colors.lightGray,
  },
});

export default connect((state) => ({}))(PaymentsItem);
