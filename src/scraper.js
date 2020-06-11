const request = require('superagent');

// An example function that scrapes Hacker News and returns
// all posts on the front page with more than `threshold` points
const hn = ({threshold = 400} = {}) => {
  return request
    .get('https://www.gettaro.com/api/examples/scraper')
    .query({threshold})
    .then((res) => res.body.data);
};

const scraper = async (type, options = {}) => {
  switch (type) {
    case 'hn':
      return hn(options);
    default:
      // TODO: add more examples of useful scrapers
      throw new Error('Currently supported scrapers: [hn]');
  }
};

module.exports = scraper;
