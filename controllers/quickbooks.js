const OAuthClient = require('intuit-oauth');
const consumerKey = process.env.QB_CLIENT_ID;
const consumerSecret = process.env.QB_CLIENT_SECRET;
const QuickBooks = require('../models/QuickBooks');
const moment = require('moment');
const axios = require('axios');
const qs = require('qs');
const oQuickBooks = require('node-quickbooks');
const realmId = process.env.QB_REALM_ID;

var oauthClient = null;

exports.qbAuth = async (req, res, next) => {
  const qb = await QuickBooks.findOne({});
  const authUri = createLoginUri(); // create the login URI
  const currentMoment = moment(); // get the current date and time

  // Check if there's an existing QuickBooks token and if it has expired
  if (qb && moment(qb.expiry_date).isBefore(currentMoment)) {
    return res.json({
      success: false,
      message: 'QuickBooks token has expired, please log in again',
      url: authUri,
    });
  }

  // Check if there's no QuickBooks token or OAuth client object
  if (!qb || !oauthClient) {
    return res.json({
      success: false,
      message: 'Please log in to QuickBooks',
      url: authUri,
    });
  }

  const data = qs.stringify({
    grant_type: 'refresh_token',
    redirect_uri: `${process.env.HOST}/api/qb-auth/callback`,
    refresh_token: qb.refresh_token,
  });

  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    const token = {
      ...response.data,
      expiry_date: moment().add(response.data?.x_refresh_token_expires_in, 'seconds').toDate(),
    };
    // await QuickBooks.findOneAndReplace({}, token, { upsert: true });
    req.token = token;
    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.json({
      success: false,
      message: 'Failed to refresh QuickBooks token, please log in again',
      url: authUri,
    });
  }
};

const createLoginUri = () => {
  oauthClient = new OAuthClient({
    clientId: consumerKey,
    clientSecret: consumerSecret,
    environment: 'sandbox',
    redirectUri: `${process.env.HOST}/api/qb-auth/callback`,
  });

  return oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: 'intuit-test',
  });
};

exports.auth = async (req, res) => {
  const authUri = createLoginUri();
  return res.json({
    success: false,
    message: 'Please log in to QuickBooks',
    url: authUri,
  });
};

exports.callback = (req, res) => {
  oauthClient
    .createToken(req.url)
    .then(async (resp) => {
      const token = {
        ...resp.getJson(),
        expiry_date: moment().add(resp.getJson()?.x_refresh_token_expires_in, 'seconds').toDate(),
      };
      await QuickBooks.findOneAndReplace({}, token, { upsert: true });
      // res.json({
      //   success: true,
      //   token: resp.getJson(),
      // });
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    });

  res.redirect(process.env.ORIGIN);
};

exports.refresh = async (req, res) => {
  res.json({
    success: true,
    message: 'Token refreshed.',
    token: req.token,
  });
};

exports.getData = async (req, res) => {
  const qb = new oQuickBooks(
    consumerKey,
    consumerSecret,
    req.token.access_token,
    false, // no token secret for oAuth 2.0
    realmId,
    true, // use the sandbox?
    false, // enable logging?
    null, // set minor-version, or null for the latest version
    '2.0', //oAuth version
    req.token.refresh_token,
  );
  qb.createCustomer(req.body.customer, (err, customer) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(err, null, 2));
      return res.json({
        success: false,
        message: err?.Fault?.Error[0]?.Message ?? 'Internal Server Error',
      });
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(customer, null, 2));
    // return res.json({ ...req.body.invoice, CustomerRef: { value: customer.Id } });
    qb.createInvoice(
      { ...req.body.invoice, CustomerRef: { value: customer.Id } },
      (err, invoice) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log(JSON.stringify(err, null, 2));
          return res.json({
            success: false,
            message: err?.Fault?.Error[0]?.Message ?? 'Internal Server Error',
          });
        }

        res.json({
          success: true,
          message: 'Invoice created successfully.',
          invoice,
        });
      },
    );
  });
};
