
// services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token!');
      return;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
}

// Helper function to generate multiple trigger times based on frequency
function generateTriggerTimes(baseTime, frequency) {
  const base = new Date(baseTime);
  const times = [];

  const intervals = {
    'Once Daily': [0],
    'Twice Daily': [0, 12],
    'Every 6 Hours': [0, 6, 12, 18],
    'Every 8 Hours': [0, 8, 16],
  };

  const selectedOffsets = intervals[frequency] || [0];

  for (let offset of selectedOffsets) {
    const newTime = new Date(base);
    newTime.setHours(base.getHours() + offset);
    if (newTime < new Date()) {
      newTime.setDate(newTime.getDate() + 1); // ensure future time
    }
    times.push(newTime);
  }

  return times;
}

export async function scheduleMedicineNotification(medicineName, selectedTime, frequency = 'Once Daily') {
  const times = generateTriggerTimes(selectedTime, frequency);

  for (let time of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Medicine Reminder',
        body: `Time to take ${medicineName}`,
        sound: true,
      },
      trigger: time,
    });
  }
}

// Optional: Cancel all scheduled notifications (for reset/debug)
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
