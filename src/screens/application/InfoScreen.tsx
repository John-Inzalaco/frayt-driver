import React from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { signOutUser } from '@actions/userAction';
import { ScrollView } from 'react-native-gesture-handler';
import ActionButton from '@components/ui/ActionButton';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';

var { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{ index: number }>;
} & ConnectedProps<typeof connector>;

function InfoScreen(props: ScreenProps) {
  const { navigation, dispatch } = props;

  const goBack = async () => {
    if (navigation) {
      const parent = navigation.dangerouslyGetParent(),
        index = parent ? parent.state.index : 0;

      if (index > 0) {
        navigation.goBack();

        return true;
      }
    }

    await dispatch<any>(signOutUser());

    return false;
  };

  const nextStep = () => navigation.navigate('Questionnaire');
  const itemStyles = { ...styles.text, paddingLeft: 7 };

  return (
    <Container>
      <StatusBar barStyle='light-content' />
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Apply To Drive</Text>
          <Text style={styles.text}>
            Thank you for your interest in applying to drive to FRAYT! Once
            approved as an independent contracted driver, you will be able to
            start taking Matches (deliveries).
          </Text>
          <Text style={styles.text}>
            Before you get started, you'll want to make sure you have all the
            information needed to complete the application. These include:
          </Text>
          <Text style={styles.text}>
            You'll need these for the application:
          </Text>
          <Text style={itemStyles}>- Vehicle insurance and registration</Text>
          <Text style={itemStyles}>- Driver's license</Text>
          <Text style={itemStyles}>- Photos of your vehicle</Text>
          <Text style={itemStyles}>
            - Credit card for application fee ($35)
          </Text>
          <Text style={styles.text}>
            No refund will be given if there is a failure to provide all proper documentation.
          </Text>
          <ActionButton
            label='GET STARTED'
            type='light'
            size='large'
            style={styles.button}
            onPress={nextStep}
            block
          />
          <ActionButton
            label='BACK'
            type='light'
            size='large'
            style={styles.button}
            onPress={goBack}
            block
            hollow
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
}));

export default connector(InfoScreen);
