import { momentFromJson } from '@lib/JsonConversion';
import { Moment } from 'moment';
import { Image } from 'react-native-image-crop-picker';
import MatchStopItem from './MatchStopItem';

export type BarcodeReadingState = 'captured' | 'missing';

export type BarcodeReadingType = 'pickup' | 'delivery';

export type NewBarcodeReading = {
  type: BarcodeReadingType;
  state: BarcodeReadingState;
  photo: Nullable<Image>;
  barcode: Nullable<string>;
  item: MatchStopItem;
};

export type BarcodeReadingData = {
  type: BarcodeReadingType;
  state: BarcodeReadingState;
  photo: Nullable<string>;
  barcode: Nullable<string>;
  inserted_at: Nullable<Moment | string>;
};

export default class BarcodeReading
  implements Modify<BarcodeReadingData, { inserted_at: Nullable<Moment> }>
{
  type;
  state;
  photo;
  barcode;
  inserted_at;

  constructor(data: BarcodeReadingData) {
    this.type = data.type;
    this.state = data.state;
    this.photo = data.photo;
    this.barcode = data.barcode;
    this.inserted_at = momentFromJson(data.inserted_at);
  }
}
