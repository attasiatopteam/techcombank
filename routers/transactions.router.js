const express = require('express')
const Router = express.Router()
const {
    createtrans,
    getTrans,
    getAllTrans,
    deletetrans
} = require('../controllers/transactions.controller')

Router.route('/').get(getTrans).post(createtrans).delete(deletetrans)
Router.route('/all_trans').get(getAllTrans)
module.exports = Router