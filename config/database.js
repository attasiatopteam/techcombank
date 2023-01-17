const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
module.exports = async()=>{
    try {
        await mongoose.connect('mongodb://127.0.0.1/attpay')
        console.log("Database Connected!")
    } catch (error) {
        console.log(error)
    }
}