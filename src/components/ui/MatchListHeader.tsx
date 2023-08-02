import React, { PureComponent } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { ListItem, Text } from 'native-base';
import { connect } from 'react-redux';
import colors from '@constants/Colors';

import {
  MatchGroupListItemData,
  MatchListItemData,
  MatchListViewToken,
} from '@components/ui/MatchList';

type State = {
  firstVisibleGroupItem: Nullable<MatchListItemData>;
  title: Nullable<string>;
};

export type MatchListHeaderTitle =
  | string
  | ((args: { [key: string]: any }) => string);

type Props = {
  title: MatchListHeaderTitle;
  icon?: Element;
} & Partial<DefaultProps>;

type DefaultProps = {
  groupItems: MatchGroupListItemData[];
  viewableItems: MatchListViewToken[];
  center: boolean;
};

class MatchListHeader extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    viewableItems: [],
    groupItems: [],
    center: false,
  };

  state = {
    firstVisibleGroupItem: null,
    title: null,
  };

  componentDidMount() {
    this.setState({
      firstVisibleGroupItem: this.getFirstVisibleGroupItem(),
      title: this.getTitle(),
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const { firstVisibleGroupItem, title } = this.state;
    const updatedFirstVisibleGroupItem =
      this.getFirstVisibleGroupItem(nextProps);
    const updatedTitle = this.getTitle();

    if (updatedFirstVisibleGroupItem !== firstVisibleGroupItem) {
      this.setState({ firstVisibleGroupItem: updatedFirstVisibleGroupItem });
    }

    if (updatedTitle && updatedTitle !== title) {
      this.setState({ title: updatedTitle });
    }
  }

  getTitle() {
    const { title, ...props } = this.props;
    const args = { props, ...this.state };

    return title instanceof Function ? title(args) : title;
  }

  getFirstVisibleGroupItem(
    props: Props = this.props,
  ): Nullable<MatchListItemData> {
    const { groupItems, viewableItems } = props;

    if (Array.isArray(groupItems) && Array.isArray(viewableItems)) {
      if (groupItems.length > 0 && viewableItems.length > 0) {
        const groupIndexes = groupItems.map(({ index }) => index),
          viewableGroupItems = viewableItems.filter(({ index }) =>
            groupIndexes.includes(index || -1),
          );

        let firstVisibleGroupItem: Nullable<MatchListItemData> = null;

        if (viewableGroupItems.length > 0) {
          firstVisibleGroupItem = viewableGroupItems[0].item;
        } else {
          firstVisibleGroupItem = groupItems[0]?.item;
        }

        return firstVisibleGroupItem;
      }
    }
    return null;
  }

  render() {
    const { title } = this.state;
    const { icon, center } = this.props;

    return (
      <ListItem
        itemHeader
        style={[
          title ? styles.header : styles.hiddenHeader,
          center ? styles.center : null,
        ]}>
        <Text style={[styles.headerText]}>
          {icon} {title}
        </Text>
      </ListItem>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.darkGray,
    height: 51,
  },
  hiddenHeader: {
    display: 'none',
  },
  headerText: {
    color: colors.secondaryText,
    fontWeight: 'bold',
    fontSize: 19,
    height: 51,
    paddingTop: 28,
    marginTop: Platform.OS === 'android' ? -20 : -20,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connect((state) => ({}))(MatchListHeader);
