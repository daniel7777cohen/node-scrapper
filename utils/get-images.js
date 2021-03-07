const cheerio = require('cheerio');

const getImagesFromWebUrl = (html) => {
  const $ = cheerio.load(html);
  return $('img')
    .map(function () {
      return `${$(this).attr('src')}`;
    })
    .get()
    .filter((imgUrl) => imgUrl !== 'undefined');
};

module.exports = { getImagesFromWebUrl };
