import { initStripe, PaymentMethod } from '@stripe/stripe-react-native';
import { updateRemoteComponent } from '@components/RemoteComponent';
import { charge_background_check } from '@actions/userAction';
import { NavigatorStepEnum } from '@constants/NavigatorSteps';
import { StyleSheet, Dimensions, View } from 'react-native';
import { STRIPE_PUBLISH_KEY } from '@constants/Environment';
import FormNavigation from '@components/ui/FormNavigation';
import { NavigationScreenProp } from 'react-navigation';
import { useStripe } from '@stripe/stripe-react-native';
import ActionButton from '@components/ui/ActionButton';
import { connect, ConnectedProps } from 'react-redux';
import userTypes from '@actions/types/userTypes';
import { Container, Text, Toast } from 'native-base';
import PaymentScreen from './PaymentScreen';
import { RootState } from '@reducers/index';
import React, { useEffect } from 'react';
import colors from '@constants/Colors';
import { Formik } from 'formik';
import { formErrorsToast } from '@lib/error/FormikSubmissionErrors';
import { ApplySteps } from '@src/navigation/ApplyNavigator';

var { width } = Dimensions.get('window');

type ScreenProps = {
  navigation: NavigationScreenProp<{}>;
  dispatch: any;
} & ConnectedProps<typeof connector>;

function BackgroundCheckScreen(props: ScreenProps) {
  const { createPaymentMethod, handleNextAction } = useStripe();
  const { navigation, dispatch, creatingPaymentMethod } = props;

  useEffect(() => {
    initStripe({ publishableKey: STRIPE_PUBLISH_KEY });
  }, []);

  const onRefChange = (formik: any) => {
    if (formik) {
      updateRemoteComponent(
        'fixed-footer',
        <FormNavigation
          loading={formik.isSubmitting}
          stepType={NavigatorStepEnum.Preapproval}
          nextAction={formik.submitForm}
          backAction={() => {
            navigation.navigate(ApplySteps[ApplySteps.BackgroundCheck - 1]);
          }}
          navigation={navigation}
          disabled={
            creatingPaymentMethod ||
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

  const startBackgroundCheck = async () => {
    dispatch({ type: userTypes.CREATING_PAYMENT_METHOD });
    // Create payment method
    const { error, paymentMethod } = await createPaymentMethod({
      paymentMethodType: 'Card',
    });

    if (error) {
      const { message, localizedMessage } = error;

      await dispatch({
        type: userTypes.CREATING_PAYMENT_METHOD_ERROR,
      });

      const nonUserFriendly =
        localizedMessage?.includes('https://') ||
        localizedMessage?.includes('Exception');

      const endUserMsg = nonUserFriendly
        ? 'An unexpected error occurred'
        : localizedMessage || '';

      Toast.show({ text: endUserMsg });
    } else {
      chargeBackgroundCheck(paymentMethod, null);
    }
  };

  const chargeBackgroundCheck = async (
    payment: PaymentMethod.Result | undefined,
    intent: any | null,
  ) => {
    const { driver, payment_intent_client_secret, requires_action } =
      await dispatch(charge_background_check(payment, intent));

    if (payment_intent_client_secret && !requires_action) {
      // Payment succeeded
      nextStep(driver);
    }

    if (payment_intent_client_secret && requires_action) {
      const { error, paymentIntent } = await handleNextAction(
        payment_intent_client_secret,
      );

      if (error) {
        const { message, localizedMessage } = error;

        Toast.show({
          text: localizedMessage || message || 'An unextected error ocurred.',
        });
      } else if (paymentIntent) {
        if (paymentIntent.status === 'Succeeded') {
          // Payment succedeed
          nextStep(driver);
        } else {
          // Confirm the PaymentIntent again on your server
          chargeBackgroundCheck(payment, paymentIntent.id);
        }
      }
    }
  };

  const nextStep = async (driver: any) => {
    await dispatch({
      type: userTypes.FETCHING_USER_SUCCESS,
      user: driver,
    });

    navigation.navigate('ApplicationComplete');
  };

  return (
    <Container style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.header}>Background Check</Text>
        <Formik
          initialValues={{}}
          innerRef={onRefChange}
          onSubmit={startBackgroundCheck}>
          {({ handleSubmit }) => (
            <View>
              <Text style={styles.text}>
                Your application is almost done! Thank you for applying for
                FRAYT. You can still go back and change any details if needed.
              </Text>

              <Text style={styles.text}>
                Once your application has been reviewed, you'll{' '}
                <Text style={[styles.text, { fontWeight: 'bold' }]}>
                  receive an email directly from Turn
                </Text>{' '}
                with a link to begin the background check.
              </Text>

              <Text style={styles.text}>
                A $35 application fee is required.
              </Text>

              <Text style={styles.subHeader}>
                Form to enter credit card info
              </Text>

              <PaymentScreen />

              <ActionButton
                label='AUTHORIZE $35'
                type='light'
                size='large'
                style={styles.button}
                onPress={handleSubmit}
                loading={creatingPaymentMethod}
                disabled={creatingPaymentMethod}
                block
              />
            </View>
          )}
        </Formik>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  boldText: {
    fontWeight: 'bold',
  },
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
  subHeader: {
    textAlign: 'left',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 32,
    color: colors.secondaryText,
    marginTop: 25,
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
});
const connector = connect((state: RootState) => ({
  signingOutUser: state.userReducer.signingOutUser,
  creatingPaymentMethod: state.userReducer.creatingPaymentMethod,
}));

export default connector(BackgroundCheckScreen);
