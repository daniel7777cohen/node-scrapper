const probe = require('probe-image-size');
const cheerio = require('cheerio');
const fs = require('fs');

const getHeight = (width, height) => {
  const orgHeightProportion = height / width;
  return width >= 120 ? orgHeightProportion * 120 : orgHeightProportion * width;
};

const updatedGrid = async (grid, imageUrls) => {
  for (const imgUrl of imageUrls) {
    if (imgUrl.startsWith('https://')) {
      try {
        console.log(`getting info for ${imgUrl}`);
        const { width, height, type } = await probe(imgUrl);
        let calculatedHeight = getHeight(width, height);

        grid.append(
          `
              <div class="grid-item">
              <img src=${imgUrl} loading=lazy height=${calculatedHeight} alt="img" width=${width} class="gallery__img-1">
               <div class="originalDetails">
                <ul>
                  <li> <a href=${imgUrl} target=_blank>View Original Image</a></li>
                  <li><span>Original Width : ${width}</span></li>
                  <li><span>Original Height : ${height}</span></li>
                  <li><span>Type : ${type}</span></li>
                </ul></div></div>`
        );
      } catch (error) {
        console.error(error);
      }
    }
  }
  return grid;
};

const getHtmlFileName = (url) => {
  // https://www.google.com
  const splitedUrl = url.split('.');
  return splitedUrl[1];
};

const writeHtmlFile = async (dest, htmlContent, imageUrls, url) => {
  const $ = cheerio.load(htmlContent);
  const header = $(`.header`);
  const grid = $(`.grid`);

  header.prepend(`<h1>Scraped Images From ${url}</h1>`);

  await updatedGrid(grid, imageUrls);
  const newHtml = $.html();
  const htmlFileName = getHtmlFileName(url);
  console.log('writing content to html file...');
  fs.writeFile(`${dest}/${htmlFileName}-index.html`, newHtml, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`${dest}/${htmlFileName}-index.html-index.html created`);
    }
  });
};

const getHtmlContent = () => `
<!DOCTYPE html>
<html>
<head>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
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
.gallery__img-1 {
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
