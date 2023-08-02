import { upsertArray } from '@lib/helpers';
import createReducer from '@lib/reducers';
import User, { Driver, Schedule, Reports, Device } from '@models/User';
import { IdedStates } from '@reducers/index';
import DeviceInfo from 'react-native-device-info';
export interface UserState {
  // is User requesting
  isDefaultDevice: boolean;
  updatingAgreements: boolean;
  dismissingUserCargoCapacity: boolean;
  updatingUserPassword: boolean;
  updatingUserProfilePhoto: boolean;
  updatingUserCargoCapacity: boolean;
  updatingUserPaymentInfo: boolean;
  updatingUserAddress: boolean;
  updatingUserPhone: boolean;
  sendingTestNotification: boolean;
  updatingUserLoadUnload: boolean;
  updatingUserLocation: boolean;
  updatingAcceptingScheduleOpportunities: boolean;
  completingUserRegistration: boolean;
  fetchingUser: boolean;
  fetchingStripeBankToken: boolean;
  fetchingUserReport: boolean;
  registeringUser: boolean;
  creatingUnapprovedUser: boolean;
  fetchingUserPaymentHistory: boolean;
  editingUserAccount: boolean;
  editingUserVehicle: boolean;
  signingInUser: boolean;
  signingOutUser: boolean;
  acceptingSchedule: boolean;
  rejectingSchedule: boolean;
  fetchingSchedule: IdedStates;
  fetchingScheduleError: IdedStates;
  updatingOneSignalId: boolean;
  updatingDocument: boolean;

  // is User initialized
  userInitialized: boolean;

  // user data
  isUserSignedIn: boolean;
  sessionToken: Nullable<string>;
  sessionExpiry: Nullable<string>;
  confirmCode: Nullable<string>;
  userId: Nullable<string>;
  paymentsComplete: Nullable<number>;
  paymentsFuture: Nullable<number>;
  payments: any[];
  user: Driver;
  reports: Reports;
  schedules: Schedule[];
  accepted_schedules: Schedule[];
  rejected_schedules: Schedule[];
  fetchingAvailableSchedules: boolean;
  availableMatchesInitialized: boolean;
  availableSchedules: Schedule[];
  oneSignalId: Nullable<string>;
  creatingPaymentMethod: boolean;
  paymentMethod: any;
}

const initialState: UserState = {
  isDefaultDevice: false,
  updatingOneSignalId: false,
  oneSignalId: null,
  dismissingUserCargoCapacity: false,
  updatingAgreements: false,
  updatingUserPassword: false,
  updatingUserProfilePhoto: false,
  updatingUserCargoCapacity: false,
  updatingUserPaymentInfo: false,
  updatingUserAddress: false,
  updatingUserPhone: false,
  sendingTestNotification: false,
  updatingUserLocation: false,
  updatingAcceptingScheduleOpportunities: false,
  completingUserRegistration: false,
  updatingUserLoadUnload: false,
  fetchingUser: false,
  fetchingStripeBankToken: false,
  fetchingUserReport: false,
  fetchingSchedule: {},
  fetchingScheduleError: {},
  userInitialized: false,
  signingOutUser: false,
  signingInUser: false,
  editingUserAccount: false,
  registeringUser: false,
  creatingUnapprovedUser: false,
  fetchingUserPaymentHistory: false,
  // data
  isUserSignedIn: false,
  sessionToken: null,
  sessionExpiry: null,
  userId: null,
  user: {},
  reports: {},
  paymentsComplete: null,
  paymentsFuture: null,
  payments: [],
  confirmCode: null,
  schedules: [],
  accepted_schedules: [],
  rejected_schedules: [],
  fetchingAvailableSchedules: false,
  availableMatchesInitialized: false,
  availableSchedules: [],
  paymentMethod: null,
};

function isDefaultDevice(user: Driver, oneSignalId: string | null) {
  const defaultDeviceId = user?.default_device_id;
  const defaultDevice = user?.devices?.find(
    (device: Device) => device.id === defaultDeviceId,
  );
  const isDefault =
    defaultDevice?.device_uuid === DeviceInfo.getUniqueId() &&
    defaultDevice?.player_id === oneSignalId;

  return isDefault;
}

