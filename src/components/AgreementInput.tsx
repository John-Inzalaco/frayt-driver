import React from 'react';
import { AgreementDocument } from '@models/User';
import { Linking, Platform, StyleSheet } from 'react-native';
import { Switch, Text, View } from 'native-base';
import colors, { colorObjs } from '@constants/Colors';
type AgreementTheme = 'blue';
type AgreementLinksProps = {
  agreement: AgreementDocument;
  theme?: AgreementTheme;
};
function AgreementLinks({ agreement, theme }: AgreementLinksProps) {
  const style =
    theme === 'blue'
      ? { color: colors.white, fontWeight: 'bold' }
      : { color: colors.secondary };
  return (
    <>
      {[agreement, ...agreement.support_documents]
        .map(({ url, title }) => (
          <Text
            style={[styles.checkboxText, style]}
            onPress={() => Linking.openURL(url)}>
            {title}
          </Text>
        ))
        .reduce((prev, curr) => (
          <>{[prev, ', ', curr]}</>
        ))}
    </>
  );
}

type Props = {
  agreement: AgreementDocument;
  onChange: (value: boolean) => void;
  value: boolean;
  theme?: AgreementTheme;
};

export function AgreementInput({ agreement, onChange, value, theme }: Props) {
  const trackColor =
    theme === 'blue'
      ? {
          true: colorObjs.secondary.lighten(0.3).hex(),
          false: colors.gray,
        }
      : { true: colors.secondary, false: colors.gray };
  const thumbColor = theme === 'blue' ? colors.white : colors.secondary;

  const ios_backgroundColor = theme === 'blue' ? colors.white : colors.gray;
  const style =
    theme === 'blue' ? { color: colors.white } : { color: colors.text };

  return (
    <View style={styles.checkboxWrapper}>
      <Switch
        trackColor={trackColor}
        thumbColor={Platform.OS === 'android' ? thumbColor : undefined}
        ios_backgroundColor={ios_backgroundColor}
        style={styles.smallSwitch}
        value={value}
        onValueChange={onChange}
      />
      <View style={styles.checkboxTextWrapper}>
        <Text style={[styles.checkboxText, style]}>
          I Agree to <AgreementLinks agreement={agreement} theme={theme} />
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  smallSwitch: {
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }],
    flexShrink: 0,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  checkboxTextWrapper: {
    flex: 1,
  },
  link: {
    color: colors.secondary,
  },
  checkboxText: {
    fontSize: 13.5,
  },
});
