import React, { Component } from 'react';
import Match from '@models/Match';
import MatchStop from '@models/MatchStop';
import { connect, ConnectedProps } from 'react-redux';
import { matchActionTypes } from '@actions/types/matchTypes';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';

import { Image } from 'react-native-image-crop-picker';
import {
  toggleStopEnRoute,
  arriveAtDropoff,
  deliverMatch,
} from '@actions/matchAction';

import { View, StyleSheet } from 'react-native';
import { DataCardItem } from '@components/ui/DataCard';
import { CardItem, Icon, Body, Text, Toast } from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import colors, { colorObjs } from '@constants/Colors';
import ActionButton from '@components/ui/ActionButton';
import Communications from 'react-native-communications';
import BlockSwitch from '@components/ui/BlockSwitch';
import MatchPhotoCropper from '@components/ui/MatchPhotoCropper';
import { generalLocationFormat } from '@lib/helpers';
import Accordion from '@components/ui/Accordion';
import UndeliverableStopButton from '@components/UndeliverableStopButton';
interface NavigationProps {
  id: string;
}

interface NavigationState {
  params: NavigationProps;
}

interface ScreenProps extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
}

interface ScreenProps extends ConnectedProps<typeof connector> {
  stop: MatchStop;
  match: Match;
  routeTo: any;
}

interface ScreenState {
  destinationPhoto: Nullable<Image>;
}

class MatchStopListItem extends Component<ScreenProps, ScreenState> {
  constructor(props: ScreenProps) {
    super(props);

    this.state = {
      destinationPhoto: null,
    };
  }

  async toggleEnRoute() {
    const { dispatch, match, stop } = this.props;

    dispatch<any>(toggleStopEnRoute(match.id, stop.id));
  }

  async arriveAtDropoff() {
    const { dispatch, match, stop } = this.props;

    dispatch<any>(arriveAtDropoff(match.id, stop.id));
  }