let reductions = {
  // Fetching User
  FETCHING_USER: () => ({
    fetchingUser: true,
  }),
  FETCHING_USER_SUCCESS: (action, state: UserState) => {
    const user = User.updateUser(action.user);
    return {
      fetchingUser: false,
      userInitialized: true,
      user,
      isDefaultDevice: isDefaultDevice(user, state.oneSignalId),
    };
  },
  FETCHING_USER_ERROR: () => ({
    fetchingUser: false,
  }),
  UPDATING_AGREEMENTS: () => ({
    updatingAgreements: true,
  }),
  UPDATING_AGREEMENTS_SUCCESS: ({ pending_agreements }, state) => ({
    updatingAgreements: true,
    user: { ...state.user, pending_agreements },
  }),
  UPDATING_AGREEMENTS_ERROR: () => ({
    updatingAgreements: false,
  }),
  SIGNING_IN_USER: () => ({
    signingInUser: true,
  }),
  SIGNING_IN_USER_SUCCESS: (
    { sessionToken, sessionExpiry, userId, ...action },
    state,
  ) => {
    const user = action.user || state.user;

    return {
      isUserSignedIn: true,
      signingInUser: false,
      user: User.updateUser(user),
      userInitialized: user && Object.keys(user).length > 0,
      userId,
      sessionToken,
      sessionExpiry,
    };
  },
  SIGNING_IN_USER_ERROR: () => ({
    signingInUser: false,
  }),
  SIGNING_OUT_USER: () => ({
    signingOutUser: true,
  }),
  SIGNING_OUT_USER_SUCCESS: () => ({
    user: {},
    userId: null,
    isUserSignedIn: false,
    sessionToken: null,
    sessionExpiry: null,
    signingOutUser: false,
  }),
  SIGNING_OUT_USER_ERROR: () => ({
    user: {},
    userId: null,
    isUserSignedIn: false,
    sessionToken: null,
    sessionExpiry: null,
    signingOutUser: false,
  }),
  UPDATING_USER_LOCATION: () => ({
    updatingUserLocation: true,
  }),
  UPDATING_USER_LOCATION_SUCCESS: ({ location }, { user }) => ({
    updatingUserLocation: false,
    user: User.updateUser({
      ...user,
      current_location: location,
    }),
  }),
  UPDATING_USER_LOCATION_ERROR: () => ({
    updatingUserLocation: false,
  }),
  SAVE_ONE_SIGNAL_ID: ({ playerId }, state: UserState) => ({
    oneSignalId: playerId,
    isDefaultDevice: isDefaultDevice(state.user, playerId),
  }),
  UPDATING_ONE_SIGNAL: () => ({
    updatingOneSignalId: true,
  }),
  UPDATING_ONE_SIGNAL_SUCCESS: (
    { device }: { device: Device },
    state: UserState,
  ) => {
    const user = User.updateUser({
      ...state.user,
      default_device_id: device.id,
      devices: upsertArray([...state.user.devices], 'id', device),
    });

    return {
      updatingOneSignalId: false,
      isDefaultDevice: isDefaultDevice(user, state.oneSignalId),
      user,
    };
  },
  UPDATING_ONE_SIGNAL_ERROR: () => ({
    updatingOneSignalId: false,
  }),
  UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES: () => ({
    updatingAcceptingScheduleOpportunities: true,
  }),
  UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES_SUCCESS: (
    {
      accepting_schedule_opportunities,
    }: { accepting_schedule_opportunities: boolean },
    state: any,
  ) => ({
    updatingAcceptingScheduleOpportunities: false,
    user: User.updateUser({
      ...state.user,
      schedule_opt_state: accepting_schedule_opportunities
        ? 'opted_in'
        : 'opted_out',
    }),
  }),
  UPDATING_USER_ACCEPTING_SCHEDULE_OPPORTUNITIES_ERROR: () => ({
    updatingAcceptingScheduleOpportunities: false,
  }),
  FETCHING_SCHEDULE: (
    { scheduleId }: { scheduleId: string },
    { fetchingScheduleError, fetchingSchedule },
  ) => {
    delete fetchingScheduleError[scheduleId];

    return {
      fetchingSchedule: {
        ...fetchingSchedule,
        [scheduleId]: true,
      },
      fetchingScheduleError: { ...fetchingScheduleError },
    };
  },
  SENDING_TEST_NOTIFICATION_SUCCESS: () => ({
    sendingTestNotification: false,
  }),
  SENDING_TEST_NOTIFICATION: () => ({
    sendingTestNotification: true,
  }),
  SENDING_TEST_NOTIFICATION_ERROR: () => ({
    sendingTestNotification: false,
  }),
  FETCHING_SCHEDULE_SUCCESS: (
    { schedule }: { schedule: Schedule },
    {
      schedules: prevSchedules,
      fetchingSchedule,
    }: { schedules: Schedule[]; fetchingSchedule: any },
  ) => {
    delete fetchingSchedule[schedule.id];

    const schedules = [...prevSchedules, schedule];

    return {
      fetchingSchedule: { ...fetchingSchedule },
      schedules: schedules,
    };
  },
  FETCHING_SCHEDULE_INACCESSIBLE: (
    { scheduleId, error }: { scheduleId: string; error: any },
    { schedules: prevSchedules, fetchingScheduleError, fetchingSchedule },
  ) => {
    delete fetchingSchedule[scheduleId];

    const schedules = prevSchedules.filter(
      (schedule: Schedule) => schedule.id !== scheduleId,
    );

    return {
      schedules: schedules,
      fetchingSchedule: { ...fetchingSchedule },
      fetchingMatchError: {
        ...fetchingScheduleError,
        [scheduleId]: error,
      },
    };
  },
  FETCHING_SCHEDULE_ERROR: (
    { scheduleId, error }: { scheduleId: string; error: any },
    { fetchingScheduleError, fetchingSchedule },
  ) => {
    delete fetchingSchedule[scheduleId];

    return {
      fetchingSchedule: { ...fetchingSchedule },
      fetchingScheduleError: {
        ...fetchingScheduleError,
        [scheduleId]: error,
      },
    };
  },
  ACCEPTING_SCHEDULE: () => ({
    acceptingSchedule: true,
  }),
  ACCEPTING_SCHEDULE_SUCCESS: (
    { schedule }: { schedule: Schedule },
    {
      accepted_schedules,
      rejected_schedules,
      user,
    }: {
      accepted_schedules: Schedule[];
      rejected_schedules: Schedule[];
      user: Driver;
    },
  ) => {
    return {
      user: User.updateUser({
        ...user,
        accepted_schedules: [...accepted_schedules, schedule],
        rejected_schedules: rejected_schedules.filter(
          (maybe_schedule) => maybe_schedule.id !== schedule.id,
        ),
      }),
      acceptingSchedule: false,
    };
  },
  ACCEPTING_SCHEDULE_ERROR: () => ({
    acceptingSchedule: false,
  }),
  REJECTING_SCHEDULE: () => ({
    rejectingSchedule: true,
  }),
  REJECTING_SCHEDULE_SUCCESS: (
    { schedule }: { schedule: Schedule },
    {
      accepted_schedules,
      rejected_schedules,
      user,
    }: {
      accepted_schedules: Schedule[];
      rejected_schedules: Schedule[];
      user: Driver;
    },
  ) => {
    return {
      user: User.updateUser({
        ...user,
        rejected_schedules: [...rejected_schedules, schedule],
        accepted_schedules: accepted_schedules.filter(
          (maybe_schedule) => maybe_schedule.id !== schedule.id,
        ),
      }),
      rejectingSchedule: false,
    };
  },
  REJECTING_SCHEDULE_ERROR: () => ({
    rejectingSchedule: false,
  }),
  FETCHING_AVAILABLE_SCHEDULES: () => ({ fetchingAvailableSchedules: true }),
  FETCHING_AVAILABLE_SCHEDULES_SUCCESS: (
    { availableSchedules }: { availableSchedules: Schedule[] },
    state,
  ) => ({
    fetchingAvailableSchedules: false,
    availableMatchesInitialized: true,
    availableSchedules: availableSchedules,
  }),
  FETCHING_AVAILABLE_SCHEDULES_INACCESSIBLE: (action, state) => ({
    fetchingAvailableSchedules: false,
  }),
  FETCHING_AVAILABLE_SCHEDULES_ERROR: (action, state) => ({
    fetchingAvailableSchedules: false,
  }),
  EDITING_USER_ACCOUNT: () => ({
    editingUserAccount: true,
    editingUserVehicle: true,
  }),
  EDITING_USER_ACCOUNT_SUCCESS: () => ({
    editingUserAccount: false,
    editingUserVehicle: false,
  }),
  EDITING_USER_ACCOUNT_ERROR: (message) => ({
    editingUserAccount: false,
    editingUserVehicle: false,
  }),
  FETCHING_USER_REPORT: () => ({
    fetchingUserReport: true,
  }),
  FETCHING_USER_REPORT_SUCCESS: (action) => ({
    fetchingUserReport: false,
    reports: action.reports,
  }),
  FETCHING_USER_REPORT_ERROR: () => ({
    fetchingUserReport: false,
  }),
  REGISTERING_USER: () => ({
    registeringUser: true,
  }),
  REGISTERING_USER_SUCCESS: (
    { sessionToken, sessionExpiry, userId, user, ...action },
    state,
  ) => ({
    registeringUser: false,
    isUserSignedIn: true,
    user: User.updateUser(user),
    userInitialized: user && Object.keys(user).length > 0,
    userId,
    sessionToken,
    sessionExpiry,
  }),
  REGISTERING_USER_ERROR: () => ({
    registeringUser: false,
  }),
  CREATING_UNAPPROVED_USER: () => ({
    creatingUnapprovedUser: true,
  }),
  CREATING_UNAPPROVED_USER_SUCCESS: (
    { sessionToken, sessionExpiry, userId, user, ...action },
    state,
  ) => ({
    creatingUnapprovedUser: false,
    isUserSignedIn: true,
    user: User.updateUser(user),
    userInitialized: user && Object.keys(user).length > 0,
    userId,
    sessionToken,
    sessionExpiry,
  }),
  CREATING_UNAPPROVED_USER_ERROR: () => ({
    creatingUnapprovedUser: false,
  }),
  UPDATING_USER_PASSWORD: () => ({
    updatingUserPassword: true,
  }),
  UPDATING_USER_PASSWORD_SUCCESS: (action, state) => ({
    updatingUserPassword: false,
    user: User.updateUser({
      ...state.user,
      password_reset_code: false,
      is_password_set: true,
    }),
  }),
  UPDATING_USER_PASSWORD_ERROR: () => ({
    updatingUserPassword: false,
  }),
  UPDATING_USER_PROFILE_PHOTO: () => ({
    updatingUserProfilePhoto: true,
  }),
  UPDATING_USER_PROFILE_PHOTO_SUCCESS: (action, state) => ({
    updatingUserProfilePhoto: false,
    user: User.updateUser({
      ...state.user,
      profile_image: action.profile_image,
    }),
  }),
  UPDATING_USER_LOAD_UNLOAD: () => ({
    updatingUserLoadUnload: true,
  }),
  UPDATING_USER_LOAD_UNLOAD_SUCCESS: (action, state) => ({
    updatingUserLoadUnload: false,
    user: User.updateUser({
      ...state.user,
      can_load: action.can_load,
    }),
  }),
  UPDATING_USER_LOAD_UNLOAD_ERROR: () => ({
    updatingUserLoadUnload: false,
  }),
  UPDATING_USER_PROFILE_PHOTO_ERROR: () => ({
    updatingUserProfilePhoto: false,
  }),
  UPDATING_USER_CARGO_CAPACITY: () => ({
    updatingUserCargoCapacity: true,
  }),
  UPDATING_USER_CARGO_CAPACITY_SUCCESS: (action, state) => ({
    updatingUserCargoCapacity: false,
    user: User.updateUser({
      ...state.user,
      ...action.capacityMeasurements,
    }),
  }),
  UPDATING_USER_CARGO_CAPACITY_ERROR: () => ({
    updatingUserCargoCapacity: false,
  }),
  DISMISSING_USER_CARGO_CAPACITY: () => ({
    dismissingUserCargoCapacity: true,
  }),
  DISMISSING_USER_CARGO_CAPACITY_SUCCESS: (action, state) => ({
    dismissingUserCargoCapacity: false,
    user: User.updateUser({
      ...state.user,
      capacity_dismissed_at: action.capacity_dismissed_at,
    }),
  }),
  DISMISSING_USER_CARGO_CAPACITY_ERROR: () => ({
    dismissingUserCargoCapacity: false,
  }),
  COMPLETING_USER_REGISTRATION: () => ({
    completingUserRegistration: true,
  }),
  COMPLETING_USER_REGISTRATION_SUCCESS: (action, state) => ({
    completingUserRegistration: false,
    user: User.updateUser({
      ...state.user,
      state: action.state,
    }),
  }),
  COMPLETING_USER_REGISTRATION_ERROR: () => ({
    completingUserRegistration: false,
  }),
  UPDATING_USER_PAYMENT_INFO: (action, state) => ({
    updatingUserPaymentInfo: true,
  }),
  UPDATING_USER_PAYMENT_INFO_SUCCESS: ({ wallet_state }: any, state) => ({
    updatingUserPaymentInfo: false,
    user: User.updateUser({
      ...state.user,
      wallet_state,
    }),
  }),
  UPDATING_USER_PAYMENT_INFO_ERROR: () => ({
    updatingUserPaymentInfo: false,
  }),
  UPDATING_USER_ADDRESS: (action, state) => ({
    updatingUserAddress: true,
  }),
  UPDATING_USER_ADDRESS_SUCCESS: (
    { address }: { address: UserAddress },
    state,
  ) => ({
    updatingUserAddress: false,
    user: User.updateUser({
      ...state.user,
      address,
    }),
  }),
  UPDATING_USER_ADDRESS_ERROR: () => ({
    updatingUserAddress: false,
  }),
  UPDATING_USER_PHONE: (action, state) => ({
    UpdatingUserPhone: true,
  }),
  UPDATING_USER_PHONE_SUCCESS: ({ phone_number }: string, state) => ({
    updatingUserPhone: false,
    user: User.updateUser({
      ...state.user,
      phone_number,
    }),
  }),
  UPDATING_USER_PHONE_ERROR: () => ({
    updatingUserPhone: false,
  }),
  REQUESTING_PASSWORD_RESET: () => ({
    requestingPasswordReset: true,
  }),
  REQUESTING_PASSWORD_RESET_SUCCESS: (action, state) => ({
    requestingPasswordReset: false,
    user: User.updateUser({
      ...state.user,
      password_reset_code: true,
    }),
  }),
  REQUESTING_PASSWORD_RESET_ERROR: () => ({
    requestingPasswordReset: false,
  }),
  SENDING_PASSWORD_RESET: () => ({
    sendingPasswordReset: true,
  }),
  SENDING_PASSWORD_RESET_SUCCESS: (action, state) => ({
    sendingPasswordReset: false,
    user: User.updateUser({
      ...state.user,
      password_reset_code: false,
    }),
  }),
  SENDING_PASSWORD_RESET_ERROR: () => ({
    sendingPasswordReset: false,
  }),
  FETCHING_STRIPE_BANK_TOKEN: () => ({
    fetchingStripeBankToken: true,
  }),
  FETCHING_STRIPE_BANK_TOKEN_SUCCESS: () => ({
    fetchingStripeBankToken: false,
  }),
  FETCHING_STRIPE_BANK_TOKEN_ERROR: () => ({
    fetchingStripeBankToken: false,
  }),
  FETCHING_USER_PAYMENT_HISTORY: () => ({
    fetchingUserPaymentHistory: true,
  }),
  FETCHING_USER_PAYMENT_HISTORY_SUCCESS: (
    { payments, complete, future },
    state,
  ) => {
    return {
      fetchingUserPaymentHistory: false,
      paymentsComplete: complete,
      paymentsFuture: future,
      payments: payments || [],
    };
  },
  FETCHING_USER_PAYMENT_HISTORY_ERROR: () => ({
    fetchingUserPaymentHistory: false,
  }),
  UPDATE_ALWAYS_TRACKING_LOCATION: (action, state) => ({
    user: User.updateUser({
      ...state.user,
      flag_always_tracking_location: action.is_always_tracking_location,
    }),
  }),
  CREATING_PAYMENT_METHOD: () => ({
    creatingPaymentMethod: true,
  }),
  CREATING_PAYMENT_METHOD_SUCCESS: ({ paymentMethod }, state) => {
    return {
      ...state,
      creatingPaymentMethod: false,
      paymentMethod: paymentMethod,
    };
  },
  CREATING_PAYMENT_METHOD_ERROR: () => ({
    creatingPaymentMethod: false,
  }),
  UPDATING_USER_DOCUMENT: () => ({
    updatingDocument: true,
  }),
  UPDATING_USER_DOCUMENT_SUCCESS: (action, state) => ({
    updatingDocument: false,
  }),
  UPDATING_USER_DOCUMENT_ERROR: () => ({
    updatingDocument: false,
  }),
};

const userReducer = createReducer<UserState>(reductions, initialState);

export default userReducer;
