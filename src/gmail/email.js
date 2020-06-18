const request = require('superagent');

const send = (auth, {to, subject, text, html, cc = [], bcc = []}) => {
  return request
    .post('https://www.gettaro.com/api/gmail/send')
    .set('Authorization', `Bearer ${auth}`)
    .send({to, cc, bcc, subject, text, html})
    .then((res) => res.body.data);
};

module.exports = {
  send,
};
