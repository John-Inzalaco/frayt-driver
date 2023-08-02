import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Item, Input, Label, View, Form, Text, Container } from 'native-base';
import ActionButton from '@components/ui/ActionButton';
import { connect } from 'react-redux';
import { updateAddress } from '@actions/userAction';
import colors from '@constants/Colors';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type EditAccountState = {
  address: string;
  city: string;
  state: string;
  zip: string;
  error: string;
};

class EditAddressScreen extends React.Component<{}, EditAccountState> {
  constructor(props) {
    super(props);
    const { user, navigation } = this.props;

    this.state = {
      error: navigation.state.params ? navigation.state.params.error : null,
    };
  }

  render() {
    const { address, city, state, zip, error } = this.state;
    const { updatingUserAddress, navigation } = this.props;

    return (
      <Container style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <KeyboardAwareScrollView extraScrollHeight={80}>
          <View style={styles.scrollView}>
            <Text style={styles.header}>Edit Address</Text>
            <Text style={[styles.text, styles.boldText]}>
              We need to make some updates to your address on file
            </Text>
            {error && <Text style={styles.text}>{error}</Text>}
            <Form style={styles.form}>
              <Item floatingLabel>
                <Label>Street</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(address) => this.setState({ address })}
                  autoCapitalize='words'
                  autoCompleteType='street-address'
                  value={address}
                />
              </Item>
              <Item floatingLabel>
                <Label>City</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(city) => this.setState({ city })}
                  autoCapitalize='words'
                  value={city}
                />
              </Item>
              <Item floatingLabel>
                <Label>State</Label>
                <Input
                  keyboardType='default'
                  onChangeText={(state) => this.setState({ state })}
                  autoCapitalize='words'
                  value={state}
                />
              </Item>
              <Item floatingLabel>
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
            </Form>

            <ActionButton
              label='Update'
              type='secondary'
              disabled={updatingUserAddress}
              loading={updatingUserAddress}
              onPress={this.updateAddress.bind(this)}
            />
            <ActionButton
              label='Cancel'
              disabled={updatingUserAddress}
              onPress={() => navigation.goBack()}
            />
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }

  async updateAddress() {
    const { dispatch, navigation, onDismiss } = this.props;

    const { address, city, state, zip } = this.state;

    const updated = await dispatch(
      updateAddress({ address, city, state, zip }),
    );

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
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
    color: colors.darkGray,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
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

export default connect((state) => ({
  user: state.userReducer.user,
  updatingUserAddress: state.userReducer.updatingUserAddress,
}))(EditAddressScreen);
