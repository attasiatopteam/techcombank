const express = require('express')
const Router = express.Router()
const {
    createLogin,
    login
} = require('../controllers/autho.controller')

Router.route('/').post(createLogin).get(login)

module.exports = Router