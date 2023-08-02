import React, { Component } from 'react';
import {
  NavigationFocusInjectedProps,
  NavigationScreenProp,
} from 'react-navigation';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { Content } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import CardSingle from '@components/ui/CardSingle';
import colors from '@constants/Colors';
import Badge from '@components/ui/Badge';
import DeviceInfoCard from '@components/ui/DeviceInfoCard';
import ActionButton from '@components/ui/ActionButton';
import { saveOneSignalId, sendTestNotification } from '@actions/userAction';
import { getUser } from '@actions/userAction';
import { updateOneSignalId } from '@actions/userAction';
import { RootState } from '@reducers/index';
import OneSignal from 'react-native-onesignal';

type State = {
  showThisDevice: boolean;
};

type Props = {
  navigation: NavigationScreenProp<{}, {}>;
} & ConnectedProps<typeof connector> &
  NavigationFocusInjectedProps;

type Device = {
  device_uuid: string;
  os: string;
  os_version: string;
};

class NotificationsScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showThisDevice: true,
    };
  }
  componentDidMount(): void {
    const { dispatch } = this.props;
    OneSignal.getDeviceState().then((device) => {
      if (device) {
        dispatch(saveOneSignalId(device));
      }
    });
  }

  render() {
    const { showThisDevice } = this.state;
    const {
      user,
      fetchingUser,
      userInitialized,
      updatingOneSignalId,
      sendingTestNotification,
      isDefaultDevice,
      oneSignalId,
    } = this.props;
    const hasMultiplesDevices = user.devices?.length > 1;

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
          <CardSingle header='Notifications'>
            {hasMultiplesDevices && (
              <View style={styles.badgeContainer}>
                <Badge
                  description='This device'
                  selected={this.state.showThisDevice}
                  onPress={() => this.setState({ showThisDevice: true })}
                  style={styles.badge}
                />

                <Badge
                  description='Other devices'
                  selected={!this.state.showThisDevice}
                  onPress={() => this.setState({ showThisDevice: false })}
                  style={styles.badge}
                />
              </View>
            )}

            {!showThisDevice && this.renderOtherDevicesInfo()}

            {showThisDevice && (
              <>
                <DeviceInfoCard
                  playerId={oneSignalId}
                  deviceId={DeviceInfo.getUniqueId()}
                  os={DeviceInfo.getSystemName()}
                  os_version={DeviceInfo.getSystemVersion()}
                />

                <ActionButton
                  onPress={() => this._updateDefaultDevice()}
                  disabled={updatingOneSignalId || isDefaultDevice}
                  loading={updatingOneSignalId}
                  type='secondary'
                  label={
                    isDefaultDevice
                      ? 'This is your default device'
                      : 'Use This Device'
                  }
                  style={styles.actionBtn}
                />

                <ActionButton
                  onPress={() => this._testNotification()}
                  disabled={sendingTestNotification}
                  loading={sendingTestNotification}
                  type='secondary'
                  label='Test Notification'
                />
              </>
            )}
          </CardSingle>
        </Content>
      </ScrollView>
    );
  }

  async getUser() {
    const { dispatch } = this.props;

    dispatch<any>(getUser());
  }

  renderOtherDevicesInfo() {
    const { user } = this.props;
    const deviceUniqueId = DeviceInfo.getUniqueId();
    const otherDevices = user?.devices?.filter(
      (device: Device) => device.device_uuid !== deviceUniqueId,
    );

    return (
      <>
        {otherDevices.length > 0 &&
          otherDevices.map((device: Device, index: Number) => {
            return (
              <DeviceInfoCard
                key={`dev_${index}_device.device_uuid`}
                playerId={device.player_id}
                deviceId={device.device_uuid}
                os={device.os}
                os_version={device.os_version}
              />
            );
          })}
      </>
    );
  }

  _updateDefaultDevice() {
    const { dispatch } = this.props;

    dispatch<any>(updateOneSignalId());
  }

  _testNotification() {
    const { dispatch } = this.props;

    dispatch<any>(sendTestNotification());
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  actionBtn: {
    marginTop: 20,
  },
  badge: {
    borderRadius: 20,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  fetchingUser: userReducer.fetchingUser,
  userInitialized: userReducer.userInitialized,
  updatingOneSignalId: userReducer.updatingOneSignalId,
  sendingTestNotification: userReducer.sendingTestNotification,
  isDefaultDevice: userReducer.isDefaultDevice,
  oneSignalId: userReducer.oneSignalId,
}));

export default connector(NotificationsScreen);
