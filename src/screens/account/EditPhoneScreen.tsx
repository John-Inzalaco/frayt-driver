import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { View, Form, Text, Container } from 'native-base';
import PhoneInput from '@components/PhoneInput';
import ActionButton from '@components/ui/ActionButton';
import { connect, ConnectedProps } from 'react-redux';
import { updatePhone } from '@actions/userAction';
import colors from '@constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RootState } from '@reducers/index';
import { NavigationScreenProp } from 'react-navigation';

interface NavigationProps {
  error?: string;
}

interface NavigationState {
  params: NavigationProps;
}
interface State {
  phoneNumber: string;
}

interface Props extends ConnectedProps<typeof connector> {
  navigation: NavigationScreenProp<NavigationState, NavigationProps>;
  onDismiss: () => any;
}

class EditPhoneScreen extends React.Component<Props, State> {
  phoneNumber = React.createRef<PhoneInput>();

  constructor(props: Props) {
    super(props);
    const { user } = this.props;

    this.state = {
      phoneNumber: user.phone_number || '',
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(phoneNumber: string) {
    this.setState({ phoneNumber });
  }

  render() {
    const { phoneNumber } = this.state;
    const { updatingUserPhone, navigation } = this.props;
    const error = navigation.state?.params?.error;
    const isValid = this.phoneNumber.current?.isValid();

    return (
      <Container style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <KeyboardAwareScrollView extraScrollHeight={80}>
          <View style={styles.scrollView}>
            <Text style={styles.header}>Edit Phone Number</Text>
            <Text style={[styles.text, styles.boldText]}>
              We need to make some updates to your phone number on file
            </Text>
            {error && <Text style={styles.text}>{error}</Text>}
            <Form style={styles.form}>
              <PhoneInput
                onChange={this.onChange}
                phoneNumber={phoneNumber}
                ref={this.phoneNumber}
              />
            </Form>

            <ActionButton
              label='Update'
              type='secondary'
              disabled={updatingUserPhone || !isValid || !phoneNumber}
              loading={updatingUserPhone}
              onPress={this.updatePhone.bind(this)}
            />
            <ActionButton
              label='Cancel'
              disabled={updatingUserPhone}
              onPress={() => navigation.goBack()}
            />
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }

  async updatePhone() {
    const { dispatch, navigation, onDismiss } = this.props;

    const { phoneNumber } = this.state;

    const updated = await dispatch<any>(updatePhone(phoneNumber));

    if (updated) {
      navigation.goBack();
      onDismiss && onDismiss();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingVertical: 20,
  },
  link: {
    color: colors.secondary,
  },
  form: {
    marginBottom: 30,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    flex: 1,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
    marginBottom: 18,
  },
  text: {
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  warningText: {
    color: colors.danger,
  },
  inputRow: {
    flexDirection: 'row',
    marginHorizontal: -12,
  },
  inputGroup: {
    flex: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  rowHeader: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 10,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserPhone: userReducer.updatingUserPhone,
}));

export default connector(EditPhoneScreen);
