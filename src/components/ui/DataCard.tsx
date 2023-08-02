import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { CardItem, Body, Text } from 'native-base';
import colors, { colorObjs } from '@constants/Colors';
import ActionButton from '@components/ui/ActionButton';
import Communications from 'react-native-communications';

export type DataCardItem = {
  label: TextContent;
  name?: TextContent;
  content?: TextContent;
  phone?: Nullable<string>;
  width?: 'full';
};

type TextContent = string | number | null | Element;

type DataCardProps = {
  title: Nullable<string | Element>;
  items: DataCardItem[];
  viewMode: boolean;
  columns: number;
  headerColor: string;
};

export default class DataCard extends Component<DataCardProps> {
  constructor(props: DataCardProps) {
    super(props);
  }

  static defaultProps = {
    headerColor: colors.lightGray,
    viewMode: false,
    columns: 1,
    items: [],
  };

  getItemWidth() {
    const { columns } = this.props;

    let percentage = 99.99 / (columns > 0 ? columns : 1);

    return `${percentage}%`;
  }

  renderItems() {
    const { items, viewMode } = this.props,
      itemStyle = { width: this.getItemWidth() },
      itemStyleFull = { width: '100%' };

    if (items) {
      if (!viewMode) {
        return items.map((item, index) => (
          <CardItem
            style={[
              styles.item,
              item.width === 'full' ? itemStyleFull : itemStyle,
            ]}
            bordered
            key={index}>
            <Body>
              <Text style={styles.itemLabel}>{item.label}</Text>
              {item.name && (<View style={styles.itemWrapper}>
                <Text style={styles.itemContent} selectable={true}>
                  {item.name || '-'}
                </Text>
              </View>)}
              <View style={styles.itemWrapper}>
                <Text style={styles.itemContent} selectable={true}>
                  {item.content || '-'}
                </Text>
              </View>
              {!!item.phone && (
                <View style={styles.itemWrapper}>
                  <ActionButton
                    size='medium'
                    label='Call'
                    style={{ marginRight: 8, marginTop: 10 }}
                    onPress={() => {
                      Communications.phonecall(item.phone, true);
                    }}
                  />
                  <ActionButton
                    size='medium'
                    label='Text'
                    style={{ marginLeft: 8, marginTop: 10 }}
                    onPress={() => {
                      Communications.text(item.phone, '');
                    }}
                  />
                </View>
              )}
            </Body>
          </CardItem>
        ));
      } else {
        return items.map((item, index) => (
          <CardItem style={[styles.item, itemStyle]} bordered key={index}>
            <Body>
              {item.label && <Text style={styles.itemLabel}>{item.label}</Text>}
              <View style={styles.itemWrapper}>
                <View style={styles.itemContent}>{item.content}</View>
              </View>
            </Body>
          </CardItem>
        ));
      }
    }
  }

  render() {
    const { title, headerColor } = this.props;

    return (
      <View style={styles.card}>
        <CardItem
          style={[
            styles.header,
            {
              backgroundColor: headerColor,
            },
          ]}
          header
          bordered>
          <Text style={styles.headerText}>{title}</Text>
        </CardItem>
        <View style={styles.container}>{this.renderItems()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // if you want to fill rows left to right
  },
  bodyBold: {
    width: '100%',
    color: colors.gray,
  },
  card: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 3,
  },
  header: {
    borderBottomColor: colors.secondary,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  item: {
    backgroundColor: colors.offWhite,
    borderColor: colors.white,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: colorObjs.gray.lighten(0.6).hex(),
    borderTopWidth: 0,
  },
  itemContent: {
    width: '100%',
    flex: 1,
    flexWrap: 'wrap',
  },
  itemLabel: {
    width: '100%',
    color: colors.gray,
  },
  itemWrapper: {
    flexDirection: 'row',
  },
});
