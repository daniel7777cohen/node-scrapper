#!/usr/bin/env node
const request = require('request');
const { getHtmlContent, writeHtmlFile } = require('./utils/html');
const { downloadImages } = require('./utils/download.js');
const { askQuestion } = require('./utils/user-input');
const { getImagesFromWebUrl } = require('./utils/get-images');

(async () => {
  try {
    // let url = await askQuestion(
    //   'Please enter a valid url , e.g www.google.com \n'
    // );
    // if (!url.startsWith('http://')) url = 'http://' + url;
    // console.log(`url is ${url}`);
    // const path = await askQuestion('Please enter a valid path \n');
    // console.log(`path is ${path}`);

    let webUrl = 'https://www.coinmarketcap.com';
    let dest = __dirname;
    request(webUrl, async (error, response, html) => {
      if (error) console.log(error);
      else {
        const imageUrls = getImagesFromWebUrl(html).filter(
          (url) => url !== 'undefined'
        );
        await downloadImages(imageUrls, dest);
        const htmlContent = getHtmlContent();
        await writeHtmlFile(dest, htmlContent, imageUrls, webUrl);
      }
    });
  } catch (error) {
    console.error(error);
  }
})();
