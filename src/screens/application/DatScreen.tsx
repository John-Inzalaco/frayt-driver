import React, { useCallback } from 'react';
import { StyleSheet, View, Dimensions, StatusBar, Linking } from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { finishUserApplication } from '@actions/userAction';
import { ScrollView } from 'react-native-gesture-handler';
import ActionButton from '@components/ui/ActionButton';
import { NavigationScreenProp } from 'react-navigation';
 import { RootState } from '@src/reducers';
import { Driver } from '@models/User';

const { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{ index: number }>;
  user: Driver;
} & ConnectedProps<typeof connector>;

function DatScreen(props: ScreenProps) {
  const { dispatch, navigation, driver } = props;

  const nextStep = useCallback(async () => {
    const finished = await dispatch(finishUserApplication());

    if (finished) {
      await navigation.navigate('ApplicationComplete');
      const email = 'support@frayt.com';
      const subject = 'Box Truck Frayt Application';
      const body =
        'Email and Application ID will be used to link this to your account. If these are changed your submission will be rejected.\n' +
        ` - Email: ${driver.email}\n` +
        ` - Application ID: ${driver.id}Yeah\n` +
        'Please enter your information below after each colon: \n' +
        ' - DOT Number: \n' +
        ' - MC Number: \n' +
        ' - Company Name: \n';

      const url = `mailto:${email}?subject=${subject}&body=${body}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  }, [navigation]);

  return (
    <Container>
      <StatusBar barStyle='light-content' />
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={{ ...styles.text, fontWeight: 'bold' }}>
            Please email the following items to support@frayt.com:
          </Text>
          <Text style={styles.text}> - Your DOT Number</Text>
          <Text style={styles.text}> - Your MC Number</Text>
          <Text style={styles.text}> - Your Company Name</Text>
          <ActionButton
            label='Click Here To Continue'
            type='light'
            size='large'
            style={styles.button}
            onPress={nextStep}
            block
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 12,
  },
  header: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  text: {
    color: colors.secondaryText,
    marginBottom: 12,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    marginVertical: 12,
  },
});

const connector = connect((state: RootState) => ({
  signingOutUser: state.userReducer.signingOutUser,
  driver: state.userReducer.user,
}));

export default connector(DatScreen);
