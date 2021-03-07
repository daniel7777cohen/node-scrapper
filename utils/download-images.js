const Path = require('path');
const fs = require('fs');
const request = require('request');
const { isBase64Url, getSlicedBase64 } = require('./common');

const downloadImages = async (imageUrls, dest) => {
  let extendedDest = getRelativePath(dest, 'Images');
  createImagesFolder(extendedDest);
  for (const imgUrl of imageUrls) {
    await downloadImage(imgUrl, extendedDest, () => {
      console.log(`✅ ${imgUrl} downloaded successfully!`);
    });
  }
};

const getRelativePath = (dest, extention) => {
  return Path.resolve(dest, extention);
};

const downloadImage = async (imgUrl, extendedDest, cb) => {
  try {
    let filename;
    let path;
    if (imgUrl.startsWith('https')) {
      filename = `${imgUrl.substring(imgUrl.lastIndexOf('/') + 1)}`;
      path = getRelativePath(extendedDest, filename);
      try {
        const writer = fs.createWriteStream(path);
        request(imgUrl).pipe(writer);
        cb();
      } catch (error) {
        console.error(error);
      }
    } else if (isBase64Url(imgUrl)) {
      const slicedBase64 = getSlicedBase64(imgUrl);
      filename = `${new Date().getTime()}-imageBase64.png`;
      path = getRelativePath(extendedDest, `${filename}`);
      
      fs.writeFile(path, slicedBase64, { encoding: 'base64' }, (err) => {
        if (err) {
          console.error(err);
        } else {
          cb();
        }
      });
    }
  } catch (error) {
    console.error(error);
  }
};
const createImagesFolder = (extendedDest) => {
  fs.mkdirSync(`${extendedDest}`, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = {
  downloadImages,
};
