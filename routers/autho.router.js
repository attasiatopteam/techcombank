const express = require('express')
const Router = express.Router()
const {
    createLogin
} = require('../controllers/autho.controller')

Router.route('/').post(createLogin)

module.exports = Router