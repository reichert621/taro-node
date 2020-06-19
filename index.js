const email = require('./src/notifications/email');
const slack = require('./src/notifications/slack');
const hn = require('./src/scrapers/hn');
const pg = require('./src/scrapers/pg');
const sheets = require('./src/gsheets/sheets');
const gmail = require('./src/gmail/email');

const ping = () => 'Pong';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const client = (auth) => {
  return {
    ping,
    wait,
    sleep: wait,
    scrape: {
      hn: hn,
      pg: pg,
    },
    notify: {
      email: (...args) => email(auth, ...args),
      slack: (...args) => slack(auth, ...args),
    },
    gmail: {
      send: (...args) => gmail.send(auth, ...args),
    },
    sheets: {
      load: (...args) => sheets.load(auth, ...args),
      retrieve: (...args) => sheets.retrieve(auth, ...args),
      append: (...args) => sheets.append(auth, ...args),
      update: (...args) => sheets.update(auth, ...args),
      // TODO: `set` and `clear`
    },
  };
};

module.exports = client;
