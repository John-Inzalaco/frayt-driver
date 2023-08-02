import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';
import { signOutUser } from '@actions/userAction';
import { NavigationScreenProp } from 'react-navigation';
import colors from '@constants/Colors';
import { Text, Spinner } from 'native-base';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { RootState } from '@reducers/index';

type Props<D = {}> = {
  title?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: Element;
  navigation?: NavigationScreenProp<any>;
  onPress?: (event: GestureResponderEvent) => void;
} & D &
  Partial<DefaultProps> &
  ConnectedProps<typeof connector>;

type DefaultProps = {
  action: 'back' | 'skip';
  loading: boolean;
  disabled: boolean;
};

class NavigationButton extends Component<Props<DefaultProps>> {
  static defaultProps: DefaultProps = {
    action: 'back',
    loading: false,
    disabled: false,
  };

  canGoBack() {
    const { navigation } = this.props;
    if (navigation) {
      const parent = navigation.dangerouslyGetParent(),
        index = parent ? parent.state.index : 0;

      return index > 0;
    } else {
      return false;
    }
  }

  goBack() {
    const { navigation } = this.props;

    !!navigation && navigation.goBack();
  }

  cancel() {
    const { dispatch } = this.props;

    dispatch<any>(signOutUser());
  }

  getTitle() {
    const { action, title } = this.props;

    if (title) {
      return title;
    } else {
      switch (action) {
        case 'back':
          const canGoBack = this.canGoBack();

          return canGoBack ? 'Back' : 'Sign Out';
        case 'skip':
          return 'Skip';
      }
    }
  }

  getLoading() {
    const { action, loading, signingOutUser } = this.props;
    let isLoading = false;

    switch (action) {
      case 'back':
        const canGoBack = this.canGoBack();

        isLoading = canGoBack ? loading : loading || signingOutUser;
      default:
        isLoading = loading;
    }

    return (
      isLoading && (
        <Spinner size='small' style={styles.spinner} color={colors.secondary} />
      )
    );
  }

  getIcon() {
    const { action, icon, disabled, textStyle } = this.props;

    if (icon) {
      return icon;
    } else {
      switch (action) {
        case 'back':
          return (
            <FontAwesome5
              name='chevron-left'
              style={[styles.icon, disabled && styles.textDisabled, textStyle]}
            />
          );
        case 'skip':
          return (
            <FontAwesome5
              name='chevron-right'
              style={[styles.icon, disabled && styles.textDisabled, textStyle]}
            />
          );
      }
    }
  }

  getNavigate() {
    const { action, onPress } = this.props;

    if (onPress) {
      return onPress;
    } else {
      switch (action) {
        case 'back':
          const canGoBack = this.canGoBack();

          return canGoBack ? this.goBack.bind(this) : this.cancel.bind(this);
      }
    }
  }

  renderContent() {
    const { action, disabled, textStyle } = this.props;
    const icon = this.getIcon();
    const title = this.getTitle();
    const loading = this.getLoading();
    let content = [];

    switch (action) {
      case 'back':
        content.push(
          icon,
          <Text
            style={[styles.text, disabled && styles.textDisabled, textStyle]}>
            {title}
          </Text>,
          loading,
        );
        break;
      case 'skip':
        content.push(
          loading,
          <Text
            style={[styles.text, disabled && styles.textDisabled, textStyle]}>
            {title}
          </Text>,
          icon,
        );
        break;
    }

    return content;
  }

  render() {
    const { disabled, onPress, style, signingOutUser, ...props } = this.props;
    const navigate = this.getNavigate();

    return (
      <TouchableOpacity
        disabled={disabled || signingOutUser}
        onPress={navigate}
        style={[styles.button, disabled && styles.buttonDisabled, style]}
        {...props}>
        {this.renderContent()}
      </TouchableOpacity>
    );
  }
}

const connector = connect(({ userReducer }: RootState) => ({
  signingOutUser: userReducer.signingOutUser,
}));

export default connector(NavigationButton);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textDisabled: {
    color: colors.gray,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 22,
    color: colors.secondary,
    paddingHorizontal: 3,
  },
  text: {
    fontSize: 17,
    lineHeight: 17,
    color: colors.secondary,
  },
  spinner: {
    flex: 0,
    height: 22,
    marginHorizontal: 2,
  },
});
