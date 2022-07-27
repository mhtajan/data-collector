const axios = require('axios').default

function getMainteReport(body) {
  axios({
    method: 'get',
    url:
      'https://apps.mypurecloud.jp/platform/api/v2/audits/query/servicemapping',
    headers: { Authorization: 'Bearer ' + body.access_token },
  })
    .then((response) => {
      console.log(response.data)
    })
    .catch((e) => console.error(e))
}

module.exports = getMainteReport
