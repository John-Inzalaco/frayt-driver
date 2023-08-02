import NavigationService from '@lib/NavigationService';

type StripeError = {
  code?: string;
  message?: string;
  [key: string]: any;
};

export function handleStripeProfileErrors(error: StripeError) {
  const { message, code } = error;
  switch (code) {
    case 'missing_address':
      NavigationService.navigate('EditAddress', { error: message });
      break;

    case 'invalid_request_error':
      NavigationService.navigate('EditPhone', { error: message });
      break;
  }
}

export function throwStripeProfileErrors(request: any, handleErrors = true) {
  const response = request?.response;
  const error = response && JSON.parse(response);

  if (handleErrors && error) {
    handleStripeProfileErrors(error);
  }
  //
  // throw ({ response: { data } });
}
