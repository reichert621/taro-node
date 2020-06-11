const request = require('superagent');

// TODO: make this a bit more secure!
const email = (auth, {to, subject, message}) => {
  return request
    .post('https://www.gettaro.com/api/emails')
    .set('Authorization', `Bearer ${auth}`)
    .send({subject, to_address: to, email_body: message})
    .then((res) => res.body.result)
    .then((result) => result.envelope);
};

module.exports = email;
