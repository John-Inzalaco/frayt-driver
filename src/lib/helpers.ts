import moment, { Moment } from 'moment';
import CodePush from 'react-native-code-push';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Region = Coordinates & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export function upsertArray<T>(array: T[], key: keyof T, element: T): T[] {
  const i = array.findIndex((_element) => _element[key] === element[key]);

  if (i > -1) {
    array[i] = element;
  } else {
    array.push(element);
  }

  return array;
}

export function titleCase(string: string) {
  let sentence = string.toLowerCase().split(/[\s_]/);
  for (let i = 0; i < sentence.length; i++) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }

  return sentence.join(' ');
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// https://github.com/react-native-community/react-native-maps/issues/505#issuecomment-243423775
export function getRegionForCoordinates(
  points: Coordinates[],
  padding: number,
): Region {
  // padding should be a fraction, ie .1 is 10% padding
  padding = padding ? padding : 0;
  // points should be an array of { latitude: X, longitude: Y }
  let minX: number, maxX: number, minY: number, maxY: number;

  // init first point
  ((point) => {
    minX = point.latitude;
    maxX = point.latitude;
    minY = point.longitude;
    maxY = point.longitude;
  })(points[0]);

  // calculate rect
  points.map((point) => {
    minX = Math.min(minX, point.latitude);
    maxX = Math.max(maxX, point.latitude);
    minY = Math.min(minY, point.longitude);
    maxY = Math.max(maxY, point.longitude);
  });

  const paddingX = Math.abs(maxX - minX) * padding;
  const paddingY = Math.abs(maxY - minY) * padding;

  minX -= paddingX;
  minY -= paddingY;
  maxX += paddingX;
  maxY += paddingY;

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = maxX - minX;
  const deltaY = maxY - minY;

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX,
    longitudeDelta: deltaY,
  };
}

export function uniqId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function generalLocationFormat(address: GeoAddress) {
  return `${address.neighborhood ? address.neighborhood + ', ' : ''}${
    address.city
  }, ${address.state_code}`;
}

export async function getAppVersion() {
  const [{ appVersion }, revision] = await Promise.all([
    CodePush.getConfiguration(),
    getRevision(),
  ]);

  return revision ? `v${appVersion} rev.${revision}` : `v${appVersion}`;
}

export async function getRevision() {
  const update = await CodePush.getUpdateMetadata();

  if (update) {
    return update.label.substring(1);
  }

  return null;
}

export async function getAppRevision(): Promise<string> {
  const update = await CodePush.getUpdateMetadata();

  return update?.label || '';
}

export function dateIsExpired(date: string | Moment | undefined): boolean {
  if (!date) return true;
  const today = moment().startOf('day');
  const referenceDate = moment(date).startOf('day');

  return today.isAfter(referenceDate);
}
