import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { Text, Container, Content } from 'native-base';
import CardSingle from '@components/ui/CardSingle';
import { acceptScheduleOpportunity, getSchedule } from '@actions/userAction';

import { NavigationScreenProp } from 'react-navigation';
import { Schedule } from '@models/User';

import ActionButton from '@components/ui/ActionButton';
import { timeToMoment } from '@lib/JsonConversion';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { RootState } from '@reducers/index';

type ScheduleState = {
  scheduleId: string;
  schedule: Nullable<Schedule>;
  acceptingSchedule: boolean;
  rejectingSchedule: boolean;
};

interface NavigationProps {
  id: string;
}

interface NavigationState {
  params: NavigationProps;
}

interface Props extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
}

class ScheduleScreen extends React.Component<Props, ScheduleState> {
  constructor(props: Props) {
    super(props);

    const { id } = this.props.navigation.state.params,
      schedule = this.findSchedule(id);

    this.state = {
      scheduleId: id,
      schedule: schedule ? schedule : null,
      acceptingSchedule: false,
      rejectingSchedule: false,
    };
  }

  findSchedule(id = this.state.scheduleId) {
    const { dispatch, schedules } = this.props,
      schedule = schedules.find(
        (maybe_schedule: Schedule) => maybe_schedule.id === id,
      );

    if (!schedule) {
      dispatch<any>(getSchedule(id));
    }

    return schedule;
  }

  displayLocalTime(time: Nullable<string>) {
    const moment = timeToMoment(time);
    return moment ? moment.format('h:mm a') : 'N/A';
  }

  render() {
    const { schedule, scheduleId } = this.state;
    const {
      dispatch,
      navigation,
      acceptingSchedule,
      rejectingSchedule,
      fetchingSchedule: { [scheduleId]: isUpdating },
    } = this.props;

    const disabled = acceptingSchedule || rejectingSchedule || isUpdating;

    if (!schedule) {
      return (
        <Content contentContainerStyle={styles.unavailableContainer}>
          <FontAwesome5 name='truck-loading' style={styles.megaIcon} />
          <Text style={styles.unavailableHeader}>Fetching New Opportunity</Text>
          <Text style={styles.unavailableText} />
          <ActionButton
            label='Go Back'
            onPress={() => navigation.navigate('EditSchedules')}
            block
            size='large'
            type='secondary'
          />
        </Content>
      );
    }

    const {
      sunday,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      location,
    } = schedule;

    return (
      <Container style={styles.container}>
        <Content padder>
          <CardSingle
            header='New Route Opportunity'
            icon='notifications-outline'>
            <Content>
              <View style={styles.scheduleRow}>
                <Text>
                  {location?.neighborhood}, {location?.city}, {location?.state}
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
            </Content>
            <View style={styles.ruler} />
            <Content>
              <Text style={[styles.disclaimer, { marginBottom: 8 }]}>
                You are not guaranteed these opportunities, but will be offered
                them. First-come, first-served.
              </Text>
            </Content>
            <ActionButton
              label='Accept'
              type='secondary'
              disabled={disabled}
              loading={acceptingSchedule || rejectingSchedule}
              onPress={async () => {
                const success = await dispatch(
                  acceptScheduleOpportunity(scheduleId),
                );
                if (success) {
                  navigation.navigate('EditSchedules');
                }
              }}
            />
            <ActionButton
              label='Reject'
              type='secondary'
              disabled={disabled}
              loading={rejectingSchedule || acceptingSchedule}
              onPress={async () => {
                navigation.navigate('EditSchedules');
              }}
            />
          </CardSingle>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
  center: {
    padding: 20,
  },
  disclaimer: {
    color: colors.gray,
  },
  unavailableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    flex: 1,
    padding: 30,
  },
  unavailableHeader: {
    color: colors.darkGray,
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  unavailableText: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 24,
  },
  megaIcon: {
    fontSize: 150,
    color: colors.lightGray,
    marginBottom: 10,
  },
  scheduleRow: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
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
  acceptingSchedule: userReducer.acceptingSchedule,
  rejectingSchedule: userReducer.rejectingSchedule,
  fetchingSchedule: userReducer.fetchingSchedule,
  schedules: userReducer.schedules,
}));

export default connector(ScheduleScreen);
