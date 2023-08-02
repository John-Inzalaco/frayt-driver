import moment, { Moment } from 'moment';

import 'moment-timezone';

export function momentFromJson(
  date: Nullable<string | Moment>,
): Nullable<Moment> {
  try {
    if (moment.isMoment(date)) {
      return date;
    } else if (typeof date === 'string') {
      return momentFromString(date);
    } else {
      return null;
    }
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export function dateFromJson(date: Nullable<string | Date>): Nullable<Date> {
  try {
    if (date instanceof Date) {
      return date;
    } else if (typeof date === 'string') {
      return momentFromString(date).toDate();
    } else {
      return null;
    }
  } catch (e) {
    console.warn(e);
    return null;
  }
}

function momentFromString(date: string) {
  const tz = moment.tz.guess();
  return moment.utc(date).tz(tz);
}

export function jsonToJs(value: any, type: string) {
  try {
    switch (type) {
      case 'date':
        value = value ? moment(new Date(value)) : null;
        break;
    }
  } catch (e) {
    value = null;
  }

  value = value === undefined || Number.isNaN(value) ? null : value;

  return value;
}

export function timeToMoment(
  time: Nullable<string | Moment>,
): Nullable<Moment> {
  try {
    if (moment.isMoment(time)) {
      return time;
    } else if (typeof time === 'string') {
      const tz = moment.tz.guess();
      return moment(time, [moment.ISO_8601, 'HH:mm']).tz(tz);
    } else {
      return null;
    }
  } catch (e) {
    console.warn(e);
    return null;
  }
}
