const request = require('superagent');
const cheerio = require('cheerio');
const _ = require('lodash');

// An example function that scrapes Hacker News and returns
// all posts on the front page with more than 500 points
const hn = async (threshold = 300) => {
  return request.get('https://news.ycombinator.com/').then((res) => {
    const html = res.text;
    const $ = cheerio.load(html);
    const links = $('.storylink')
      .map((i, el) => {
        return {href: $(el).attr('href'), text: $(el).text()};
      })
      .get();
    const scores = $('.subtext')
      .map((i, el) => {
        return $(el).find('.score').text();
      })
      .get();
    const formatted = _.zip(links, scores).map(([link, score]) => {
      return {
        text: link.text,
        link: link.href,
        score: score ? Number(score.replace(/\D/g, '')) : 0,
      };
    });
    const top = formatted.filter((item) => item.score > threshold);

    return top;
  });
};

module.exports = hn;
