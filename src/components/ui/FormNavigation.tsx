import React from 'react';
import { StyleSheet, View } from 'react-native';
import ActionButton from '@components/ui/ActionButton';
import { connect, ConnectedProps } from 'react-redux';
import { NavigationScreenProp } from 'react-navigation';
import colors, { colorObjs } from '@constants/Colors';
import NavigationButton from '@components/ui/NavigationButton';
import ScreenIndicator from '@components/ui/ScreenIndicator';
import { RootState } from '@reducers/index';
import { NavigatorStepEnum, navigatorSteps } from '@constants/NavigatorSteps';

type NavigationState = {
  routeName: string;
} & any;

type Props = {
  navigation: NavigationScreenProp<NavigationState>;
  nextAction: () => void;
  backAction?: () => void;
  disabledAction?: () => void;
  skipAction?: () => void;
} & ConnectedProps<typeof connector> &
  Partial<DefaultProps>;

type DefaultProps = {
  loading: boolean;
  disabled: boolean;
  disableBack: boolean;
  skipLoading: boolean;
  skipDisabled: boolean;
  showSkip: boolean;
  nextLabel: string;
  stepType: NavigatorStepEnum;
};

function FormNavigation({
  loading = false,
  disabled = false,
  disableBack = false,
  skipLoading = false,
  skipDisabled = false,
  showSkip = false,
  nextLabel = 'Continue',
  stepType = NavigatorStepEnum.Registration,
  navigation,
  nextAction,
  backAction,
  skipAction,
  disabledAction,
}: Props) {
  const currentScreen = navigation ? navigation.state.routeName : 0;

  return (
    <View>
      <ScreenIndicator
        steps={navigatorSteps[stepType]}
        screen={currentScreen}
      />
      <View style={styles.menu}>
        <NavigationButton
          action='back'
          onPress={backAction ? backAction : undefined}
          navigation={navigation}
          disabled={loading || skipLoading || disableBack}
        />
        {(!!skipAction || showSkip) && (
          <NavigationButton
            action='skip'
            onPress={skipAction}
            disabled={loading || skipLoading || skipDisabled}
            loading={skipLoading}
            navigation={navigation}
          />
        )}
        <View style={styles.nextWrapper} />
        <ActionButton
          label={nextLabel}
          type='secondary'
          onPress={nextAction}
          onDisabledPress={disabledAction}
          loading={loading}
          disabled={disabled}
          block
          shrink
        />
      </View>
    </View>
  );
}

const connector = connect(({ userReducer }: RootState) => ({
  signingOutUser: userReducer.signingOutUser,
}));

export default connector(FormNavigation);

const styles = StyleSheet.create({
  menu: {
    borderTopWidth: 1,
    borderColor: colorObjs.lightGray.darken(0.1).toString(),
    backgroundColor: colors.lightGray,
    flexDirection: 'row',
    paddingBottom: 15,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  nextWrapper: {
    flexGrow: 1,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navigationButtonDisabled: {
    opacity: 0.7,
  },
  navigationIcon: {
    fontSize: 28,
    color: colors.secondary,
    paddingHorizontal: 2,
  },
  navigationText: {
    fontSize: 17,
    lineHeight: 17,
    color: colors.secondary,
  },
});
