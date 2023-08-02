import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ViewStyle,
  ViewToken,
  ListRenderItemInfo,
  SectionListProps,
} from 'react-native';
import { Text, View, ListItem } from 'native-base';

import colors from '@constants/Colors';
import MatchListItem from '@components/ui/MatchListItem';
import MatchListHeader, {
  MatchListHeaderTitle,
} from '@components/ui/MatchListHeader';
import { connect, ConnectedProps } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import MatchListEmpty from '@components/ui/MatchListEmpty';
import MatchesCollection from '@models/MatchesCollection';
import Match from '@models/Match';
import { NavigationScreenProp } from 'react-navigation';
import { RootState } from '@reducers/index';

export type MatchListItemData =
  | Match
  | MatchListItemComponent
  | MatchListItemHeader;

export type MatchGroupListItemData = {
  item: Match;
  index: number;
};

export interface MatchListViewToken extends Omit<ViewToken, 'item'> {
  item: MatchListItemData;
}

type MatchListItemHeader = {
  id: string;
  title: MatchListHeaderTitle;
  isHeader: boolean;
  groupItems: MatchGroupListItemData[];
};

type MatchListItemComponent = {
  id: string;
  component: React.ReactNode;
};

type ListGroup = {
  title: MatchListHeaderTitle;
  parameters?: (match: Match) => boolean;
  sort?: (a: Match, b: Match, state?: State) => number;
  renderEmpty?: (group: ListGroup, index: number) => React.ReactNode;
  emptyText?: string | React.ReactNode;
  showWhenEmpty?: boolean;
  matches?: Match[];
};

type State = {
  headerIndices: number[];
  items: MatchListItemData[];
  viewableItems: MatchListViewToken[];
};

type Props = {
  groups: ListGroup[];
  style?: ViewStyle;
  refreshTitle?: string;
  onRefresh?: () => void;
  emptyHeader?: string;
  emptyBody?: string | React.ReactNode;
  emptyIcon?: string;
  loadMoreTitle?: string;
  navigation: NavigationScreenProp<{}>;
} & ConnectedProps<typeof connector> &
  Partial<DefaultProps> &
  Pick<
    SectionListProps<MatchListItemData>,
    'onEndReached' | 'onEndReachedThreshold'
  >;

type DefaultProps = {
  disabled: boolean;
  refreshing: boolean;
  loadingMore: boolean;
};

