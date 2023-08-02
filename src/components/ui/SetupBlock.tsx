import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from 'native-base';
import colors from '@constants/Colors';
import BlockSwitch from '@components/ui/BlockSwitch';

type SetupBlockProps = {
  title: string;
  description: string;
  instructions: string;
  optional: boolean;
  completed: boolean;
  loading: boolean;
};

export default class SetupBlock extends Component<SetupBlockProps> {
  static defaultProps = {
    button: {},
    optional: false,
  };

  constructor(props: SetupBlockProps) {
    super(props);
  }

  render() {
    const {
      title,
      description,
      completed,
      loading,
      instructions,
      optional,
      children,
      ...props
    } = this.props;
    return (
      <View style={styles.wrapper}>
        <View style={styles.instructionsWrapper}>
          {!!instructions && (
            <Text style={styles.boldText}>{instructions}</Text>
          )}
        </View>
        <BlockSwitch
          type='primary'
          light
          value={completed || loading}
          subLabel={optional ? '(Optional)' : undefined}
          unclickable={loading || completed}
          loading={loading}
          {...props}>
          {title}
        </BlockSwitch>
        {!completed && (
          <View style={styles.detailsWrapper}>
            {children}
            <Text style={styles.text}>{description}</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 15,
  },
  instructionsWrapper: {
    paddingHorizontal: '5%',
  },
  detailsWrapper: {
    paddingHorizontal: '5%',
    paddingTop: 15,
  },
  text: {
    color: colors.white,
  },
  boldText: {
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
