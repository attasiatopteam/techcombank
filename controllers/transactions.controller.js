const transactions = require('../models/transactions.model')

module.exports = {
  createtrans: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let create = await transactions.create(body)
      res.json({
        status_code: 200,
        valid:true,
        data: create
      })
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: error
      })
    }
  },
  getTrans: async(req,res,next)=>{
    let {...query} = req.query
    try {
      let trans = await transactions.findOne({withdrawid:query.withdrawid})
      if(trans!=null){
        res.json(trans)
      }else{
        res.json({
          status_code:404,
          valid:false,
          error: "Transaction not found!"
        })
      }
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: error
      })
    }
  },
  getAllTrans: async(req,res,next)=>{
    let {...query} = req.query
    try {
      let trans = await transactions.find({
        createdAt: {
            $gte: new Date(query.start*1), 
            $lt: new Date(query.end*1)
        }
      })
      if(trans!=null){
        res.json(trans)
      }else{
        res.json({
          status_code:404,
          valid:false,
          error: "Transaction not found!"
        })
      }
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: error
      })
    }
  },
  deletetrans: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let del = await transactions.deleteMany(body)
      res.json({
        status_code: 200,
        valid:true,
        data: del
      })
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: error
      })
    }
  }
}