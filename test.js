const rp = require('request-promise');
const cheerio = require('cheerio');

const options = {
  transform: (body) => {
    return cheerio.load(body);
  }
};

const urls = [
  'https://www.amazon.com',
  'https://www.google.com/',
];

const promises = urls.map((url)=> {
  return (async () => {
    try {
      const $ = await rp.get(url, options);
      return $('title').text();
    } catch(error) {
      console.error('Error:', error);
    }
  })();
});
Promise.all(promises).then((result) => {
  console.log(result);
});
