import React, { Component } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Container, Form, Text, Input } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import {
  updateUserCargoCapacity,
  dismissUserCargoCapacity,
} from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import NumberInput from '@components/form/NumberInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { getNextSetupScreen } from '@actions/appAction';
import BlockSwitch from '@components/ui/BlockSwitch';
import { RootState } from '@reducers/index';
import { NavigationScreenProp } from 'react-navigation';

var { width } = Dimensions.get('window');

type Props = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;
type State = {
  capacity_height: Nullable<number>;
  capacity_length: Nullable<number>;
  capacity_width: Nullable<number>;
  capacity_weight: Nullable<number>;
  capacity_between_wheel_wells: Nullable<number>;
  capacity_door_height: Nullable<number>;
  capacity_door_width: Nullable<number>;
  lift_gate: boolean;
  pallet_jack: boolean;
};

class UpdateCargoCapacityScreen extends Component<Props, State> {
  state = {
    capacity_height: null,
    capacity_length: null,
    capacity_width: null,
    capacity_weight: null,
    capacity_between_wheel_wells: null,
    capacity_door_height: null,
    capacity_door_width: null,
    lift_gate: false,
    pallet_jack: false,
  };

  componentDidMount() {
    this.updateFooter();
  }

  componentDidUpdate() {
    this.updateFooter();
  }

  updateFooter() {
    const {
      updatingUserCargoCapacity,
      dismissingUserCargoCapacity,
      navigation,
    } = this.props;
    const needsMoreDetails = this.needsMoreDetails();
    const disabled =
      updatingUserCargoCapacity ||
      dismissingUserCargoCapacity ||
      needsMoreDetails;

    updateRemoteComponent(
      'fixed-footer',
      <FormNavigation
        nextAction={this.updateCargoCapacity.bind(this)}
        skipAction={this.skipCargoCapacity.bind(this)}
        skipDisabled={!needsMoreDetails}
        loading={updatingUserCargoCapacity}
        skipLoading={dismissingUserCargoCapacity}
        disabled={disabled}
        navigation={navigation}
      />,
      { navigation },
    );
  }

  needsMoreDetails() {
    const { capacity_height, capacity_length, capacity_width } = this.state;

    return !(capacity_height && capacity_length && capacity_width);
  }

  async updateCargoCapacity() {
    const {
      capacity_height,
      capacity_length,
      capacity_width,
      capacity_weight,
      capacity_between_wheel_wells,
      capacity_door_height,
      capacity_door_width,
      lift_gate,
      pallet_jack,
    } = this.state;
    const { dispatch, navigation } = this.props;
    const measurements = {
      capacity_height,
      capacity_length,
      capacity_width,
      capacity_weight,
      capacity_between_wheel_wells,
      capacity_door_height,
      capacity_door_width,
      lift_gate,
      pallet_jack,
    };

    const updated = await dispatch<any>(updateUserCargoCapacity(measurements));

    if (updated) {
      navigation.navigate(dispatch<any>(getNextSetupScreen()));
    }
  }

  async skipCargoCapacity() {
    const { dispatch, navigation } = this.props;

    const skipped = await dispatch<any>(dismissUserCargoCapacity());

    if (skipped) {
      navigation.navigate(dispatch<any>(getNextSetupScreen()));
    }
  }

