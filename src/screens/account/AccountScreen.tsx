import React from 'react';
import { ScrollView, StyleSheet, RefreshControl, View } from 'react-native';
import { Content, Text, Icon } from 'native-base';
import CardSingle from '@components/ui/CardSingle';
import MatchReport from '@components/ui/MatchReport';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';
import { connect, ConnectedProps } from 'react-redux';
import { signOutUser, getUser } from '@actions/userAction';
import { getPaymentHistory } from '@actions/userAction';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { RootState } from '@reducers/index';
import {
  NavigationFocusInjectedProps,
  NavigationScreenProp,
} from 'react-navigation';
import StarRating from '@components/ui/StarRating';
import Accordion from '@components/ui/Accordion';

type State = {
  nextMonday: Date;
};

type Props = {
  navigation: NavigationScreenProp<{}, {}>;
} & ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

class AccountScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      nextMonday: this.calculateNextMonday(),
    };
  }

  static navigationOptions = {
    title: 'Account',
    headerTintColor: colors.white,
  };

  componentDidMount() {
    const { fetchingUser, userInitialized, fetchingUserPaymentHistory } =
      this.props;
    if (!fetchingUser && !userInitialized) {
      this.getUser();
    }
    if (!fetchingUserPaymentHistory) {
      this.getPaymentHistory();
    }
    this.attemptNavigation();
  }

  componentDidUpdate(prevProps: Props) {
    const { navigation } = this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (
      params &&
      (!prevParams || prevParams.navigateTo !== params.navigateTo)
    ) {
      this.attemptNavigation();
    }
  }

  calculateNextMonday() {
    var nextMonday = new Date();
    if (nextMonday.getDay() !== 1) {
      // it's not monday, so get the next monday
      nextMonday.setDate(
        nextMonday.getDate() + ((7 - nextMonday.getDay()) % 7) + 1,
      );
    }

    return nextMonday;
  }

  _editAccount = () => {
    this.props.navigation.navigate('EditAccount');
  };
  _editVehicle = () => {
    this.props.navigation.navigate('EditVehicle');
  };
  _editPassword = () => {
    this.props.navigation.navigate('EditPassword');
  };
  _paymentHistory = () => {
    this.props.navigation.navigate('Payments');
  };
  _editSchedules = () => {
    this.props.navigation.navigate('EditSchedules');
  };
  _editProfilePicture = () => {
    this.props.navigation.navigate('EditProfile');
  };
  _editNotifications = () => {
    this.props.navigation.navigate('EditNotifications');
  };
  _showDocumentsPreview = () => {
    this.props.navigation.navigate('DocumentsPreview');
  };

  attemptNavigation() {
    const { navigation } = this.props,
      { params } = navigation.state;
    if (params && params.navigateTo) {
      navigation.navigate(params.navigateTo, params.params);
      navigation.setParams({ navigateTo: null });
    }
  }

  async signOut() {
    const { dispatch } = this.props;

    dispatch<any>(signOutUser());
  }

  async getUser() {
    const { dispatch } = this.props;

    dispatch<any>(getUser());
  }

  async getPaymentHistory() {
    const { dispatch } = this.props;

    dispatch<any>(getPaymentHistory());
  }

  renderHeader(item: any, expanded: boolean) {
    return (
      <View style={styles.headerWrapper}>
        <Text style={styles.headerTitle}>{item.title}</Text>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <StarRating
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingRight: 10,
            }}
            starStyle={{ color: colors.white }}
            rating={item.user.rating}
          />
          {expanded ? (
            <Icon style={[styles.headerTitle]} name='chevron-up-outline' />
          ) : (
            <Icon style={[styles.headerTitle]} name='chevron-down-outline' />
          )}
        </View>
      </View>
    );
  }

  renderContent(item: any) {
    const { user } = item;
    return (
      <View style={styles.accordionContent}>
        <View style={styles.ratingRow}>
          <View style={styles.ratingColumn}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.ratingTitle}>SLA </Text>
              <View>
                <StarRating
                  starStyle={styles.starRatingStyle}
                  rating={user.sla_rating}
                />
              </View>
            </View>
          </View>
          <View style={styles.ratingDescription}>
            <Text style={styles.ratingDescriptionText}>
              Achieving order timelines
            </Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <View style={styles.ratingColumn}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.ratingTitle}>Fulfillment </Text>
              <View>
                <StarRating
                  starStyle={styles.starRatingStyle}
                  rating={user.fulfillment_rating}
                />
              </View>
            </View>
          </View>
          <View style={styles.ratingDescription}>
            <Text style={styles.ratingDescriptionText}>
              Finishing orders without canceling
            </Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <View style={styles.ratingColumn}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.ratingTitle}>Activity </Text>
              <View>
                <StarRating
                  starStyle={styles.starRatingStyle}
                  rating={user.activity_rating}
                />
              </View>
            </View>
          </View>
          <View style={styles.ratingDescription}>
            <Text style={styles.ratingDescriptionText}>
              Frequency checking app
            </Text>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <View style={styles.ratingColumn}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.ratingTitle}>Shipper </Text>
              <View>
                <StarRating
                  starStyle={styles.starRatingStyle}
                  rating={user.shipper_rating}
                />
              </View>
            </View>
          </View>
          <View style={styles.ratingDescription}>
            <Text style={styles.ratingDescriptionText}>
              Ratings from shippers
            </Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {
      user,
      signingOutUser,
      fetchingUser,
      userInitialized,
      paymentsFuture,
      paymentsComplete,
    } = this.props;
    const { nextMonday } = this.state;

    const payments = {
      next: nextMonday,
      amount:
        paymentsFuture == null ? 'Loading...' : `$${paymentsFuture.toFixed(2)}`,
      completed:
        paymentsComplete == null
          ? 'Loading...'
          : `$${paymentsComplete.toFixed(2)}`,
    };

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={fetchingUser && userInitialized}
            onRefresh={this.getUser.bind(this)}
          />
        }>
        <Content padder>
          <CardSingle
            header='Personal'
            icon='person'
            loading={fetchingUser && !userInitialized}
            loadingText='Loading Personal Data'>
            <Text style={styles.textItem}>
              <Text style={styles.bold}>Name:</Text> {user.first_name}{' '}
              {user.last_name}
            </Text>
            <Text style={styles.textItem}>
              <Text style={styles.bold}>Address:</Text> {user.address?.address},{' '}
              {user.address?.city}, {user.address?.state} {user.address?.zip}
            </Text>
            <Text style={styles.textItem}>
              <Text style={styles.bold}>Email:</Text> {user.email}
            </Text>
            <Text style={styles.textItem}>
              <Text style={styles.bold}>Phone:</Text> {user.phone_number}
            </Text>
            <Text style={styles.textItem}>
              <Text style={styles.bold}>Vehicle:</Text> {user.vehicle_year}{' '}
              {user.vehicle_make} {user.vehicle_model}
            </Text>

            <Accordion
              renderHeader={this.renderHeader}
              renderContent={this.renderContent}
              item={{ user: user, title: 'Ratings' }}
            />

            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='edit' /> Account
                </Text>
              }
              type='secondary'
              onPress={() => {
                this._editAccount();
              }}
              style={{ marginTop: 8 }}
            />
            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='portrait' /> Profile Picture
                </Text>
              }
              type='secondary'
              onPress={() => {
                this._editProfilePicture();
              }}
            />
            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='truck' /> Cargo Capacity
                </Text>
              }
              type='secondary'
              onPress={() => {
                this._editVehicle();
              }}
            />
            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='warehouse' /> Manage Schedule
                </Text>
              }
              type='secondary'
              onPress={() => {
                this._editSchedules();
              }}
            />
            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='bell' /> Notifications
                </Text>
              }
              type='secondary'
              onPress={() => {
                this._editNotifications();
              }}
            />
            <ActionButton
              label={<Text style={styles.buttonText}>Documents</Text>}
              type='darkBlue'
              onPress={() => {
                this._showDocumentsPreview();
              }}
            />
          </CardSingle>

          <CardSingle header='Finance' icon='cash-outline'>
            <Text style={styles.financeHeader}>
              <FontAwesome5 name='check' /> COMPLETED PAYOUTS
            </Text>
            <Text style={[styles.textItem, styles.bold]}>
              {payments.completed
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </Text>
            <View
              style={{
                borderBottomColor: colors.gray,
                borderBottomWidth: 1,
                width: '100%',
                marginTop: 5,
                marginBottom: 10,
              }}
            />
            <Text style={styles.disclaimer}>
              Payouts are run every business day. It will arrive in your bank in
              the next 1-3 days. Contact support if your payout is taking longer
              than expected.
            </Text>
            {/* <ActionButton
              label='History'
              type='secondary'
              onPress={() => {
                this._paymentHistory();
              }}
            /> */}
          </CardSingle>

          <CardSingle header='Reports' icon='stats-chart' isRow>
            <Content>
              <Text style={styles.reportHeader}>30 DAY</Text>
              <MatchReport days={30} />
            </Content>
            <Content>
              <Text style={styles.reportHeader}>90 DAY</Text>
              <MatchReport days={90} />
            </Content>
          </CardSingle>

          <CardSingle header='Manage' icon='md-list'>
            <ActionButton
              label={
                <Text style={styles.buttonText}>
                  <FontAwesome5 name='key' /> Change Password
                </Text>
              }
              type='secondary'
              disabled={signingOutUser}
              loading={signingOutUser}
              onPress={this._editPassword.bind(this)}
              style={{ marginTop: 8 }}
            />
            <ActionButton
              label='Logout'
              type='secondary'
              hollowBackground={colors.white}
              hollow
              disabled={signingOutUser}
              loading={signingOutUser}
              onPress={this.signOut.bind(this)}
            />
          </CardSingle>
        </Content>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
  reportHeader: {
    marginBottom: 4,
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  disclaimer: {
    color: colors.gray,
  },
  financeHeader: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 6,
  },
  button: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  textItem: {
    paddingBottom: 10,
    textAlign: 'left',
  },
  ratingTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.white,
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ratingColumn: {
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    alignItems: 'flex-end',
  },
  ratingDescription: {
    flexDirection: 'column',
    flexGrow: 1,
    flexBasis: 0,
    paddingLeft: 15,
  },
  ratingDescriptionText: {
    fontSize: 10,
    color: colors.white,
  },
  starRatingStyle: {
    color: colors.white,
    fontSize: 12,
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerWrapper: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: '100%',
    backgroundColor: colors.darkGray,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.white,
  },
  accordionContent: {
    backgroundColor: colors.darkGray,
    flexDirection: 'column',
    minWidth: '100%',
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  signingOutUser: userReducer.signingOutUser,
  fetchingUser: userReducer.fetchingUser,
  userInitialized: userReducer.userInitialized,
  fetchingUserPaymentHistory: userReducer.fetchingUserPaymentHistory,
  paymentsFuture: userReducer.paymentsFuture,
  paymentsComplete: userReducer.paymentsComplete,
}));

export default connector(AccountScreen);
