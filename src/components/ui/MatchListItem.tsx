import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, Toast } from 'native-base';
import { ListItem } from 'react-native-elements'; // 0.19.0
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { connect, ConnectedProps } from 'react-redux';

import colors from '@constants/Colors';
import { toggleEnRouteMatch, toggleStopEnRoute } from '@actions/matchAction';
import BlockSwitch from '@components/ui/BlockSwitch';
import * as Sentry from '@sentry/react-native';
import IconData from '@components/ui/IconData';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';

import Match from '@models/Match';
import ServiceLevel from '@constants/ServiceLevel';

const disabledText = colors.gray;

type Props = {
  match: Match;
  navigation: NavigationScreenProp<{}, {}>;
} & ConnectedProps<typeof connector> &
  Partial<DefaultProps>;

type DefaultProps = {
  refreshing: boolean;
  disabled: boolean;
};

type State = {
  isEnRoute: boolean;
  isLive: boolean;
  isCurrentDriver: boolean;
  updatingEnRoute: boolean;
  match: Match;
};

export class MatchListItem extends Component<Props, State> {
  static defaultProps: DefaultProps = {
    refreshing: false,
    disabled: false,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isEnRoute: false,
      isLive: false,
      isCurrentDriver: false,
      updatingEnRoute: false,
      match: props.match.clone(),
    };
  }

  componentDidMount() {
    this.setState({
      isEnRoute: this.isEnRoute(),
      isLive: this.isLive(),
      isCurrentDriver: this.isCurrentDriver(),
      updatingEnRoute: this.isUpdatingEnRoute(),
      match: this.match(),
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { isEnRoute, updatingEnRoute, isLive, isCurrentDriver } = this.state;
    const nextLive = this.isLive(nextProps);
    const nextEnRoute = this.isEnRoute(nextProps);
    const nextCurrentDriver = this.isCurrentDriver(nextProps);
    const nextUpdatingEnRoute = this.isUpdatingEnRoute(nextProps);

    this.setState({
      isLive: nextLive !== isLive ? nextLive : isLive,
      isEnRoute: nextEnRoute !== isEnRoute ? nextEnRoute : isEnRoute,
      isCurrentDriver:
        nextCurrentDriver !== isCurrentDriver
          ? nextCurrentDriver
          : isCurrentDriver,
      updatingEnRoute:
        nextUpdatingEnRoute !== updatingEnRoute
          ? nextUpdatingEnRoute
          : updatingEnRoute,
      match: this.match(nextProps),
    });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { isEnRoute, updatingEnRoute, isLive, isCurrentDriver, match } =
      this.state;
    const { refreshing } = this.props;

    return (
      nextState.isEnRoute !== isEnRoute ||
      nextState.isCurrentDriver !== isCurrentDriver ||
      nextState.updatingEnRoute !== updatingEnRoute ||
      nextState.isLive !== isLive ||
      (nextState.isLive && nextProps.refreshing !== refreshing) ||
      (match && !match.shallowCompare(nextState.match))
    );
  }

  match(props = this.props) {
    const { match } = props;

    return match.clone();
  }

  isEnRoute(props = this.props) {
    const { match } = props;

    return match ? match.isEnRoute() : false;
  }

  isCurrentDriver(props = this.props) {
    const { match, user } = props;

    return match.driver_id === user.id;
  }

  isDisabled() {
    const { disabled } = this.props;

    return this.isInaccessible() || disabled;
  }

  isInaccessible() {
    const { match } = this.props;

    return !(this.isCurrentDriver() || match.isAvailable());
  }

  isLive(props = this.props) {
    const { match } = props;

    return match.isLive();
  }

  isUpdatingEnRoute(props = this.props) {
    const { match, updatingEnRouteMatch } = props;

    return !!updatingEnRouteMatch[match.id];
  }

  async toggleEnRoute(stopId?: string) {
    const { dispatch } = this.props;
    const { match } = this.state;

    if (stopId) {
      dispatch<any>(toggleStopEnRoute(match.id, stopId));
    } else {
      dispatch<any>(toggleEnRouteMatch(match.id));
    }
  }

  renderEnrouteTooltip() {
    return (
      <Text>
        <Text style={styles.tooltipHeader}>{`What is En Route?\n`}</Text>
        <Text style={styles.tooltipContent}>
          Turn this on anytime you are driving to pick up or drop off a Match.
          This will let the shipper securely see your location and ETA.
        </Text>
      </Text>
    );
  }

  renderActions() {
    const { refreshing, match } = this.props;
    const { updatingEnRoute, isLive, isCurrentDriver } = this.state;
    let buttons = [];

    if (isLive && isCurrentDriver && match.isEnRouteToggleable()) {
      const stopId =
        match.state === 'picked_up' ? match.stops[0].id : undefined;
      let disabled = !!(updatingEnRoute || refreshing);

      buttons.push(
        <BlockSwitch
          type='primary'
          onValueChange={() => this.toggleEnRoute(stopId)}
          value={match.isEnRoute()}
          loading={updatingEnRoute}
          disabled={disabled || match.isMultiStop()}
          tooltipWidth={350}
          tooltipHeight={125}
          tooltip={this.renderEnrouteTooltip()}>
          En Route {this.displayEnrouteType(match)}
        </BlockSwitch>,
      );
    }

    return (
      buttons.length > 0 && <View style={styles.actionsWrapper}>{buttons}</View>
    );
  }

  displayEnrouteType(match: Match) {
    if (!match.isEnRoute()) return;

    if (match.isEnRouteToDropoff()) {
      return 'To Dropoff';
    } else {
      return 'To Pickup';
    }
  }

  renderEnRouteTitle() {
    const { isEnRoute, isCurrentDriver } = this.state;

    if (isEnRoute && isCurrentDriver) {
      return (
        <Text style={styles.enRouteTitle}>
          <FontAwesome5 name='route' size={16} /> MATCH EN ROUTE
        </Text>
      );
    }
  }

  renderCanceledTitle() {
    const { match } = this.props;

    if (match.state === 'canceled') {
      return (
        <Text style={styles.enRouteTitle}>
          <FontAwesome5 name='ban' size={16} /> MATCH CANCELED
        </Text>
      );
    }
  }

  getTimingCaption() {
    const { match } = this.props;

    if (match.service_level == ServiceLevel.SameDay) return 'Today';
    else return 'Now';
  }

  renderDetails() {
    const { match } = this.props;
    const disabled = this.isDisabled();

    return (
      <View style={styles.detailsWrapper}>
        <IconData
          icon='map-marker-alt'
          unit='mi'
          placeholder='N/A'
          disabled={disabled}>
          {match.distance ? match.distance.toFixed(0) : null}
        </IconData>
        <IconData
          icon='ruler-combined'
          unitMatch='x|@'
          placeholder='N/A'
          disabled={disabled}>
          {match.formattedCargo()}
        </IconData>
        <IconData icon='truck-moving' placeholder='N/A' disabled={disabled}>
          {match.vehicle_class}
        </IconData>
        <IconData icon='stopwatch' placeholder='N/A' disabled={disabled}>
          {this.getTimingCaption()}
        </IconData>
      </View>
    );
  }

  renderWarnings() {
    const { match, user } = this.props;
    let warnings = [];

    if (match.isAvailable()) {
      if (user.can_load === false && match.needsLoadUnload()) {
        warnings.push(
          <Text style={styles.warningText}>
            <FontAwesome5
              name='exclamation-triangle'
              size={18}
              color={colors.danger}
            />{' '}
            This Match requires load/unload
          </Text>,
        );
      }

      if (!user.pallet_jack && match.needsPalletJack()) {
        warnings.push(
          <Text style={styles.warningText}>
            <FontAwesome5
              name='exclamation-triangle'
              size={18}
              color={colors.danger}
            />{' '}
            This Match requires a pallet jack
          </Text>,
        );
      }

      if (!user.lift_gate && match.unload_method == 'lift_gate') {
        warnings.push(
          <Text style={styles.warningText}>
            <FontAwesome5
              name='exclamation-triangle'
              size={18}
              color={colors.danger}
            />{' '}
            This Match requires a lift gate
          </Text>,
        );
      }
    }

    return warnings;
  }

  renderSchedule() {
    const { match, disabled } = this.props;

    if (match.pickup_at) {
      return (
        <View>
          <Text style={[styles.schedule, disabled && styles.disabledText]}>
            {match.pickup_at.calendar({
              sameDay: '[Today]',
              nextDay: '[Tomorrow]',
              nextWeek: 'MMM Do',
              lastDay: 'MMM Do',
              lastWeek: 'MMM Do',
              sameElse: 'MMM Do',
            })}
            , {match.pickup_at.format('h:mm a z')}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  }

  navigate() {
    const { match, navigation } = this.props,
      { isCurrentDriver } = this.state,
      screen = isCurrentDriver ? 'MyMatch' : 'Match';

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Navigated to match #${match.id}`,
      level: Sentry.Severity.Info,
    });

    navigation.navigate(screen, {
      id: match.id,
    });
  }

  displayWarning() {
    if (this.isInaccessible()) {
      Toast.show({
        text: 'This match was accepted by another driver.',
        duration: 4000,
      });
    }
  }

  render() {
    const { match } = this.props;
    const disabled = this.isDisabled();

    let color = match.getStatusColor(),
      serviceStyle = disabled
        ? styles.disabledService
        : styles[match.serviceLevelClass()];

    return (
      <ListItem
        key={match.id}
        title={
          <View>
            {this.renderEnRouteTitle()}
            {match.isMultiStop() ? (
              <Text style={[styles.title, disabled && styles.disabledTitle]}>
                MATCH #{match.shortcode}{' '}
                <FontAwesome5
                  solid
                  name='circle'
                  style={[
                    serviceStyle,
                    styles.serviceIcon,
                    { color: colors.route },
                  ]}
                />{' '}
                <Text style={[serviceStyle, { color: colors.route }]}>
                  Route
                </Text>
              </Text>
            ) : (
              <Text style={[styles.title, disabled && styles.disabledTitle]}>
                MATCH #{match.shortcode}{' '}
                <FontAwesome5
                  solid
                  name='circle'
                  style={[serviceStyle, styles.serviceIcon]}
                />{' '}
                <Text style={serviceStyle}>{match.serviceLevel()}</Text>
              </Text>
            )}
            {this.isInaccessible() && match && match.accepted_at && (
              <Text style={styles.acceptedWhen}>
                Accepted {match.accepted_at.fromNow()}
              </Text>
            )}
            <Text style={styles.price}>
              ${match.totalPay()}
              {match.hasFee('driver_tip') && (
                <Text style={styles.tip}> Tip Included</Text>
              )}
            </Text>
          </View>
        }
        titleStyle={{ fontSize: 15, fontWeight: '500' }}
        subtitle={
          <View>
            {match.isMultiStop() ? (
              <Text
                style={[styles.description, disabled && styles.disabledText]}>
                {match.origin_address.city}, {match.origin_address.state_code}
                {'  '}
                <FontAwesome5
                  name='map-marker-alt'
                  size={15}
                  color={colors.darkGray}
                  style={{ paddingLeft: 10 }}
                />{' '}
                {match.stops && match.stops.length} Stops
              </Text>
            ) : (
              <Text
                style={[styles.description, disabled && styles.disabledText]}>
                {match.origin_address.city}, {match.origin_address.state_code}{' '}
                <FontAwesome5
                  name='arrow-right'
                  size={15}
                  color={colors.gray}
                  style={{ paddingLeft: 10 }}
                />{' '}
                {match.stops && match.stops[0].destination_address.city},{' '}
                {match.stops && match.stops[0].destination_address.state_code}
              </Text>
            )}
            {this.renderSchedule()}
            {this.renderDetails()}
            {this.renderActions()}
            {this.renderWarnings()}
          </View>
        }
        onPress={
          disabled ? this.displayWarning.bind(this) : this.navigate.bind(this)
        }
        disabled={this.props.disabled}
        subtitleStyle={disabled ? styles.subtitle : styles.subtitleDisabled}
        containerStyle={[
          styles.matchContainer,
          { borderLeftColor: disabled ? disabledText : color },
        ]}
        style={[styles.listItem, disabled && styles.listItemDisabled]}
        // chevron={<FontAwesome5 name="angle-right" size={32} color={disabled ? disabledText : color}/>}
      />
    );
  }
}

const styles = StyleSheet.create({
  matchContainer: {
    backgroundColor: colors.offWhite,
    borderTopWidth: 1,
    borderBottomColor: colors.lightGray,
    borderTopColor: colors.lightGray,
    borderLeftWidth: 7,
  },
  listItem: {
    marginVertical: 5,
  },
  listItemDisabled: {
    // opacity: 0.5,
  },
  detailsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    marginTop: 8,
    borderTopColor: colors.lightGray,
    borderTopWidth: 2,
  },
  dash: {
    color: colors.dash,
  },
  sameDay: {
    color: colors.sameDay,
  },
  route: {
    color: colors.route,
  },
  disabledService: {
    color: disabledText,
  },
  serviceIcon: {
    fontSize: 16,
  },
  title: {
    padding: 5,
    color: colors.gray,
    fontWeight: 'bold',
    fontSize: 17,
  },
  disabledTitle: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  price: {
    fontSize: 28,
    paddingHorizontal: 5,
  },
  tip: {
    fontSize: 20,
    paddingHorizontal: 5,
    color: colors.gray,
  },
  disabledText: {
    color: disabledText,
  },
  enRouteTitle: {
    padding: 5,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  acceptedWhen: {
    // fontWeight: 'normal',
    paddingHorizontal: 5,
    paddingBottom: 5,
    color: colors.gray,
  },
  canceledTitle: {
    padding: 5,
    color: colors.danger,
    fontWeight: 'bold',
  },
  description: {
    paddingHorizontal: 5,
    paddingTop: 5,
    color: colors.gray,
    fontSize: 17,
  },
  schedule: {
    paddingHorizontal: 5,
    paddingBottom: 5,
    color: colors.gray,
    fontSize: 17,
  },
  detail: {
    paddingLeft: 10,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 5,
    marginLeft: 0,
    fontWeight: '300',
  },
  subtitleDisabled: {
    fontSize: 13,
    marginTop: 5,
    marginLeft: 0,
    fontWeight: '300',
    textDecorationLine: 'line-through',
  },
  actionsWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: colors.gray,
  },
  warningText: {
    color: colors.danger,
    fontWeight: '500',
  },
  tooltipContent: {
    color: colors.offWhite,
    alignSelf: 'stretch',
    paddingLeft: 5,
    paddingRight: 5,
  },
  tooltipHeader: {
    fontWeight: 'bold',
    color: colors.offWhite,
    alignSelf: 'stretch',
    paddingLeft: 5,
    paddingRight: 5,
  },
});

const connector = connect(({ userReducer, matchReducer }: RootState) => ({
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  user: userReducer.user,
}));

export default connector(MatchListItem);
