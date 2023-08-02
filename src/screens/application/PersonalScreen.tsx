/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TextInput } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import { Container, Icon, Item, Label, Picker, Text, Toast } from 'native-base';
import colors from '@constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import { updateRemoteComponent } from '@components/RemoteComponent';
import FormNavigation from '@components/ui/FormNavigation';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { saveAccountUpdates } from '@actions/userAction';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  formErrorsToast,
  ErrorMessage,
} from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';
import User from '@models/User';

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
  user: typeof User;
} & ConnectedProps<typeof connector>;

const { width } = Dimensions.get('window');

const states = [
  {
    label: 'Alabama',
    value: 'AL',
  },
  {
    label: 'Alaska',
    value: 'AK',
  },
  {
    label: 'Arizona',
    value: 'AZ',
  },
  {
    label: 'Arkansas',
    value: 'AR',
  },
  {
    label: 'California',
    value: 'CA',
  },
  {
    label: 'Colorado',
    value: 'CO',
  },
  {
    label: 'Connecticut',
    value: 'CT',
  },
  {
    label: 'Delaware',
    value: 'DE',
  },
  {
    label: 'Florida',
    value: 'FL',
  },
  {
    label: 'Georgia',
    value: 'GA',
  },
  {
    label: 'Hawaii',
    value: 'HI',
  },
  {
    label: 'Idaho',
    value: 'ID',
  },
  {
    label: 'Illinois',
    value: 'IL',
  },
  {
    label: 'Indiana',
    value: 'IN',
  },
  {
    label: 'Iowa',
    value: 'IA',
  },
  {
    label: 'Kansas',
    value: 'KS',
  },
  {
    label: 'Kentucky',
    value: 'KY',
  },
  {
    label: 'Louisiana',
    value: 'LA',
  },
  {
    label: 'Maine',
    value: 'ME',
  },
  {
    label: 'Maryland',
    value: 'MD',
  },
  {
    label: 'Massachusetts',
    value: 'MA',
  },
  {
    label: 'Michigan',
    value: 'MI',
  },
  {
    label: 'Minnesota',
    value: 'MN',
  },
  {
    label: 'Mississippi',
    value: 'MS',
  },
  {
    label: 'Missouri',
    value: 'MO',
  },
  {
    label: 'Montana',
    value: 'MT',
  },
  {
    label: 'Nebraska',
    value: 'NE',
  },
  {
    label: 'Nevada',
    value: 'NV',
  },
  {
    label: 'New Hampshire',
    value: 'NH',
  },
  {
    label: 'New Jersey',
    value: 'NJ',
  },
  {
    label: 'New Mexico',
    value: 'NM',
  },
  {
    label: 'New York',
    value: 'NY',
  },
  {
    label: 'North Carolina',
    value: 'NC',
  },
  {
    label: 'North Dakota',
    value: 'ND',
  },
  {
    label: 'Ohio',
    value: 'OH',
  },
  {
    label: 'Oklahoma',
    value: 'OK',
  },
  {
    label: 'Oregon',
    value: 'OR',
  },
  {
    label: 'Pennsylvania',
    value: 'PA',
  },
  {
    label: 'Rhode Island',
    value: 'RI',
  },
  {
    label: 'South Carolina',
    value: 'SC',
  },
  {
    label: 'South Dakota',
    value: 'SD',
  },
  {
    label: 'Tennessee',
    value: 'TN',
  },
  {
    label: 'Texas',
    value: 'TX',
  },
  {
    label: 'Utah',
    value: 'UT',
  },
  {
    label: 'Vermont',
    value: 'VT',
  },
  {
    label: 'Virginia',
    value: 'VA',
  },
  {
    label: 'Washington',
    value: 'WA',
  },
  {
    label: 'West Virginia',
    value: 'WV',
  },
  {
    label: 'Wisconsin',
    value: 'WI',
  },
  {
    label: 'Wyoming',
    value: 'WY',
  },
];

type PersonalValues = {
  first_name: string | null;
  last_name: string | null;
  birthdate: Date | null;
  address: string | null;
  address2?: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
};

const minAge = 18;
const maxAge = 80;
const minDate = moment().startOf('day').subtract(maxAge, 'years');
const maxDate = moment().startOf('day').subtract(minAge, 'years');
const PersonalInfoSchema: Yup.SchemaOf<PersonalValues> = Yup.object().shape({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  birthdate: Yup.date()
    .min(minDate.toDate(), `The maximum age allowed is ${maxAge} years old`)
    .max(maxDate.toDate(), `Should have at least ${minAge} years old`)
    .required('Required'),
  address: Yup.string().required('Required'),
  address2: Yup.string(),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  zip: Yup.string()
    .matches(/^\d{4,}(?:[-\s]\d{4})?$/, 'Invalid zip code')
    .required('Required'),
});

