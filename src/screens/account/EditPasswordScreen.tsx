import React from 'react';
import { StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { Item, Label, Container, Input, Content, Toast } from 'native-base';
import ActionButton from '@components/ui/ActionButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CardSingle from '@components/ui/CardSingle';
import { updateUserPassword } from '@actions/userAction';
import { NavigationScreenProp } from 'react-navigation';

import { PasswordRequirements } from '@components/ui/PasswordRequirements';
import { RootState } from '@reducers/index';

type Props = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

type State = {
  current_password: string;
  password: string;
  confirm_password: string;
};

class EditPasswordScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      current_password: '',
      password: '',
      confirm_password: '',
    };

    this.updatePassword = this.updatePassword.bind(this);
  }

  async updatePassword() {
    const { dispatch, navigation } = this.props;
    const { current_password, password, confirm_password } = this.state;

    const updated = await dispatch<any>(
      updateUserPassword(current_password, password, confirm_password),
    );

    if (updated) {
      await this.setState({
        current_password: '',
        password: '',
        confirm_password: '',
      });

      await navigation.goBack();

      Toast.show({
        text: 'Updated your password successfully.',
      });
    }
  }

  isValid() {
    const { current_password, password, confirm_password } = this.state;

    return (
      current_password &&
      password &&
      confirm_password &&
      password === confirm_password
    );
  }

  render() {
    const { current_password, password, confirm_password } = this.state;
    const { updatingUserPassword } = this.props;
    const disabled = updatingUserPassword || !this.isValid();

    return (
      <Container style={styles.container}>
        <KeyboardAwareScrollView
          extraScrollHeight={80}
          contentContainerStyle={styles.scrollContainer}>
          <Content padder>
            <CardSingle header='Password' icon='md-key'>
              <Item floatingLabel style={styles.inputWrapper}>
                <Label style={styles.inputLabel}>Current Password</Label>
                <Input
                  secureTextEntry={true}
                  onChangeText={(current_password) =>
                    this.setState({ current_password })
                  }
                  autoCapitalize='none'
                  style={styles.input}
                  value={current_password}
                />
              </Item>
              <Item floatingLabel style={styles.inputWrapper}>
                <Label style={styles.inputLabel}>New Password</Label>
                <Input
                  secureTextEntry={true}
                  onChangeText={(password) => this.setState({ password })}
                  autoCapitalize='none'
                  style={styles.input}
                  value={password}
                />
              </Item>
              <Item floatingLabel style={styles.inputWrapper}>
                <Label style={styles.inputLabel}>Confirm New Password</Label>
                <Input
                  secureTextEntry={true}
                  onChangeText={(confirm_password) =>
                    this.setState({ confirm_password })
                  }
                  autoCapitalize='none'
                  style={styles.input}
                  value={confirm_password}
                />
              </Item>
              <PasswordRequirements />
            </CardSingle>
            <ActionButton
              label='Update'
              type='secondary'
              disabled={disabled}
              loading={updatingUserPassword}
              onPress={this.updatePassword}
            />
          </Content>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  inputLabel: {
    color: colors.gray,
  },
  input: {
    color: colors.text,
  },
  inputWrapper: {
    marginVertical: 5,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserPassword: userReducer.updatingUserPassword,
}));

export default connector(EditPasswordScreen);
