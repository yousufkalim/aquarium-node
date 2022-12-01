/**
 * FCM SEND NOTIFICATION
 * @author Najam Ul Saqib
 */

const FCM = require('fcm-node');
const SERVER_KEY = process.env.FCM_SERVER_KEY;
const fcm = new FCM(SERVER_KEY);

exports.sendNotification = async (tokens, title, body) => {
  try {
    var message = {
      registration_ids: Array.isArray(tokens) ? tokens : [tokens],
      notification: {
        title,
        body,
      },
    };
    fcm.send(message, (error) => {
      if (error)
        // eslint-disable-next-line no-console
        console.log('Something gone wrong', error);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('Something gone wrong', err.message);
  }
};

// usage
// sendFcmNotification("User Token", "Notif Title", "Message / anything");
// sendFcmNotification(["User Token 1", "User Token 2"], "Notif Title", "Message / anything");
