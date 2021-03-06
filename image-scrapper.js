#!/usr/bin/env node
const request = require('request');
const { getHtmlContent, writeHtmlFile } = require('./utils/html');
const { downloadImages } = require('./utils/download.js');
const { askQuestion } = require('./utils/user-input');
const { getImagesFromWebUrl } = require('./utils/get-images');

(async () => {
  try {
    let webUrl = await askQuestion(
      'Please enter a valid url , e.g www.google.com \n'
    );
    if (!webUrl.startsWith('http://')) webUrl = 'http://' + webUrl;
    console.log(`url is ${webUrl}`);
    const dest = await askQuestion('Please enter a valid path \n');
    console.log(`path is ${dest}`);

    // let webUrl = 'https://www.mako.com';
    // let dest = __dirname;
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