function PersonalScreen(props: ScreenProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());
  const { navigation, editingUserAccount, dispatch, user } = props;

  const nextStep = async () => navigation.navigate('VerifyIdentity');

  const onSubmit = async (data: PersonalValues) => {
    const birthdate = moment(data.birthdate).format('YYYY-MM-DD');
    const driver = { ...data, birthdate };
    const success = await dispatch<any>(saveAccountUpdates(driver));

    if (success) {
      nextStep();
    }
  };

  const onRefChange = (formik: FormikProps<PersonalValues>) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          loading={formik.isSubmitting}
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          disableBack={!!user.id}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.Personal - 1]);
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

  const buildStates = () => {
    return states.map(({ label, value }) => {
      return <Picker.Item label={label} value={value} />;
    });
  };

  const initialValues: PersonalValues = {
    first_name: '',
    last_name: '',
    birthdate: maxDate.toDate(),
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  };

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Personal</Text>
          <Formik
            initialValues={initialValues}
            innerRef={onRefChange}
            validationSchema={PersonalInfoSchema}
            onSubmit={onSubmit}>
            {({
              values,
              handleChange,
              handleBlur,
              errors,
              touched,
              setFieldValue,
            }) => {
              const ErrorMsg = ({ field }: any) => (
                <ErrorMessage errors={errors} touched={touched} field={field} />
              );

              return (
                <KeyboardAwareScrollView>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>First Name</Label>
                    <TextInput
                      onChangeText={handleChange('first_name')}
                      onBlur={handleBlur('first_name')}
                      style={styles.inputText}
                      value={values.first_name}
                    />
                    <ErrorMsg field='first_name' />
                  </Item>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>Last Name</Label>
                    <TextInput
                      onChangeText={handleChange('last_name')}
                      onBlur={handleBlur('last_name')}
                      style={styles.inputText}
                      value={values.last_name}
                    />
                    <ErrorMsg field='last_name' />
                  </Item>
                  <View style={styles.formItem}>
                    <Label style={styles.inputLabel}>Date Of Birth</Label>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={handleChange('birthdate')}
                      onBlur={handleBlur('birthdate')}
                      value={moment(values.birthdate).format('MM/DD/YYYY')}
                      onFocus={() => {
                        setCalendarOpen(true);
                      }}
                    />
                    <DatePicker
                      modal
                      open={calendarOpen}
                      date={birthDate}
                      mode={'date'}
                      minimumDate={minDate.toDate()}
                      maximumDate={maxDate.toDate()}
                      onConfirm={(date) => {
                        setBirthDate(date);
                        setCalendarOpen(false);
                        setFieldValue('birthdate', date);
                      }}
                      onCancel={() => setCalendarOpen(false)}
                    />
                    <Icon
                      style={styles.icon}
                      name='calendar'
                      onPress={() => {
                        setCalendarOpen(true);
                      }}
                    />
                    <ErrorMsg field='birthdate' />
                  </View>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>Address 1</Label>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={handleChange('address')}
                      onBlur={handleBlur('address')}
                      value={values.address}
                    />
                    <ErrorMsg field='address' />
                  </Item>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>Address 2</Label>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={handleChange('address2')}
                      onBlur={handleBlur('address2')}
                      value={values.address2}
                    />
                    <ErrorMsg field='address2' />
                  </Item>
                  <View style={styles.row}>
                    <Item style={{ ...styles.formItem, ...styles.halfW }}>
                      <Label style={styles.inputLabel}>City</Label>
                      <TextInput
                        style={styles.inputText}
                        onChangeText={handleChange('city')}
                        onBlur={handleBlur('city')}
                        value={values.city}
                      />
                      <ErrorMsg field='city' />
                    </Item>
                    <Item style={{ ...styles.formItem, ...styles.halfW }}>
                      <Label style={styles.inputLabel}>State</Label>
                      <View style={styles.dropdownWrapper}>
                        <Picker
                          mode='dropdown'
                          placeholder='Select state'
                          iosIcon={<Icon name='chevron-down' />}
                          style={styles.dropdown}
                          placeholderIconColor='#007aff'
                          selectedValue={values.state}
                          onTouchEnd={handleBlur('state')}
                          onValueChange={handleChange('state')}>
                          {buildStates()}
                        </Picker>
                      </View>
                      <ErrorMsg field='state' />
                    </Item>
                  </View>
                  <Item style={styles.formItem}>
                    <Label style={styles.inputLabel}>ZIP</Label>
                    <TextInput
                      style={styles.inputText}
                      onChangeText={handleChange('zip')}
                      onBlur={handleBlur('zip')}
                      value={values.zip}
                      minLength={4}
                    />
                    <ErrorMsg field='zip' />
                  </Item>
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
  wrapper: {
    backgroundColor: colors.secondary,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary,
  },
  center: {
    width: width,
    padding: 12,
    marginTop: 15,
  },
  header: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 32,
    color: colors.secondaryText,
    marginBottom: 16,
  },
  formItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    flexGrow: 0,
    marginBottom: 15,
    borderBottomWidth: 0,
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
  inputLabel: {
    height: 16,
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: colors.lightGray,
    alignSelf: 'stretch',
  },
  dropdown: {
    backgroundColor: '#C5CEE0',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    alignSelf: 'stretch',
    flexGrow: 0,
    marginTop: 0,
    paddingVertical: 8,
    paddingLeft: 0,
    height: 38,
    width: width / 2 - width * 0.05,
  },
  dropdownWrapper: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 4,
    backgroundColor: '#C5CEE0',
    marginTop: 8,
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfW: {
    width: width / 2 - width * 0.05,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 27,
    color: '#8F9BB3',
  },
});

const connector = connect((state: RootState) => ({
  editingUserAccount: state.userReducer.editingUserAccount,
  user: state.userReducer.user,
}));

export default connector(PersonalScreen);
