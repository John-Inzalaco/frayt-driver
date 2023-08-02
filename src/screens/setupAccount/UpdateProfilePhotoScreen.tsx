import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import PhotoCropperHelper from '@lib/PhotoCropperHelper';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import User from '@models/User';

const { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
  user: User;
} & ConnectedProps<typeof connector>;

class UpdateProfilePhotoScreen extends Component<ScreenProps, any> {
  render() {
    const { user } = this.props;
    const profilePic = user.images.find((doc: any) => doc.type === 'profile');
    const uri = profilePic
      ? PhotoCropperHelper.getUri(null, profilePic.document || '')
      : null;

    return (
      <Container>
        <StatusBar barStyle='light-content' />
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          <View style={styles.center}>
            <Text style={styles.header}>Profile Picture</Text>
            <Image source={{ uri }} style={styles.photo} />
          </View>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 20,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.gray,
  },
  input: {
    color: colors.text,
  },
  button: {
    marginTop: 20,
  },
  photo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 75,
    borderWidth: 1,
    borderColor: colors.gray,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: colors.lightGray,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserProfilePhoto: userReducer.updatingUserProfilePhoto,
}));

export default connector(UpdateProfilePhotoScreen);
