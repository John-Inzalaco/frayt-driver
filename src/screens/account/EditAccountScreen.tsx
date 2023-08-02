import React, { createRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Root, Content, Toast, Item, Input, Label } from 'native-base';
import CardSingle from '@components/ui/CardSingle';
import ActionButton from '@components/ui/ActionButton';
import { connect, ConnectedProps } from 'react-redux';
import { saveAccountUpdates } from '@actions/userAction';
import colors from '@constants/Colors';
import PhoneInput from '@components/PhoneInput';
import { RootState } from '@reducers/index';

type State = {
  phone_number: Nullable<string>;
  address: string;
  city: string;
  state: string;
  zip: string;
  isValid: boolean;
};

type Props = {} & ConnectedProps<typeof connector>;

class EditAccountScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { user } = this.props;

    this.state = {
      phone_number: user.phone_number,
      address: user.address?.address,
      city: user.address?.city,
      state: user.address?.state,
      zip: user.address?.zip,
      isValid: false,
    };
  }

  static navigationOptions = {
    title: 'Edit Account',
    headerTintColor: 'white',
  };

  phoneInput = createRef<PhoneInput>();

  componentDidMount() {
    this.maybeUpdateValid(this.state.isValid);
  }

  componentDidUpdate(prevProps: Props, { isValid: wasValid }: State) {
    this.maybeUpdateValid(wasValid);
  }

  maybeUpdateValid(wasValid: boolean) {
    const isValid = this.isValid();
    if (isValid !== wasValid) {
      this.setState({ isValid });
    }
  }

  render() {
    const { address, city, state, zip, phone_number } =
      this.state;
    const { editingUserAccount } = this.props;

    return (
      <Root>
        <ScrollView style={styles.container}>
          <Content padder>
            <CardSingle header='Personal' icon='md-create'>
              <PhoneInput
                onChange={(value) => this.setState({ phone_number: value })}
                phoneNumber={phone_number || ''}
                ref={this.phoneInput}
              />
            </CardSingle>
            <CardSingle header='Address' icon='md-create'>
              <Item floatingLabel style={styles.itemLabel}>
                <Label>Street</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(address) => this.setState({ address })}
                  autoCapitalize='words'
                  autoCompleteType='street-address'
                  value={address}
                />
              </Item>
              <Item floatingLabel style={styles.itemLabel}>
                <Label>City</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(city) => this.setState({ city })}
                  autoCapitalize='words'
                  value={city}
                />
              </Item>
              <Item floatingLabel style={styles.itemLabel}>
                <Label>State</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(state) => this.setState({ state })}
                  autoCapitalize='words'
                  value={state}
                />
              </Item>
              <Item floatingLabel style={styles.itemLabel}>
                <Label>ZIP</Label>
                <Input
                  keyboardType='number-pad'
                  returnKeyType='done'
                  onChangeText={(zip) => this.setState({ zip })}
                  autoCompleteType='postal-code'
                  autoCapitalize='none'
                  value={zip}
                />
              </Item>
            </CardSingle>
            <ActionButton
              label='Update'
              type='secondary'
              disabled={editingUserAccount || !this.isValid()}
              loading={editingUserAccount}
              onPress={this.updateUser.bind(this)}
            />
          </Content>
        </ScrollView>
      </Root>
    );
  }

  isValid() {
    const { address, city, state, zip } = this.state,
      phoneIsValid = this.phoneInput.current?.isValid();
    return phoneIsValid && address && city && state && zip;
  }

  async updateUser() {
    const { dispatch } = this.props;
    const { address, city, state, zip, phone_number } = this.state;

    const success = await dispatch<any>(
      saveAccountUpdates({
        address,
        city,
        state,
        zip,
        phone_number,
      }),
    );
    if (success) {
      Toast.show({
        text: 'Successfully updated!',
        buttonText: 'Okay',
        duration: 3000,
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: colors.white,
  },
  spinner: {
    flexShrink: 0,
  },
  button: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  buttonPadding: {
    marginTop: 6,
  },
  itemLabel: {
    marginTop: 5,
    marginBottom: 5,
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
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  editingUserAccount: userReducer.editingUserAccount,
}));

export default connector(EditAccountScreen);
