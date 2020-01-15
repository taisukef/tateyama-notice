const rp = require('request-promise');
const cheerio = require('cheerio');
const options = { transform: (body) => cheerio.load(body) }

const main = async function() {
  const url = 'https://service.sugumail.com/tateyama/m/b/i/'
  const res = await rp.get(url, options)
  res.apparent_encoding
  console.log(res('title').text())
}

main()

