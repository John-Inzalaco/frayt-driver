import AsyncStorage from '@react-native-community/async-storage';
import { Moment } from 'moment';
import { momentFromJson } from '@lib/JsonConversion';
import { dateIsExpired } from '@lib/helpers';

const DRIVER_STORAGE_KEY = 'user';

export type UserState =
  | 'registered'
  | 'approved'
  | 'rejected'
  | 'applying'
  | 'pending_approval';

export type ScheduleOptState = 'opted_out' | 'opted_in' | 'pending_approval';
export type DocumentState = 'pending_approval' | 'rejected' | 'approved';
export enum DocumentType {
  License = 'license',
  Registration = 'registration',
  Insurance = 'insurance',
  Profile = 'profile',
  PassengersSide = 'passengers_side',
  DriverSide = 'drivers_side',
  CargoArea = 'cargo_area',
  Front = 'front',
  Back = 'back',
  VehicleType = 'vehicle_type',
  CarrierAgreement = 'carrier_agreement',
}

export type Driver = DriverData & DriverCalcProps;

type DriverCalcProps = {
  has_cargo_capacity: boolean;
  has_wallet: boolean;
  vehicle_icon: string;
  is_accepting_schedule_opportunities: boolean;
  profile_image: Nullable<string>;
};

export type AgreementDocument = {
  id: string;
  title: string;
  type: string;
  url: string;
  support_documents: AgreementDocument[];
};

export type Vehicle = {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_class: 1 | 2 | 3 | 4;
  lift_gate: boolean;
  pallet_jack: boolean;
  images: Document[];
  capacity_dismissed_at: Nullable<number>;
  capacity_between_wheel_wells: Nullable<number>;
  capacity_door_height: Nullable<number>;
  capacity_door_width: Nullable<number>;
  capacity_height: Nullable<number>;
  capacity_length: Nullable<number>;
  capacity_weight: Nullable<number>;
  capacity_width: Nullable<number>;
};

export type DriverLocation = {
  id: string;
  created_at: Nullable<Moment>;
  lat: number;
  lng: number;
};

type JsonDriverLocation = {
  created_at: Nullable<string>;
} & DriverLocation;

export type DriverData = {
  vehicle: Nullable<Vehicle>;
  default_device_id: string;
  devices: Device[];
  images: Document[];
  address: GeoAddress;
  current_location: Nullable<DriverLocation>;
  can_load: boolean;
  id: string;
  fountain_id: Nullable<string>;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: Nullable<string>;
  profile_image: Nullable<string>;
  wallet_state: Nullable<string>;
  schedule_opt_state: ScheduleOptState;
  accepted_schedules: Schedule[];
  rejected_schedules: Schedule[];
  password_reset_code: false;
  state: UserState;
  rating: number;
  shipper_rating: number;
  activity_rating: number;
  fulfillment_rating: number;
  sla_rating: number;
  pending_agreements: AgreementDocument[];
  license_number: Nullable<string>;
};

export interface Reports {
  days_30?: number;
  days_90?: number;
}

export interface Schedule {
  id: string;
  sla: number;
  sunday: Nullable<string>;
  monday: Nullable<string>;
  tuesday: Nullable<string>;
  wednesday: Nullable<string>;
  thursday: Nullable<string>;
  friday: Nullable<string>;
  saturday: Nullable<string>;
  location: Nullable<DriverLocation>;
}

export interface Device {
  id: string;
  device_uuid: string;
  device_model: string;
  player_id: string;
  os: string;
  os_version: string;
  is_tablet: boolean;
  is_location_enabled: boolean;
  driver_id: string;
}

export interface Document {
  id?: string;
  document?: string;
  expires_at?: string;
  notes?: string;
  state?: DocumentState;
  type: DocumentType;
}

