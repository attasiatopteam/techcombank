const transfer = require('./transfer.router')
const autho = require('./autho.router')
const queue = require('./queue.router')
const trans = require('./transactions.router')

module.exports = (app)=>{
    app.use('/transfer', transfer)
    app.use('/autho', autho)
    app.use('/addqueue', queue)
    app.use('/trans', trans)
}