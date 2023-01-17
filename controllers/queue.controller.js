const queue = require('../models/queue.model')

module.exports = {
  createQueue: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let create = await queue.create(body)
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
  deleteQueue: async(req,res,next)=>{
    let {...body} = req.body
    try {
      let deleteQueue = await queue.deleteMany(body)
      res.json({
        status_code: 200,
        valid:true,
        data: deleteQueue
      })
    } catch (error) {
      res.json({
        status_code:503,
        valid:false,
        error: deleteQueue
      })
    }
  }
}