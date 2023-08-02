import {
  StyleSheet,
  Dimensions,
  View,
  TextInput,
  Platform,
} from 'react-native';
import { Container, Icon, Item, Label, Picker, Text } from 'native-base';
import { NavigationScreenProp } from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import { RootState } from '@reducers/index';
import React, { useState } from 'react';
import colors from '@constants/Colors';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { createVehicle, updateVehicle } from '@actions/userAction';
import FormNavigation from '@components/ui/FormNavigation';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import { PhotoInput } from '@components/PhotoInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  formErrorsToast,
} from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

const { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
  dispatch: any;
} & ConnectedProps<typeof connector>;

type VehicleValues = {
  make: string | undefined;
  model: string | undefined;
  year: number | undefined;
  license_plate: string | undefined;
  vin: string | undefined;
  vehicle_class: number;
  insurance_photo: string | null;
  registration_photo: string | null;
  insurance_expiration_date: string | number | Date;
  registration_expiration_date: string | number | Date;
};

const VehicleSchema: Yup.SchemaOf<VehicleValues> = Yup.object().shape({
  make: Yup.string().required('Required'),
  model: Yup.string().required('Required'),
  year: Yup.number().required('Required'),
  license_plate: Yup.string().required('Required'),
  vin: Yup.string().required('Required'),
  vehicle_class: Yup.number()
    .min(1, 'Must select a vehicle type.')
    .max(4, 'Invalid vehicle type selected.')
    .required('Required'),
  insurance_photo: Yup.string().required('Required'),
  registration_photo: Yup.string().required('Required'),
  insurance_expiration_date: Yup.string().required('Required'),
  registration_expiration_date: Yup.string().required('Required'),
});