class MatchList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.onViewableItemsChanged = this.onViewableItemsChanged.bind(this);
  }

  static defaultProps: DefaultProps = {
    disabled: false,
    refreshing: false,
    loadingMore: false,
  };

  state: State = {
    headerIndices: [],
    items: [],
    viewableItems: [],
  };

  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 20,
    minimumViewTime: 50,
  };

  componentWillMount() {
    const { matches } = this.props;

    this.updateItems(matches);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { matches, groups } = this.props;

    let changed = !(
      groups.length === nextProps.groups.length &&
      matches.matches == nextProps.matches.matches
    );

    if (!changed) {
      const changedGroups = nextProps.groups.filter((g, i) => {
        let group = groups[i];

        if (group) {
          return !(g.title === group.title && g.matches === group.matches);
        } else {
          return false;
        }
      });
      changed = changedGroups.length > 0;
    }

    if (changed) {
      this.updateItems(nextProps.matches);
    }
  }

  onViewableItemsChanged({
    viewableItems,
  }: {
    viewableItems: MatchListViewToken[];
  }) {
    this.setState({ viewableItems });
  }

  updateItems(matches: MatchesCollection) {
    const { groups } = this.props;

    let items: MatchListItemData[] = [],
      headerIndices: number[] = [];

    for (const group of groups) {
      let groupItems = group.matches || matches;

      groupItems = group.parameters
        ? groupItems.filter(group.parameters)
        : Array.isArray(groupItems)
        ? groupItems
        : [];

      if (group.sort) {
        groupItems = groupItems.sort((a, b) => group.sort!(a, b));
      }

      if (groupItems.length > 0 || group.showWhenEmpty) {
        let index: number = items.length,
          groupItemList = groupItems.map((item, i) => {
            // index in full list will start at the current length of the list, we will add the index from it's group, and add 1 to account for the header
            let itemIndex = index + i + 1;
            return {
              item,
              index: itemIndex,
            };
          }),
          headerId: string = `${group.title}_${index}`,
          emptyId: string = `${group.title}_empty_${index}`;

        headerIndices.push(index);

        items.push({
          id: headerId,
          title: group.title,
          isHeader: true,
          groupItems: groupItemList,
        });
        if (groupItems.length > 0) {
          items.push(...groupItems);
        } else if (group.renderEmpty) {
          items.push({
            id: emptyId,
            component: group.renderEmpty(group, index),
          });
        } else if (group.emptyText) {
          items.push({
            id: emptyId,
            component: <MatchListEmpty body={group.emptyText} />,
          });
        }
      }
    }

    this.setState({ items, headerIndices });
  }

  keyExtractor(item: MatchListItemData) {
    return `match-list-${item.id}`;
  }

  renderItem({ item }: ListRenderItemInfo<MatchListItemData>) {
    const { refreshing, navigation, disabled } = this.props;

    if ('isHeader' in item) {
      const { viewableItems } = this.state;

      return (
        <MatchListHeader
          title={item.title}
          viewableItems={viewableItems}
          groupItems={item.groupItems}
        />
      );
    } else if ('component' in item) {
      return <ListItem>{item.component}</ListItem>;
    } else if (item instanceof Match) {
      return (
        <MatchListItem
          match={item}
          disabled={disabled}
          refreshing={refreshing}
          navigation={navigation}
        />
      );
    } else {
      return null;
    }
  }

  renderFooter({ item }: ListRenderItemInfo<MatchListItemData>) {
    const { loadingMore, loadMoreTitle } = this.props;

    return loadingMore ? (
      <View style={styles.loadMore}>
        <ActivityIndicator color={colors.gray} />
        <Text style={styles.loadMoreText}>{loadMoreTitle}</Text>
      </View>
    ) : null;
  }

  renderListEmpty() {
    const { emptyHeader, emptyBody, emptyIcon, refreshing, refreshTitle } =
      this.props;

    if (refreshing) {
      return <MatchListHeader title={refreshTitle || 'Loading...'} center />;
    } else {
      return (
        <View>
          <MatchListHeader
            title={emptyHeader || 'Sorry!'}
            icon={
              <Icon
                name={emptyIcon || 'md-rainy'}
                size={20}
                color={colors.white}
              />
            }
          />
          <MatchListEmpty body={emptyBody || 'No Matches Found'} />
        </View>
      );
    }
  }

  render() {
    const { refreshing, refreshTitle, onRefresh, style, ...props } = this.props;
    const { headerIndices, items } = this.state;

    return (
      <FlatList
        {...props}
        data={items}
        refreshing={refreshing}
        keyExtractor={this.keyExtractor.bind(this)}
        ListEmptyComponent={this.renderListEmpty.bind(this)}
        ListFooterComponent={this.renderFooter.bind(this)}
        renderItem={this.renderItem.bind(this)}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={this.viewabilityConfig}
        stickyHeaderIndices={headerIndices}
        refreshControl={
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            title={items.length > 0 ? refreshTitle : undefined}
            colors={[colors.white]}
            tintColor={colors.white}
            titleColor={colors.white}
            style={styles.refreshControl}
          />
        }
        style={[styles.list, style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.white,
  },
  refreshControl: {
    backgroundColor: colors.darkGray,
    shadowColor: colors.darkGray,
    shadowRadius: 0,
    shadowOpacity: 1,
    shadowOffset: {
      height: 20,
      width: 0,
    },
  },
  loadMore: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadMoreText: {
    textAlign: 'center',
    color: colors.gray,
    fontSize: 14,
    marginTop: 4,
  },
});

const connector = connect(({ matchReducer }: RootState) => ({
  matches: matchReducer.matches,
}));

export default connector(MatchList);
