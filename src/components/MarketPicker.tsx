import React, { useEffect, useState } from 'react';
import { Text } from 'native-base';
import colors from '@constants/Colors';
import { unauthorizedRequest } from '@lib/Request';
import { StyleSheet } from 'react-native';
import Select from './ui/Select';

type MarketPickerProps = {
  onMarketSelected: (vehicle_types: string[] | []) => void;
  onChange: (market_id: string) => void;
  value: string | null;
};

type Market = {
  id: string;
  region: string | null;
  name: string;
  currently_hiring: string[] | [];
};

const getMarkets = async (): Promise<Market[]> => {
  const http = await unauthorizedRequest();
  const request = await http.get('markets');
  return request.data.response;
};

export function MarketPicker({
  onMarketSelected,
  onChange,
  value,
}: MarketPickerProps) {
  const [region, setRegion] = useState<string | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [regions, setRegions] = useState<(string | null)[]>([]);

  const updateMarket = (m: string) => {
    onChange(m);
    const market = markets.find((market) => market.id == m);
    onMarketSelected(market?.currently_hiring || []);
  };

  useEffect(() => {
    getMarkets().then((updatedMarkets) => {
      setMarkets(updatedMarkets);

      let updatedRegions = updatedMarkets.map((m) => m.region);

      updatedRegions = [...new Set(updatedRegions)];

      setRegions(updatedRegions);
    });
  }, []);

  return (
    <>
      <Text style={styles.label}>State</Text>
      <Select
        value={region}
        placeholder={{
          label: 'Select your state...',
          value: '',
        }}
        items={regions.map((r) => ({ label: r || 'Other', value: r }))}
        onValueChange={(r) => setRegion(r)}
      />

      <Text style={styles.label}>Market</Text>
      <Select
        value={value}
        placeholder={{
          label: 'Select your closest market...',
          value: '',
        }}
        items={markets
          .filter((m) => m.region === region)
          .map((m) => ({ label: `${m.name}, ${m.region}`, value: m.id }))}
        onValueChange={(m) => updateMarket(m)}
        disabled={!region}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.white,
  },
  text: {
    color: colors.secondaryText,
    marginBottom: 12,
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 20,
  },
});
