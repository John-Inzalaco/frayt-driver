import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, StatusBar, Image } from 'react-native';
import { Container, Input, Item, Label, Text } from 'native-base';
import { connect, ConnectedProps } from 'react-redux';
import colors from '@constants/Colors';
import { createUnapprovedUser } from '@actions/userAction';
import ActionButton from '@components/ui/ActionButton';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import SignatureCapture from 'react-native-signature-capture';
import FormNavigation from '@components/ui/FormNavigation';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { unauthorizedRequest } from '@lib/Request';
import { AgreementInput } from '@components/AgreementInput';
import { AgreementDocument } from '@models/User';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  formErrorsToast,
} from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

var { width } = Dimensions.get('window');

type ScreenProps = {
  route: any;
  navigation: NavigationScreenProp<{}>;
  email: string;
  phoneNumber: string;
} & ConnectedProps<typeof connector>;

type RegistrationValues = {
  password: string | null;
  password_confirmation: string | null;
  agreements: AgreementValues[];
  signature: string | null;
};

type AgreementValues = {
  agreed: boolean;
  document_id: string;
};

const agreementSchema: Yup.SchemaOf<AgreementValues> = Yup.object().shape({
  agreed: Yup.boolean().oneOf([true], 'Please agree to continue').required(),
  document_id: Yup.string().required(),
});

const registrationSchema: Yup.SchemaOf<RegistrationValues> = Yup.object().shape(
  {
    password: Yup.string()
      .min(8, 'Should have 8 characters or more')
      .required('Required'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
    agreements: Yup.array(agreementSchema).required(),
    signature: Yup.string().required('Signature is required'),
  },
);

function CreateAccountScreen(props: ScreenProps) {
  const { navigation, creatingUnapprovedUser, dispatch } = props;
  let signatureRef: Nullable<SignatureCapture> = null;
  const [driverAgreements, setDriverAgreements] = useState<AgreementDocument[]>(
    [],
  );
  const [initialValues, setInitialValues] = useState<RegistrationValues>({
    password: '',
    password_confirmation: '',
    agreements: [],
    signature: null,
  });

  useEffect(() => {
    async function retrieveAgreementDocuments() {
      try {
        const http = await unauthorizedRequest();
        const { data } = await http.get('agreement_documents/driver');
        await setDriverAgreements(data.agreement_documents);
      } catch (error) {
        console.warn(error);
      }
    }
    retrieveAgreementDocuments();
  }, []);

  useEffect(() => {
    setInitialValues((iv) => ({
      ...iv,
      agreements: driverAgreements.map((a: AgreementDocument) => ({
        document_id: a.id,
        agreed: false,
      })),
    }));
  }, [driverAgreements]);

  const nextStep = async ({
    password,
    password_confirmation: _,
    ...values
  }: RegistrationValues) => {
    const { email, ...questionnaires } = navigation.getParam('questionnaires');

    const data = {
      ...values,
      ...questionnaires,
      user: {
        password,
        email,
      },
    };

    const success = await dispatch(createUnapprovedUser(data));

    if (success) navigation.navigate('Personal');
  };

  const onRefChange = (formik: FormikProps<RegistrationValues>) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          loading={formik.isSubmitting}
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.CreateAccount - 1]);
          }}
          navigation={navigation}
          disabled={
            formik.isSubmitting ||
            creatingUnapprovedUser ||
            !formik.dirty ||
            !formik.isValid
          }
          disabledAction={() => formErrorsToast(formik.errors)}
        />,
        { navigation },
      );
    }
  };

  return (
    <Container>
      <StatusBar barStyle='light-content' />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.header}>Create Account</Text>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={registrationSchema}
            innerRef={onRefChange}
            onSubmit={nextStep}>
            {({
              handleChange,
              handleBlur,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              const ErrorMsg = ({ field }: any) => (
                <ErrorMessage errors={errors} touched={touched} field={field} />
              );

              return (
                <View>
                  <Item last style={styles.formItem}>
                    <Label style={styles.inputLabel}>Password</Label>
                    <Input
                      keyboardType='default'
                      secureTextEntry={true}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      style={styles.inputText}
                    />
                    <ErrorMsg field='password' />
                  </Item>

                  <Item last style={styles.formItem}>
                    <Label style={styles.inputLabel}>
                      Password Confirmation
                    </Label>
                    <Input
                      keyboardType='default'
                      secureTextEntry={true}
                      onChangeText={handleChange('password_confirmation')}
                      onBlur={handleBlur('password_confirmation')}
                      style={styles.inputText}
                    />
                    {touched.password_confirmation ? (
                      <ErrorMsg field='password_confirmation' />
                    ) : null}
                  </Item>
                  {driverAgreements.map((agreement, i) => (
                    <AgreementInput
                      key={`agreement_${i}`}
                      onChange={(value) => {
                        setFieldValue(`agreements[${i}].agreed`, value, true);
                      }}
                      agreement={agreement}
                      value={!!values.agreements[i]?.agreed}
                      theme='blue'
                    />
                  ))}

                  {values.signature ? (
                    <Image
                      source={{
                        uri: `data:image/png;base64,${values.signature}`,
                      }}
                      style={styles.signature}
                    />
                  ) : (
                    <>
                      <SignatureCapture
                        style={styles.signature}
                        ref={(sig) => (signatureRef = sig)}
                        onSaveEvent={(signature) => {
                          setFieldValue('signature', signature.encoded);
                        }}
                        saveImageFileInExtStorage={false}
                        showNativeButtons={false}
                        showTitleLabel={false}
                        viewMode='portrait'
                      />

                      <ActionButton
                        label='Save Signature'
                        type='light'
                        size='large'
                        style={styles.button}
                        onPress={() => {
                          signatureRef?.saveImage();
                        }}
                        block
                      />
                    </>
                  )}
                </View>
              );
            }}
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  debug: {
    borderColor: 'red',
    borderWidth: 2,
  },
  wrapper: {
    backgroundColor: colors.secondary,
    height: '100%',
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
  input: {
    color: colors.white,
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
  signature: {
    borderColor: colors.signature,
    borderWidth: 1,
    minHeight: 175,
    marginTop: 24,
  },
  errorMsg: {
    color: '#FFAAAA',
    paddingTop: 10,
    fontWeight: 'bold',
  },
});

const connector = connect((state: RootState) => ({
  creatingUnapprovedUser: state.userReducer.creatingUnapprovedUser,
}));

export default connector(CreateAccountScreen);
