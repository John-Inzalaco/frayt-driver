import moment from 'moment';
import Match, { MatchData } from '@models/Match';
import MatchStop, { MatchStopData } from '@models/MatchStop';
import User, {
  Driver,
  DriverData,
  DriverLocation,
  Vehicle,
} from '@models/User';
import { v4 as uuidv4 } from 'uuid';
import MatchFee, { MatchFeeData } from '@models/MatchFee';
import MatchStopItem, { MatchStopItemData } from '@models/MatchStopItem';

export function MatchFactory(custom_attrs: Partial<MatchData> = {}): Match {
  const attrs: MatchData = {
    id: uuidv4(),
    shortcode: 'ABCDEFG',
    driver_id: null,
    state: 'assigning_driver',
    service_level: '1',
    vehicle_class: 'car',
    vehicle_class_id: '1',
    distance: 1.0,
    total_volume: 1000,
    total_weight: 1000,
    pickup_notes: null,
    sender: null,
    self_sender: true,
    po: null,
    shipper: {
      name: 'John Smith',
      phone: '+10000000000',
    },
    unload_method: null,
    scheduled: false,
    rating: null,
    origin_address: AddressFactory(),
    bill_of_lading_photo: null,
    origin_photo: null,
    origin_photo_required: false,
    driver_total_pay: 2000,
    pickup_at: null,
    dropoff_at: null,
    created_at: moment(),
    accepted_at: null,
    picked_up_at: null,
    completed_at: null,
    stops: [MatchStopFactory()],
    fees: [MatchFeeFactory()],
    ...custom_attrs,
  };

  return new Match(attrs);
}

export function MatchFeeFactory(
  custom_attrs: Partial<MatchFeeData> = {},
): MatchFee {
  return new MatchFee({
    id: uuidv4(),
    type: 'base_fee',
    name: 'Base Fee',
    description: null,
    amount: 2000,
  });
}

export function AddressFactory(
  custom_attrs: Partial<GeoAddress> = {},
): GeoAddress {
  const attrs = {
    formatted_address: '',
    lat: 39.1153633,
    lng: -84.5190226,
    address: '128 W Elder St',
    address2: '',
    city: 'Cincinnati',
    state: 'Ohio',
    state_code: 'OH',
    neighborhood: 'Over-the-Rhine',
    zip: '45202',
    country: 'USA',
    ...custom_attrs,
  };

  attrs.formatted_address = `${attrs.address}${
    attrs.address2 ? attrs.address2 + ' ' : ''
  } ${attrs.city}, ${attrs.state_code}  ${attrs.zip}`;

  return attrs;
}

export function MatchStopFactory(
  attrs: Partial<MatchStopData> = {},
): MatchStop {
  return new MatchStop({
    id: uuidv4(),
    state: 'pending',
    destination_address: AddressFactory({
      address: '1311 Vine St.',
      lat: 39.1098486,
      lng: -84.5176765,
    }),
    delivery_notes: null,
    driver_tip: 200,
    signature_photo: null,
    destination_photo: null,
    destination_photo_required: false,
    has_load_fee: true,
    needs_pallet_jack: false,
    index: 0,
    dropoff_by: null,
    self_recipient: true,
    recipient: null,
    items: [MatchStopItemFactory()],
    ...attrs,
  });
}

export function MatchStopItemFactory(
  attrs: Partial<MatchStopItemData> = {},
): MatchStopItem {
  return new MatchStopItem(
    {
      id: uuidv4(),
      width: 5,
      length: 2,
      height: 10,
      weight: 100,
      pieces: 10,
      volume: 100,
      description: "Big box o' chocolates",
      barcode: null,
      barcode_pickup_required: false,
      barcode_delivery_required: false,
      barcode_readings: [],
      ...attrs,
    },
    uuidv4(),
  );
}

export function DriverFactory(custom_attrs: Partial<DriverData> = {}): Driver {
  const attrs: DriverData = {
    id: uuidv4(),
    address: AddressFactory(),
    current_location: DriverLocationFactory(),
    vehicle: VehicleFactory(),
    can_load: false,
    fountain_id: uuidv4(),
    email: 'driver@frayt.com',
    first_name: 'Baby',
    last_name: 'Driver',
    phone_number: '+11110000000',
    profile_image: null,
    has_wallet: true,
    schedule_opt_state: 'pending_approval',
    accepted_schedules: [],
    rejected_schedules: [],
    pending_agreements: [],
    password_reset_code: false,
    rating: 4,
    sla_rating: 4,
    shipper_rating: 4,
    activity_rating: 4,
    fulfillment_rating: 4,
    state: 'approved',
    ...custom_attrs,
  };
  return User.new(attrs);
}

export function VehicleFactory(attrs: Partial<Vehicle> = {}): Vehicle {
  return {
    id: uuidv4(),
    capacity_dismissed_at: new Date().getTime(),
    capacity_between_wheel_wells: null,
    capacity_door_height: null,
    capacity_door_width: null,
    capacity_height: null,
    capacity_length: null,
    capacity_weight: null,
    capacity_width: null,
    lift_gate: false,
    pallet_jack: false,
    vehicle_make: 'Toyota',
    vehicle_model: 'Corolla',
    vehicle_year: 2016,
    vehicle_class: 1,
    ...attrs,
  };
}

export function DriverLocationFactory(
  attrs: Partial<DriverLocation> = {},
): DriverLocation {
  return {
    id: uuidv4(),
    lat: 39.1098486,
    lng: -84.5176765,
    created_at: moment(),
    ...attrs,
  };
}
