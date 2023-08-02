import React, { Component } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  ViewStyle,
} from 'react-native';
import { Card, CardItem, Text } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '@constants/Colors';

const springAnimationProperties = {
  type: 'spring',
  springDamping: 0.6,
  property: 'opacity',
};

const animationConfig = {
  duration: 650,
  // create: springAnimationProperties,
  update: springAnimationProperties,
  delete: springAnimationProperties,
};

type Props = {
  loadingText?: string | Text;
  header?: string | Text;
  icon?: string;
  innerStyle?: ViewStyle;
} & Partial<DefaultProps>;

type DefaultProps = {
  headerColor: string;
  loading: boolean;
  isRow: boolean;
};

export default class CardSingle extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  static defaultProps: DefaultProps = {
    headerColor: colors.lightGray,
    loading: false,
    isRow: false,
  };

  layoutAnimationActive = false;

  layoutAnimation() {
    if (!this.layoutAnimationActive) {
      this.layoutAnimationActive = true;
      LayoutAnimation.configureNext(animationConfig, () => {
        this.layoutAnimationActive = false;
      });
    }
  }

  render() {
    const {
      isRow,
      children,
      loading,
      loadingText,
      headerColor,
      header,
      icon,
      innerStyle,
    } = this.props;
    let bodyStyle, data;

    if (loading) {
      bodyStyle = styles.bodyLoading;
      data = [
        <ActivityIndicator
          size='small'
          style={styles.loadingIndicator}
          color={colors.gray}
        />,
        <Text style={styles.loadingText}>{loadingText}</Text>,
      ];
    } else {
      if (isRow) {
        bodyStyle = styles.bodyLoadedRow;
      }
      data = children;
      this.layoutAnimation();
    }

    return (
      <Card style={styles.card}>
        <CardItem
          header
          bordered
          style={[styles.header, { backgroundColor: headerColor }]}>
          <Text style={styles.headerText}>
            {icon && (
              <Ionicons name={icon} size={16} color={colors.secondary} />
            )}{' '}
            {header}
          </Text>
        </CardItem>
        <CardItem bordered style={[styles.body, bodyStyle, innerStyle]}>
          {data}
        </CardItem>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  header: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: colors.secondary,
    borderBottomWidth: 4,
  },
  headerText: {
    color: colors.secondary,
    fontSize: 17,
  },
  icon: {
    color: colors.secondary,
    fontSize: 19,
  },
  body: {
    padding: 15,
    paddingBottom: 15,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'column',
    backgroundColor: colors.offWhite,
  },
  bodyLoadedRow: {
    flexDirection: 'row',
  },
  bodyLoading: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: colors.gray,
  },
});
