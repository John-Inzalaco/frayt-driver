import React, { Component } from 'react';
import { Text, Toast, View } from 'native-base';
import { Clipboard, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { TouchableOpacity } from 'react-native-gesture-handler';

type Props = {
  deviceId: string;
  os: string;
  os_version: string;
  playerId: string;
};

function copyToClipboard(text: string) {
  Clipboard.setString(text);
  Toast.show({ text: 'Copied to clipboard' });
}

export default class DeviceInfoCard extends Component<Props> {
  render() {
    const { playerId, deviceId } = this.props;
    return (
      <View style={styles.device}>
        <Text style={styles.deviceInfoLabelFull}>Device ID</Text>
        <TouchableOpacity onPress={() => copyToClipboard(deviceId)}>
          <Text style={styles.deviceID}>
            <FontAwesome5 name='copy' /> {deviceId}
          </Text>
        </TouchableOpacity>

        <Text style={styles.deviceInfoLabelFull}>Notification ID</Text>
        <TouchableOpacity onPress={() => copyToClipboard(playerId)}>
          <Text style={styles.deviceID}>
            <FontAwesome5 name='copy' /> {playerId}
          </Text>
        </TouchableOpacity>

        <View style={styles.container}>
          <View style={styles.label}>
            <Text style={styles.deviceInfoLabel}> Phone </Text>
          </View>
          <View style={styles.label}>
            <Text style={styles.deviceInfoLabel}> OS </Text>
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.content}>
            <Text> {this.props.os} </Text>
          </View>
          <View style={styles.content}>
            <Text> {this.props.os_version} </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  device: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#e8e8e8',
    marginTop: 8,
    paddingTop: 8,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: 100,
  },
  label: {
    flex: 1,
    marginTop: 15,
  },
  content: {
    flex: 1,
  },
  deviceID: {
    letterSpacing: -1,
    marginBottom: 12,
  },
  deviceInfoLabel: {
    fontSize: 16,
    color: 'rgb(145, 145, 145)',
    width: '50%',
  },
  deviceInfoLabelFull: {
    fontSize: 16,
    color: 'rgb(145, 145, 145)',
  },
});
