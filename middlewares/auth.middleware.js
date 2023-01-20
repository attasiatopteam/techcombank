const fs = require('fs')
const axios = require('axios');
module.exports = (req,res,next)=>{
  let data = JSON.parse(fs.readFileSync('constant/auth'+(req.query.auth*1+1)+'.json'))
  let config = {
    method: 'get',
    url: req.body.baseUrl+'connection?auth='+req.query.auth,
    headers: { 
      'Content-Type': 'application/json'
    },
  };
  console.log(config.url)
  axios(config)
  .then(function (response) {
    try {
      req.data = data
      next()
    } catch (error) {
      res.json(error)
    }
  })
  .catch(function (error) {
    console.log(error);
  });
}