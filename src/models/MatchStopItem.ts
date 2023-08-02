import BarcodeReading, {
  BarcodeReadingData,
  BarcodeReadingType,
  NewBarcodeReading,
} from './BarcodeReading';

export type MatchStopItemData = {
  id: string;
  height: Nullable<number>;
  width: Nullable<number>;
  length: Nullable<number>;
  weight: number;
  pieces: number;
  volume: number;
  description: Nullable<string>;
  barcode: Nullable<string>;
  barcode_pickup_required: boolean;
  barcode_delivery_required: boolean;
  barcode_readings: BarcodeReadingData[];
};

export default class MatchStopItem
  implements Modify<MatchStopItemData, { barcode_readings: BarcodeReading[] }>
{
  id;
  height;
  width;
  length;
  weight;
  pieces;
  volume;
  description;
  barcode;
  barcode_pickup_required;
  barcode_delivery_required;
  barcode_readings: BarcodeReading[] = [];
  stop_id: string;

  constructor(data: MatchStopItemData, stop_id: string) {
    this.id = data.id;
    this.height = data.height;
    this.width = data.width;
    this.length = data.length;
    this.weight = data.weight;
    this.pieces = data.pieces;
    this.volume = data.volume;
    this.description = data.description;
    this.barcode = data.barcode;
    this.barcode_pickup_required = data.barcode_pickup_required;
    this.barcode_delivery_required = data.barcode_delivery_required;
    this.stop_id = stop_id;
    this.barcode_readings = data.barcode_readings
      ? data.barcode_readings.map((item: BarcodeReadingData) => {
          return new BarcodeReading(item);
        })
      : [];
  }

  isBarcodeRequired(type: BarcodeReadingType): boolean {
    return (
      (type === 'pickup' && this.barcode_pickup_required) ||
      (type === 'delivery' && this.barcode_delivery_required)
    );
  }

  needsBarcode(type: BarcodeReadingType): boolean {
    return this.isBarcodeRequired(type) && !this.hasBarcodeReading(type);
  }

  neededBarcode(type: BarcodeReadingType): Nullable<NewBarcodeReading> {
    if (this.needsBarcode(type)) {
      return {
        type,
        state: 'missing',
        barcode: null,
        photo: null,
        item: this,
      };
    }

    return null;
  }

  hasBarcodeReading(type: BarcodeReadingType) {
    return !!this.barcodeReading(type);
  }

  barcodeReading(type: BarcodeReadingType): Nullable<BarcodeReading> {
    return this.barcode_readings.find((r) => r.type === type) || null;
  }

  display(): string {
    return `${this.pieces} ${
      this.description ? this.description : 'pieces'
    } @ ${this.length}"x${this.width}"x${this.height}" @ ${this.weight}${
      this.weight === 1 ? 'lb' : 'lbs'
    }`;
  }
}
