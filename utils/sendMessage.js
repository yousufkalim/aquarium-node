/* eslint-disable no-console */
/**
 * Send SMS service
 * @author Najam Ul Saqib
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const client = require('twilio')(accountSid, authToken);

exports.isValidPhoneNumber = (phoneNumber) => {
  try {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, 'US');
    return parsedNumber.isValid();
  } catch (error) {
    return false;
  }
};

/**
 * Send OTP to user
 * @param {String} phone
 * @param {String} body
 */
exports.sendMessage = (phone, body) => {
  return new Promise((resolve, reject) => {
    // Sending message to client
    client.messages
      .create({
        // message options
        body: body,
        messagingServiceSid: serviceSid,
        to: `+1${phone}`,
      })
      .then(() => {
        // On message successfully sent
        resolve({ success: true, message: 'OTP sent' });
      })
      .catch((err) => {
        // On error
        reject(err);
      });
  });
};
