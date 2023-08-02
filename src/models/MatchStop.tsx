import { Moment } from 'moment';
import { momentFromJson } from '@lib/JsonConversion';
import { Contact } from './Contact';
import MatchStopItem, { MatchStopItemData } from './MatchStopItem';
import BarcodeReading, {
  BarcodeReadingType,
  NewBarcodeReading,
} from './BarcodeReading';

export enum SignatureType {
  Electronic = 'electronic',
  Photo = 'photo',
}

export type MatchStopState =
  | 'pending'
  | 'en_route'
  | 'arrived'
  | 'signed'
  | 'delivered'
  | 'undeliverable';

export type MatchStopData = {
  state: MatchStopState;
  id: string;
  delivery_notes: Nullable<string>;
  driver_tip: Nullable<number>;
  signature_photo: Nullable<string>;
  destination_photo: Nullable<string>;
  destination_photo_required: boolean;
  has_load_fee: boolean;
  signature_required: boolean;
  signature_type: SignatureType;
  signature_instructions: string;
  needs_pallet_jack: boolean;
  index: number;
  recipient: Nullable<Contact>;
  self_recipient: boolean;
  destination_address: GeoAddress;
  items: MatchStopItemData[];
  dropoff_by: Nullable<Moment | string>;
  po: Nullable<string>;
};

export default class MatchStop
  implements
    Modify<
      MatchStopData,
      {
        dropoff_by: Nullable<Moment>;
        items: MatchStopItem[];
      }
    >
{
  state;
  id;
  delivery_notes;
  driver_tip;
  signature_photo;
  signature_required;
  signature_type;
  signature_instructions;
  destination_photo;
  destination_photo_required;
  has_load_fee;
  index;
  recipient;
  destination_address;
  self_recipient;
  needs_pallet_jack;
  dropoff_by;
  po;
  items: MatchStopItem[] = [];

  constructor(data: MatchStopData) {
    this.state = data.state;
    this.id = data.id;
    this.delivery_notes = data.delivery_notes;
    this.driver_tip = data.driver_tip;
    this.signature_photo = data.signature_photo;
    this.signature_required = data.signature_required;
    this.signature_type = data.signature_type;
    this.signature_instructions = data.signature_instructions;
    this.destination_photo = data.destination_photo;
    this.destination_photo_required = data.destination_photo_required;
    this.has_load_fee = data.has_load_fee;
    this.needs_pallet_jack = data.needs_pallet_jack;
    this.index = data.index;
    this.recipient = data.recipient;
    this.destination_address = data.destination_address;
    this.items = data.items.map((item: MatchStopItemData) => {
      return new MatchStopItem(item, data.id);
    });
    this.self_recipient = data.self_recipient;
    this.dropoff_by = momentFromJson(data.dropoff_by);
    this.po = data.po;
  }

  getDropoffBy() {
    if (this.dropoff_by) {
      // A specific pickup time has been scheduled
      return (
        this.dropoff_by.format('MMMM D, h:mm a z') +
        ' (' +
        this.dropoff_by.fromNow() +
        ')'
      );
    } else {
      // No specific time requested; ASAP
      return 'ASAP';
    }
  }

  isEnRouteToggleable(): boolean {
    return ['pending', 'en_route'].includes(this.state);
  }

  neededBarcodes(type: BarcodeReadingType): NewBarcodeReading[] {
    return this.items
      .map((i) => i.neededBarcode(type) as NewBarcodeReading)
      .filter((b) => b);
  }
}
