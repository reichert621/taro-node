const request = require('superagent');

// TODO: make this a bit more secure!
const slack = (auth, {message}) => {
  return request
    .post('https://www.gettaro.com/api/slack')
    .set('Authorization', `Bearer ${auth}`)
    .send({text: message})
    .then((res) => res.body.result);
};

module.exports = slack;
