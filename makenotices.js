const request = require('request')
const cheerio = require('cheerio')
const Iconv = require('iconv').Iconv;
const fs = require('fs');

const get = function(url, fname) {
  request({url: url, encoding: null }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var iconv = new Iconv('SJIS', 'UTF-8//TRANSLIT//IGNORE');
      body = iconv.convert(body).toString();
      fs.writeFileSync(fname, body)

      //console.log(body)
      const dom = cheerio.load(body)
      //console.log(dom('title').text())
      console.log(dom('a').attr('href'))
    }
  })
}
const getAsync = async function(url) {
  return new Promise(res => {
    request({ url: url, encoding: null }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var iconv = new Iconv('SJIS', 'UTF-8//TRANSLIT//IGNORE');
        body = iconv.convert(body).toString();
        res(body)
      }
    })
  })
}

// get('https://service.sugumail.com/tateyama/m/b/i/', 'test.html')
//get('https://service.sugumail.com/tateyama/mobile/back_numbers/detail_mail/2775831', 'detail.html')

const parse = function(body) {
  const dom = cheerio.load(body)
  //console.log(dom('title').text()) // バックナンバー
  //console.log(dom('a').attr('href'))
  let res = []
  dom('a').each(function() {
    const link = dom(this)
    const text = link.text()
    const href = link.attr('href')
    console.log(text, href)
    if (href && href.indexOf('detail') >= 0)
      res.push(href)
  })
  return res
}
const parseDetail = function(body) {
  const dom = cheerio.load(body)
  //console.log(dom('title').text()) // 本文表示
  let text = dom('body').text()
  text = text.substring(text.indexOf('配信日時') + 4, text.lastIndexOf('戻る')).trim()
  //console.log(text)
  return text
}
const getDetail = async function(url) {
//const detail = 'https://service.sugumail.com/tateyama/mobile/back_numbers/detail_mail/2775831'
  const body = await getAsync(url)
  const text = parseDetail(body)
  return text
}
const getNotices = async function() {
  const url = 'https://service.sugumail.com/tateyama/m/b/i/'
  //const urld = '/tateyama/mobile/back_numbers/detail_mail/2775831'
  const all = await getAsync(url)
  const links = parse(all)
  let res = []
  for (const path of links) {
    const baseurl = 'https://service.sugumail.com'
    let urld = baseurl + path

    const t = await getDetail(urld)
    console.log(urld)
    console.log(t)
    if (urld.indexOf('?') >= 0) {
      urld = urld.substring(0, urld.lastIndexOf('?'))
    }
    res.push({ url: urld, body: t })
  }
  return { notices: res }
}

/*
const body = fs.readFileSync('test.html', 'utf-8')
//console.log(body)
//parse(body)

const bodyd = fs.readFileSync('detail.html', 'utf-8')
parseDetail(bodyd)


*/
const main = async function() {
  const data = await getNotices()
  const json = JSON.stringify(data)
  console.log(json)
  fs.writeFileSync('notices.json', json)
}

main()

