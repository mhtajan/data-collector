const fetch = require(`node-fetch`)

function getReport(body) {
  return fetch(`https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${body.token_type} ${body.access_token}`
    }
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    })
    .then(jsonResponse => {
      console.log(jsonResponse);
    })
    .catch(e => console.error(e));
}

module.exports = getReport