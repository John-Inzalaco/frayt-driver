import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { decode as atob, encode as btoa } from 'base-64';
import moment, { Moment } from 'moment';
import { DBConn } from '@src/db/Database';
import colors from '@constants/Colors';
import store from '@lib/store';
import * as Sentry from '@sentry/react-native';
import { Transaction, ResultSetRowList } from 'react-native-sqlite-storage';
import { momentFromJson } from '@lib/JsonConversion';
import MatchStop, { MatchStopData } from '@models/MatchStop';
import MatchFee, { MatchFeeData } from '@models/MatchFee';
import { titleCase } from '@lib/helpers';
import { Contact } from './Contact';
import { NewBarcodeReading } from './BarcodeReading';
import ServiceLevel from '../constants/ServiceLevel';
import {
  buildMatchSla,
  MatchSLA,
  MatchSLAData,
  SLAType,
} from '@models/MatchSLA';

const LOCALE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
};

export type MatchState =
  | 'canceled'
  | 'driver_canceled'
  | 'admin_canceled'
  | 'pending'
  | 'inactive'
  | 'scheduled'
  | 'assigning_driver'
  | 'accepted'
  | 'en_route_to_pickup'
  | 'arrived_at_pickup'
  | 'picked_up'
  | 'completed'
  | 'charged'
  | 'en_route_to_return'
  | 'arrived_at_return';

export type MatchUnloadMethod = 'lift_gate' | 'dock_to_dock' | null;

const columns = {
  id: 'string',
  shortcode: 'string',
  driver_id: 'string',
  state: 'string',
  bill_of_lading_photo: 'string',
  bill_of_lading_required: 'boolean',
  origin_photo: 'string',
  vehicle_class_id: 'string',
  vehicle_class: 'string',
  service_level: 'string',
  origin_address: 'json',
  distance: 'number',
  total_volume: 'number',
  total_weight: 'number',
  po: 'string',
  pickup_notes: 'string',
  pickup_at: 'date',
  dropoff_at: 'date',
  shipper: 'json',
  created_at: 'date',
  completed_at: 'date',
  accepted_at: 'date',
  picked_up_at: 'date',
  driver_total_pay: 'number',
  rating: 'number',
  origin_photo_required: 'boolean',
  stops: 'json',
};

const columnKeys = Object.keys(columns);

export type MatchData = {
  id: string;
  shortcode: string;
  driver_id: Nullable<string>;
  state: MatchState;
  service_level: ServiceLevel;
  vehicle_class: string;
  vehicle_class_id: string;
  distance: number;
  total_volume: number;
  total_weight: number;
  pickup_notes: Nullable<string>;
  po: Nullable<string>;
  sender: Nullable<Contact>;
  self_sender: boolean;
  shipper: {
    name: string;
    phone: string;
  };
  scheduled: boolean;
  rating: Nullable<string>;
  origin_address: GeoAddress;
  bill_of_lading_required: boolean;
  bill_of_lading_photo: Nullable<string>;
  origin_photo: Nullable<string>;
  origin_photo_required: boolean;
  driver_total_pay: Nullable<number>;
  pickup_at: Nullable<string | Moment>;
  dropoff_at: Nullable<string | Moment>;
  created_at: Nullable<string | Moment>;
  accepted_at: Nullable<string | Moment>;
  picked_up_at: Nullable<string | Moment>;
  completed_at: Nullable<string | Moment>;
  unload_method: MatchUnloadMethod;
  stops: MatchStopData[];
  fees?: MatchFeeData[];
  slas?: MatchSLAData[];
};

