const request = require('superagent');

const run = (auth, id, payload = {}) => {
  return request
    .post(`https://www.gettaro.com/api/lambdas/${id}/run`)
    .set('Authorization', `Bearer ${auth}`)
    .send(payload)
    .then((res) => res.body);
};

module.exports = {
  run,
};