  async deliver() {
    const { dispatch, match, stop } = this.props;
    const { destinationPhoto } = this.state;

    //TO DO: figure out delivery for only active stop, check if destination photo is needed for that stop, save photo to only that stop
    if (stop.destination_photo_required && !destinationPhoto) {
      Toast.show({
        text: 'This delivery requires a photo of where the cargo was unloaded.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }
    dispatch<any>(deliverMatch(match.id, destinationPhoto, stop.id));
  }

  renderActions() {
    const { stop, match } = this.props;

    const isEnRoute = (stop as MatchStop) === match.stopCurrentlyEnRoute();
    const {
      navigation,
      updatingMatchStatus: { [match.id]: updatingMatchStatus },
      updatingEnRouteMatch: { [match.id]: updatingEnRoute },
    } = this.props;

    if (
      match.state === 'picked_up' &&
      stop.state !== 'delivered' &&
      stop.state !== 'undeliverable'
    ) {
      const matchActions = [];

      switch (stop.state) {
        case 'en_route':
          {
            /* Arrived at Dropoff button */
          }
          matchActions.push(
            <ActionButton
              size='large'
              type='secondary'
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.picked_up}
              disabled={!!updatingMatchStatus || !!updatingEnRoute}
              label="I'm at the Dropoff"
              onPress={this.arriveAtDropoff.bind(this)}
              shrink
              block
            />,
          );
          break;
        case 'arrived':
          const neededBarcodes = stop.neededBarcodes('delivery');
          neededBarcodes.length > 0 &&
            matchActions.push(
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

          matchActions.push(
            <ActionButton
              size='large'
              type='secondary'
              block
              shrink
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.picked_up}
              disabled={
                !!updatingMatchStatus ||
                !!updatingEnRoute ||
                neededBarcodes.length > 0
              }
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
          matchActions.push(
            <ActionButton
              size='large'
              type='secondary'
              block
              shrink
              style={styles.actionButton}
              loading={updatingMatchStatus === matchActionTypes.completed}
              disabled={!!updatingMatchStatus || !!updatingEnRoute}
              label='Confirm Delivery'
              onPress={() => {
                this.deliver();
              }}
            />,
          );
          break;
      }

      matchActions.push(
        <UndeliverableStopButton
          match={match}
          stop={stop}
          navigation={navigation}
        />,
      );

      return (
        <View style={styles.actionContainer}>
          {(stop.state === 'pending' || stop.state === 'en_route') && [
            <View style={styles.routeWrapper}>
              <View style={styles.directionsWrapper}>
                <ActionButton
                  label='Directions'
                  style={styles.actionButton}
                  size='large'
                  type='secondary'
                  hollow
                  block
                  shrink
                  hollowBackground={colors.white}
                  onPress={() =>
                    this.props.routeTo(
                      stop.destination_address.formatted_address,
                    )
                  }
                />
              </View>
              <View style={styles.enRouteWrapper}>
                <BlockSwitch
                  type='primary'
                  onValueChange={() => this.toggleEnRoute()}
                  value={updatingEnRoute ? !isEnRoute : isEnRoute}
                  loading={updatingEnRoute}
                  disabled={!!updatingMatchStatus || !!updatingEnRoute}
                  style={styles.enRouteToggle}
                  containerStyles={styles.enRouteToggleContainer}>
                  En Route
                </BlockSwitch>
              </View>
            </View>,
            !isEnRoute && (
              <Text style={styles.noticeText}>
                Turn on En Route as soon as you are on your way to this stop.
              </Text>
            ),
          ]}

          {/* Destination Photo */}
          {stop.state === 'signed' && (
            <View>
              <Text style={styles.itemLabel}>
                Upload Photos (
                {stop.destination_photo_required ? 'Required' : 'Optional'})
              </Text>
              <View style={styles.itemContent}>
                <Text>Cargo after Delivery</Text>
                <MatchPhotoCropper
                  photo={this.state.destinationPhoto}
                  altIcon='box-open'
                  disabled={!!updatingMatchStatus || !!updatingEnRoute}
                  onPhotoChange={(destinationPhoto: Image) =>
                    this.setState({ destinationPhoto })
                  }
                />
              </View>
            </View>
          )}

          {matchActions}
        </View>
      );
    }
  }

  render() {
    const { stop, match } = this.props;

    let stopItems: DataCardItem[] = [];

    // CARGO
    let cargoContent = '';
    for (let i = 0; i < stop.items.length; i++) {
      const item = stop.items[i];
      cargoContent = cargoContent.concat(item.display());
      if (i !== stop.items.length - 1) {
        cargoContent = cargoContent.concat('\n');
      }
    }

    // CONTACT
    if (!stop.self_recipient && stop.recipient) {
      stopItems.push({
        label: `Contact Recipient`,
        content: `${stop.recipient.name} - ${match.formatPhoneNumber(
          stop.recipient.phone_number,
        )}`,
        phone: stop.recipient.phone_number,
      });
    }

    const renderHeaderAvailable = (item: any, expanded: boolean) => {
      return (
        <View style={styles.headerWrapperAvailable}>
          <Text style={styles.headerTextAvailable}>{item.title}</Text>
          <View style={{ flex: 1 }}>
            {expanded ? (
              <Icon name='chevron-up-outline' />
            ) : (
              <Icon name='chevron-down-outline' />
            )}
          </View>
        </View>
      );
    };

    const renderHeader = (item: any, expanded: boolean) => {
      let statusColor = colors.gray;
      let statusIcon = null;
      let status = '';
      switch (stop.state) {
        case 'pending':
          status = 'Not Started';
          statusColor = colors.gray;
          statusIcon = <FontAwesome5 name='map' size={14} />;

          break;
        case 'en_route':
          status = 'En Route to Dropoff';
          statusColor = colors.secondary;
          statusIcon = <FontAwesome5 name='map-marked' size={14} />;
          break;
        case 'arrived':
          status = 'Arrived at Dropoff';
          statusColor = colors.secondary;
          statusIcon = <FontAwesome5 name='map-marked-alt' size={14} />;
          break;
        case 'signed':
          status = stop.signature_required
            ? 'Delivery Signed'
            : 'Delivery (Signature not required)';
          statusColor = colors.secondary;
          statusIcon = <FontAwesome5 name='map-marked-alt' size={14} />;
          break;
        case 'delivered':
          status = 'Delivered';
          statusColor = colors.success;
          statusIcon = (
            <Icon
              name='checkmark-circle-outline'
              style={{ fontSize: 14, color: statusColor }}
            />
          );
          break;
        case 'undeliverable':
          status = 'Undeliverable';
          statusColor = colors.danger;
          statusIcon = <FontAwesome5 name='ban' size={14} />;
          break;
      }

      return (
        <View style={styles.headerWrapper}>
          <View style={{ display: 'flex', flexDirection: 'row', flex: 10 }}>
            <Text style={styles.numberLabel}>{stop.index + 1}</Text>
            <View style={styles.itemLabelContainer}>
              <Text style={styles.headerText}>{item.title}</Text>
              <Text style={[styles.status, { color: statusColor }]}>
                {statusIcon} {status}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {expanded ? (
              <Icon name='chevron-up-outline' />
            ) : (
              <Icon name='chevron-down-outline' />
            )}
          </View>
        </View>
      );
    };

    const renderContent = () => {
      return (
        <View style={styles.accordionItemWrapper}>
          {this.renderActions()}

          {/* Services */}

          {(stop.has_load_fee || stop.needs_pallet_jack) && (
            <View style={styles.item}>
              <Text style={styles.itemLabel}>Services</Text>
              <View style={styles.itemWrapper}>
                <View style={styles.itemContent}>
                  {stop.has_load_fee && <Text>Requires Load/Unload</Text>}
                  {stop.needs_pallet_jack && <Text>Needs Pallet Jack</Text>}
                </View>
              </View>
            </View>
          )}

          {/* Cargo */}
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Cargo</Text>
            <View style={styles.itemWrapper}>
              <View style={styles.itemContent}>
                <Text>{cargoContent}</Text>
              </View>
            </View>
          </View>

          {/* Dropoff By */}
          <View style={styles.item}>
            <Text style={styles.itemLabel}>Dropoff By</Text>
            <View style={styles.itemWrapper}>
              <View style={styles.itemContent}>
                <Text>{stop.getDropoffBy()}</Text>
              </View>
            </View>
          </View>

          {/* Dropoff Notes */}
          {match.isLive() && (
            <CardItem style={styles.item} bordered>
              <Body>
                <Text style={styles.itemLabel}>Dropoff Notes</Text>
                <View style={styles.itemWrapper}>
                  <View style={styles.itemContent}>
                    <Text>{stop.delivery_notes || '-'}</Text>
                  </View>
                </View>
              </Body>
            </CardItem>
          )}

          {/* P.O. */}
          <View style={styles.item}>
            <Text style={styles.itemLabel}>P.O.</Text>
            <View style={styles.itemWrapper}>
              <View style={styles.itemContent}>
                <Text>{stop.po}</Text>
              </View>
            </View>
          </View>

          {/* Contact Recipient */}
          {match.state === 'picked_up' &&
            !stop.self_recipient &&
            stop.recipient && (
              <CardItem style={styles.item} bordered>
                <Body>
                  <Text style={styles.itemLabel}>Contact Recipient</Text>
                  <View style={styles.itemWrapper}>
                    <Text style={styles.itemContent} selectable={true}>
                      {stop.recipient.name} -{' '}
                      {stop.recipient.phone_number &&
                        match.formatPhoneNumber(stop.recipient.phone_number)}
                    </Text>
                  </View>
                  <View style={styles.itemWrapper}>
                    {stop.recipient.phone_number && [
                      <ActionButton
                        label='Call'
                        style={{ marginRight: 8, marginTop: 10 }}
                        onPress={() => {
                          Communications.phonecall(
                            stop.recipient?.phone_number!,
                            true,
                          );
                        }}
                      />,
                      <ActionButton
                        label='Text'
                        style={{ marginLeft: 8, marginTop: 10 }}
                        onPress={() => {
                          Communications.text(stop.recipient?.phone_number, '');
                        }}
                      />,
                    ]}
                  </View>
                </Body>
              </CardItem>
            )}
          {/*  Driver Tip?? Half width, maybe?? Only show if applicable?? */}
        </View>
      );
    };

    return (
      <Accordion
        renderHeader={
          match.isAvailable() ? renderHeaderAvailable : renderHeader
        }
        renderContent={renderContent}
        item={{
          title: `${
            match.isAvailable()
              ? generalLocationFormat(stop.destination_address)
              : match.formatAddress(stop.destination_address.formatted_address)
          }`,
        }}
      />
    );
  }
}
const connector = connect(({ matchReducer }: RootState) => ({
  updatingEnRouteMatch: matchReducer.updatingEnRouteMatch,
  updatingMatchStatus: matchReducer.updatingMatchStatus,
  matchStatusError: matchReducer.matchStatusError,
  matchStatusSuccess: matchReducer.matchStatusSuccess,
}));

export default connector(MatchStopListItem);

const styles = StyleSheet.create({
  actionContainer: {
    marginHorizontal: 6,
    marginTop: 10,
  },
  directionsWrapper: {
    flexShrink: 0,
    flexDirection: 'row',
  },
  enRouteWrapper: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  enRouteToggle: {
    width: 'auto',
    height: 47,
    marginRight: 4,
  },
  enRouteToggleContainer: {
    flex: 1,
  },
  routeWrapper: {
    flexDirection: 'row',
  },
  headerTextAvailable: {
    color: colors.text,
    flex: 10,
  },
  headerText: {
    color: colors.text,
  },
  headerWrapperAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    textAlignVertical: 'center',
    backgroundColor: colors.lightGray,
    minWidth: '100%',
    borderWidth: 1,
    borderColor: colorObjs.lightGray.darken(0.05).toString(),
  },
  headerWrapper: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    textAlignVertical: 'center',
    backgroundColor: colors.lightGray,
    minWidth: '100%',
    borderWidth: 1,
    borderColor: colorObjs.lightGray.darken(0.05).toString(),
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 4,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  bodyBold: {
    width: '100%',
    color: colors.gray,
  },
  card: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 3,
  },
  accordionItemWrapper: {
    minWidth: '100%',
    backgroundColor: colors.white,
  },
  item: {
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // flex: 1,
    // minWidth: 300,
    // width: '100%',
  },
  itemContent: {
    // width: '100%',
    // flex: 1,
    // flexWrap: 'wrap',
  },
  numberLabel: {
    fontSize: 32,
    flex: 1,
    flexShrink: 5,
  },
  itemLabelContainer: {
    flex: 1,
    flexGrow: 10,
  },
  itemLabel: {
    // width: '100%',
    color: colors.gray,
  },
  itemWrapper: {
    flexDirection: 'row',
  },
  actionButton: {
    marginBottom: 10,
    marginHorizontal: 4,
    shadowOpacity: 0,
  },
  actionWrapper: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    marginVertical: 10,
    alignItems: 'center',
  },
  noticeText: {
    color: colors.gray,
    marginTop: 0,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  uploadTitle: {
    color: colors.gray,
    fontWeight: 'bold',
  },
});
