declare type GeoAddress = {
  formatted_address: string;
  lat: number;
  lng: number;
  address: string;
  address2: Nullable<string>;
  city: string;
  state: string;
  state_code: string;
  neighborhood: string;
  zip: string;
  country: string;
  name: string | null;
};

declare type GPSCoordinates = {
  latitude: number;
  longitude: number;
};
