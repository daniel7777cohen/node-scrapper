const cheerio = require('cheerio');

const getImagesFromWebUrl = (html) => {
  const $ = cheerio.load(html);
  console.log($.html());
  return $('img')
    .map(function () {
      return `${$(this).attr('src')}`;
    })
    .get();
};

module.exports = { getImagesFromWebUrl };
