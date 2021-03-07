#!/usr/bin/env node
const request = require('request');
const { getHtmlContent, writeHtmlFile } = require('./utils/html');
const { downloadImages } = require('./utils/download-images.js');
const { getUserInput } = require('./utils/user-input');
const { getImagesFromWebUrl } = require('./utils/get-images');

const main = async() => {
  try {
    let webUrl = await getUserInput(
      'Please enter a valid url , e.g www.google.com \n'
    );
    if (!webUrl.startsWith('http://')) webUrl = 'http://' + webUrl;
    console.log(`url is ${webUrl}`);
    const dest = await getUserInput('Please enter a valid path \n');
    console.log(`path is ${dest}`);

  
    request(webUrl, async (error, response, html) => {
      if (error) console.error(error);
      else {
        const imageUrls = getImagesFromWebUrl(html)
        await downloadImages(imageUrls, dest);
        const htmlContent = getHtmlContent();
        await writeHtmlFile(dest, htmlContent, imageUrls, webUrl);
      }
    });
  } catch (error) {
    console.error(error);
  }
};

main();
