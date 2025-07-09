// import messaging from '@react-native-firebase/messaging'; // Only for mobile app
import admin from '../config/firebase.js'; // Server-side usage

export async function sendPushNotification(token, title, body) {
  const message = {
    token,
    notification: {
      title,
      body,
    },
    android: {
      notification: {
        title,
        body,
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}