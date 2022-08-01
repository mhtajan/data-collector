const axios = require(`axios`)
const download = require('download')
const fetch = require('node-fetch')
const moment = require(`moment`)
var datetime = moment().format('YYYY_MM_DD_HH_mm_ss')
const logger = require('./logger.js')
const { workerData, parentPort } = require('worker_threads')
let opts = {
  pageNumber: 1,
  pageSize: 25,
}
getReport(workerData)
function getReport(body) {
  const options = {
    headers: {
      Authorization: `Bearer ${body}`,
      ContentType: `application/json`,
    },
  }

  getData()
  function getData() {
    axios({
      method: 'get',
      url:
        'https://apps.mypurecloud.jp/platform/api/v2/analytics/reporting/exports',
      headers: { Authorization: 'Bearer ' + body },
      params: opts,
    })
      .then((response) => {
        res = response.data
        entity = res.entities
        if (res.pageCount >= res.pageNumber) {
          entity.forEach((entry) => {
            const fileoption = {
              filename: `${entry.viewType}_${datetime}_${entry.id}.csv`,
            }

            if (entry.status.includes('COMPLETED')) {
              fetch(entry.downloadUrl, options)
                .then((res) => {
                  download(res.url, './reports', fileoption).then(() => {
                    logger.info(
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
          logger.info('there is no data')
        }
      })
      .catch((e) => console.error())
  }
}
