import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from 'native-base';
import colors from '@constants/Colors';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Driver } from '@models/User';

type Props = {
  user: Driver;
  onPress: () => void;
};

export default class ProfileCard extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { user, ...props } = this.props;

    let vehicleIcon,
      profile_image = null;

    if (!user.profile_image) {
      profile_image = require('../../assets/images/user.png');
    } else {
      profile_image = { uri: user.profile_image };
    }

    return (
      <TouchableOpacity style={styles.container} activeOpacity={0.7} {...props}>
        <View style={styles.card}>
          <View style={styles.body}>
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                flexShrink: 1,
                marginRight: 8,
              }}
              source={profile_image}
            />
            <View style={styles.textPanel}>
              <Text style={styles.headerText}>
                {user.first_name} {user.last_name}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                }}>
                {/* <Text style={styles.subText} numberOfLines={1}>
                  <FontAwesome5 name='bolt' />
                  &nbsp;
                  {user.drivers_gigs ? user.drivers_gigs.length : '0'}{' '}
                  Matches&nbsp;&nbsp;
                </Text> */}
                <Text style={styles.subText} numberOfLines={1}>
                  <FontAwesome5 name={user.vehicle_icon} />
                  &nbsp;{user.vehicle_make} {user.vehicle_model}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
    top: 0,
  },
  card: {
    backgroundColor: colors.white,
    margin: 12,
    borderRadius: 6,
    shadowColor: colors.darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  body: {
    margin: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  textPanel: {
    flex: 1,
  },
  headerText: {
    color: colors.darkGray,
    fontSize: 18,
    marginTop: 3,
    marginBottom: 4,
  },
  subText: {
    color: colors.gray,
    fontSize: 14,
  },
});
