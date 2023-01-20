const express = require('express')
const app = express()
const cors = require('cors')
const Router = require('./routers')
const connectDb = require('./config/database')
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static('./public'))
app.use(cors())

Router(app)
connectDb()

app.get('/',(req,res,next)=>{
  res.render('index')
})

app.listen('5000',()=>{
  console.log("server running at port 3000")
})