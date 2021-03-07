const probe = require('probe-image-size');
const cheerio = require('cheerio');
const fs = require('fs');
const sizeOf = require('image-size');
const sharp = require('sharp');
const { isBase64Url, getSlicedBase64 } = require('./common');

const writeHtmlFile = async (dest, htmlContent, imageUrls, webUrl) => {
  const $ = cheerio.load(htmlContent);
  const header = $(`.header`);
  const grid = $(`.grid`);

  header.prepend(`<h1>Scraped Images From ${webUrl}</h1>`);
  await updatedGrid(grid, imageUrls);
  const newHtml = $.html();

  const htmlFileName = getHtmlFileName(webUrl);
  console.log('writing content to html file...');
  fs.writeFile(`${dest}/${htmlFileName}-index.html`, newHtml, (error) => {
    if (error) {
      console.error(error);
    } else {
      console.log(`${dest}/${htmlFileName}-index.html created`);
    }
  });
};

const updatedGrid = async (grid, imageUrls) => {
  let processedHeight;
  let processedWidth;

  for (const imgUrl of imageUrls) {
    if (imgUrl.startsWith('https://')) {
      try {
        console.log(`getting info of ${imgUrl}`);
        const { width, height, type } = await probe(imgUrl);

        processedWidth = width > 120 ? 120 : width;
        processedHeight = getProcessedHeight(width, height);

        const gridData = {
          src: imgUrl,
          height,
          width,
          imgUrl,
          processedWidth,
          processedHeight,
          type,
        };

        appendDataToGrid(grid, gridData);
      } catch (error) {
        console.error(error);
      }
    } else if (isBase64Url(imgUrl)) {
      console.log(`getting info for a base64 url`);
      const slicedBase64 = getSlicedBase64(imgUrl);
      const img = Buffer.from(slicedBase64, 'base64');
      const { width, height } = sizeOf(img);

      processedWidth = width > 120 ? 120 : width;
      processedHeight = getProcessedHeight(width, height);

      const resizedBase64 = getResizedBase64(
        imgUrl,
        processedWidth,
        processedHeight
      );
      const gridData = {
        src: resizedBase64,
        height,
        width,
        imgUrl,
        processedWidth,
        processedHeight,
        type: 'base64',
      };

      appendDataToGrid(grid, gridData);
    }
  }
};

const appendDataToGrid = (
  grid,
  { src, height, width, imgUrl, processedWidth, processedHeight, type }
) => {
  grid.append(
    `
        <div class="grid-item">
        <img src=${src} loading=lazy height=${processedHeight} alt="img" width=${processedWidth} class="gallery">
         <div class="originalDetails">
          <ul>
              <li> <a href=${imgUrl} target=_blank download \>View Original Image</a></li>
            <li><span>Original Width : ${width}</span></li>
            <li><span>Original Height : ${height}</span></li>
            <li><span>Type : ${type}</span></li>
          </ul></div></div>`
  );
};

const getProcessedHeight = (width, height) => {
  const orgHeightProportion = height / width;
  const processedHeight =
    width >= 120 ? orgHeightProportion * 120 : orgHeightProportion * width;
  return Math.round(processedHeight);
};

const getResizedBase64 = async (imgUrl, processedWidth, processedHeight) => {
  const parts = imgUrl.split(';');
  const mimType = parts[0].split(':')[1];
  const imageData = parts[1].split(',')[1];

  const imgBuffer = new Buffer(imageData, 'base64');
  const resizedImageBuffer = await sharp(imgBuffer)
    .resize(processedWidth, processedHeight)
    .toBuffer()
    .catch((error) => {
      console.error(error);
    });
  let resizedImageData = resizedImageBuffer.toString('base64');
  return `data:${mimType};base64,${resizedImageData}`;
};

const getHtmlFileName = (webUrl) => {
  const splitedUrl = webUrl.split('.');
  return splitedUrl[1];
};

const getHtmlContent = () => `
<!DOCTYPE html>
<html>
<head>
</head>
<style>

*{
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
  font-weight:bold;
  }
  ul{
    list-style-type: none;
  }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-row-gap: 20px;
  justify-items: center;
  margin: 10px 0;
}

.grid-item{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 5px double #9e6adc;  width: 300px;
  align-items: center;
  padding:20px;
}
.gallery {
  max-width:120px;
  margin:15px 0;
}
.originalDetails{
  line-height: 1.5;
}
.originalDetails .url {
  overflow-wrap: break-word;
}
.header{
  margin:10px 0;
  text-align:center;
  h1{
    color:red;
  }
}
</style>
  <body
    <div class="header"></div>
    <div class="grid"> </div>
  </body>
</html>
`;

module.exports = {
  getHtmlContent,
  writeHtmlFile,
};
