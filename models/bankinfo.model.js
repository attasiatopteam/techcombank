const mongoose = require('mongoose')
const bank_info = mongoose.Schema({
    bank:{
        type:String,
        default:"TCB1"
    },
    account_name:String,
    botoken:String,
    balance:String
})

module.exports = mongoose.model("bank_info",bank_info)