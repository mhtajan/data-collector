const axios = require(`axios`)
const download = require('download')
const fetch = require('node-fetch')
const moment = require(`moment`)
var datetime = moment().format('YYYY_MM_DD_hh_mm_ss.SSSSS')

let opts = {
  pageNumber: 1,
  pageSize: 25,
}

function getReport(body) {
  const options = {
    headers: {
      Authorization: `Bearer ${body.access_token}`,
      ContentType: `application/json`,
    },
  }

  getData()
  function getData() {
    axios({
      method: 'get',
      url:
        'https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports',
      headers: { Authorization: 'Bearer ' + body.access_token },
      params: opts,
    })
      .then((response) => {
        res = response.data
        entity = res.entities
        if (res.pageCount >= res.pageNumber) {
          entity.forEach((entry) => {
            const fileoption = {
              filename: `${entry.viewType}_${datetime}.csv`,
            }

            if (entry.status.includes('COMPLETED')) {
              fetch(entry.downloadUrl, options)
                .then((res) => {
                  download(res.url, './reports', fileoption).then(() => {
                    console.log(
                      `Complete Downloading - ${Object.values(fileoption)}`,
                    )
                  })
                })
                .catch((e) => console.error(e))
            }
          })
          opts.pageNumber = opts.pageNumber + 1
          getData()
        } else if ((res.total = 0)) {
          console.log('there is no data')
        }
      })
      .catch((e) => console.error(e))
  }
}

module.exports = getReport
