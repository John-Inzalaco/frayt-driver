import React from 'react';
import { StyleSheet, Image, Linking } from 'react-native';
import { Container, Text, View } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';
import ActionButton from '@components/ui/ActionButton';
import QueryString from 'qs';
import { signOutUser, getUser } from '@actions/userAction';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {
  needsUpdatedDocuments,
  documentsAwaitingApproval,
} from '../../models/User';

class ApprovalScreen extends React.Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  async getUser() {
    const { dispatch } = this.props;

    return await dispatch(getUser());
  }

  async signOut() {
    const { dispatch } = this.props;

    dispatch<any>(signOutUser());
  }

  async continue() {
    const { navigation } = this.props;

    navigation.navigate('Main');
  }

  async emailSupport(subject) {
    const params = QueryString.stringify({
        subject,
      }),
      emailUrl = `mailto:support@frayt.com?${params}`;

    const supported = await Linking.canOpenURL(emailUrl);

    if (supported) {
      Linking.openURL(emailUrl);
    }
  }

  renderTitle() {
    const { user } = this.props;

    let title = null,
      icon = (
        <Image
          source={require('../../assets/images/frayt-badge.png')}
          style={[styles.icon, styles.logo]}
        />
      );

    switch (user.state) {
      case 'pending_approval':
      case 'applying':
      case 'screening':
        title = 'Application Completed!';
        break;
      case 'rejected':
        title = 'You are not approved to drive for FRAYT';
        break;
      case 'disabled':
        title = 'Your account has been suspended';
        break;
      case 'approved':
        if (documentsAwaitingApproval(user)) {
          title = 'Documents Are In Review';
        } else if (needsUpdatedDocuments(user)) {
          title = 'Your account has been suspended';
        } else {
          title = 'You have been approved to drive for FRAYT!';
        }
        break;
      case 'registered':
        if (documentsAwaitingApproval(user)) {
          title = 'Documents Are In Review';
        } else if (needsUpdatedDocuments(user)) {
          title = 'Your account has been suspended';
        }
        break;
      default:
        title = 'We have made some changes...';
        icon = (
          <FontAwesome5Icon
            name='cogs'
            color='white'
            size={135}
            style={styles.icon}
          />
        );

        break;
    }

    return [icon, <Text style={styles.header}>{title}</Text>];
  }

  renderBody() {
    const { user, fetchingUser, navigation } = this.props;
    let body: JSX.Element[] = [];

    const checkAgainBtn = (
      <ActionButton
        label='Check Again'
        size='large'
        type='light'
        hollow
        block
        onPress={this.getUser.bind(this)}
        loading={fetchingUser}
        disabled={fetchingUser}
      />
    );

    const submitDocumentsBtn = (
      <ActionButton
        label='Submit Documents'
        size='large'
        type='light'
        hollow
        block
        onPress={() => navigation.navigate('UpdateDocuments')}
        loading={fetchingUser}
        disabled={fetchingUser}
      />
    );

    const needsUpdatedDocumentsBody = (body: JSX.Element[]) => {
      body.push(
        <Text style={styles.text}>
          Some of your documents on file are expired or rejected.
        </Text>,
        <Text style={styles.text}>
          Please submit your updated documents below and for further review.
          Thanks for applying at FRAYT!
        </Text>,
        submitDocumentsBtn,
      );
    };

    switch (user.state) {
      case user.state === 'applying' && needsUpdatedDocuments(user):
        needsUpdatedDocumentsBody(body);
        break;
      case 'pending_approval':
        if (needsUpdatedDocuments(user)) needsUpdatedDocumentsBody(body);
        else
          body.push(
            <Text style={styles.text}>
              Your application is completed and we are in the process of
              reviewing it. You will receive an email whenever there is an
              update. Thanks for applying for FRAYT!
            </Text>,
            checkAgainBtn,
          );
        break;
      case 'screening':
        if (needsUpdatedDocuments(user)) {
          needsUpdatedDocumentsBody(body);
        } else {
          body.push(
            <Text style={styles.text}>
              Your application is completed and we are in the process of
              reviewing it. You will receive an email whenever there is an
              update. Thanks for applying for FRAYT!
            </Text>,
            checkAgainBtn,
          );
        }

        break;
      case 'rejected':
        body.push(
          <Text style={styles.text}>
            This app is intended for approved drivers only. If you have any
            questions please contact us at support@frayt.com
          </Text>,
          <ActionButton
            label='Email Support'
            block
            size='large'
            onPress={this.emailSupport.bind(
              this,
              `${user.first_name} ${user.last_name}'s Rejection (LP# ${user.vehicle_license_plate})`,
            )}
          />,
        );
        body.push(checkAgainBtn);
        break;
      case 'disabled':
        body.push(
          <Text style={styles.text}>
            It appears that your application was rejected or your account has
            been suspended. If you have questions about your disabled account,
            please contact us at support@frayt.com
          </Text>,
          <ActionButton
            label='Email Support'
            block
            size='large'
            type='light'
            onPress={this.emailSupport.bind(
              this,
              `${user.first_name} ${user.last_name}'s Suspension (LP# ${user.vehicle_license_plate})`,
            )}
          />,
        );
        body.push(checkAgainBtn);
        break;
      case 'approved':
        if (needsUpdatedDocuments(user)) needsUpdatedDocumentsBody(body);
        else if (documentsAwaitingApproval(user)) {
          body.push(
            <Text style={styles.text}>
              Thank you! We have received the new document and are currently
              reviewing. Once approved, you will be able to continue using
              FRAYT.
            </Text>,
            checkAgainBtn,
          );
          break;
        } else {
          body.push(
            <Text style={styles.text}>
              Now let's make sure that you have everything setup...
            </Text>,
            <ActionButton
              label='Continue'
              block
              size='large'
              type='light'
              onPress={this.continue.bind(this)}
            />,
          );
        }

        break;
      case 'registered':
        if (documentsAwaitingApproval(user)) {
          body.push(
            <Text style={styles.text}>
              Thank you! We have received the new document and are currently
              reviewing. Once approved, you will be able to continue using
              FRAYT.
            </Text>,
            checkAgainBtn,
          );
          break;
        } else if (needsUpdatedDocuments(user)) {
          body.push(
            <Text style={styles.text}>
              Your account has been automatically suspended. Some of your
              documents on file are expired or rejected.
            </Text>,
            <Text style={styles.text}>
              Please submit your updated documents below and after a review your
              account will be reactivated.
            </Text>,
            submitDocumentsBtn,
          );
          break;
        }

      default:
        body.push(
          <Text style={styles.text}>
            We have made some major updates and bug fixes. We need you to log
            back in to experience these improvements.
          </Text>,
          <ActionButton
            label='Go to Login'
            block
            size='large'
            type='light'
            onPress={this.signOut.bind(this)}
          />,
        );
    }

    return body;
  }

  render() {
    const { userInitialized } = this.props;

    if (userInitialized) {
      return (
        <Container>
          <View style={styles.container}>
            <View style={styles.center}>{this.renderTitle()}</View>
            <View style={styles.bodyContainer}>{this.renderBody()}</View>
          </View>
        </Container>
      );
    } else {
      this.continue();
      return null;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  bodyContainer: {
    paddingVertical: 6,
    paddingHorizontal: '10%',
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
    marginBottom: 30,
  },
  icon: {
    marginBottom: 30,
    alignSelf: 'center',
  },
  logo: {
    width: 135,
    height: 160,
  },
});

export default connect((state) => ({
  user: state.userReducer.user,
  userInitialized: state.userReducer.userInitialized,
  fetchingUser: state.userReducer.fetchingUser,
}))(ApprovalScreen);
