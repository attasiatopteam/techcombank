const express = require('express')
const Router = express.Router()
const transfer = require('../controllers/transfer.controller')
const auth = require('../middlewares/auth.middleware')

Router.route('/').post(auth,transfer)

module.exports = Router