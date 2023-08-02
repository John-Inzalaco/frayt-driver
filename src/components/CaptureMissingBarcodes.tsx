import React from 'react';
import colors from '@constants/Colors';
import Match from '@models/Match';
import { Text, View } from 'native-base';
import { StyleSheet, ViewProps } from 'react-native';
import { Image } from 'react-native-image-crop-picker';
import MatchPhotoCropper from './ui/MatchPhotoCropper';
import ActionButton from './ui/ActionButton';
import { ScrollView } from 'react-native-gesture-handler';
import { NewBarcodeReading } from '@models/BarcodeReading';

type CaptureMissingBarcodesProps = {
  onChange: (barcodeReadings: NewBarcodeReading[]) => void;
  onFinish: (barcodeReadings: NewBarcodeReading[]) => void;
  barcodeReadings: NewBarcodeReading[];
} & ViewProps;

type CaptureMissingBarcodeProps = {
  onChange: (barcodeReadings: NewBarcodeReading) => void;
  barcodeReading: NewBarcodeReading;
};

export default function CaptureMissingBarcodes({
  barcodeReadings,
  onChange,
  onFinish,
  style,
}: CaptureMissingBarcodesProps) {
  const _renderBarcodeReading = (reading: NewBarcodeReading) => (
    <CaptureMissingBarcode barcodeReading={reading} onChange={_handleChange} />
  );

  const _handleChange = (reading: NewBarcodeReading) => {
    const readings = barcodeReadings.map((r) =>
      r.item.id === reading.item.id ? reading : r,
    );
    onChange(readings);
  };

  const _handleFinish = () => {
    onFinish(barcodeReadings);
  };

  const missingReadings = barcodeReadings.filter(
    ({ state }) => state === 'missing',
  );

  const disabled = missingReadings.filter(({ photo }) => !photo).length > 0;

  return (
    <View style={[styles.container, style]}>
      <ScrollView style={styles.barcodes}>
        {missingReadings.map(_renderBarcodeReading)}
      </ScrollView>
      <ActionButton
        label='Continue'
        block={true}
        onPress={_handleFinish}
        size='large'
        type='secondary'
        disabled={disabled}
      />
    </View>
  );
}

function CaptureMissingBarcode({
  barcodeReading,
  onChange,
}: CaptureMissingBarcodeProps) {
  const _handleChange = (photo: Image) => {
    onChange({ ...barcodeReading, photo });
  };

  return (
    <View style={styles.barcode}>
      <Text style={styles.text}>{barcodeReading.item?.display()}</Text>
      <MatchPhotoCropper
        photo={barcodeReading.photo}
        altIcon='file-alt'
        onPhotoChange={_handleChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barcodes: {
    marginVertical: 15,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
  barcode: {
    alignItems: 'center',
    marginBottom: 30,
  },
  text: {
    color: colors.offWhite,
    fontWeight: '500',
  },
});
