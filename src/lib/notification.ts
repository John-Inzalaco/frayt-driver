import NavigationService from '@lib/NavigationService';
import store from '@lib/store';
import { getMatch } from '@actions/matchAction';
import { getSchedule } from '@actions/userAction';
import {
  NotificationReceivedEvent,
  OSNotification,
} from 'react-native-onesignal';

export const notificationType = {
  MATCH: 'MATCH',
  MESSAGE: 'MESSAGE',
  SCHEDULE: 'SCHEDULE',
  BATCH: 'BATCH',
};

type FraytNotificationData = {
  match_id?: string;
  schedule_id?: string;
  delivery_batch_id?: string;
  message?: string;
};

function getData(notification: OSNotification) {
  if (!notification.additionalData) return null;
  return notification.additionalData as FraytNotificationData;
}

export function handleOpenedNotification(notification: OSNotification) {
  const type = getNotificationType(notification);
  const data = getData(notification);

  switch (type) {
    case notificationType.MATCH:
      NavigationService.navigate('Drive', {
        navigateTo: 'Matches',
        params: {
          matchId: data.match_id,
        },
      });
      break;
    case notificationType.SCHEDULE:
      NavigationService.navigate('Account', {
        navigateTo: 'EditSchedules',
        params: {
          scheduleId: data.schedule_id,
        },
      });
      break;
    case notificationType.BATCH:
      NavigationService.navigate('Drive', {
        navigateTo: 'Matches',
        params: {
          batchId: data.delivery_batch_id,
        },
      });
      break;
    case notificationType.MESSAGE:
      // may not need to do anything here
      // since the app logic will check for wf/driver_message anyways
      break;
  }
}

export function handleReceivedNotification(
  notification: NotificationReceivedEvent,
) {
  const nativeNotification = notification.getNotification();
  const data = getData(nativeNotification);
  const type = getNotificationType(nativeNotification);

  switch (type) {
    case notificationType.MATCH:
      store.dispatch(getMatch(data.match_id));
      break;
    case notificationType.SCHEDULE:
      store.dispatch(getSchedule(data.schedule_id));
      break;
    case notificationType.BATCH:
      // in the future we could have MatchesScreen render only matches belonging to batch
      break;
    case notificationType.MESSAGE:
      // also a no-op for now
      break;
  }

  notification.complete(nativeNotification);
}

export function getNotificationType(notification: OSNotification) {
  const data = getData(notification);
  let type = null;

  if (data) {
    if (data.match_id) {
      type = notificationType.MATCH;
    } else if (data.schedule_id) {
      type = notificationType.SCHEDULE;
    } else if (data.delivery_batch_id) {
      type = notificationType.BATCH;
    } else if (data.message) {
      type = notificationType.MESSAGE;
    }
  }

  return type;
}
