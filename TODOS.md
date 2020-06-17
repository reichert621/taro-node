# Taro

Taro is a tool that brings all your favorite integrations into one place, with
simple abstractions over the most common use cases.

## Why?

TODO

## Use cases

Weekly report to slack

## Getting started

Install Taro client

```
npm install taro-client
```

## Docs

Retrieve lambda functions from Taro

```js
const Taro = require('taro-client')({
  key: API_KEY,
});

Taro.lambdas.list(); // Get all
Taro.lambdas.retrieve(token); // Get one
```

Set schedule for lambda

```js
Taro.schedules.retrieve(token);
Taro.schedules.update(token, {frequency: 5, unit: 'minutes'});
Taro.schedules.update(token, {cron: '* * * * *'});
// TODO: should this be handled in a separate namespace/table?
Taro.schedules.update(token, {date: '2020-09-01', retries: 10});
```

Trigger run lambda manually

```js
Taro.lambdas.run(token);
Taro.jobs.run(token);
Taro.jobs.run('AFTER_USER_SIGNUP');
```

Retrieve logs for a given lambda

```js
Taro.logs.list(token); // Internal logs + AWS logs (marked as such)

// Create internal logs?
Taro.log('message');
Taro.log({level: 'info', message: 'message'});
Taro.debug('message');
Taro.info('message');
Taro.warn('message');
Taro.error('message');
```

Create email templates

```js
Taro.templates.create(
  'test',
  `
  <p>Hello __NAME__!</p>
  <p>Thanks for signing up. Your username is __USERNAME__</p>
  <p>Your free trial will expire in __DAYS_UNTIL_EXPIRATION__ days</p>
  <p>Best, <br />Taro</p>
`
);
```

Send alerts through Taro

```js
Taro.notify.email({
  to: 'name@me.com',
  subject: 'subject',
  message: 'text',
});
// TODO: integrate Twilio, Slack, etc.
Taro.notify.sms({message: 'message'});
Taro.notify.slack({message: 'message'});

// TODO: how should webhooks work?
Taro.notify.webhook('ais.success', {...data});
Taro.notify.webhook({
  event: 'ais.success',
  data: {...data},
});

// Send email with template (see above)
Taro.notify.email({
  subject: 'subject',
  template: 'test',
  params: {
    name: 'Alex',
    username: 'reichertjalex',
    daysUntilExpiration: 14, // or `days_until_expiration`
  },
});
```

Set up webhooks in Taro

```js
// TODO: where do we store these?
Taro.webhooks.on('event', {
  // When 'event' is triggered, will send POST request with event body
  urls: ['gettaro.com/api/callback'],
  // TODO: might be easier to just handle the url case above...
  // When 'event' is triggered, will call these callbacks with event body as data
  callbacks: [
    (data) => process(data),
    (data) => reconcile(data),
    (data) => doSomethingElse(data),
  ],
});
```

Save data to Taro

```js
// TODO: set up with Firebase?
Taro.storage.get(key);
Taro.storage.set(key, {...values});

const db = await Taro.sheets.load('Hacker News Posts');

Taro.sheets.retrieve(db);
// Get the row with the matching link
Taro.sheets.retrieve(db, {link: 'gettaro.com'});
Taro.sheets.append(
  db,
  [{link: 'gettaro.com'}, {link: 'airbnb.com'}, {link: 'uber.com'}],
  {uniqBy: ['link', 'text']}
);
Taro.sheets.clear(db, {all: true});
Taro.sheets.clear(db, {
  ids: ['a1b2c3', 'd4e5f6'],
});
Taro.sheets.update(db, {
  a1b2c3: {link: 'updated.com'},
  d4e5f6: {link: 'new.com'},
});
```

Deploy

```js
// TODO: figure out how to handle sending to server
Taro.deploy({path: 'directory/to/zip'});
```

## Use cases

```js
const Taro = require('taro-client')({
  key: API_KEY,
  namespace: 'my-first-function',
});

const scrape = () => {
  return request.get(url).then((res) => parse(res.body));
};

const main = async () => {
  Taro.log('Begin scraping AIS data');

  const results = await scrape();
  const ts = +new Date();
  const key = `AIS-DATA-${ts}`;
  const {ok, url, error} = await Taro.set(key, {data: results}); // ensure `data` is object?

  if (ok) {
    const msg = `Successfully scraped and saved data! View at ${url}`;

    Taro.log(msg);
    await Taro.notify.slack({message: msg});
    await Taro.notify.webhook('ais.success', {key, data, timestamp: ts});
  } else {
    Taro.error(error || 'Something went wrong!');
  }
};

module.exports = main;
```

Triggers?

```js
const sendWelcomeEmail = (userId) => {
  const user = await Taro.db.sql(`select * from users where id = ?`, [userId]);

  Taro.notify.email({
    template: 'users.welcome',
    data: {user},
  });
};

const sendFollowupEmail = (userId) => {
  const user = await Taro.db.sql(
    `select * from users where id = ? and status = 'unactivated'`,
    [userId]
  );

  Taro.notify.email({
    template: 'users.followup',
    data: {user},
  });
};


const handleNewUserSignup = async (payload = {}) => {
  const {user, metadata = {}} = payload;

  // Send message to Slack to alert team about new signup
  Taro.notify.slack({channel: 'bots', message: 'New user signup!'});
  // Add row to Google Sheet 'Users' spreadsheet
  Taro.gsheet.append('Users', [{name: user.name, email: user.email}]);
  // Add row to Airtable 'Users' table
  Taro.airtable.append('Users', [{name: user.name, email: user.email}]);

  // TODO: look up existing libraries that do this!
  // (e.g. AgendaJS with pre-installed MongoDB per user)
  // Schedule tasks to be sent out at a specific time
  Taro.scheduler.at(moment().add(40, 'minutes'), () => {
    // Send email to new user with pre-defined template
    Taro.email.send({
      to: user.email,
      template: 'users.welcome', // Define email templates in the dashboard!
      data: {user},
    });
  });

  Taro.scheduler.at(moment().add(3, 'days'), () => {
    Taro.email.send({
      to: user.email,
      template: 'users.followup',
      data: {user},
    });
  });
};

const generateWeeklyReport = async () => {
  const signups = await Taro.db.sql(
    `select * from users where created_at > ?`,
    [moment().subtract(1, 'week')]
  );
  const chats = await Taro.intercom.chats({since: moment().subtract(1, 'week')});
  const emails = await Taro.gmail.retrieve({
    where: {label: 'taro', recipient: 'me@company.com'}
  });
  const payments = await Taro.stripe.charges({since: moment().subtract(1, 'week')});
  const sentiment = await Taro.ai.analyze({
    messages: [...chats.map(chat => chat.text), ...emails.map(email => email.body)],
    type: 'sentiment_analysis',
  })

  const report = {
    num_new_signups: signups.length,
    num_new_intercom_chats: chats.length,
    num_new_customer_emails: emails.length,
    sentiment_analysis_description: sentiment.description,
    payment_volume: payments.reduce((total, payment) => total + payment.amount, 0)
  };

  await Taro.gsheets.append('Weekly Report', report);
  await Taro.airtable.append('Weekly Report', report);
  await Taro.slack.notify({template: 'reports.weekly', data: report});
};

```

Scripts:

```
npm install -g taro-cli

taro deploy my-first-function
taro run my-first-function
taro delete my-first-function
taro repl my-first-function # ?
```
