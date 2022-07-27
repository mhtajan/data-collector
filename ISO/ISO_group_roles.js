const fetch = require(`node-fetch`)
const axios = require('axios')
let opts = {
  pageSize: 500,
  pageNumber: 1,
}
function isoDL(token) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/groups',
    headers: { Authorization: 'Bearer ' + token.access_token },
    params: opts,
  })
    .then((response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach((entry) => {
          //console.log(entry.id)
          getSub(token, entry.id)
          getMember(token, entry.id)
        })
        opts.pageNumber = opts.pageNumber + 1
        isoDL(token)
      }
    })
    .catch((e) => console.error(e))
}

function getSub(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/authorization/subjects/${id}`,
    headers: { Authorization: 'Bearer ' + token.access_token },
  })
    .then((response) => {
      //console.log(response.data)
    })
    .catch((e) => console.error(e))
}

function getMember(token, id) {
  axios({
    method: 'get',
    url: `https://apps.mypurecloud.jp/platform/api/v2/groups/${id}/members`,
    headers: { Authorization: 'Bearer ' + token.access_token },
    params: opts,
  })
    .then((response) => {
      res = response.data
      if (res.pageCount >= res.pageNumber) {
        entities = res.entities
        entities.forEach((entry) => {
          //console.log(entry)
        })
        opts.pageNumber = opts.pageNumber + 1
      }
    })
    .catch((e) => console.error(e))
}
module.exports = isoDL
