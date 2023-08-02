import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { Container, Form, Text, Item, Label, Input } from 'native-base';
import { connect } from 'react-redux';
import ActionButton from '@components/ui/ActionButton';
import colors from '@constants/Colors';
import { registerUser } from '@actions/userAction';

var { width } = Dimensions.get('window');

class RegisterScreen extends Component {
  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  state = {
    email: null,
    confirm_code: null,
  };

  async register() {
    const { dispatch } = this.props;
    const { email, confirm_code } = this.state;

    await dispatch(registerUser(email, confirm_code));
  }

  render() {
    const { navigation, registeringUser } = this.props;

    return (
      <Container>
        <StatusBar barStyle='dark-content' />
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          <View style={styles.center}>
            <Image
              source={require('../../assets/images/frayt-badge-primary.png')}
              style={{
                width: 135,
                height: 160,
                marginBottom: 30,
                alignSelf: 'center',
              }}
            />
            <Text style={styles.header}>Complete Registration</Text>
            <Form>
              <Item floatingLabel>
                <Label style={styles.inputLabel}>Email</Label>
                <Input
                  keyboardType='email-address'
                  onChangeText={(email) => this.setState({ email })}
                  autoCapitalize='none'
                  style={styles.input}
                />
              </Item>
              <Item floatingLabel last>
                <Label style={styles.inputLabel}>Confirmation Code</Label>
                <Input
                  keyboardType='default'
                  secureTextEntry={true}
                  onChangeText={(confirm_code) =>
                    this.setState({ confirm_code })
                  }
                  style={styles.input}
                />
              </Item>
              <ActionButton
                label='Register'
                type='primary'
                size='large'
                loading={registeringUser}
                disabled={registeringUser}
                onPress={this.register.bind(this)}
                style={styles.button}
                block
              />
              <ActionButton
                label='Go Back'
                type='inverse'
                size='large'
                disabled={registeringUser}
                block
                hollow
                onPress={() => {
                  navigation.goBack();
                }}
              />
            </Form>
          </View>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}

export default connect((state) => ({
  registeringUser: state.userReducer.registeringUser,
}))(RegisterScreen);

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
});