export default class Match
  implements
    Modify<
      MatchData,
      {
        pickup_at: Nullable<Moment>;
        dropoff_at: Nullable<Moment>;
        created_at: Nullable<Moment>;
        accepted_at: Nullable<Moment>;
        picked_up_at: Nullable<Moment>;
        completed_at: Nullable<Moment>;
        stops: MatchStop[];
        fees: MatchFee[];
        slas: MatchSLA[];
      }
    >
{
  static liveStates: MatchState[] = [
    'accepted',
    'en_route_to_pickup',
    'arrived_at_pickup',
    'picked_up',
    'en_route_to_return',
    'arrived_at_return',
  ];
  static deliveredStates: MatchState[] = ['completed', 'charged'];
  static pickedUpStates: MatchState[] = ['picked_up', 'completed', 'charged'];
  static enRouteStates: MatchState[] = [
    'en_route_to_pickup',
    'en_route_to_return',
  ];

  id;
  shortcode;
  driver_id;
  state;
  service_level;
  vehicle_class;
  vehicle_class_id;
  distance;
  total_volume;
  total_weight;
  pickup_notes;
  po;
  scheduled;
  shipper;
  rating;
  origin_address;
  sender;
  self_sender;
  bill_of_lading_photo;
  bill_of_lading_required;
  origin_photo;
  origin_photo_required;
  driver_total_pay;
  pickup_at;
  dropoff_at;
  created_at;
  accepted_at;
  picked_up_at;
  completed_at;
  unload_method;
  stops: MatchStop[] = [];
  fees: MatchFee[] = [];
  slas: MatchSLA[] = [];

  constructor(data: MatchData) {
    this.id = data.id;
    this.shortcode = data.shortcode;
    this.driver_id = data.driver_id;
    this.state = data.state;
    this.distance = data.distance;
    this.total_volume = data.total_volume;
    this.total_weight = data.total_weight;
    this.pickup_notes = data.pickup_notes;
    this.po = data.po;
    this.rating = data.rating;
    this.origin_address = data.origin_address;
    this.driver_total_pay = data.driver_total_pay;
    this.service_level = data.service_level;
    this.vehicle_class = data.vehicle_class;
    this.vehicle_class_id = data.vehicle_class_id;
    this.bill_of_lading_photo = data.bill_of_lading_photo;
    this.bill_of_lading_required = data.bill_of_lading_required;
    this.origin_photo = data.origin_photo;
    this.origin_photo_required = data.origin_photo_required;
    this.sender = data.sender;
    this.self_sender = data.self_sender;
    this.scheduled = data.scheduled;
    this.unload_method = data.unload_method;
    this.pickup_at = momentFromJson(data.pickup_at);
    this.dropoff_at = momentFromJson(data.dropoff_at);
    this.created_at = momentFromJson(data.created_at);
    this.accepted_at = momentFromJson(data.accepted_at);
    this.picked_up_at = momentFromJson(data.picked_up_at);
    this.completed_at = momentFromJson(data.completed_at);
    this.stops = data.stops.map((stop: MatchStopData) => new MatchStop(stop));
    this.fees = data.fees?.map((fee: MatchFeeData) => new MatchFee(fee)) || [];
    this.shipper = data.shipper;
    this.slas = data.slas?.map((sla) => buildMatchSla(sla)) || [];
  }

  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  shallowCompare(match: Match) {
    for (const k in match) {
      const key = k as keyof Match;

      if (match[key] !== this[key]) return false;
    }
    return true;
  }

  isAuthorized() {
    const { user, userInitialized } = store.getState().userReducer;

    return !this.driver_id || !userInitialized || this.driver_id === user.id;
  }

  isRecent() {
    // TODO: needs to evaluate
    return false;
  }

  isCanceled() {
    return this.state === 'canceled';
  }

  isPickedUp() {
    return Match.pickedUpStates.includes(this.state);
  }

  isSigned() {
    // TO DO: figure out the logic for this: Where is this used, does it need ALL stops to be signed, or just one?
    return this.stops.some((stop) => stop.state === 'signed');
  }

  isAtPickup() {
    return this.state === 'arrived_at_pickup';
  }

  isAtDropoff() {
    //TO DO: Check where this is used, and see if it needs to know all stops were delivered, or just one. Is this the start of a new stop flow, or does it open up the option to complete the entire match?
    let arrived = false;
    for (let i = 0; i < this.stops.length; i++) {
      if (
        this.stops[i].state === 'arrived' ||
        this.stops[i].state === 'signed'
      ) {
        arrived = true;
      }
    }
    return arrived;
  }

  isAvailable() {
    return this.state === 'assigning_driver';
  }

  isEnRoute(): boolean {
    return (
      this.stops?.some((stop) => stop.state === 'en_route') ||
      Match.enRouteStates.includes(this.state)
    );
  }

  isEnRouteToDropoff() {
    return this.stops?.some((stop) => stop.state === 'en_route');
  }

  isMultiStop(): boolean {
    if (this.stops && this.stops.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  isActionable(): boolean {
    return [
      'en_route_to_pickup',
      'arrived_at_pickup',
      'picked_up',
      'en_route_to_return',
      'arrived_at_return',
    ].includes(this.state);
  }

  isEnRouteToggleable(): boolean {
    return (
      ['accepted', 'en_route_to_pickup'].includes(this.state) ||
      (this.state === 'picked_up' &&
        this.stops.filter((stop) => stop.isEnRouteToggleable()).length > 0)
    );
  }

  isLive(): boolean {
    return Match.liveStates.includes(this.state);
  }

  isComplete(): boolean {
    return Match.deliveredStates.includes(this.state);
  }

  getStatus() {
    let status = null;

    if (this.state) {
      status = this.state;
    } else {
      status = null;
      try {
        throw Error(
          `Unrecognized status for Match ${this.shortcode || this.id} with ${
            this.driver_id
              ? this.driver_id + ' assigned as the driver'
              : 'no driver assigned'
          }.`,
        );
      } catch (err) {
        const match = this;
        Sentry.withScope(function (scope: Sentry.Scope) {
          scope.setExtra('match', match);
          Sentry.captureException(err);
        });
      }
    }

    return status;
  }

  getStatusColor() {
    // Find the status color of the Match
    let color;

    switch (this.state) {
      case 'charged':
      case 'completed':
        color = colors.success;
        break;
      case 'assigning_driver':
        color = colors.primary;
        break;
      case 'pending':
      case 'scheduled':
      case 'canceled':
        color = colors.danger;
        break;
      default:
        color = colors.secondary;
    }

    return color;
  }

  serviceLevel() {
    switch (this.service_level) {
      case ServiceLevel.Dash:
        return 'Dash';
      case ServiceLevel.SameDay:
        return 'Same Day';
      default:
        return 'Dash';
    }
  }

  serviceLevelClass() {
    switch (this.service_level) {
      case ServiceLevel.Dash:
        return 'dash';
      case ServiceLevel.SameDay:
        return 'sameDay';
      default:
        return 'dash';
    }
  }

  stopCurrentlyEnRoute() {
    let stop = null;
    for (let i = 0; i < this.stops.length; i++) {
      switch (this.stops[i].state) {
        case 'en_route':
        case 'arrived':
        case 'signed':
          stop = this.stops[i];
      }
    }
    return stop;
  }

  allStopsComplete() {
    const remainingStops = this.stops.filter(
      (stop) => stop.state !== 'delivered',
    );

    if (remainingStops.length === 0) {
      return false;
    } else {
      return true;
    }
  }

  hasFee(fee_type: string) {
    return this.fees?.filter((fee) => fee.type === fee_type).length > 0;
  }

  displayUnloadMethod() {
    return titleCase(this.unload_method || '-');
  }

  getSLAEndTime(type: SLAType) {
    return this.slas
      .find((sla) => sla.type === type)
      ?.end_time?.toLocaleDateString('default', LOCALE_OPTIONS);
  }

  getPriority() {
    const pickupEndTime = this.getSLAEndTime('pickup');
    const deliveryEndTime = this.getSLAEndTime('delivery');

    const serviceStyle = styles[this.serviceLevelClass()];

    let message = '';

    /*
    The unicode \u2022 represent the bullet character (•)
    */
    if (this.service_level == ServiceLevel.SameDay) {
      message = `
        \u2022 Pickup by ${pickupEndTime} 
        \u2022 Deliver before 5pm`;
    } else {
      const PICKUP_MSG = this.scheduled
        ? `\u2022 Pickup at ${pickupEndTime}`
        : `\u2022 Pickup by ${pickupEndTime}`;

      message = `
      ${PICKUP_MSG}
      \u2022 Deliver by ${deliveryEndTime}`;
    }

    return (
      <Text>
        <MaterialCommunityIcons
          name='checkbox-blank-circle'
          style={serviceStyle}
        />
        <Text style={serviceStyle}>{this.serviceLevel()}</Text>
        <Text style={{ fontSize: 13 }}> – {message}</Text>
      </Text>
    );
  }

  getPickupTime() {
    let pickupTime = '';
    if (this.service_level === ServiceLevel.SameDay) pickupTime = 'Ready by: ';

    if (this.pickup_at) {
      // A specific pickup time has been scheduled
      return (
        pickupTime +
        this.pickup_at.format('MMMM D, h:mm A z') +
        ' (' +
        this.pickup_at.fromNow() +
        ')'
      );
    } else {
      // No specific time requested; ASAP
      return pickupTime + 'Now';
    }
  }

  getDropoffTime() {
    if (this.dropoff_at) {
      // A specific pickup time has been scheduled
      return (
        this.dropoff_at.format('MMMM D, h:mm a z') +
        ' (' +
        this.dropoff_at.fromNow() +
        ')'
      );
    } else {
      // No specific time requested; ASAP
      return this.service_level === ServiceLevel.SameDay ? 'By 5PM' : 'ASAP';
    }
  }

  formatPhoneNumber(phone: Nullable<string>) {
    if (phone) {
      var cleaned = phone.replace(/\D/g, '');
      var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return ['(', match[2], ') ', match[3], '-', match[4]].join('');
      }
    }
    return null;
  }

  formatAddress(address: Nullable<string>) {
    return address?.replace(', USA', '');
  }

  getShipper() {
    // Find the shipper information for driver contact purposes
    if (this.shipper.name) {
      return [
        this.shipper.name,
        ' – ',
        this.formatPhoneNumber(this.shipper.phone),
      ];
    } else {
      return 'N/A';
    }
  }

  totalPay() {
    return this.driver_total_pay?.toFixed(2);
  }

  needsLoadUnload() {
    return (
      this.stops.filter((stop) => {
        return stop.has_load_fee;
      }).length > 0
    );
  }

  needsPalletJack() {
    return (
      this.stops.filter((stop) => {
        return stop.needs_pallet_jack;
      }).length > 0
    );
  }

  hasItems() {
    let items = 0;
    for (let i = 0; i < this.stops.length; i++) {
      items += this.stops[i].items.length;
    }
    return items > 0;
  }

  neededPickupBarcodes(): NewBarcodeReading[] {
    return this.stops.map((stop) => stop.neededBarcodes('pickup')).flat();
  }

  formattedCargo() {
    const { stops, total_weight, total_volume } = this;
    if (stops && stops.length === 1) {
      const items = stops[0].items;
      if (items.length === 1) {
        const [{ length, width, height }] = items;
        return `${length}x${width}x${height}`;
      } else {
        return `${items.length} items @ ${total_weight}lbs`;
      }
    } else {
      // TO DO: Figure out what goes here in place of "multiple stops"
      return `${this.formattedVolume()} ft³ @ ${total_weight}lbs`;
    }
  }

  formattedVolume() {
    const { total_volume } = this;
    return (total_volume / 1728).toFixed(0);
  }

  async save() {
    let exists = await Match.exists(this.id),
      saved: boolean = false;
    if (exists) {
      saved = await this.update();
    } else {
      const db = await DBConn;

      try {
        let result = await db.transaction(async (tx: any) => {
          let [txn, results] = await tx.executeSql(
            'INSERT INTO Matches (' +
              columnKeys.join(',') +
              ') VALUES (' +
              new Array(columnKeys.length).fill('?').join(',') +
              ')',
            this.toSQLArray(),
          );

          saved = results.rowsAffected > 0;
        });
      } catch (e) {
        console.warn(e);
        saved = false;
      }
    }

    return saved;
  }

  async update() {
    let updated = false;
    const db = await DBConn;

    try {
      await db.transaction(async (tx: any) => {
        let [txn, results] = await tx.executeSql(
          'UPDATE Matches SET ' + this.toSet() + ' WHERE id = ?',
          [this.id],
        );

        updated = results.rowsAffected > 0;
      });
    } catch (e) {
      console.warn(e);
      updated = false;
    }

    return updated;
  }

  async delete() {
    return Match.deleteWhere('id = ?', [this.id]);
  }

  static async exists(id: string) {
    const db = await DBConn;
    let exists = false;

    try {
      await db.transaction(async (tx: any) => {
        let [txn, results] = await tx.executeSql(
          'SELECT * FROM Matches WHERE id = ? LIMIT 1',
          [id],
        );
        exists = results.rows.length > 0;
      });
    } catch (e) {
      console.warn(e);
    }

    return exists;
  }

  static async find(id: string) {
    const matches = await Match.select(`WHERE id = "${id}"`);
    return matches.length > 0 ? matches[0] : null;
  }

  static async deleteWhere(where: string, args: any[] = []) {
    return Match.delete('WHERE ' + where, args);
  }

  static async delete(query: string = '', args: any[] = []) {
    const db = await DBConn;
    let updated = false;

    try {
      await db.transaction(async (tx: any) => {
        let [txn, results] = await tx.executeSql(
          'DELETE FROM Matches ' + query,
          args,
        );

        updated = results.rowsAffected > 0;
      });
    } catch (e) {
      console.warn(e);
    }

    return updated;
  }

  static async select(query: string) {
    const db = await DBConn;
    let matches: Match[] = [];

    try {
      await db.transaction(async (tx: Transaction) => {
        let [txn, results] = await tx.executeSql(
          'SELECT * FROM Matches ' + query + ';',
        );
        matches = Match.rowsToModel(results.rows);
      });
    } catch (e) {
      console.warn(e);
      matches = [];
    }

    return matches;
  }

  static async getAll() {
    return await Match.select('WHERE 1 = 1');
  }

  static async getLive() {
    let liveStates = Match.liveStates.map((s) => `'${s}'`).join(',');
    return await Match.select(`WHERE state IN (${liveStates})`);
  }

  // static async getCanceled () {
  //     return await Match.select('WHERE canceled = 0');
  // }

  static async getComplete() {
    return await Match.select('WHERE state IN ("delivered", "charged")');
  }

  toSet() {
    let array = [];
    for (const c in columns) {
      if (this.hasOwnProperty(c)) {
        const column = c as keyof typeof columns;
        let value =
          this[column] === null
            ? 'NULL'
            : `"${Match.valueToSQL(column, this[column])}"`;
        array.push(`${column} = ${value}`);
      }
    }

    return array.join(', ');
  }

  toSQLArray() {
    let array = [];
    for (const c in columns) {
      const column = c as keyof typeof columns;
      array.push(Match.valueToSQL(column, this[column]));
    }
    return array;
  }

  toArray() {
    let array = [];
    for (const c of columnKeys) {
      const column = c as keyof typeof columns;
      array.push(this[column]);
    }
    return array;
  }

  static valueToSQL(column: keyof typeof columns, value: any) {
    try {
      switch (columns[column]) {
        case 'boolean':
          value = +value;
          break;
        case 'integer':
          value = parseInt(value);
          break;
        case 'date':
          value = value.format('x');
          break;
        case 'number':
          value = parseFloat(value);
          break;
        case 'json':
          value = btoa(JSON.stringify(value));
          break;
      }
    } catch (e) {
      value = null;
    }

    value = value === undefined || Number.isNaN(value) ? null : value;

    return value;
  }

  static SQLToValue(column: keyof typeof columns, value: any) {
    try {
      if (value !== null) {
        switch (columns[column]) {
          case 'string':
            value = value ? value.toString() : value;
            break;
          case 'integer':
            value = parseInt(value);
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = !!value;
            break;
          case 'json':
            value = value ? JSON.parse(atob(value)) : null;
            break;
          case 'date':
            value = value ? moment(new Date(value)) : null;
            break;
        }
      }
    } catch (err) {
      value = null;
    }

    return value;
  }

  static rowsToModel(rows: ResultSetRowList) {
    let len = rows.length,
      matches = [];

    for (let i = 0; i < len; i++) {
      let row = rows.item(i),
        match;

      for (var column in row) {
        if (row.hasOwnProperty(column)) {
          row[column] = Match.SQLToValue(
            column as keyof typeof columns,
            row[column],
          );
        }
      }

      match = new Match(row);

      matches.push(match);
    }

    return matches;
  }
}

const styles = StyleSheet.create({
  dash: {
    color: colors.dash,
  },
  sameDay: {
    color: colors.sameDay,
  },
});
