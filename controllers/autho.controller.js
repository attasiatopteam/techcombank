const fs = require('fs')
const axios = require('axios');
module.exports = {
  createLogin : (req,res,next)=>{
    let auth = btoa(req.body.username+":"+req.body.password)
    let config = {
      method: 'get',
      url: 'http://localhost:8090/TotalControl/v2/login',
      headers: { 
        'Authorization': auth
      }
    };
    axios(config)
    .then(function (response) {
      console.log(response.data.status)
      if(response.data.status==true){
        let token = response.data.value.token
        let config = {
          method: 'get',
          url: 'http://localhost:8090/TotalControl/v2/devices?q=all&token='+token,
        };
        axios(config)
        .then(function (response) {
          let data = {
            statuscode:200,
            valid:true,
            device: response.data.ids[0],
            token: token
          }
          fs.writeFile('constant/auth.json', JSON.stringify(data) , function (err) {
            if (err) throw err;
            res.json(data);
          });
        }).catch(err => console.log(err))
      }else{
        res.json({
          statuscode:403,
          valid:false,
          err: "Sai thông tin đăng nhập"
        })
      }
    }).catch(err => console.log(err))
  },
  login: (req,res,next)=>{
    let readFile = fs.readFileSync('data/auth.json')
    let jdata = JSON.parse(readFile)
    res.json(jdata)
  }
}