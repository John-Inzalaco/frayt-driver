import React from 'react';
import { StyleSheet, Linking } from 'react-native';
import { Container, Content, Text, View, Toast, Right } from 'native-base';
import colors, { colorObjs } from '@constants/Colors';
import { getUser } from '@actions/userAction';
import { connect, ConnectedProps } from 'react-redux';
import ActionButton from '@components/ui/ActionButton';
import CardSingle from '@components/ui/CardSingle';
import { sendSupport } from '@actions/appAction';
import Touchable from 'react-native-platform-touchable';
import {
  getBrand,
  getBuildNumber,
  getVersion,
  getSystemName,
  getSystemVersion,
  isEmulator,
  getDeviceId,
} from 'react-native-device-info';
import DataCard from '@components/ui/DataCard';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { RootState } from '@reducers/index';
import Intercom from 'react-native-intercom';
import AppVersion from '@components/ui/AppVersion';
import CodePush from 'react-native-code-push';

type Props = {} & ConnectedProps<typeof connector>;

type State = {
  comments: string;
  submitted: boolean;
};

class SupportScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      comments: '',
      submitted: false,
    };
  }

  static navigationOptions = {
    title: 'Help',
    headerTintColor: 'white',
  };

  componentDidMount() {
    const { fetchingUser, userInitialized } = this.props;

    if (!fetchingUser && !userInitialized) {
      this.getUser();
    }
  }

  async getUser() {
    const { dispatch } = this.props;

    dispatch<any>(getUser());
  }

  async getMetaInfo() {
    let emulator = await isEmulator();
    const metaInfo = `\n\nApp: ${getVersion()} ${getBuildNumber()}, OS: ${getSystemName()} ${getSystemVersion()}, Brand: ${getBrand()}, Device: ${getDeviceId()}, Build #${getBuildNumber()}, Emulator: ${emulator}`;
    return metaInfo;
  }

  async _submitForm() {
    const { dispatch, user } = this.props;
    const { comments } = this.state;
    const email = user.email;

    if (comments == '') {
      Toast.show({
        text: 'The message is empty.',
        buttonText: 'Okay',
        duration: 3000,
      });
      return;
    }

    let metaInfo = await this.getMetaInfo();
    const commentWithMeta = comments + metaInfo;

    const success = await dispatch<any>(sendSupport(commentWithMeta, email));
    if (success) {
      this.setState({ submitted: true });
    }
  }

  _callSupport() {
    Linking.openURL('tel:8444827108');
  }

  _openChat() {
    Intercom.displayConversationsList();
  }

  _checkForUpdates() {
    CodePush.sync({
      updateDialog: {
        title: 'Update App',
      },
      installMode: CodePush.InstallMode.IMMEDIATE,
    });
  }

  renderContact() {
    const { matches } = this.props;
    const hasLiveMatches = matches.getLive().length > 0;

    return (
      <CardSingle header='Contact' icon='md-mail'>
        <Text>Chat with us for quick responses to your questions.{'\n'}</Text>
        <ActionButton
          label={
            <Text style={styles.buttonText}>
              <FontAwesome5Icon name='comment' /> Open Chat
            </Text>
          }
          type='secondary'
          onPress={this._openChat.bind(this)}
        />
        <ActionButton
          label={
            <Text style={styles.buttonText}>
              <FontAwesome5Icon name='phone' /> Phone Support
            </Text>
          }
          type='secondary'
          disabled={!hasLiveMatches}
          onPress={this._callSupport.bind(this)}
        />
        {!hasLiveMatches && (
          <Text>Phone support is only available when you are on a Match.</Text>
        )}
      </CardSingle>
    );
  }

  render() {
    return (
      <Container style={styles.container}>
        <Content padder>
          <CardSingle
            header='Resources'
            icon='md-list'
            innerStyle={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
            }}>
            <Touchable
              style={styles.option}
              onPress={() => Linking.openURL('https://www.frayt.com/guide/')}>
              <View style={styles.optionTextContainer}>
                <FontAwesome5Icon
                  name='chalkboard-teacher'
                  style={styles.resourceIcon}
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.optionText}>Driver's Guide</Text>
                <Right>
                  <FontAwesome5Icon
                    name='angle-right'
                    size={18}
                    color={colors.secondary}
                  />
                </Right>
              </View>
            </Touchable>

            <Touchable
              style={styles.option}
              onPress={() =>
                Linking.openURL('https://www.frayt.com/driver-faq/')
              }>
              <View style={styles.optionTextContainer}>
                <FontAwesome5Icon
                  name='question'
                  style={styles.resourceIcon}
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.optionText}>
                  Frequently Asked Questions
                </Text>
                <Right>
                  <FontAwesome5Icon
                    name='angle-right'
                    size={18}
                    color={colors.secondary}
                  />
                </Right>
              </View>
            </Touchable>

            <Touchable
              style={styles.option}
              onPress={() =>
                Linking.openURL(
                  'http://www.frayt.com/end-user-license-agreement/',
                )
              }>
              <View style={styles.optionTextContainer}>
                <FontAwesome5Icon
                  name='file-contract'
                  style={styles.resourceIcon}
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.optionText}>
                  End User License Agreement
                </Text>
                <Right>
                  <FontAwesome5Icon
                    name='angle-right'
                    size={18}
                    color={colors.secondary}
                  />
                </Right>
              </View>
            </Touchable>

            <Touchable
              style={styles.option}
              onPress={() =>
                Linking.openURL('https://www.frayt.com/privacy-policy/')
              }>
              <View style={styles.optionTextContainer}>
                <FontAwesome5Icon
                  name='shield-alt'
                  style={styles.resourceIcon}
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.optionText}>Privacy Policy</Text>
                <Right>
                  <FontAwesome5Icon
                    name='angle-right'
                    size={18}
                    color={colors.secondary}
                  />
                </Right>
              </View>
            </Touchable>
          </CardSingle>
          {this.renderContact()}

          <DataCard
            title='App Information'
            icon='md-information-circle'
            columns={2}
            items={[
              {
                label: 'Version',
                content: <AppVersion />,
              },
              {
                label: 'Build Number',
                content: getBuildNumber(),
              },
            ]}></DataCard>

          <ActionButton
            onPress={this._checkForUpdates}
            type='secondary'
            label='Check for Updates'
          />
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
  textArea: {
    width: '100%',
    marginBottom: 20,
  },
  option: {
    backgroundColor: colors.offWhite,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colorObjs.lightGray.darken(0.1).toString(),
    width: '100%',
  },
  optionTextContainer: {
    flexDirection: 'row',
  },
  optionText: {
    fontSize: 17,
    marginTop: 1,
    marginLeft: 7,
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    fontSize: 14,
  },
  resourceIcon: {
    width: 30,
  },
});

const connector = connect(
  ({ userReducer, appReducer, matchReducer }: RootState) => ({
    user: userReducer.user,
    sendingSupport: appReducer.sendingSupport,
    fetchingUser: userReducer.fetchingUser,
    userInitialized: userReducer.userInitialized,
    matches: matchReducer.matches,
  }),
);

export default connector(SupportScreen);
