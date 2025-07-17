// App.js
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './services/NotificationService';
import { LogBox } from 'react-native';
import { MedicineProvider } from './context/MedicineContext';

LogBox.ignoreLogs(['Require cycle:', 'Non-serializable values were found in the navigation state']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <NavigationContainer>
      <MedicineProvider>
      <AppNavigator />
      </MedicineProvider>
      </NavigationContainer>
  );
}
