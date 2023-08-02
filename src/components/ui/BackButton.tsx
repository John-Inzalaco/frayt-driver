import React, { Component } from 'react';
import { connect } from 'react-redux';
import ActionButton from '@components/ui/ActionButton';
import { signOutUser } from '@actions/userAction';
import { withNavigationFocus } from 'react-navigation';

class BackButton extends Component {
  canGoBack() {
    const { navigation } = this.props,
      parent = navigation.dangerouslyGetParent(),
      index = parent ? parent.state.index : 0;

    return index > 0;
  }

  goBack() {
    const { dispatch, navigation } = this.props;
    const canGoBack = this.canGoBack();

    if (canGoBack) {
      navigation.goBack();
    } else {
      dispatch(signOutUser());
    }
  }

  render() {
    const {
      navigation,
      label,
      signoutLabel,
      disabled,
      signingOutUser,
      ...props
    } = this.props;
    const canGoBack = this.canGoBack();

    return (
      <ActionButton
        {...props}
        disabled={disabled || signingOutUser}
        loading={signingOutUser}
        label={canGoBack ? label : signoutLabel}
        onPress={this.goBack.bind(this)}
      />
    );
  }
}

export default connect((state) => ({
  signingOutUser: state.userReducer.signingOutUser,
}))(withNavigationFocus(BackButton));

BackButton.defaultProps = {
  label: 'Go Back',
  signoutLabel: 'Cancel',
  type: 'inverse',
  size: 'large',
  block: true,
  hollow: true,
};
