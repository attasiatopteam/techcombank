const express = require('express')
const app = express()
const cors = require('cors')
const Router = require('./routers')
const connectDb = require('./config/database')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cors())
app.get('/',(req,res,next)=>{
  res.send("hello")
})

Router(app)
connectDb()

app.listen('3000',()=>{
  console.log("server running at port 3000")
})

