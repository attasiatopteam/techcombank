const axios = require('axios')
const fs = require('fs');
module.exports = function keeplogin(baseUrl,device,token){
  let data = '';
  var config = {
    method: 'post',
    url: baseUrl+'keeplogin?device='+device+'&token='+token,
    headers: { },
    data : data
  };
  axios(config)
  .then(function (response) {
    console.log(response.data)
  }).catch(function (error) {
    console.log(error)
  });
}



