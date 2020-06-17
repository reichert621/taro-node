const request = require('superagent');
const cheerio = require('cheerio');
const _ = require('lodash');

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getPgEssayUrls = async () => {
  const {text} = await request.get('http://www.paulgraham.com/articles.html');
  const $ = cheerio.load(text);
  const links = $('table table a')
    .map((i, el) => $(el).attr('href'))
    .get();

  return _.uniq(links).map((path) => {
    return `http://www.paulgraham.com/${path}`;
  });
};

const getRandomPgEssayUrl = async () => {
  const urls = await getPgEssayUrls();
  const url = _.sample(urls);

  return url;
};

const extractPgEssayData = async (url) => {
  const {text: html} = await request.get(url);
  const $ = cheerio.load(html);

  const title = $('table table img')
    .filter((i, el) => {
      const alt = $(el).attr('alt');

      return alt && alt.trim().length > 0;
    })
    .attr('alt');
  const content = $('table table font')
    .filter((i, el) => {
      const text = $(el).text();

      return months.some((month) => text.indexOf(month) !== -1);
    })
    .html();

  if (!content || !content.length) {
    return;
  }

  return {
    title,
    url,
    content: content.concat(`<br /><br /><p>Read online at ${url}</p>`),
  };
};

const pg = async (href) => {
  const link = href || (await getRandomPgEssayUrl());
  const {title, content, url} = await extractPgEssayData(link);

  return {title, content, url};
};

module.exports = pg;
