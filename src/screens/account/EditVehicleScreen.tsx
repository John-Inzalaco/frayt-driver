import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Root, Content, Toast, Input, View } from 'native-base';
import CardSingle from '@components/ui/CardSingle';
import ActionButton from '@components/ui/ActionButton';
import { connect, ConnectedProps } from 'react-redux';
import { updateUserCargoCapacity } from '@actions/userAction';
import colors from '@constants/Colors';
import NumberInput from '@components/form/NumberInput';
import BlockSwitch from '@components/ui/BlockSwitch';
import { RootState } from '@reducers/index';

type Props = {} & ConnectedProps<typeof connector>;

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

class EditVehicleScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { vehicle } = this.props.user;

    this.state = {
      capacity_height: vehicle?.capacity_height || null,
      capacity_length: vehicle?.capacity_length || null,
      capacity_width: vehicle?.capacity_width || null,
      capacity_weight: vehicle?.capacity_weight || null,
      capacity_between_wheel_wells:
        vehicle?.capacity_between_wheel_wells || null,
      capacity_door_height: vehicle?.capacity_door_height || null,
      capacity_door_width: vehicle?.capacity_door_width || null,
      lift_gate: vehicle?.lift_gate === true,
      pallet_jack: vehicle?.pallet_jack === true,
    };
  }

  static navigationOptions = {
    title: 'Edit Cargo Capacity',
    headerTintColor: 'white',
  };

  render() {
    const { updatingUserCargoCapacity } = this.props;
    const { vehicle } = this.props.user;
    const { lift_gate, pallet_jack } = this.state;

    const inputDisabled = updatingUserCargoCapacity;

    return (
      <Root>
        <ScrollView style={styles.container}>
          <Content padder>
            <Input
              style={styles.hiddenInput}
              keyboardType='default'
              value={''}
              autoFocus={true}
            />
            <CardSingle header='Cargo Area' icon='md-create'>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Height'
                    onChange={(capacity_height) =>
                      this.setState({ capacity_height })
                    }
                    defaultValue={vehicle?.capacity_height || 0}
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
                    defaultValue={vehicle?.capacity_width || 0}
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
                    defaultValue={vehicle?.capacity_length || 0}
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
                      defaultValue={vehicle?.capacity_between_wheel_wells || 0}
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
              {[3, 4].includes(vehicle?.vehicle_class || -1) && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <NumberInput
                      label='Cargo Weight Limit'
                      onChange={(capacity_weight) =>
                        this.setState({ capacity_weight })
                      }
                      defaultValue={vehicle?.capacity_weight || 0}
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
              {vehicle?.vehicle_class === 4 && (
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <BlockSwitch
                      type='primary'
                      onValueChange={(has_lift_gate) =>
                        this.setState({ lift_gate: has_lift_gate })
                      }
                      value={lift_gate}
                      disabled={inputDisabled}>
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
            </CardSingle>
            <CardSingle header='Door Dimensions' icon='md-create'>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <NumberInput
                    label='Height'
                    onChange={(capacity_door_height) =>
                      this.setState({ capacity_door_height })
                    }
                    defaultValue={vehicle?.capacity_door_height || 0}
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
                    defaultValue={vehicle?.capacity_door_width || 0}
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
            </CardSingle>
            <ActionButton
              label='Update'
              type='secondary'
              disabled={updatingUserCargoCapacity}
              loading={updatingUserCargoCapacity}
              onPress={this._saveVehicle.bind(this)}
            />
          </Content>
        </ScrollView>
      </Root>
    );
  }

  async _saveVehicle() {
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
    const { dispatch } = this.props;
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

    const success = await dispatch<any>(updateUserCargoCapacity(measurements));

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
  button: {
    backgroundColor: colors.secondary,
    flex: 1,
  },
  buttonPadding: {
    marginTop: 6,
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
  cargoForm: {
    flex: 1,
    color: colors.primary,
  },
  hiddenInput: {
    height: 1,
  },
});

const connector = connect(({ userReducer }: RootState) => ({
  user: userReducer.user,
  updatingUserCargoCapacity: userReducer.updatingUserCargoCapacity,
}));

export default connector(EditVehicleScreen);