const User = {
  new: (driver: Driver | DriverData): Driver => {
    const calcProps: DriverCalcProps = {
      has_cargo_capacity: User.hasCargoCapacity(driver),
      has_wallet: User.hasWallet(driver),
      vehicle_icon: User.getVehicleIcon(driver),
      is_accepting_schedule_opportunities:
        User.isAcceptingScheduleOpportunities(driver),
      profile_image: User.getProfileImage(driver),
    };
    return {
      ...driver,
      ...calcProps,
      vehicle: Vehicle.new(driver.vehicle),
      current_location: User.currentLocationFromJson(
        driver.current_location as JsonDriverLocation,
      ),
    };
  },
  updateUser: (driverProps: Driver | DriverData) => {
    const driver = User.new(driverProps);

    User.saveToStorage(driver);

    return driver;
  },
  saveToStorage: async (driver: Driver) => {
    if (Object.keys(driver).length > 0) {
      try {
        await AsyncStorage.setItem(DRIVER_STORAGE_KEY, JSON.stringify(driver));
      } catch (e) {
        console.warn(e);
      }
    }
  },
  getFromStorage: async (): Promise<Driver> => {
    const driverData = await AsyncStorage.getItem(DRIVER_STORAGE_KEY);
    const driver = driverData ? User.new(JSON.parse(driverData) as Driver) : {};

    return driver as Driver;
  },
  currentLocationFromJson: (
    current_location: Nullable<JsonDriverLocation>,
  ): Nullable<DriverLocation> => {
    if (!current_location) {
      return null;
    } else {
      return {
        ...current_location,
        created_at: momentFromJson(current_location.created_at),
      };
    }
  },
  getProfileImage: (user: Driver | DriverData) => {
    if (user.images && user.images.length > 0) {
      const profile_image = user.images.find((image) => {
        return (
          image.type === DocumentType.Profile && image.state !== 'rejected'
        );
      });

      if (profile_image && profile_image.document) {
        return profile_image.document;
      }
    }
    return null;
  },
  getVehicleIcon: (user: Driver | DriverData) => {
    let vehicleIcon = 'truck-moving';
    switch (user.vehicle?.vehicle_class) {
      case 1:
        vehicleIcon = 'car';
        break;
      case 2:
        vehicleIcon = 'truck-pickup';
        break;
      case 3:
        vehicleIcon = 'shuttle-van';
        break;
      case 4:
        vehicleIcon = 'truck-moving';
        break;
      default:
        vehicleIcon = 'car';
        break;
    }

    return vehicleIcon;
  },
  hasCargoCapacity: (user: Driver | DriverData) => {
    return !!(
      user &&
      user.vehicle &&
      user.vehicle.capacity_height &&
      user.vehicle.capacity_length &&
      user.vehicle.capacity_width &&
      user.vehicle.capacity_door_height &&
      user.vehicle.capacity_door_width &&
      (user.vehicle.vehicle_class !== 3 ||
        (user.vehicle.capacity_between_wheel_wells &&
          user.vehicle.capacity_weight))
    );
  },
  hasWallet: (user: Driver | DriverData) => {
    switch (user.wallet_state) {
      case 'UNCLAIMED':
      case 'ACTIVE':
        return true;
      default:
        return false;
    }
  },
  isAcceptingScheduleOpportunities: (user: Driver | DriverData) => {
    switch (user.schedule_opt_state) {
      case 'pending_approval':
      case 'opted_out':
        return false;
      case 'opted_in':
        return true;
    }
  },
};

const Vehicle = {
  new: (vehicle: Nullable<Vehicle>) => {
    if (!vehicle) return null;

    return {
      ...vehicle,
      capacity_dismissed_at: vehicle.capacity_dismissed_at || 0,
    };
  },
};

export function needsUpdatedDocuments(user: Driver): boolean {
  const vehicleDocs = user.vehicle?.images || [];
  const driverDocs = user.images || [];
  const docs = [...vehicleDocs, ...driverDocs];
  const docsMap = docs.reduce((acc, doc) => {
    return acc.set(doc.type, doc);
  }, new Map<string, Document>());

  const insurance = docsMap.get(DocumentType.Insurance);
  const registration = docsMap.get(DocumentType.Registration);
  const license = docsMap.get(DocumentType.License);

  return (
    dateIsExpired(insurance?.expires_at) ||
    dateIsExpired(registration?.expires_at) ||
    dateIsExpired(license?.expires_at) ||
    docs.some((d) => d.state === 'rejected')
  );
}

export function documentsAwaitingApproval(user: Driver): boolean {
  const vehicleDocs = user.vehicle?.images || [];
  const driverDocs = user.images || [];
  const docs = [...vehicleDocs, ...driverDocs];

  return docs.some((d) => d.state === 'pending_approval');
}

export default User;
