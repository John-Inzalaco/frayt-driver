/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import { updateRemoteComponent } from '@components/RemoteComponent';
import FormNavigation from '@components/ui/FormNavigation';
import { ApplySteps } from '@src/navigation/ApplyNavigator';
const Branch = require('../../assets/images/branch.png');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

const { width } = Dimensions.get('window');

function PayoutsScreen(props: ScreenProps) {
  const { navigation, creatingUnapprovedUser } = props;
  useEffect(() => updateFooter());
  const nextStep = () => navigation.navigate('Vehicle');

  const updateFooter = () => {
    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={nextStep}
        backAction={() => {
          navigation.navigate(ApplySteps[ApplySteps.Payouts - 1]);
        }}
        loading={creatingUnapprovedUser}
        disabled={creatingUnapprovedUser}
        navigation={navigation}
      />,
      { navigation },
    );
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Payouts</Text>
          <View>
            <Image source={Branch} style={styles.branchLogo} />
          </View>
          <View style={styles.branchInfo}>
            <Text style={styles.branchInfoText}>
              Payouts are handled through our partner, Branch. Once your
              application is approved, you will receive an email with details on
              how to setup your Branch account.
            </Text>
          </View>
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
  },
  center: {
    width: width,
    padding: 12,
    alignItems: 'center',
    marginTop: 19,
  },
  branchInfo: {
    marginTop: 16,
    marginBottom: 4,
  },
  branchInfoText: {
    color: colors.white,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  },
  header: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
    color: colors.secondaryText,
    marginBottom: 15,
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
    textTransform: 'uppercase',
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    flexGrow: 0,
    marginBottom: 15,
    borderBottomWidth: 0,
  },
  inputImageContainer: {
    justifyContent: 'center',
    top: 0,
    marginBottom: 15,
  },
  inputText: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    width: '100%',
    height: 40,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 8,
    padding: 8,
  },
  inputLabel: {
    height: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: colors.lightGray,
    alignSelf: 'stretch',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfW: {
    width: '48%',
  },
  calendarIcon: {
    backgroundColor: '#231F20',
  },
  errorMsg: {
    color: '#FFAAAA',
    paddingTop: 10,
    fontWeight: 'bold',
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 27,
    color: '#8F9BB3',
  },
  branchLogo: {
    width: 148,
    height: 42,
  },
});

const connector = connect((state: RootState) => ({
  signingOutUser: state.userReducer.signingOutUser,
  creatingUnapprovedUser: state.userReducer.creatingUnapprovedUser,
}));

export default connector(PayoutsScreen);
