import React from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Text, Toast, Content, Body, CardItem } from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { connect, ConnectedProps } from 'react-redux';
import openMap from 'react-native-open-maps';
import * as Sentry from '@sentry/react-native';
import colors from '@constants/Colors';
import {
  arriveAtReturn,
  returned,
  toggleEnRouteMatch,
  toggleStopEnRoute,
} from '@actions/matchAction';
import {
  acceptMatch,
  pickupMatch,
  deliverMatch,
  rejectMatch,
  getMatch,
  arriveAtDropoff,
  arriveAtPickup,
} from '@actions/matchAction';
import { RootState } from '@reducers/index';
import { matchActionTypes, matchStatusTypes } from '@actions/types/matchTypes';
import MatchMap from '@components/MatchMap';
import DataCard, { DataCardItem } from '@components/ui/DataCard';
import ActionButton from '@components/ui/ActionButton';
import BlockSwitch from '@components/ui/BlockSwitch';
import MatchPhotoCropper from '@components/ui/MatchPhotoCropper';
import { NavigationActions, NavigationScreenProp } from 'react-navigation';
import Match from '@models/Match';
import { Image } from 'react-native-image-crop-picker';
import MatchCargoDetails from '@components/ui/MatchCargoDetails';
import MatchStopListItem from '@components/ui/MatchStopListItem';
import { generalLocationFormat } from '@lib/helpers';
import moment from 'moment';
import Intercom from 'react-native-intercom';
import { withNavigationFocus } from 'react-navigation';
import MatchSLACard from '@components/ui/MatchSLACard';
import UndeliverableStopButton from '@components/UndeliverableStopButton';

interface NavigationProps {
  id: string;
  shortcode: Nullable<string>;
}

interface NavigationState {
  params: NavigationProps;
}

interface ScreenProps extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
  isFocused: boolean;
}

interface ScreenState {
  matchId: string;
  match: Nullable<Match>;
  cargoTermsAccepted: boolean;
  billOfLading: Nullable<Image>;
  originPhoto: Nullable<Image>;
  destinationPhoto: Nullable<Image>;
  lastMatchRefresh: number;
}

class MatchScreen extends React.Component<ScreenProps, ScreenState> {
  static navigationOptions = ({ navigation }: ScreenProps) => {
    return {
      title: 'Match #' + navigation.getParam('shortcode', ''),
    };
  };

  constructor(props: ScreenProps) {
    super(props);

    const { navigation } = this.props;
    const id = navigation.getParam('id'),
      match = this.findMatch(id);

    navigation.setParams({ shortcode: match?.shortcode });

    this.state = {
      matchId: id,
      cargoTermsAccepted: false,
      billOfLading: null,
      originPhoto: null,
      destinationPhoto: null,
      lastMatchRefresh: new Date().getTime(),
      match,
    };

    this.routeToOrigin = this.routeToOrigin.bind(this);
    this.routeTo = this.routeTo.bind(this);
    this.toggleEnRoute = this.toggleEnRoute.bind(this);
  }

  componentDidMount() {
    this.updateIntercomMatch();
  }

  async componentDidUpdate(prevProps: ScreenProps) {
    const { isFocused, matches } = this.props;

    if (prevProps.isFocused !== isFocused) {
      this.updateIntercomMatch();
    }

    if (prevProps.matches.matches !== matches.matches) {
      await this.setState({ match: this.findMatch() });
    }

    if (this.secondsSinceLastRefresh() > 30) {
      this.getMatch();
    }
  }

  updateIntercomMatch() {
    const { isFocused } = this.props;
    const { match } = this.state;
    Intercom.updateUser({
      custom_attributes: {
        current_match: isFocused ? match?.shortcode : null,
      },
    });
  }

  secondsSinceLastRefresh() {
    const { lastMatchRefresh } = this.state,
      currentTime = new Date().getTime(),
      timeSince = currentTime - lastMatchRefresh;

    return timeSince / 1000;
  }

  findMatch(id = this.state.matchId) {
    const { matches, fetchingMatch, fetchingMatchError } = this.props,
      isUpdating = !!fetchingMatch[id],
      matchError = !!fetchingMatchError[id],
      match = matches.find(id);

    if (!match && !isUpdating && !matchError) this.getMatch(id);

    return match;
  }

  checkIfMatchExists() {
    const { match, matchId } = this.state;
    const {
      fetchingMatch: { [matchId]: isUpdating },
    } = this.props;
    const isAuthorizedMatch = match ? match.isAuthorized() : true;

    if ((!isUpdating && !match) || !isAuthorizedMatch) {
      Sentry.addBreadcrumb({
        category: 'match',
        message: `Match #${matchId} is no longer available`,
        level: Sentry.Severity.Info,
      });
    }
  }

