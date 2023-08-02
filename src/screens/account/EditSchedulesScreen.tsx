import React from 'react';
import { FlatList, StyleSheet, View, Platform } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { Text, Container, Content } from 'native-base';
import { ListItem } from 'react-native-elements';
import CardSingle from '@components/ui/CardSingle';
import {
  rejectScheduleOpportunity,
  acceptScheduleOpportunity,
  updateAcceptingScheduleOpportunities,
  getAvailableSchedules,
  getUser,
} from '@actions/userAction';
import { RootState } from '@reducers/index';
import BlockSwitch from '@components/ui/BlockSwitch';
import { NavigationScreenProp } from 'react-navigation';
import ActionButton from '@components/ui/ActionButton';
import { timeToMoment } from '@lib/JsonConversion';

type EditSchedulesState = {
  isAcceptingScheduleOpportunities: boolean;
};

interface NavigationProps {
  error?: string;
}

interface NavigationState {
  params: NavigationProps;
}

interface Props extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
}

class EditSchedulesScreen extends React.Component<Props, EditSchedulesState> {
  constructor(props: Props) {
    super(props);

    const { user } = this.props;

    this.state = {
      isAcceptingScheduleOpportunities:
        user.is_accepting_schedule_opportunities,
    };

    this.attemptNavigation();
  }

  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 20,
    minimumViewTime: 50,
  };

  async componentDidMount() {
    const { dispatch } = this.props;

    dispatch(getAvailableSchedules());
  }

  renderScheduleOpportunityToggle() {
    const { isAcceptingScheduleOpportunities } = this.state;
    const { dispatch, updatingAcceptingScheduleOpportunities } = this.props;
    return (
      <CardSingle header='Route Opportunities' icon='notifications-outline'>
        <Text style={{ fontWeight: 'bold', paddingBottom: 6 }}>
          What is a route opportunity?
        </Text>
        <Text style={[styles.disclaimer, { paddingBottom: 6 }]}>
          Frayt customers now have the ability to order Matches with multiple
          stops called “routes.” To be eligible to accept a company’s routes,
          you must opt-in to receive notifications. This is not a guarantee that
          you will get these Matches, only that you are willing to take them and
          receive the opportunities.
        </Text>
        <View style={styles.ruler} />
        <BlockSwitch
          type='primary'
          onValueChange={(value) => {
            const success = dispatch(
              updateAcceptingScheduleOpportunities(value),
            );
            if (success) {
              this.setState({ isAcceptingScheduleOpportunities: value });
            }
          }}
          value={
            updatingAcceptingScheduleOpportunities
              ? !isAcceptingScheduleOpportunities
              : isAcceptingScheduleOpportunities
          }
          loading={updatingAcceptingScheduleOpportunities}
          disabled={!!updatingAcceptingScheduleOpportunities}
          style={{ marginBottom: 6 }}>
          New Route Notifications
        </BlockSwitch>
        <Text style={styles.disclaimer}>
          You may opt in to receive notifications for when a new opportunity
          arises in your area.
        </Text>
      </CardSingle>
    );
  }

  renderScheduleList() {
    const { fetchingUser, style, user } = this.props;
    return (
      <FlatList
        data={user.accepted_schedules}
        refreshing={fetchingUser}
        keyExtractor={this.keyExtractor.bind(this)}
        ListEmptyComponent={this.renderListEmpty.bind(this)}
        renderItem={this.renderItem.bind(this)}
        // onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        style={[styles.list, style]}
      />
    );
  }

  renderAvailableSchedulesList() {
    const { fetchingAvailableSchedules, style, availableSchedules } =
      this.props;
    return (
      <FlatList
        data={availableSchedules}
        refreshing={fetchingAvailableSchedules}
        keyExtractor={this.availableKeyExtractor.bind(this)}
        ListEmptyComponent={this.renderAvailableListEmpty.bind(this)}
        renderItem={this.renderAvailableItem.bind(this)}
        // onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        style={[styles.list, style]}
      />
    );
  }

  renderListEmpty() {
    const { fetchingUser } = this.props;

    if (fetchingUser) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      return (
        <View style={{ padding: 12 }}>
          <Text>You are not enrolled in any route opportunities.</Text>
        </View>
      );
    }
  }

  renderAvailableListEmpty() {
    const { fetchingAvailableSchedules } = this.props;

    if (fetchingAvailableSchedules) {
      return (
        <View>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      return (
        <View style={{ padding: 12 }}>
          <Text>There are no available route opportunities in your area.</Text>
        </View>
      );
    }
  }

  renderItem(toRender) {
    const { rejectingSchedule, fetchingUser, dispatch } = this.props;
    const { item, index } = toRender;

    return (
      <ListItem
        title={this._renderSchedule(item, index)}
        titleStyle={{ fontSize: 15, fontWeight: '500' }}
        titleNumberOfLines={1}
        subtitle={
          <View>
            <ActionButton
              label='Leave'
              type='secondary'
              disabled={rejectingSchedule || fetchingUser}
              loading={rejectingSchedule || fetchingUser}
              onPress={async () => {
                await dispatch(rejectScheduleOpportunity(item.id));
                await dispatch(getAvailableSchedules());
                dispatch(getUser());
              }}
            />
          </View>
        }
        containerStyle={styles.listContainer}
      />
    );
  }

  renderAvailableItem(toRender) {
    const { acceptingSchedule, fetchingAvailableSchedules, dispatch } =
      this.props;
    const { item, index } = toRender;

    return (
      <ListItem
        title={this._renderSchedule(item, index)}
        titleStyle={{ fontSize: 15, fontWeight: '500' }}
        titleNumberOfLines={1}
        subtitle={
          <View>
            <ActionButton
              label='Join'
              type='secondary'
              disabled={acceptingSchedule || fetchingAvailableSchedules}
              loading={acceptingSchedule || fetchingAvailableSchedules}
              onPress={async () => {
                await dispatch(acceptScheduleOpportunity(item.id));
                await dispatch(getAvailableSchedules());
                dispatch(getUser());
              }}
            />
          </View>
        }
        containerStyle={styles.listContainer}
      />
    );
  }

  _renderSchedule(item: any, index: number) {
    const {
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      location,
    } = item;

    return (
      <View>
        <View style={styles.scheduleRow}>
          <Text>
            Route #{index + 1}: {location?.neighborhood}, {location?.city},{' '}
            {location?.state}
          </Text>
        </View>
        <View style={styles.scheduleRow}>
          <Text>Sunday: {this.displayLocalTime(sunday)}</Text>
          <Text>Monday: {this.displayLocalTime(monday)}</Text>
        </View>
        <View style={styles.scheduleRow}>
          <Text>Tuesday: {this.displayLocalTime(tuesday)}</Text>
          <Text>Wednesday: {this.displayLocalTime(wednesday)}</Text>
        </View>
        <View style={styles.scheduleRow}>
          <Text>Thursday: {this.displayLocalTime(thursday)}</Text>
          <Text>Friday: {this.displayLocalTime(friday)}</Text>
        </View>
        <View style={styles.scheduleRow}>
          <Text>Saturday: {this.displayLocalTime(saturday)}</Text>
        </View>
      </View>
    );
  }

  displayLocalTime(time: Nullable<string>) {
    const moment = timeToMoment(time);
    return moment ? moment.format('h:mm a') : 'N/A';
  }

  keyExtractor(item) {
    return `schedule-list-${item.id}`;
  }

  availableKeyExtractor(item) {
    return `available-schedule-list-${item.id}`;
  }

  componentDidUpdate(prevProps) {
    const { navigation } = this.props,
      { params } = navigation.state,
      { params: prevParams } = prevProps.navigation.state;

    if (
      params &&
      (!prevParams || params.scheduleId !== prevParams.scheduleId)
    ) {
      this.attemptNavigation();
    }
  }

  attemptNavigation() {
    const { navigation } = this.props,
      { params } = navigation.state;

    if (params && params.scheduleId) {
      navigation.navigate('Schedule', {
        id: params.scheduleId,
      });
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <Content padder>
          <View>{this.renderScheduleOpportunityToggle()}</View>

          <View style={styles.header}>
            <Text style={[styles.headerText]}>Accepted Opportunities</Text>
            <Text style={[styles.disclaimer]}>
              You are not guaranteed these opportunities, but will be offered
              them. First-come, first-served.
            </Text>
          </View>
          {this.renderScheduleList()}

          <View style={styles.header}>
            <Text style={[styles.headerText]}>Available Opportunities</Text>
            <Text style={[styles.disclaimer]}>
              You are not guaranteed these opportunities, but will be offered
              them. First-come, first-served.
            </Text>
          </View>
          {this.renderAvailableSchedulesList()}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  list: {
    backgroundColor: colors.white,
  },
  disclaimer: {
    color: colors.gray,
  },
  listContainer: {
    backgroundColor: colors.offWhite,
    borderTopWidth: 1,
    borderBottomColor: colors.lightGray,
    borderTopColor: colors.lightGray,
  },
  scheduleRow: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  header: {
    backgroundColor: colors.offWhite,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: Platform.OS === 'android' ? 10 : -10,
    paddingBottom: 6,
  },
  ruler: {
    borderBottomColor: colors.gray,
    borderBottomWidth: 1,
    width: '100%',
    marginTop: 5,
    marginBottom: 10,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  fetchingUser: userReducer.fetchingUser,
  rejectingSchedule: userReducer.rejectingSchedule,
  acceptingSchedule: userReducer.acceptingSchedule,
  updatingAcceptingScheduleOpportunities:
    userReducer.updatingAcceptingScheduleOpportunities,
  availableSchedules: userReducer.availableSchedules,
  fetchingAvailableSchedules: userReducer.fetchingAvailableSchedules,
  availableSchedulesInitialized: userReducer.availableMatchesInitialized,
}));

export default connector(EditSchedulesScreen);
