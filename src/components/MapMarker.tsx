import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';

import { Marker } from 'react-native-maps';
import colors, { colorObjs } from '@constants/Colors';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { Text } from 'native-base';

import moment from 'moment';
import { Coordinates } from '@lib/helpers';

type Props = {
  coordinate: Coordinates;
  label?: Nullable<string | number>;
  icon?: Nullable<string>;
  callout?: Nullable<Element>;
};

const MapMarker = ({ coordinate, callout, label, icon }: Props) => {
  return (
    <Marker
      key={`${moment().unix()}`}
      coordinate={coordinate}
      tracksViewChanges={false}
      centerOffset={{ x: 0, y: -44 / 2 }}>
      <View style={styles.markerShadow}></View>
      <View style={styles.markerBorder}>
        <View style={styles.marker}>
          {label ? (
            <Text style={styles.markerLabel}>{label}</Text>
          ) : (
            icon && <FontAwesome5Icon name={icon} color={colors.secondary} />
          )}
        </View>
      </View>
      <View style={styles.markerCaret}></View>
      {callout}
    </Marker>
  );
};

export default MapMarker;

const styles = StyleSheet.create({
  markerShadow: {
    shadowColor: '#000',
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    width: 32,
    height: 32,
    zIndex: 9,
    borderRadius: 16,
    backgroundColor: '#000',
    position: 'absolute',
  },
  marker: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colorObjs.lightGray.hex(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerBorder: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 4,
    width: 32,
    height: 32,
    overflow: 'hidden',
    borderColor: colors.secondary,
    zIndex: 11,
  },
  markerLabel: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  markerCaret: {
    left: 7,
    top: -3,
    width: 0,
    height: 0,
    zIndex: 10,
    borderTopWidth: 12,
    borderRightWidth: 9,
    borderBottomWidth: 0,
    borderLeftWidth: 9,
    borderColor: 'transparent',
    borderTopColor: colors.secondary,
  },
});
