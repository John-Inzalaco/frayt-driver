import { Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import colors from '@constants/Colors';
import Match from '@models/Match';
import { MatchStopItem } from '@models/MatchStop';
import { Driver } from '@models/User';

import DataCard, { DataCardItem } from '@components/ui/DataCard';
import { BP3D } from 'binpackingjs';

interface Props {
  match: Match;
  driver: Driver;
}

export default class MatchCargoDetails extends React.Component<Props> {
  cargoFits(driver: Driver, match: Match) {
    const vehicle = driver?.vehicle;

    if (vehicle) {
      const {
        capacity_length,
        capacity_width,
        capacity_height,
        capacity_weight,
      } = vehicle;
      const { Item, Bin, Packer } = BP3D;
      const bin = new Bin(
        'cargo',
        capacity_length,
        capacity_width,
        capacity_height,
        capacity_weight || 99999,
      );
      const packer = new Packer();
      packer.addBin(bin);

      // don't have cargo dimensions and thus can't calculate if it will fit
      if (!capacity_width || !capacity_height || !capacity_length) return true;

      if (match.hasItems()) {
        match.stops.every(({ items }) =>
          items.map(({ length, width, height, weight }, index) => {
            const item = new Item(
              `item_${index}`,
              length,
              width,
              height,
              weight,
            );
            packer.addItem(item);
          }),
        );
      }
      packer.pack();
      return packer.unfitItems.length === 0;
    } else {
      return true;
    }
  }

  getWarning(): Nullable<DataCardItem> {
    const { driver, match } = this.props;
    if (!this.cargoFits(driver, match)) {
      return {
        label: <Text style={styles.warningHeader}>Warning</Text>,
        content: (
          <Text style={styles.warning}>
            The cargo dimensions are larger than the dimensions you gave for
            your vehicle.
          </Text>
        ),
        width: 'full',
      };
    } else {
      return null;
    }
  }

  formatItem({ width, length, height, weight, volume, pieces }: MatchStopItem) {
    if (width && length && height) {
      return `${pieces} ${pieces == 1 ? 'piece' : 'pieces'} @ ${this.dimensions(
        length,
        width,
        height,
      )} and ${weight}${weight == 1 ? 'lb' : 'lbs'}`;
    } else {
      const cubicFeet = (volume / 1728).toFixed(2);
      return `${pieces} pieces @ ${cubicFeet} cubic ft and ${weight}lbs`;
    }
  }

  dimensions(
    length: Nullable<number>,
    width: Nullable<number>,
    height: Nullable<number>,
  ) {
    return `${length}"x${width}"x${height}"`;
  }

  getCargoDetails(): DataCardItem[] {
    const { match } = this.props;
    let cargoItems: DataCardItem[] = [
      {
        label: `Total Weight`,
        content: match.total_weight + ` lbs`,
      },
    ];

    if (match.isMultiStop()) {
      cargoItems.push({
        label: `Dimensions`,
        content: (match.total_volume / 1728).toFixed(0) + ` ft³`,
      });

      return cargoItems;
    } else {
      if (match.stops[0].items.length > 1) {
        return [
          ...cargoItems,
          ...match.stops[0].items.map(
            (item: MatchStopItem): DataCardItem => ({
              label: item.description,
              content: this.formatItem(item),
              width: 'full',
            }),
          ),
        ];
      } else if (match.hasItems()) {
        const item = match.stops[0].items[0];
        const { length, width, height, weight, description, pieces } = item;
        return [
          ...cargoItems,
          {
            label: 'Dimensions',
            content: this.dimensions(
              length ? length : 1,
              width ? width : 1,
              height ? height : 1,
            ),
          },
          {
            label: 'Weight',
            content: (weight ? weight : 1) + ' lbs', // Older Matches include lbs in the string so parseInt is used to strip that
          },
          {
            label: 'Description',
            content: description,
          },
          {
            label: 'Pieces',
            content: pieces,
          },
        ];
      }
    }

    return [];
  }

  render() {
    // const { match } = this.props;
    const items: DataCardItem[] = this.getCargoDetails();

    const warning = this.getWarning();
    warning && items.push(warning);

    return <DataCard title='Cargo' columns={2} items={items} />;
  }
}

const styles = StyleSheet.create({
  warningHeader: {
    fontWeight: 'bold',
    color: colors.warning,
  },
  warning: {
    color: colors.warning,
  },
});
