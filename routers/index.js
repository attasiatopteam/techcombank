const transfer = require('./transfer.router')
const autho = require('./autho.router')
const queue = require('./queue.router')
const trans = require('./transactions.router')
const bankInfo = require('./balance_n_info.router')

module.exports = (app)=>{
    app.use('/transfer', transfer)
    app.use('/autho', autho)
    app.use('/addqueue', queue)
    app.use('/trans', trans)
    app.use('/bankinfo', bankInfo)
}