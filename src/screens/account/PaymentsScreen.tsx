import React, { Component } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { Root, Content, Text, Toast, View } from 'native-base';
import colors from '@constants/Colors';
import { connect } from 'react-redux';
import PaymentsList from '@components/ui/PaymentsList';
import { getPaymentHistory } from '@actions/userAction';

class PaymentsScreen extends Component {
  static navigationOptions = {
    title: 'Payments',
    headerTintColor: colors.white,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getPayments();
  }

  getPayments() {
    const { dispatch } = this.props;

    dispatch(getPaymentHistory());
  }

  _renderPayments(payments, fetchingUserPaymentHistory) {
    return (
      <PaymentsList
        payments={payments}
        fetchingPayments={fetchingUserPaymentHistory}
        onRefresh={this.getPayments.bind(this)}
      />
    );
  }

  render() {
    const { payments, fetchingUserPaymentHistory } = this.props;

    return (
      <View style={styles.container}>
        <Text>Total Payments: {payments.length}</Text>
        {this._renderPayments(payments, fetchingUserPaymentHistory)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
});

export default connect((state) => ({
  payments: state.userReducer.payments,
  fetchingUserPaymentHistory: state.userReducer.fetchingUserPaymentHistory,
}))(PaymentsScreen);