  async toggleEnRoute(stopId?: string) {
    const { dispatch } = this.props;
    const { matchId } = this.state;

    if (stopId) {
      dispatch<any>(toggleStopEnRoute(matchId, stopId));
    } else {
      dispatch<any>(toggleEnRouteMatch(matchId));
    }
  }

  async getMatch(id = this.state.matchId) {
    const { dispatch } = this.props;

    this.setState({ lastMatchRefresh: new Date().getTime() });

    await dispatch<any>(getMatch(id));
  }

  async accept() {
    const { dispatch, navigation } = this.props,
      { matchId, match } = this.state,
      accepted: boolean = await dispatch<any>(acceptMatch(matchId));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Attempted to accept match #${matchId}, result: ${accepted}`,
      level: Sentry.Severity.Info,
    });
    const difference =
      match && match.pickup_at ? match.pickup_at.diff(moment(), 'minutes') : 0;

    if (accepted && difference < 90) {
      await navigation.goBack();
      navigation.navigate('MatchEnRoute', { id: matchId });
    }
  }

  async reject() {
    const { dispatch, navigation } = this.props,
      { matchId } = this.state;

    const rejected = await dispatch<any>(rejectMatch(matchId));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Attempted to reject match #${matchId}, result: ${rejected}`,
      level: Sentry.Severity.Info,
    });

    if (rejected) {
      navigation.navigate('Matches');
    }
  }

  async cancel() {
    const { navigation } = this.props,
      { matchId } = this.state;

    navigation.navigate('MatchCancel', {
      id: matchId,
    });
  }

  async arriveAtPickup() {
    const { dispatch } = this.props;
    const { matchId } = this.state;

    const arrived = dispatch<any>(arriveAtPickup(matchId));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Arrived at pickup of match #${matchId}, result: ${arrived}`,
      level: Sentry.Severity.Info,
    });
  }

  async arriveAtReturn() {
    const { dispatch } = this.props;
    const { matchId } = this.state;

    const arrived = dispatch<any>(arriveAtReturn(matchId));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Arrived at return for match #${matchId}, result: ${arrived}`,
      level: Sentry.Severity.Info,
    });
  }

  async returned() {
    const { dispatch } = this.props;
    const { matchId } = this.state;

    const completed = dispatch<any>(returned(matchId));

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Returned match #${matchId}, result: ${completed}`,
      level: Sentry.Severity.Info,
    });
  }

  async pickup() {
    const { dispatch } = this.props;
    const { match, matchId, originPhoto, billOfLading } = this.state;

    if (match?.origin_photo_required && !originPhoto) {
      Toast.show({
        text: 'This delivery requires a photo of the cargo loaded in your vehicle.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    if (match?.bill_of_lading_required && !billOfLading) {
      Toast.show({
        text: 'This delivery requires a photo of the bill of lading.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }
    const pickedUp = dispatch<any>(
      pickupMatch(matchId, originPhoto, billOfLading),
    );

    Sentry.addBreadcrumb({
      category: 'match',
      message: `Picked up match #${matchId}, result: ${pickedUp}`,
      level: Sentry.Severity.Info,
    });
  }

  async unable_pickup() {
    const { navigation } = this.props,
      { matchId } = this.state;

    navigation.navigate('MatchUnablePickup', {
      id: matchId,
    });
  }

  async arriveAtDropoff() {
    const { dispatch } = this.props;
    const { matchId, match } = this.state;

    if (match) {
      const stopId = match.stops[0].id;

      const arrived = dispatch<any>(arriveAtDropoff(matchId, stopId));

      Sentry.addBreadcrumb({
        category: 'match',
        message: `Arrived at dropoff of match #${matchId}, result: ${arrived}`,
        level: Sentry.Severity.Info,
      });
    }
  }

  async deliver() {
    const { dispatch } = this.props;
    const { match, matchId, destinationPhoto } = this.state;

    if (match) {
      const stop = match.stops[0];

      //TO DO: figure out delivery for only active stop, check if destination photo is needed for that stop, save photo to only that stop
      if (stop.destination_photo_required && !destinationPhoto) {
        Toast.show({
          text: 'This delivery requires a photo of where the cargo was unloaded.',
          buttonText: 'Okay',
          duration: 3000,
        });
        return;
      }

      const delivered = dispatch<any>(
        deliverMatch(matchId, destinationPhoto, stop.id),
      );

      Sentry.addBreadcrumb({
        category: 'match',
        message: `Delivered match #${matchId}, result: ${delivered}`,
        level: Sentry.Severity.Info,
      });
    }
  }

  routeToOrigin() {
    const { match } = this.state;

    match && this.routeTo(match.origin_address.formatted_address);
  }

  routeTo(location: string) {
    const { matchId, match } = this.state;
    const { navigation } = this.props;

    const openDirections = () => {
      openMap({
        end: location,
      });
      return NavigationActions.back();
    };

    if (match?.isEnRoute()) {
      openDirections();
    } else {
      navigation.navigate('MatchEnRoute', {
        id: matchId,
        onYes: openDirections,
        onNo: openDirections,
      });
    }
  }

  renderStops() {
    const { match, matchId } = this.state;
    if (match) {
      return (
        <View style={{ marginBottom: 24 }}>
          <CardItem
            style={{
              backgroundColor: colors.lightGray,
              borderBottomColor: colors.secondary,
              borderBottomWidth: 4,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
            header
            bordered>
            <Text style={[styles.headerText, { fontWeight: 'bold' }]}>
              Location
            </Text>
          </CardItem>
          <CardItem
            style={[
              styles.multiStopItem,
              {
                backgroundColor: colors.lightGray,
                borderColor: '#D3D3D3',
                borderWidth: 0,
                borderLeftWidth: 0.5,
                borderRightWidth: 0.3,
                borderBottomWidth: 0.3,
                borderRadius: 0,
              },
            ]}
            bordered>
            <Body style={{ display: 'flex', flexDirection: 'row' }}>
              <Text style={[styles.numberLabel]}>P</Text>
              <View style={[styles.itemLabelContainer]}>
                <Text style={[styles.itemLabel, { marginLeft: -4 }]}>
                  Start
                </Text>
                <View style={{ flexDirection: 'row', marginLeft: -4 }}>
                  <Text style={styles.itemContent} selectable={true}>
                    {match.isAvailable()
                      ? generalLocationFormat(match.origin_address)
                      : match.origin_address.formatted_address}
                  </Text>
                </View>
              </View>
            </Body>
          </CardItem>
          {match?.stops
            .sort(function (a, b) {
              return a.index - b.index;
            })
            .map((stop) => {
              return (
                <MatchStopListItem
                  stop={stop}
                  match={match}
                  routeTo={this.routeTo}
                  navigation={this.props.navigation}
                />
              );
            })}
        </View>
      );
    }
  }

  renderNavigationAction() {
    const { match, matchId } = this.state;
    const {
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: updatingEnRoute },
    } = this.props;
    const isEnRoute = match?.isEnRoute();

    let actions = [];
    if (match) {
      const stop = match.stops[0];
      switch (match.state) {
        case matchStatusTypes.accepted:

        case matchStatusTypes.en_route_to_pickup:
          actions.push(
            <View style={[styles.actionWrapper, { marginBottom: 12 }]}>
              <BlockSwitch
                type='primary'
                onValueChange={() => this.toggleEnRoute()}
                value={updatingEnRoute ? !isEnRoute : isEnRoute}
                loading={updatingEnRoute}
                disabled={!!updatingMatchStatus || !!updatingEnRoute}>
                En Route to Pickup
              </BlockSwitch>
              {!isEnRoute && (
                <Text style={[styles.noticeText, { marginTop: 12 }]}>
                  Turn on En Route as soon as you are on your way to the pickup
                  location.
                </Text>
              )}
            </View>,
          );
          actions.push(
            <ActionButton
              label='Navigate to Pickup'
              size='large'
              style={styles.actionButton}
              type='secondary'
              hollow
              hollowBackground={colors.white}
              onPress={this.routeToOrigin}
            />,
          );
          break;
        case matchStatusTypes.picked_up:
          if (!match.isMultiStop()) {
            actions.push(
              <ActionButton
                label='Navigate to Dropoff'
                style={styles.actionButton}
                size='large'
                type='secondary'
                hollow
                hollowBackground={colors.white}
                onPress={() =>
                  this.routeTo(stop.destination_address.formatted_address)
                }
              />,
              <UndeliverableStopButton
                match={match}
                stop={stop}
                navigation={this.props.navigation}
              />,
            );
          }
          break;
        case matchStatusTypes.en_route_to_return:
          actions.push(
            <ActionButton
              label='Navigate to Return'
              style={styles.actionButton}
              size='large'
              type='secondary'
              hollow
              hollowBackground={colors.white}
              onPress={this.routeToOrigin}
            />,
          );
          break;
      }

      return (
        // Style removes awkward extra gap that is there when this element is invisible
        <View
          style={[
            styles.actionWrapper,
            actions.length >= 1
              ? { marginVertical: 10 }
              : { marginVertical: 0 },
          ]}>
          {actions}
        </View>
      );
    }
  }

  renderAcceptAction() {
    const { match, matchId } = this.state;
    const {
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: isUpdating },
    } = this.props;

    let disabled = !!(isUpdating || updatingMatchStatus);

    const pickupEndTime = match?.getSLAEndTime('pickup');
    const deliveryEndTime = match?.getSLAEndTime('delivery');

    const AGREEMENT_DESCRIPTION = `By accepting this Match, you confirm that the weight and dimensions fit your vehicle. I agree to have Match picked up by ${pickupEndTime} and delivered by ${deliveryEndTime}.`;

    if (match?.isAvailable()) {
      return (
        <View style={styles.actionWrapper}>
          <BlockSwitch
            value={this.state.cargoTermsAccepted}
            onValueChange={(value) =>
              this.setState({ cargoTermsAccepted: value })
            }
            description={AGREEMENT_DESCRIPTION}>
            Acceptance Agreement
          </BlockSwitch>
          <View style={styles.inlineActionWrapper}>
            <ActionButton
              type='danger'
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.driver_rejected}
              hollow
              hollowBackground={colors.white}
              disabled={disabled}
              onPress={this.reject.bind(this)}
              renderLabel={(textStyle, animatedStyle) => {
                return [
                  <View>
                    <Animated.Text style={[animatedStyle]}>
                      Reject
                    </Animated.Text>
                    <Animated.Text style={animatedStyle}>$0.00</Animated.Text>
                  </View>,
                ];
              }}
            />
            <ActionButton
              type='secondary'
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.accepted}
              disabled={disabled || !this.state.cargoTermsAccepted}
              renderLabel={(textStyle, animatedStyle) => {
                return (
                  <View>
                    <Animated.Text style={animatedStyle}>Accept</Animated.Text>
                    <Animated.Text style={animatedStyle}>
                      ${match.totalPay()}
                    </Animated.Text>
                  </View>
                );
              }}
              onPress={this.accept.bind(this)}
            />
          </View>
        </View>
      );
    }
  }

  renderCancel() {
    const { match, matchId } = this.state;
    const {
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: isUpdating },
    } = this.props;
    const disabled = !!(isUpdating || updatingMatchStatus);
    if (match) {
      switch (match.state) {
        case 'accepted':
        case 'en_route_to_pickup':
        case 'arrived_at_pickup':
          return (
            <ActionButton
              label='Cancel Match'
              size='large'
              hollow
              hollowBackground={colors.white}
              type='danger'
              style={styles.actionButton}
              disabled={disabled}
              onPress={this.cancel.bind(this)}
            />
          );
        default:
          return null;
      }
    }
  }

  renderAction() {
    const { match, matchId } = this.state;
    const {
      navigation,
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: isUpdating },
    } = this.props;

    let actions = [],
      enRouteActions = [],
      dataActions = [],
      disabled = !!(isUpdating || updatingMatchStatus);

    if (match) {
      const stop = match.stops[0];
      switch (match.state) {
        case 'accepted':
        case 'en_route_to_pickup':
          enRouteActions.push(
            <ActionButton
              type='secondary'
              size='large'
              style={styles.actionButton}
              loading={
                updatingMatchStatus === matchActionTypes.arrived_at_pickup
              }
              disabled={disabled}
              label="I'm at the Pickup"
              onPress={this.arriveAtPickup.bind(this)}
            />,
          );
          break;
        case 'arrived_at_pickup':
          dataActions.push(
            <DataCard
              title={
                <Text style={styles.headerText}>
                  Upload Photos{' '}
                  {match?.origin_photo_required || (
                    <Text style={styles.headerOptionalText}>(optional)</Text>
                  )}
                </Text>
              }
              viewMode={true}
              items={[
                {
                  label: (
                    <Text style={styles.uploadTitle}>
                      Bill of Lading{' '}
                      {match?.bill_of_lading_required && '(required)'}
                    </Text>
                  ),
                  content: (
                    <MatchPhotoCropper
                      photo={this.state.billOfLading}
                      altIcon='file-alt'
                      disabled={disabled}
                      onPhotoChange={(billOfLading: Image) =>
                        this.setState({ billOfLading })
                      }
                    />
                  ),
                },

                {
                  label: (
                    <Text style={styles.uploadTitle}>
                      Cargo Before Pickup{' '}
                      {match?.origin_photo_required && '(required)'}
                    </Text>
                  ),
                  content: (
                    <MatchPhotoCropper
                      photo={this.state.originPhoto}
                      altIcon='box-open'
                      disabled={disabled}
                      onPhotoChange={(originPhoto: Image) =>
                        this.setState({ originPhoto })
                      }
                    />
                  ),
                },
              ]}
            />,
          );

          const neededBarcodes = match.neededPickupBarcodes();

          neededBarcodes.length > 0 &&
            enRouteActions.push(
              <ActionButton
                label={`Scan ${neededBarcodes.length} ${
                  neededBarcodes.length > 1 ? 'Barcodes' : 'Barcode'
                }`}
                size='large'
                type='secondary'
                style={styles.actionButton}
                loading={updatingMatchStatus === matchActionTypes.picked_up}
                onPress={() =>
                  navigation.navigate('ScanBarcodes', {
                    match,
                    stop_id: stop.id,
                    barcode_readings: neededBarcodes,
                  })
                }
              />,
            );

          enRouteActions.push(
            <ActionButton
              label='Confirm Pickup'
              size='large'
              type='secondary'
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.picked_up}
              disabled={neededBarcodes.length > 0 || disabled}
              onPress={this.pickup.bind(this)}
            />,
            <ActionButton
              label='Unable to Pickup'
              size='large'
              hollow
              hollowBackground={colors.white}
              type='danger'
              style={styles.actionButton}
              loading={
                updatingMatchStatus === matchActionTypes.unable_to_pickup
              }
              disabled={neededBarcodes.length > 0 || disabled}
              onPress={this.unable_pickup.bind(this)}
            />,
          );
          break;
        case 'picked_up':
          // Show match stop transition actions for first and only stop on the match
          if (!match.isMultiStop()) {
            switch (stop.state) {
              case 'en_route':
                enRouteActions.push(
                  <ActionButton
                    size='large'
                    type='secondary'
                    style={styles.actionButton}
                    loading={updatingMatchStatus === matchActionTypes.picked_up}
                    disabled={disabled}
                    label="I'm at the Dropoff"
                    onPress={this.arriveAtDropoff.bind(this)}
                  />,
                );
                break;
              case 'arrived':
                const neededBarcodes = stop.neededBarcodes('delivery');

                neededBarcodes.length > 0 &&
                  enRouteActions.push(
                    <ActionButton
                      label={`Scan ${neededBarcodes.length} ${
                        neededBarcodes.length > 1 ? 'Barcodes' : 'Barcode'
                      }`}
                      size='large'
                      type='secondary'
                      style={styles.actionButton}
                      loading={
                        updatingMatchStatus === matchActionTypes.picked_up
                      }
                      onPress={() =>
                        navigation.navigate('ScanBarcodes', {
                          match,
                          stop_id: stop.id,
                          barcode_readings: neededBarcodes,
                        })
                      }
                    />,
                  );

                enRouteActions.push(
                  <ActionButton
                    size='large'
                    type='secondary'
                    style={styles.actionButton}
                    loading={updatingMatchStatus === matchActionTypes.picked_up}
                    disabled={disabled || neededBarcodes.length > 0}
                    label="Enter Recipient's Signature"
                    onPress={() => {
                      navigation.navigate('MatchSignature', {
                        id: match.id,
                        stopId: stop.id,
                      });
                    }}
                  />,
                );
                break;
              case 'signed':
                const destination_photo_required_text =
                  stop.destination_photo_required ? 'required' : 'optional';

                dataActions.push(
                  <DataCard
                    title={
                      <Text style={styles.headerText}>
                        Upload Photos{' '}
                        <Text style={styles.headerOptionalText}>
                          ({destination_photo_required_text})
                        </Text>
                      </Text>
                    }
                    viewMode={true}
                    items={[
                      {
                        label: (
                          <Text style={styles.uploadTitle}>
                            Cargo after Delivery
                          </Text>
                        ),
                        content: (
                          <MatchPhotoCropper
                            photo={this.state.destinationPhoto}
                            altIcon='box-open'
                            disabled={disabled}
                            onPhotoChange={(destinationPhoto: Image) =>
                              this.setState({ destinationPhoto })
                            }
                          />
                        ),
                      },
                    ]}
                  />,
                );

                enRouteActions.push(
                  <ActionButton
                    size='large'
                    type='secondary'
                    style={styles.actionButton}
                    loading={updatingMatchStatus === matchActionTypes.completed}
                    disabled={disabled}
                    label='Confirm Delivery'
                    onPress={this.deliver.bind(this)}
                  />,
                );
                break;
            }
          }
          break;
        case 'en_route_to_return':
          enRouteActions.push(
            <ActionButton
              type='secondary'
              size='large'
              style={styles.actionButton}
              loading={
                updatingMatchStatus === matchActionTypes.arrived_at_return
              }
              disabled={disabled}
              label="I'm at the Return"
              onPress={this.arriveAtReturn.bind(this)}
            />,
          );
          break;
        case 'arrived_at_return':
          enRouteActions.push(
            <ActionButton
              label='Confirm Return'
              size='large'
              type='secondary'
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.completed}
              disabled={disabled}
              onPress={this.returned.bind(this)}
            />,
          );
          break;
      }

      if (match.isLive()) {
        if (!match.isActionable()) {
          // enRouteActions = [
          //   <Text style={[styles.noticeText, { marginBottom: 15 }]}>
          //     Match must be En Route to change status. Turn on En Route as soon
          //     as you are on your way.
          //   </Text>,
          // ];
          enRouteActions = [];
          dataActions = [];
        }

        if (
          dataActions.length > 0 ||
          enRouteActions.length > 0 ||
          actions.length > 0
        ) {
          return (
            <View style={styles.actionsWrapper}>
              <View style={[styles.actionWrapper, styles.dataActionWrapper]}>
                {dataActions}
              </View>
              <View style={styles.actionWrapper}>
                {enRouteActions}
                {actions}
              </View>
            </View>
          );
        }
      }
    }
  }

  renderContact(items: DataCardItem[]) {
    let contact = null;
    if (items.length > 0) {
      contact = <DataCard title={'Shipper'} items={items} />;
    }
    return contact;
  }

  renderEnRoute() {
    const { matchId, match } = this.state;
    const {
      updatingMatchStatus: { [matchId]: updatingMatchStatus },
      updatingEnRouteMatch: { [matchId]: updatingEnRoute },
    } = this.props;

    if (match && match.isEnRouteToggleable() && match.state === 'picked_up') {
      const stopId = match.stops[0].id;
      let isEnRoute = match.isEnRoute();
      if (match.isLive() && !match.isMultiStop()) {
        return (
          <View style={[styles.actionWrapper, { marginBottom: 24 }]}>
            <BlockSwitch
              type='primary'
              onValueChange={() => this.toggleEnRoute(stopId)}
              value={updatingEnRoute ? !isEnRoute : isEnRoute}
              loading={updatingEnRoute}
              disabled={!!updatingMatchStatus || !!updatingEnRoute}>
              En Route
            </BlockSwitch>
            {!isEnRoute && (
              <Text style={[styles.noticeText, { marginTop: 12 }]}>
                Turn on En Route as soon as you are on your way.
              </Text>
            )}
          </View>
        );
      }
    }
  }

  renderMatch() {
    const { match, matchId } = this.state;
    const {
      user,
      navigation,
      fetchingMatch: { [matchId]: isUpdating },
      fetchingMatchError: { [matchId]: matchError },
    } = this.props;

    /**
     * if the match is authorized, is not canceled, and is available or belongs to current driver
     */
    if (match && match.isAuthorized() && !match.isCanceled()) {
      const services = [];

      if (match.needsLoadUnload()) {
        services.push('Load/Unload');
      }
      if (match.needsPalletJack()) {
        services.push('Pallet Jack');
      }
      const stop = match.stops[0]!;
      var contactItems: DataCardItem[] = [],
        paymentItems: DataCardItem[] = [],
        detailItems: DataCardItem[] = [
          {
            label: 'Distance',
            content: match.distance ? `${match.distance.toFixed(1)} mi` : 'N/A',
          },
          {
            label: 'Rate Bracket',
            content: match.vehicle_class,
          },
          {
            label: 'Unload Method',
            content: match.displayUnloadMethod(),
          },
          {
            label: 'Services',
            content: services.length > 0 ? services.join('\n') : 'None',
          },
        ];

      if (match.isMultiStop()) {
        detailItems.push({
          label: '# Stops on Route',
          content: match.stops.length,
        });
      }

      if (match.state !== matchStatusTypes.assigning_driver) {
        detailItems.push(
          {
            label: 'PO/Job #',
            content: match.po,
            width: match.isMultiStop() ? undefined : 'full',
          },
          {
            label: 'Pickup Notes',
            content: match.pickup_notes,
            width: 'full',
          },
        );
        // TO DO: figure out why delivery notes aren't showing up
        if (!match.isMultiStop()) {
          detailItems.push({
            label: 'Dropoff Notes',
            content: stop.delivery_notes,
            width: 'full',
          });
        }

        if (!match.self_sender && match.sender) {
          contactItems.push({
            label: `Contact Sender`,
            content: `${match.sender.name} - ${match.formatPhoneNumber(
              match.sender.phone_number,
            )}`,
            phone: match.sender.phone_number,
          });
        } else {
          contactItems.push({
            label: 'Contact Shipper',
            content: match.getShipper(),
            phone: match.shipper.phone,
          });
        }

        if (!match.isMultiStop() && stop.recipient && !stop.self_recipient) {
          contactItems.push({
            label: `Contact Recipient`,
            content: `${stop.recipient.name} - ${match.formatPhoneNumber(
              stop.recipient.phone_number,
            )}`,
            phone: stop.recipient.phone_number,
          });
        }
      }

      match.fees.forEach((fee) => {
        paymentItems.push({
          label: fee.name + (fee.description ? ` – ${fee.description}` : ''),
          content: fee.display_amount(),
        });
      });

      paymentItems.push({
        label: 'Total',
        content: `$${match.totalPay()}`,
      });

      let locationItems: DataCardItem[] = [];
      if (match.isMultiStop()) {
        let stops = '';
        let match_stops_names = '';
        match.stops.map((stop) => {
          stops = stops.concat(
            `${
              match.isAvailable()
                ? generalLocationFormat(stop.destination_address)
                : match.formatAddress(
                    stop.destination_address.formatted_address,
                  )
            } \n`,
          );

          match_stops_names = match_stops_names.concat(
            `${
              stop.destination_address.name ? stop.destination_address.name : ''
            } \n`,
          );
        });
        locationItems.push(
          {
            label: 'Start',
            name: match.origin_address.name,
            content: match.isAvailable()
              ? generalLocationFormat(match.origin_address)
              : match.formatAddress(match.origin_address.formatted_address),
          },
          {
            label: `${match.stops.length} stops, ${match.distance} mi`,
            name: match_stops_names,
            content: stops,
          },
        );
      } else {
        locationItems.push(
          {
            label: 'Pickup',
            name: match.origin_address.name,
            content: match.isAvailable()
              ? generalLocationFormat(match.origin_address)
              : match.formatAddress(match.origin_address.formatted_address),
          },
          {
            label: 'Dropoff',
            name: stop.destination_address.name,
            content: match.isAvailable()
              ? generalLocationFormat(stop.destination_address)
              : match.formatAddress(stop.destination_address.formatted_address),
          },
        );
      }

      let timeframeItems: DataCardItem[] = [
        {
          label: 'Priority',
          content: match.getPriority(),
        },
      ];

      if (match.scheduled) {
        timeframeItems.push(
          {
            label: 'Pickup Time',
            content: match.getPickupTime(),
          },
          {
            label: 'Dropoff Time',
            content: match.getDropoffTime(),
          },
        );
      }

      return (
        <View>
          <Text style={styles.cityInfo}>
            {match.origin_address.city}, {match.origin_address.state_code}{' '}
            <FontAwesome5
              name='arrow-right'
              size={17}
              color={colors.secondary}
            />{' '}
            {stop.destination_address.city},{' '}
            {stop.destination_address.state_code}
          </Text>

          <View style={styles.mapContainer}>
            <MatchMap match={match} />
          </View>
          <Content padder>
            {['charged', 'completed'].includes(match.state) && (
              <ActionButton
                size='large'
                type='secondary'
                style={styles.actionButton}
                disabled={true}
                label={`Delivered on ${
                  match.completed_at
                    ? match.completed_at.format('MMM Do, YYYY')
                    : 'N/A'
                }`}
              />
            )}

            {this.renderNavigationAction()}

            {this.renderAction()}

            {this.renderEnRoute()}

            {['charged', 'completed'].includes(match.state) &&
              !!match.slas?.length && <MatchSLACard slas={match.slas} />}

            <DataCard title='Timeframe' items={timeframeItems} />

            {match.isMultiStop() ? (
              this.renderStops()
            ) : (
              <DataCard title='Location' items={locationItems} />
            )}

            <MatchCargoDetails match={match} driver={user} />
            <DataCard
              title={match.isMultiStop() ? 'Route Details' : 'Details'}
              columns={2}
              items={detailItems}
            />

            {this.renderContact(contactItems)}

            <DataCard title='Pay' items={paymentItems} />

            {this.renderAcceptAction()}
            {this.renderCancel()}
          </Content>
        </View>
      );
    } else {
      let message = matchError?.response?.data?.message,
        title = 'Match Unavailable',
        icon = <FontAwesome5 name='ban' style={styles.megaIcon} />;

      if (match) {
        switch (match.state) {
          case matchStatusTypes.canceled:
            title = 'Match Canceled';
            message = message || 'Sorry, the shipper has canceled this Match.';
            break;
          default:
            message =
              message ||
              'Sorry, this Match has been accepted by another driver.';
        }
      } else if (isUpdating) {
        title = 'Fetching Match';
        icon = <FontAwesome5 name='truck-loading' style={styles.megaIcon} />;
      }

      return (
        <Content contentContainerStyle={styles.unavailableContainer}>
          {icon}
          <Text style={styles.unavailableHeader}>{title}</Text>
          <Text style={styles.unavailableText}>{message}</Text>
          <ActionButton
            label='Go Back'
            onPress={() => navigation.navigate('Matches')}
            block
            size='large'
            type='secondary'
          />
        </Content>
      );
    }
  }

  render() {
    const { matchId } = this.state;
    const {
      fetchingMatch: { [matchId]: isUpdating },
    } = this.props;
    // For multi-stop matches, the accordion of stops is rendered as a ListView, which has its own scroll functionality, and shouldn't be listed inside a scrollview...
    // TO DO: fix listview and scrollview conflict for multistop matches
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={!!isUpdating}
            onRefresh={this.getMatch.bind(this)}
          />
        }>
        {this.renderMatch()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
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
  actionsWrapper: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginBottom: 10,
    alignItems: 'flex-start', // if you want to fill rows left to right
  },
  actionWrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    marginBottom: 10,
    alignItems: 'center',
  },
  dataActionWrapper: {
    marginBottom: 10,
    marginTop: -10,
  },
  inlineActionWrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: -10,
    justifyContent: 'space-between',
  },
  actionButton: {
    marginBottom: 10,
    marginHorizontal: 4,
  },
  cityInfo: {
    textAlign: 'center',
    fontSize: 19,
    fontWeight: '700',
    paddingVertical: 18,
  },
  mapContainer: {
    height: 200,
  },
  signature: {
    borderColor: colors.signature,
    borderWidth: 1,
    width: '100%',
    height: 250,
    marginTop: 13,
    marginBottom: 15,
  },
  noticeText: {
    color: colors.gray,
    textAlign: 'left',
    width: '100%',
  },
  uploadTitle: {
    color: colors.gray,
    fontWeight: 'bold',
  },
  headerText: {
    color: colors.secondary,
    fontSize: 18,
  },
  headerOptionalText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: '400',
  },
  multiStopContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // if you want to fill rows left to right
  },
  bodyBold: {
    width: '100%',
    color: colors.gray,
  },
  multiStopCard: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 3,
  },
  multiStopItem: {
    backgroundColor: colors.offWhite,
    borderColor: colors.white,
    borderWidth: 1,
    paddingHorizontal: 0,
  },
  itemContent: {
    width: '100%',
    flex: 1,
    flexWrap: 'wrap',
  },
  multiStopItemContent: {
    width: '90%',
    marginLeft: 5,
    paddingLeft: 4,
    paddingTop: 8,
    paddingBottom: 4,
    flex: 1,
    flexWrap: 'wrap',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderColor: colors.darkGray,
  },
  numberLabel: {
    fontSize: 32,
    flex: 1,
    flexShrink: 5,
  },
  multiStopItemLabel: {
    width: '100%',
    color: colors.darkGray,
    fontWeight: 'bold',
  },
  itemLabelContainer: {
    flex: 1,
    flexGrow: 10,
  },
  itemLabel: {
    width: '100%',
    color: colors.gray,
  },
  multiStopItemWrapper: {
    flexDirection: 'row',
  },
});

const connector = connect(({ userReducer, matchReducer }: RootState) => ({
  user: userReducer.user,
  fetchingUser: userReducer.fetchingUser,
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  updatingMatchStatus: matchReducer.updatingMatchStatus,
  matchStatusError: matchReducer.matchStatusError,
  matchStatusSuccess: matchReducer.matchStatusSuccess,
  matches: matchReducer.matches,
  fetchingMatch: matchReducer.fetchingMatch,
  fetchingMatchError: matchReducer.fetchingMatchError,
}));

export default withNavigationFocus(connector(MatchScreen));
