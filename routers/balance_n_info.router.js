const express = require('express')
const Router = express.Router()
const {
    createAcc,
    getAcc,
    deleteAcc
} = require('../controllers/blance_n_info')

Router.route('/').post(createAcc).get(getAcc).delete(deleteAcc)

module.exports = Router