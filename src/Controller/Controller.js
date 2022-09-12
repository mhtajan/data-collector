const fs = require('fs')
const {Worker} = require('worker_threads')
const logger = require('./Logger')
const Act_worker = require(`./Components/Activities.js`)
const Grp_worker = require(`./Components/Group.js`)
const Inc_worker = require(`./Components/Inactive.js`)
const Mnt_worker = require(`./Components/Maintenance.js`)
const Prf_worker = require(`./Components/Profiles.js`)

function tokenizer(body) {
  ensureDirectoryExistence()
  logger.info("test")
  Act_worker(body)
  Grp_worker(body)
  Inc_worker(body)
  Mnt_worker(body)
  Prf_worker(body)
}


function ensureDirectoryExistence() {
  if (fs.existsSync('./ISO_reports/')) {
    return true
  }
  fs.mkdirSync('./ISO_reports/')
}

module.exports = tokenizer