import React, { Component } from 'react';
import { View, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Spin from '@components/ui/Spin';
import { RootState } from '@reducers/index';

type Props = {
  days: 30 | 90;
} & ConnectedProps<typeof connector>;

export class MatchReport extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  numberWithCommas(x: number) {
    var parts = (x / 100).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  render() {
    const { days, reports } = this.props;
    let total = 0;
    switch (days) {
      case 30:
        total = reports.days_30 ? reports.days_30 : 0;
        break;
      case 90:
        total = reports.days_90 ? reports.days_90 : 0;
        break;
    }

    if (this.props.fetchingUserReport === true) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Spin>
            <MaterialIcons
              name='refresh'
              size={18}
              color={colors.darkGray}
              style={{ paddingTop: 0.8 }}
            />
          </Spin>
        </View>
      );
    } else {
      return (
        <Text style={{ fontWeight: 'bold' }}>
          ${this.numberWithCommas(total)}
        </Text>
      );
    }
  }
}

const connector = connect(({ userReducer }: RootState) => ({
  reports: userReducer.reports,
  fetchingUserReport: userReducer.fetchingUserReport,
}));

export default connector(MatchReport);
