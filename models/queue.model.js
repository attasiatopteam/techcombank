const { Timestamp } = require('mongodb')
const mongoose = require('mongoose')
const queue = mongoose.Schema({
    auditor: String,
    withdrawid: {
        type:String,
        unique: true,
        require:true
    },
    player_id: {
        type:String,
        require:true
    },
    name: {
        type:String,
        require:true
    },
    amount: {
        type:Number,
        require:true
    },
    account: {
        type:String,
        require:true
    },
    bank: {
        type:String,
        require:true
    },
    mess: {
        type:String,
        require:true
    }
}, { timestamps: true }))

module.exports = mongoose.model("queue",queue)