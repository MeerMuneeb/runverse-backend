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

export async function sendPushNotificationToMultipleDevices(tokens, title, body) {
  // Ensure 'tokens' is an array
  if (!Array.isArray(tokens) || tokens.length === 0) {
    console.warn('No tokens provided for sending notifications.');
    return;
  }

  const message = {
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
    // Use sendEachForMulticast to send to multiple tokens
    const response = await admin.messaging().sendEachForMulticast({
      tokens, // Array of device tokens
      ...message,
    });
    
    console.log('✅ Notifications sent successfully:', response);
    console.log(`Successfully sent to ${response.successCount} devices, failed for ${response.failureCount} devices.`);
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
        }
      });
    }
    return response;
  } catch (error) {
    console.error('❌ Error sending notifications to multiple devices:', error);
    throw error;
  }
}