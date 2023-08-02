import React from 'react';
import { StyleSheet, Image, Platform, Alert } from 'react-native';
import { Container, Text, View } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';
import SetupBlock from '@components/ui/SetupBlock';
import ActionButton from '@components/ui/ActionButton';
import {
  requestPermission,
  checkPermissions,
  updateSetting,
  PermissionType,
} from '@actions/appAction';
import { timeout } from '@lib/helpers';
import { openSettings } from '@lib/settings';

class SetupScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  state = {
    notificationsLoading: false,
    locationLoading: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.permissionsCheck = setInterval(() => {
      dispatch(checkPermissions());
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.permissionsCheck);
  }

  render() {
    const { permissions, settings } = this.props,
      { notificationsLoading, locationLoading } = this.state,
      canMoveForward = permissions.location,
      isComplete = canMoveForward && permissions.notifications;

    return (
      <Container>
        <View style={styles.container}>
          <View style={styles.center}>
            <Image
              source={require('../../assets/images/frayt-badge.png')}
              style={{
                width: 135,
                height: 160,
                marginBottom: 30,
                alignSelf: 'center',
              }}
            />
            <Text style={styles.header}>
              {isComplete
                ? 'Eveything is ready!'
                : settings.appIsSetup
                ? 'Looks like something changed...'
                : 'You are almost there!'}{' '}
            </Text>
            {!isComplete && !settings.appIsSetup && (
              <Text style={styles.text}>Just a few more steps to go...</Text>
            )}
          </View>
          <View style={styles.setupContainer}>
            <SetupBlock
              completed={permissions.location}
              title='Enable Location Services'
              instructions={
                !permissions.location &&
                permissions.hasAskedLocation &&
                'Location permissions are necessary for the Frayt Driver app to work.'
              }
              description="Enable location services so we can provide you and our shippers the best user experience. This allows instant pairing with matches in your area and for shippers to track your progress even when the app is closed.  Don't worry, we will only track your location when absolutely necessary."
              loading={locationLoading}
              onValueChange={this.enableLocation.bind(this)}
            />
            {Platform.OS !== 'android' && (
              <SetupBlock
                completed={permissions.notifications}
                title='Enable Notifications'
                description='Enable notifications on this device so we can ensure that you are instantly notified of new matches in your area.'
                loading={notificationsLoading}
                onValueChange={this.enableNotifications.bind(this)}
                // optional
              />
            )}
            <View style={styles.completeContainer}>
              {canMoveForward && !isComplete && Platform.OS !== 'android' && (
                <ActionButton
                  block
                  type='light'
                  size='large'
                  label='Skip Optional Setup'
                  onPress={this.completeSetup.bind(this)}
                />
              )}
              {isComplete && (
                <ActionButton
                  block
                  size='large'
                  type='light'
                  label='Finish'
                  onPress={this.completeSetup.bind(this)}
                />
              )}
            </View>
          </View>
        </View>
      </Container>
    );
  }

  async openSettings() {
    const { dispatch } = this.props;
    if (
      await openSettings(
        'Unable to open settings.  Please open the settings app, and enable necessary permissions for FRAYT Driver.',
      )
    ) {
      dispatch(checkPermissions());
    }
  }

  async enableLocation() {
    const { permissions, dispatch } = this.props;

    this.setState({ locationLoading: true });

    await timeout(500);

    if (permissions.hasAskedLocation) {
      await this.openSettings();
    } else {
      await dispatch(
        requestPermission(
          PermissionType.location,
          'Allow Frayt to access your location so we can provide our shippers and you with the best user experience',
        ),
      );
    }

    this.setState({ locationLoading: false });
  }

  async enableNotifications() {
    const { permissions, dispatch } = this.props;

    this.setState({ notificationsLoading: true });

    await timeout(500);

    if (permissions.hasAskedNotifications && Platform.OS === 'ios') {
      await this.openSettings();
    } else {
      await dispatch(requestPermission(PermissionType.notifications));
    }

    this.setState({ notificationsLoading: false });
  }

  async completeSetup() {
    const { navigation, dispatch } = this.props;

    dispatch(updateSetting('appIsSetup', true));
    navigation.navigate('Main');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    padding: 20,
  },
  setupContainer: {
    paddingHorizontal: 16,
    width: '100%',
  },
  completeContainer: {
    marginTop: 15,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
    marginTop: 24,
  },
});

export default connect((state) => ({
  permissions: state.appReducer.permissions,
  settings: state.appReducer.settings,
}))(SetupScreen);
