const express = require('express')
const Router = express.Router()
const {
    getData
} = require('../controllers/bodata.cotroller')

Router.route('/').post(getData)

module.exports = Router