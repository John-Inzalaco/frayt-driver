import { StyleSheet, Dimensions, View, TextInput } from 'react-native';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { Container, Icon, Item, Label, Text } from 'native-base';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import FormNavigation from '@components/ui/FormNavigation';
import { ScrollView } from 'react-native-gesture-handler';
import { saveAccountUpdates } from '@actions/userAction';
import { NavigationScreenProp } from 'react-navigation';
import { connect, ConnectedProps } from 'react-redux';
import { PhotoInput } from '@components/PhotoInput';
import DatePicker from 'react-native-date-picker';
import { Formik, FormikProps } from 'formik';
import { RootState } from '@reducers/index';
import React, { useState } from 'react';
import colors from '@constants/Colors';
import StringMask from 'string-mask';
import * as Yup from 'yup';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  formErrorsToast,
} from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

var { width } = Dimensions.get('window');

type IdentityValues = {
  licenseNumber: string | undefined;
  licensePhoto: string | null;
  licenseExpirationDate: string | number | Date;
  ssn: string | undefined;
  profilePhoto: string | null;
};

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

const VerifyIdentitySchema: Yup.SchemaOf<IdentityValues> = Yup.object().shape({
  licenseNumber: Yup.string().required('Required'),
  licensePhoto: Yup.string().required('Required'),
  licenseExpirationDate: Yup.string().required('Required'),
  ssn: Yup.string().required('Required'),
  profilePhoto: Yup.string().required('Required'),
});

function VerifyIdentityScreen(props: ScreenProps) {
  const DELIMITER = '-';
  const MASK = '000-00-0000';
  const { navigation, dispatch, editingUserAccount, permissions } = props;
  const [open, setCalendarOpen] = useState(false);

  const removeTrailingCharIfFound = (str: string, char: string): string => {
    return str
      .split(char)
      .filter((segment) => segment !== '')
      .join(char);
  };

  const formatValue = (str: string): string => {
    const unmaskedValue = str.split(DELIMITER).join('');
    const formatted = StringMask.process(unmaskedValue, MASK);
    return removeTrailingCharIfFound(formatted.result, DELIMITER);
  };

  const handleSubmit = async (data: IdentityValues) => {
    const licenseExpirationDate = moment(data.licenseExpirationDate).format(
      'YYYY-MM-DD',
    );
    const identity = { ...data, licenseExpirationDate } as IdentityValues;
    const success = await dispatch<any>(saveAccountUpdates(identity));

    if (success) navigation.navigate('Payouts');
  };

  const onRefChange = (formik: FormikProps<IdentityValues>) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          loading={formik.isSubmitting}
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.VerifyIdentity - 1]);
          }}
          navigation={navigation}
          disabled={
            editingUserAccount ||
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

  const initialValues: IdentityValues = {
    licenseNumber: '',
    licensePhoto: '',
    licenseExpirationDate: new Date(),
    ssn: '',
    profilePhoto: '',
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Verify Identity</Text>
          <Formik
            initialValues={initialValues}
            innerRef={onRefChange}
            validationSchema={VerifyIdentitySchema}
            onSubmit={handleSubmit}>
            {({
              handleChange,
              handleBlur,
              setFieldValue,
              values,
              errors,
              touched,
            }) => {
              const ErrorMsg = ({ field }: any) => (
                <ErrorMessage errors={errors} touched={touched} field={field} />
              );

              return (
                <KeyboardAwareScrollView>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>Driver's License #</Label>
                    <TextInput
                      style={styles.inputText}
                      placeholder='##########'
                      value={values.licenseNumber}
                      onChangeText={handleChange('licenseNumber')}
                      onBlur={handleBlur('licenseNumber')}
                      maxLength={15}
                    />
                    <ErrorMsg field='licenseNumber' />
                  </Item>
                  <PhotoInput
                    label='License'
                    onChange={(value) =>
                      setFieldValue('licensePhoto', value, true)
                    }
                    value={values.licensePhoto}
                    error={
                      (errors.licensePhoto &&
                        touched.licensePhoto &&
                        errors.licensePhoto) ||
                      undefined
                    }
                    dispatch={dispatch}
                    permissions={permissions}
                    cameraOptions={{ cropping: false }}
                  />
                  <View
                    style={styles.inputImageContainer}
                    onTouchEnd={() => setCalendarOpen(true)}>
                    <Label style={styles.inputLabel}>
                      Driver's License Expiration
                    </Label>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={handleChange('licenseExpirationDate')}
                      onBlur={handleBlur('licenseExpirationDate')}
                      value={new Date(
                        values.licenseExpirationDate,
                      ).toLocaleDateString()}
                    />
                    <DatePicker
                      modal
                      open={open}
                      date={new Date(values.licenseExpirationDate)}
                      minimumDate={new Date()}
                      mode={'date'}
                      onConfirm={(date) => {
                        setCalendarOpen(false);
                        setFieldValue('licenseExpirationDate', date);
                      }}
                      onCancel={() => {
                        setCalendarOpen(false);
                      }}
                    />
                    <Icon style={styles.icon} name='calendar' />
                  </View>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>
                      Social security number
                    </Label>
                    <TextInput
                      style={styles.inputText}
                      value={values.ssn}
                      placeholder='###-##-####'
                      maxLength={11}
                      onChange={({ nativeEvent: { text } }) => {
                        setFieldValue('ssn', formatValue(text));
                      }}
                    />
                    <ErrorMsg field='ssn' />
                  </Item>
                  <Text style={styles.text}>
                    Please upload a profile photo to verify your ID. This photo
                    will also be shown to shippers when you are on their
                    deliveries.
                  </Text>
                  <PhotoInput
                    label='Profile Photo'
                    onChange={(value) =>
                      setFieldValue('profilePhoto', value, true)
                    }
                    value={values.profilePhoto}
                    dispatch={dispatch}
                    permissions={permissions}
                    cameraOptions={{
                      width: 800,
                      height: 800,
                    }}
                  />
                </KeyboardAwareScrollView>
              );
            }}
          </Formik>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
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
    flexGrow: 0,
    marginBottom: 15,
    borderWidth: 0,
  },
  inputText: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    width: '100%',
    height: 40,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 8,
    padding: 8,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    borderWidth: 0,
  },
  errorMsg: {
    color: '#FFAAAA',
    paddingTop: 10,
    fontWeight: 'bold',
    borderBottomWidth: 0,
  },
});
const connector = connect((state: RootState) => ({
  editingUserAccount: state.userReducer.editingUserAccount,
  permissions: state.appReducer.permissions,
}));

export default connector(VerifyIdentityScreen);
