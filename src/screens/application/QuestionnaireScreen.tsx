import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import { Container, Input, Item, Label, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import { updateRemoteComponent } from '@components/RemoteComponent';
import FormNavigation from '@components/ui/FormNavigation';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { MarketPicker } from '@components/MarketPicker';
import PhoneInput from '@components/PhoneInput';
import Select from '@components/ui/Select';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  formErrorsToast,
} from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

var { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector>;

enum EnglishProficiency {
  None = 'none',
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

enum VehicleClass {
  car = 'car',
  midsize = 'midsize',
  cargo_van = 'cargo_van',
  box_truck = 'box_truck',
}

type QuestionnaireValues = {
  market_id: string | null;
  vehicle_class: VehicleClass | null;
  english_proficiency: EnglishProficiency | null;
  email: string;
  phone_number: string;
};

const questionnaireSchema: Yup.SchemaOf<QuestionnaireValues> =
  Yup.object().shape({
    market_id: Yup.string().required('Required'),
    vehicle_class: Yup.mixed<VehicleClass | null>()
      .oneOf(Object.values<VehicleClass | null>(VehicleClass).concat(null))
      .required('Required'),
    english_proficiency: Yup.mixed<EnglishProficiency | null>()
      .oneOf(
        Object.values<EnglishProficiency | null>(EnglishProficiency).concat(
          null,
        ),
      )
      .required('Required'),
    email: Yup.string().email().required('Required'),
    phone_number: Yup.string().required('Required'),
  });

function QuestionnaireScreen(props: ScreenProps) {
  const { navigation } = props;
  const [hiringVehicle, setHiringVehicle] = useState<(string | null)[]>([]);

  const onRefChange = (formik: FormikProps<QuestionnaireValues>) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.Questionnaire - 1]);
          }}
          navigation={navigation}
          disabled={formik.isSubmitting || !formik.dirty || !formik.isValid}
          disabledAction={() => formErrorsToast(formik.errors)}
        />,
        { navigation },
      );
    }
  };

  const nextStep = async (questionnaires: QuestionnaireValues) => {
    navigation.navigate('CreateAccount', { questionnaires });
  };

  const initialValues: QuestionnaireValues = {
    market_id: null,
    vehicle_class: null,
    english_proficiency: null,
    email: '',
    phone_number: '',
  };

  return (
    <Container>
      <StatusBar barStyle='light-content' />
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Questionnaire</Text>
          <Formik
            initialValues={initialValues}
            validationSchema={questionnaireSchema}
            validateOnChange={true}
            validateOnBlur={true}
            validate={(values) => {
              const errors = {};
              const is_hiring_vehicle = hiringVehicle.find(
                (vehicle) => vehicle == values.vehicle_class,
              );

              if (!is_hiring_vehicle) {
                errors.vehicle_class =
                  "The market you're applying is not accepting that vehicle type at this moment.";
              }

              return errors;
            }}
            innerRef={onRefChange}
            onSubmit={nextStep}>
            {({
              handleChange,
              handleBlur,
              values,
              errors,
              touched,
              setFieldValue,
              setFieldError,
            }) => {
              const ErrorMsg = ({ field }: any) => (
                <ErrorMessage errors={errors} touched={touched} field={field} />
              );

              return (
                <KeyboardAwareScrollView>
                  <MarketPicker
                    onMarketSelected={(hiringVehicle) =>
                      setHiringVehicle(hiringVehicle)
                    }
                    onChange={handleChange('market_id')}
                    value={values.market_id || ''}
                  />
                  <ErrorMsg field='market_id' />

                  <Text style={styles.label}>Vehicle Class</Text>
                  <Select
                    placeholder={{
                      label: 'Select your vehicle type...',
                      value: '',
                    }}
                    items={[
                      {
                        label: 'Car',
                        value: 'car',
                      },
                      {
                        label: 'Midsize',
                        value: 'midsize',
                      },
                      {
                        label: 'Cargo Van',
                        value: 'cargo_van',
                      },
                      {
                        label: 'Box Truck',
                        value: 'box_truck',
                      },
                    ]}
                    onValueChange={(value) => {
                      setFieldValue('vehicle_class', value);
                    }}
                    disabled={!values.market_id}
                    value={values.vehicle_class}
                  />
                  <Text style={styles.errorMsg}>
                    {errors['vehicle_class'] &&
                      values.vehicle_class &&
                      errors['vehicle_class']}
                  </Text>

                  <Text style={styles.label}>English Proficiency</Text>
                  <Select
                    placeholder={{
                      label: 'Select your proficiency...',
                      value: '',
                    }}
                    items={[
                      {
                        label: 'None (Not Proficient)',
                        value: EnglishProficiency.None,
                      },
                      {
                        label: 'Beginner',
                        value: EnglishProficiency.Beginner,
                      },
                      {
                        label: 'Intermediate',
                        value: EnglishProficiency.Intermediate,
                      },
                      {
                        label: 'Advanced (Fluent)',
                        value: EnglishProficiency.Advanced,
                      },
                    ]}
                    onValueChange={handleChange('english_proficiency')}
                    onTouchStart={handleBlur('english_proficiency')}
                    value={values.english_proficiency}
                  />
                  <ErrorMsg field='english_proficiency' />

                  <Item floatingLabel style={styles.item}>
                    <Label style={styles.inputLabel}>Email</Label>
                    <Input
                      keyboardType='email-address'
                      autoCapitalize='none'
                      style={styles.input}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                    />
                  </Item>
                  <ErrorMsg field='email' />

                  <PhoneInput
                    onChange={(phone_number, phone_error) => {
                      if (phone_error) {
                        return setFieldError('phone_number', phone_error);
                      }
                      setFieldValue('phone_number', phone_number);
                    }}
                    phoneNumber={values.phone_number}
                    inputStyle={styles.input}
                    errorStyle={styles.error}
                    autoFormat={true}
                    itemProps={{ floatingLabel: true, style: styles.item }}
                    style={styles.inputLabel}
                  />
                  <ErrorMsg field='phone_number' />
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
  error: {
    color: colors.white,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 16,
  },
  selectError: {
    color: colors.white,
    fontWeight: '500',
    marginTop: -16,
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.white,
  },
  item: { marginTop: 15 },
  inputLabel: {
    fontWeight: 'bold',
    color: colors.white,
  },
  input: {
    color: colors.white,
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
  errorMsg: {
    color: '#FFAAAA',
    paddingTop: 10,
    fontWeight: 'bold',
    marginTop: -16,
    marginBottom: 20,
  },
});

const connector = connect((state: RootState) => ({}));

export default connector(QuestionnaireScreen);
