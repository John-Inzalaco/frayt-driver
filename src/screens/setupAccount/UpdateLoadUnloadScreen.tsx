import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { Container, Text } from 'native-base';
import { connect } from 'react-redux';
import ShowHide from '@components/ui/ShowHide';
import colors from '@constants/Colors';
import { updateUserLoadUnload } from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import ButtonRadioList from '@components/form/ButtonRadioList';
import TextBlock from '@components/ui/TextBlock';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getNextSetupScreen } from '@actions/appAction';
import { updateRemoteComponent } from '@components/RemoteComponent';

var { width } = Dimensions.get('window');

class UpdateLoadUnloadScreen extends Component {
  state = {
    load_unload: this.props.user.can_load,
  };

  componentDidMount() {
    this.updateFooter();
  }

  componentDidUpdate() {
    this.updateFooter();
  }

  updateFooter() {
    const { load_unload } = this.state;
    const { updatingUserLoadUnload, navigation } = this.props;
    const disabled =
      (load_unload !== false && load_unload !== true) || updatingUserLoadUnload;

    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={this.updateLoadUnload.bind(this)}
        loading={updatingUserLoadUnload}
        disabled={disabled}
        navigation={navigation}
      />,
      { navigation },
    );
  }

  async updateLoadUnload() {
    const { load_unload } = this.state;
    const { dispatch, navigation } = this.props;

    const updated = await dispatch(updateUserLoadUnload(load_unload));

    if (updated) {
      navigation.navigate(dispatch(getNextSetupScreen()));
    }
  }

  render() {
    const { load_unload } = this.state;

    return (
      <Container>
        <StatusBar barStyle='light-content' />
        <KeyboardAvoidingView
          enabled
          behavior='padding'
          style={styles.container}>
          <View style={styles.center}>
            <Text style={styles.header}>Load/Unload</Text>
            <Text style={styles.subheader}>
              Are you willing to load/unload your vehicle by hand?
            </Text>
            <ButtonRadioList
              options={[
                { label: 'Yes, I will load and unload', value: true },
                { label: "No, I won't load or unload", value: false },
              ]}
              onChange={(load_unload) => this.setState({ load_unload })}
              size='large'
              style={styles.select}
            />
            <ShowHide visible={load_unload === false}>
              <Text style={styles.subtext}>
                You will still get all Match offers, but if you are not willing
                to load or unload you will be warned when accepting a Match that
                requires hand loading or unloading.
              </Text>
            </ShowHide>
            <TextBlock
              icon={
                <FontAwesome5
                  name='money-bill-alt'
                  size={24}
                  color={colors.secondary}
                />
              }>
              Matches that have load/unload provide bonus pay proportional to
              the amount of weight being handled.
            </TextBlock>
          </View>
        </KeyboardAvoidingView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 20,
  },
  select: {
    marginBottom: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
    marginBottom: 20,
  },
  subheader: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: colors.darkGray,
    marginBottom: 20,
    maxWidth: 280,
    alignSelf: 'center',
  },
  subtext: {
    marginBottom: 20,
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

export default connect((state) => ({
  user: state.userReducer.user,
  updatingUserLoadUnload: state.userReducer.updatingUserLoadUnload,
}))(UpdateLoadUnloadScreen);
