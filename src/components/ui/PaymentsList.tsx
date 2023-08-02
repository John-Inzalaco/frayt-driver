import React, { Component } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text } from 'native-base';
import { connect } from 'react-redux';
import PaymentsItem from '@components/ui/PaymentsItem';
import colors from '@constants/Colors';

class PaymentsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: this.props.payments,
    };
  }

  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 20,
    minimumViewTime: 50,
  };

  componentWillReceiveProps(nextProps) {
    const { payments } = this.props;

    if (payments != nextProps.payments) {
      this.updateItems(nextProps.payments);
    }
  }

  updateItems(payments) {
    this.setState({ items: payments });
  }

  renderListEmpty() {
    const { fetchingPayments } = this.props;

    if (fetchingPayments) {
      return [<Text>Loading...</Text>];
    } else {
      return [<Text>There are no previous payments.</Text>];
    }
  }

  renderItem({ item }) {
    return <PaymentsItem id={item.id} amount={item.amount} date={item.date} />;
  }

  keyExtractor(item) {
    return `payments-list-${item.id}`;
  }

  render() {
    const { fetchingPayments, onRefresh, style } = this.props;
    const { items } = this.state;

    return (
      <FlatList
        data={items}
        refreshing={fetchingPayments}
        keyExtractor={this.keyExtractor.bind(this)}
        ListEmptyComponent={this.renderListEmpty.bind(this)}
        renderItem={this.renderItem.bind(this)}
        // onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={fetchingPayments}
            onRefresh={onRefresh}
            colors={[colors.white]}
            tintColor={colors.white}
            titleColor={colors.white}
            style={styles.refreshControl}
          />
        }
        style={[styles.list, style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.white,
  },
  refreshControl: {
    backgroundColor: colors.darkGray,
    shadowColor: colors.darkGray,
    shadowRadius: 0,
    shadowOpacity: 1,
    shadowOffset: {
      height: 20,
    },
  },
  loadMore: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadMoreText: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 14,
    marginTop: 4,
  },
});

export default connect((state) => ({}))(PaymentsList);
