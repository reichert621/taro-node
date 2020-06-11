const email = require('./src/email');
const scraper = require('./src/scraper');
const slack = require('./src/slack');
const sheets = require('./src/sheets');

const ping = () => 'Pong';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const client = (auth) => {
  return {
    ping,
    wait,
    sleep: wait,
    scrape: {
      hn: (...args) => scraper('hn', ...args),
    },
    notify: {
      email: (...args) => email(auth, ...args),
      slack: (...args) => slack(auth, ...args),
    },
    sheets: {
      load: (...args) => sheets.load(auth, ...args),
      retrieve: (...args) => sheets.retrieve(auth, ...args),
      append: (...args) => sheets.append(auth, ...args),
      update: (...args) => sheets.update(auth, ...args),
    },
  };
};

const emailErrorCode = `
  const Taro = require('taro-client')(API_KEY);

  Taro.notify.email({
    to: 'name@me.com',
    subject: 'Email subject line',
    message: 'This can be text or HTML!',
  })
`;

client.ping = ping;
client.wait = wait;
client.sleep = wait;
client.scraper = scraper;
client.email = async () => {
  console.error(
    'This method has been deprecated. Please use the following instead:'
  );
  console.error(emailErrorCode);
};

module.exports = client;
