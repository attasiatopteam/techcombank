const express = require('express')
const Router = express.Router()
const {
    createQueue,
    deleteQueue
} = require('../controllers/queue.controller')

Router.route('/').post(createQueue).delete(deleteQueue)

module.exports = Router