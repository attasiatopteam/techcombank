const express = require('express')
const Router = express.Router()
const transfer = require('../controllers/transfer.controller')

Router.route('/').post(transfer)

module.exports = Router