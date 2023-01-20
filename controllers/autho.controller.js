const fs = require('fs')
const axios = require('axios');
module.exports = {
  createLogin: (req,res,next)=>{
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
        fs.writeFile('constant/auth'+(req.query.auth*1+1)+'.json', JSON.stringify(response.data) , function (err) {
          if (err) throw err;
          res.json(response.data);
        });
      } catch (error) {
        res.json(error)
      }
    })
    .catch(function (error) {
      res.json({
        statusCode:404,
        valid:false,
        mess:error.message
      })
    });
  }
}