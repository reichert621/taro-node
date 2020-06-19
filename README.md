# Taro

Taro is a tool that brings all your favorite integrations into a single API 🚀

## Why?

You want to easily write scripts to handle moving data across common SaaS tools.

## Getting started

Install the Taro client

```
npm install taro-client
```

If you haven't already, create a free account at https://www.gettaro.com, and find your API key at https://www.gettaro.com/integrations

## Docs

Test that the client is working

```js
// Get your API key from https://www.gettaro.com/integrations
const Taro = require('taro-client')(process.env.TARO_API_KEY);

Taro.ping(); // => 'Pong'
```

### Alerting

Send email alert

```js
// Notifies the email associated with your API key
await Taro.notify.email({
  subject: 'Welcome to Taro!',
  message: '<p>Thanks for signing up.</p>',
});
```

Send Slack alert

```js
// Notifies the Slack channel linked in https://www.gettaro.com/integrations
await Taro.notify.slack({
  message: 'user@test.com joined the waitlist!',
});
```

### Google Sheets

Find or create a Google Sheet

```js
// *NB* link your Google Sheets account in https://www.gettaro.com/integrations
const spreadsheetId = await Taro.sheets.load('Taro Waitlist');
```

Retrieve your Google Sheet data as JSON

```js
// Using the spreadsheetId from above, or get it directly from your Google Sheets URL:
// https://docs.google.com/spreadsheets/d/[GOOGLE_SPREADSHEET_ID]
const json = await Taro.sheets.retrieve(spreadsheetId);

console.log(json);
// => {data: [{name: 'Alex', email: 'alex@alex.com'}, {name: 'Kam', ...}]}
```

Add row(s) to Google Sheet

```js
// Will be added as:
// name  | email
// ------------------------
// Alex  | alex@alex.com
// Kam   | kam@kam.com
const records = [
  {name: 'Alex', email: 'alex@alex.com'},
  {name: 'Kam', email: 'kam@kam.com'},
];

// Using the spreadsheetId from above, or get it directly from your Google Sheets URL:
// https://docs.google.com/spreadsheets/d/[GOOGLE_SPREADSHEET_ID]
await Taro.sheets.append(spreadsheetId, records);
```

### Gmail

Send an email programmatically from your account

```js
// *NB* link your Gmail account in https://www.gettaro.com/integrations
await Taro.gmail.send({
  to: 'user@test.com',
  subject: `Welcome to Taro!`,
  html: `
    <p>Hello!</p>
    <p>Thanks for signing up :)</p>
    <p>Best,<br />Alex</p>
  `,
});
```

### Scrapers

Scrape top posts from Hacker News (https://news.ycombinator.com/)

```js
// You can set a points threshold so that you only see posts above that score
// const posts = await Taro.scrape.hn(); // defaults to threshold of 300 points
const posts = await Taro.scrape.hn({threshold: 500});

console.log(posts);
// => [{text: 'Show HN: Taro', link: 'gettaro.com', points: 9999}]
```

Scrape PG's essays (http://www.paulgraham.com/articles.html)

```js
// Retrieve a random article (if no argument is specified)
const {title, content, url} = await Taro.scrape.pg();

// Or, specify the article you'd like to scrape
const link = 'http://www.paulgraham.com/vb.html';
const {title, content, url} = await Taro.scrape.pg(link);

console.log(title); // => 'Life is Short'
console.log(content); // => 'January 2016<br><br>Life is short, as everyone knows...'
```

## Use cases

_TODO: this section is a work in progress_

Some examples:

- You created a website and you want to set up a waitlist by storing emails in Google Sheets, and automatically sending an email from your Gmail account thanking the person for signing up
- You want to get notifed on Slack whenever a new user signs up
- You want to pull data from Quickbooks and transform it into a weekly report which gets sent out to all your stakeholder every Friday

_TODO: add code examples_

# Scratchpad (ignore)

```js
const generateWeeklyReport = async () => {
  const signups = await Taro.db.sql(
    `select * from users where created_at > ?`,
    [moment().subtract(1, 'week')]
  );
  const chats = await Taro.intercom.chats({
    since: moment().subtract(1, 'week'),
  });
  const emails = await Taro.gmail.retrieve({
    where: {label: 'taro', recipient: 'me@company.com'},
  });
  const payments = await Taro.stripe.charges({
    since: moment().subtract(1, 'week'),
  });
  const sentiment = await Taro.ai.analyze({
    messages: [
      ...chats.map((chat) => chat.text),
      ...emails.map((email) => email.body),
    ],
    type: 'sentiment_analysis',
  });

  const report = {
    num_new_signups: signups.length,
    num_new_intercom_chats: chats.length,
    num_new_customer_emails: emails.length,
    sentiment_analysis_description: sentiment.description,
    payment_volume: payments.reduce(
      (total, payment) => total + payment.amount,
      0
    ),
  };

  await Taro.gsheets.append('Weekly Report', report);
  await Taro.airtable.append('Weekly Report', report);
  await Taro.slack.notify({template: 'reports.weekly', data: report});
};
```