  render() {
    const { updatingUserCargoCapacity, dismissingUserCargoCapacity } =
      this.props;
    const { vehicle } = this.props.user;
    const { lift_gate, pallet_jack } = this.state;
    const inputDisabled =
      updatingUserCargoCapacity || dismissingUserCargoCapacity;

    return (
      <Container style={styles.container}>
        <StatusBar barStyle='light-content' />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps='always'
          keyboardDismissMode='on-drag'
          extraScrollHeight={80}>
          <View style={styles.scrollView}>
            <Text style={styles.header}>
              Enter Your Vehicles Cargo Capacity
            </Text>
            <Form>
              <Input
                style={styles.hiddenInput}
                keyboardType='default'
                value={''}
                autoFocus={true}
              />
              <Text style={styles.rowHeader}>Cargo Area</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Height'
                    onChange={(capacity_height) =>
                      this.setState({ capacity_height })
                    }
                    defaultValue={vehicle?.capacity_height}
                    prepend=' in'
                    minimum={0}
                    maximum={180}
                    precision={0}
                    digits={3}
                    fixedLength
                    disabled={inputDisabled}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Width'
                    onChange={(capacity_width) =>
                      this.setState({ capacity_width })
                    }
                    defaultValue={vehicle?.capacity_width}
                    prepend=' in'
                    minimum={0}
                    maximum={180}
                    precision={0}
                    digits={3}
                    fixedLength
                    disabled={inputDisabled}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Length'
                    onChange={(capacity_length) =>
                      this.setState({ capacity_length })
                    }
                    defaultValue={vehicle?.capacity_length}
                    prepend=' in'
                    minimum={0}
                    maximum={900}
                    precision={0}
                    digits={3}
                    fixedLength
                    disabled={inputDisabled}
                  />
                </View>
              </View>
              {vehicle?.vehicle_class === 3 && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <NumberInput
                      label='Distance Between Wheel Wells'
                      onChange={(capacity_between_wheel_wells) =>
                        this.setState({ capacity_between_wheel_wells })
                      }
                      defaultValue={vehicle?.capacity_between_wheel_wells}
                      prepend=' in'
                      minimum={0}
                      maximum={180}
                      precision={0}
                      digits={3}
                      fixedLength
                      disabled={inputDisabled}
                    />
                  </View>
                </View>
              )}
              {(vehicle?.vehicle_class === 3 ||
                vehicle?.vehicle_class === 4) && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <NumberInput
                      label='Cargo Weight Limit'
                      onChange={(capacity_weight) =>
                        this.setState({ capacity_weight })
                      }
                      defaultValue={vehicle?.capacity_weight}
                      prepend=' lb'
                      minimum={0}
                      precision={0}
                      digits={5}
                      fixedLength
                      disabled={inputDisabled}
                      commas
                    />
                  </View>
                </View>
              )}

              <Text style={styles.rowHeader}>Door</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Height'
                    onChange={(capacity_door_height) =>
                      this.setState({ capacity_door_height })
                    }
                    defaultValue={vehicle?.capacity_door_height}
                    prepend=' in'
                    minimum={0}
                    maximum={180}
                    precision={0}
                    digits={3}
                    fixedLength
                    disabled={inputDisabled}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Width'
                    onChange={(capacity_door_width) =>
                      this.setState({ capacity_door_width })
                    }
                    defaultValue={vehicle?.capacity_door_width}
                    prepend=' in'
                    minimum={0}
                    maximum={180}
                    precision={0}
                    digits={3}
                    fixedLength
                    disabled={inputDisabled}
                  />
                </View>
              </View>
              {vehicle?.vehicle_class === 4 && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <BlockSwitch
                      type='primary'
                      onValueChange={(has_lift_gate) =>
                        this.setState({ lift_gate: has_lift_gate })
                      }
                      disabled={inputDisabled}
                      value={lift_gate}>
                      Lift Gate
                    </BlockSwitch>
                  </View>
                </View>
              )}
              {vehicle?.vehicle_class === 4 && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <BlockSwitch
                      type='primary'
                      onValueChange={(has_pallet_jack) =>
                        this.setState({ pallet_jack: has_pallet_jack })
                      }
                      value={pallet_jack}
                      disabled={inputDisabled}>
                      Pallet Jack
                    </BlockSwitch>
                  </View>
                </View>
              )}
            </Form>
          </View>
        </KeyboardAwareScrollView>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  scrollView: {
    width: width,
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
  hiddenInput: {
    height: 1,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserCargoCapacity: userReducer.updatingUserCargoCapacity,
  dismissingUserCargoCapacity: userReducer.dismissingUserCargoCapacity,
}));

export default connector(UpdateCargoCapacityScreen);
