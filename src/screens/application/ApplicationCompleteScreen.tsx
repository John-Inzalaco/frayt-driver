/* eslint-disable prettier/prettier */
import React from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Container, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import ActionButton from '@components/ui/ActionButton';
const HexagonCheckIcon = require('../../assets/images/hexagon-check.png');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

const { width, height } = Dimensions.get('window');

function ApplicationCompleteScreen(props: ScreenProps) {
  const { navigation } = props;

  const finishApplication = async () => navigation.navigate('Approval');

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.body}>
          <View>
            <Image source={HexagonCheckIcon} style={styles.checkIcon} />
          </View>
          <View style={styles.caption}>
            <Text style={styles.captionText}>Application Complete</Text>
          </View>
          <View style={styles.message}>
            <Text style={styles.messageText}>
              Your application has been completed! Our team will be reviewing
              your application and if it looks good, you will receive a
              background check from{' '}
              <Text style={styles.whiteBoldText}>Turn</Text>.
            </Text>
            <Text style={styles.messageText}>
              Once the background check comes back in line with our policy, you
              will be approved and able to get started on FRAYT.
            </Text>
            <Text style={styles.messageText}>
              You should expect to hear back from us in 1-2 weeks.
            </Text>
            <Text style={styles.messageText}>Thank you!</Text>
            <Text style={styles.messageText}>&nbsp;- The FRAYT Team</Text>
          </View>
          <ActionButton
            onPress={finishApplication}
            label='FINISH'
            size='large'
            type='light'
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
  },
  body: {
    width: width,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: height - height * 0.2,
    alignContent: 'center',
  },
  caption: {
    height: 32,
    marginBottom: 15,
  },
  captionText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
  },
  message: {
    marginBottom: 3,
  },
  messageText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 15,
  },
  checkIcon: {
    height: 85,
    marginBottom: 15,
  },
  whiteBoldText: {
    fontWeight: 'bold',
    color: colors.white,
  },
});

const connector = connect((state: RootState) => ({
  signingOutUser: state.userReducer.signingOutUser,
  creatingUnapprovedUser: state.userReducer.creatingUnapprovedUser,
}));

export default connector(ApplicationCompleteScreen);
