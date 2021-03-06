const Path = require('path');
const fs = require('fs');
const https = require('https');

const getRelativePath = (dest, extention) => {
  return Path.resolve(dest, extention);
};

const download = async (image, extendedDest, cb) => {
  try {
    let filename;
    let path;

    if (image.startsWith('data:')) {
      const data = image.replace(/^data:image\/\w+;base64,/, '');
      filename = `${new Date().getTime()}-imageBase64.png`;
      path = getRelativePath(extendedDest, `${filename}`);
      fs.writeFile(path, data, { encoding: 'base64' }, (err) => {
        if (err) {
          console.log('error', err);
        }
      });
    } else if (image.startsWith('https')) {
      filename = `${image.substring(image.lastIndexOf('/') + 1)}`;
      path = getRelativePath(extendedDest, filename);
      const writer = fs.createWriteStream(path);
      https.get(image, function (res) {
        res.pipe(writer);
      });
    }
    cb();
  } catch (error) {
    console.log(error);
  }
};

const createImagesFolder = (extendedDest) => {
  fs.mkdirSync(`${extendedDest}`, { recursive: true }, (err) => {
    if (err) {
      console.log(
        'Images folder allready exsits, downloading data into folder'
      );
    }
  });
};
const downloadImages = async (imageUrls, dest) => {
  let extendedDest = getRelativePath(dest,'Images')
  createImagesFolder(extendedDest);
  for (const img of imageUrls) {
    await download(img, extendedDest, () => {
      console.log(`✅ ${img} downloaded successfully!`);
    });
  }
};

module.exports = {
  downloadImages,
};
