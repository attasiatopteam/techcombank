const express = require('express')
const Router = express.Router()
const {
    createQueue,
    getQuere,
    deleteQueue
} = require('../controllers/queue.controller')

Router.route('/').post(createQueue).get(getQuere).delete(deleteQueue)

module.exports = Router