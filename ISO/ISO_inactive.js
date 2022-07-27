const axios = require('axios').default

function get_inactive(body) {
  axios({
    method: 'get',
    url: 'https://apps.mypurecloud.jp/platform/api/v2/users',
    headers: { Authorization: 'Bearer ' + body.access_token },
  })
    .then((response) => {
      data = response.data
      entities = data.entities
      entities.forEach((entry) => {
        if (entry.state == 'inactive') {
          //console.log(entry)
        }
      })
    })
    .catch((e) => console.error(e))
}

module.exports = get_inactive
