const isBase64Url = (imgUrl) => {
  return Buffer.from(imgUrl, 'base64').toString('base64') === imgUrl;
};

const getSlicedBase64 = (imgUrl) => {
  return imgUrl.split(';base64,').pop();
};

module.exports = {
  isBase64Url,
  getSlicedBase64
};