function VehicleScreen(props: ScreenProps) {
  const { navigation, dispatch, editingUserVehicle, permissions } = props;
  const [open, setCalendarOpen] = useState(false);
  const [registrationCalendarOpen, setRegistrationCalendarOpen] =
    useState(false);

  const yearRange = Array.from(Array(new Date().getFullYear() - 1988), (_, i) =>
    (i + 1990).toString(),
  );

  const nextStep = async (data: VehicleValues) => {
    const { vehicle } = props.user;
    const success = !vehicle
      ? await dispatch(createVehicle(data))
      : await dispatch(updateVehicle(vehicle.id, data));

    if (success) {
      navigation.navigate('VehiclePhotos');
    }
  };

  const onRefChange = (formik: FormikProps<VehicleValues>) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          loading={formik.isSubmitting}
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.Vehicle - 1]);
          }}
          navigation={navigation}
          disabled={
            editingUserVehicle ||
            formik.isSubmitting ||
            !formik.dirty ||
            !formik.isValid
          }
          disabledAction={() => formErrorsToast(formik.errors)}
        />,
        { navigation },
      );
    }
  };

  const initialValues: VehicleValues = {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    vin: '',
    vehicle_class: props.user.vehicle?.vehicle_class || 0,
    insurance_photo: '',
    registration_photo: '',
    insurance_expiration_date: new Date(),
    registration_expiration_date: new Date(),
  };

  return (
    <Container>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Vehicle</Text>
          <Formik
            innerRef={onRefChange}
            initialValues={initialValues}
            validationSchema={VehicleSchema}
            onSubmit={nextStep}>
            {({
              handleChange,
              handleBlur,
              setFieldValue,
              values,
              errors,
              touched,
              setFieldError,
            }) => {
              const ErrorMsg = ({ field }: any) => (
                <ErrorMessage errors={errors} touched={touched} field={field} />
              );

              return (
                <KeyboardAwareScrollView>
                  <View style={styles.columnContainer}>
                    <View style={styles.twoRowContent}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>Vehicle Make</Label>
                        <TextInput
                          maxLength={20}
                          style={styles.inputText}
                          value={values.make}
                          onChange={({ nativeEvent: { text } }) => {
                            setFieldValue('make', text);
                          }}
                        />
                        <ErrorMsg field='make' />
                      </Item>
                    </View>
                    <View style={styles.twoRowContent}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>Vehicle Model</Label>
                        <TextInput
                          maxLength={20}
                          style={styles.inputText}
                          value={values.model}
                          onChange={({ nativeEvent: { text } }) => {
                            setFieldValue('model', text);
                          }}
                        />
                        <ErrorMsg field='model' />
                      </Item>
                    </View>
                  </View>
                  <View style={styles.columnContainer}>
                    <View style={styles.twoRowContent}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>Vehicle Year</Label>
                        <View
                          style={[styles.dropdownWrapper, styles.halfWidth]}>
                          <Picker
                            mode='dropdown'
                            placeholder='Select your vehicle year...'
                            style={styles.dropdown}
                            placeholderIconColor='#007aff'
                            selectedValue={values.year}
                            onTouchEnd={handleBlur('year')}
                            onValueChange={(value) => {
                              if (!value) {
                                return setFieldError(
                                  'year',
                                  'Must select a vehicle year.',
                                );
                              }
                              setFieldValue('year', value);
                            }}>
                            {yearRange.map((r, _v) => (
                              <Picker.Item label={r} value={r} />
                            ))}
                          </Picker>
                          <Icon
                            style={[
                              styles.icon,
                              {
                                right: 0,
                                top: 6,
                              },
                            ]}
                            name='chevron-down-outline'
                          />
                        </View>
                        <ErrorMsg field='year' />
                      </Item>
                    </View>
                    <View style={styles.twoRowContent}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>License Plate</Label>
                        <TextInput
                          style={styles.inputText}
                          value={values.license_plate}
                          onChange={({ nativeEvent: { text } }) => {
                            setFieldValue('license_plate', text);
                          }}
                        />
                        <ErrorMsg field='license_plate' />
                      </Item>
                    </View>
                  </View>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>Vin #</Label>
                    <TextInput
                      style={styles.inputText}
                      value={values.vin}
                      onChange={({ nativeEvent: { text } }) => {
                        setFieldValue('vin', text);
                      }}
                    />
                    <ErrorMsg field='vin' />
                  </Item>
                  {!props.user.vehicle?.vehicle_class && (
                    <Item style={styles.formItem}>
                      <Label style={styles.inputLabel}>Vehicle Type</Label>
                      <View style={[styles.dropdownWrapper, { width: '100%' }]}>
                        <Picker
                          mode='dropdown'
                          placeholder='Select your vehicle type...'
                          style={styles.dropdown}
                          placeholderIconColor='#007aff'
                          selectedValue={values.vehicle_class}
                          onTouchEnd={handleBlur('vehicle_class')}
                          onValueChange={(value) => {
                            setFieldValue('vehicle_class', value);
                          }}>
                          <Picker.Item
                            label={'Select a Vehicle Type'}
                            value={0}
                          />
                          <Picker.Item label={'Car'} value={1} />
                          <Picker.Item label={'Midsize'} value={2} />
                          <Picker.Item label={'Cargo Van'} value={3} />
                          <Picker.Item label={'Box Truck'} value={4} />
                        </Picker>
                        <Icon
                          style={[
                            styles.icon,
                            {
                              right: 0,
                              top: 7,
                            },
                          ]}
                          name='chevron-down-outline'
                        />
                      </View>
                      <ErrorMsg field='vehicle_class' />
                    </Item>
                  )}
                  <Text style={styles.text}>
                    Please take clear photos of your vehicle's insurance and
                    registration.
                  </Text>
                  <PhotoInput
                    key={'insurance_photo'}
                    label='Insurance'
                    onChange={(value) =>
                      setFieldValue('insurance_photo', value, true)
                    }
                    value={values.insurance_photo}
                    error={
                      (errors.insurance_photo &&
                        touched.insurance_photo &&
                        errors.insurance_photo) ||
                      undefined
                    }
                    dispatch={dispatch}
                    permissions={permissions}
                    cameraOptions={{ cropping: false }}
                  />
                  <PhotoInput
                    key={'registration_photo'}
                    label='Registration'
                    onChange={(value) =>
                      setFieldValue('registration_photo', value, true)
                    }
                    value={values.registration_photo}
                    error={
                      (errors.registration_photo &&
                        touched.registration_photo &&
                        errors.registration_photo) ||
                      undefined
                    }
                    dispatch={dispatch}
                    permissions={permissions}
                    cameraOptions={{ cropping: false }}
                  />
                  <View style={styles.columnContainer}>
                    <View
                      style={styles.twoRowContent}
                      onTouchEnd={() => setCalendarOpen(true)}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>
                          Insurance Expiration
                        </Label>
                        <TextInput
                          style={styles.inputText}
                          onChangeText={handleChange(
                            'insurance_expiration_date',
                          )}
                          onBlur={handleBlur('insurance_expiration_date')}
                          value={new Date(
                            values.insurance_expiration_date,
                          ).toLocaleDateString()}
                        />
                        <DatePicker
                          modal
                          open={open}
                          date={new Date(values.insurance_expiration_date)}
                          minimumDate={new Date()}
                          mode={'date'}
                          onConfirm={(date) => {
                            setCalendarOpen(false);
                            setFieldValue('insurance_expiration_date', date);
                          }}
                          onCancel={() => {
                            setCalendarOpen(false);
                          }}
                        />
                        <Icon
                          key={'vehicle_screen_calendar'}
                          style={styles.icon}
                          name='calendar'
                        />
                      </Item>
                    </View>
                    <View
                      style={styles.twoRowContent}
                      onTouchEnd={() => setRegistrationCalendarOpen(true)}>
                      <Item style={styles.formItem}>
                        <Label style={styles.inputLabel}>
                          Registration Expiration
                        </Label>
                        <TextInput
                          style={styles.inputText}
                          onChangeText={handleChange(
                            'registration_expiration_date',
                          )}
                          onBlur={handleBlur('registration_expiration_date')}
                          value={new Date(
                            values.registration_expiration_date,
                          ).toLocaleDateString()}
                        />
                        <DatePicker
                          modal
                          open={registrationCalendarOpen}
                          date={new Date(values.registration_expiration_date)}
                          minimumDate={new Date()}
                          mode={'date'}
                          onConfirm={(date) => {
                            setRegistrationCalendarOpen(false);
                            setFieldValue('registration_expiration_date', date);
                          }}
                          onCancel={() => {
                            setRegistrationCalendarOpen(false);
                          }}
                        />
                        <Icon
                          key={'vehicle_screen_calendar_2'}
                          style={styles.icon}
                          name='calendar'
                        />
                      </Item>
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              );
            }}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  columnContainer: {
    flexDirection: 'row',
  },
  twoRowContent: {
    flexDirection: 'column',
    width: '50%',
  },
  inputImageContainer: {
    justifyContent: 'center',
    top: 0,
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 27,
    color: '#8F9BB3',
  },
  wrapper: {
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: width,
    padding: 12,
  },
  header: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  text: {
    color: colors.secondaryText,
    marginBottom: 12,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    marginVertical: 12,
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    height: 64,
    flexGrow: 0,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  inputText: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#151A30',
    borderRadius: 4,
    width: '100%',
    height: 40,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 8,
    padding: 8,
  },
  inputLabel: {
    height: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: '#DDDDDD',
    alignSelf: 'stretch',
  },
  dropdown: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    ...Platform.select({
      ios: {
        borderWidth: 0.4,
      },
      android: {
        borderWidth: 1,
      },
    }),
    borderColor: colors.darkGray,
    borderRadius: 4,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 0,
    paddingVertical: 8,
    paddingLeft: 0,
    height: 38,
  },
  halfWidth: {
    width: width / 2 - width * 0.05,
  },
  dropdownWrapper: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 4,
    backgroundColor: '#C5CEE0',
    marginTop: 8,
  },
});

const connector = connect((state: RootState) => ({
  editingUserVehicle: state.userReducer.editingUserVehicle,
  user: state.userReducer.user,
  permissions: state.appReducer.permissions,
}));

export default connector(VehicleScreen);
