const bankInfo = require('../models/bankinfo.model')

module.exports = {
  createAcc: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let find = await bankInfo.findOneAndUpdate({account_name:body.account_name},{balance:body.balance},{new:true}).exec()
      if(find){
        res.json(find)
      }else{
        let create = await bankInfo.create(body)
        res.json({
          status_code: 200,
          valid:true,
          data: create
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

  getAcc: async(req,res,next)=>{
    let {...query} = req.query
    try {
      let account = await bankInfo.findOne(query)
      res.json(account)
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: error
      })
    }
    
  },
  deleteAcc: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let deletebankInfo = await bankInfo.deleteMany(body)
      res.json({
        status_code: 200,
        valid:true,
        data: deletebankInfo
      })
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: deletebankInfo
      })
    }
  }
}