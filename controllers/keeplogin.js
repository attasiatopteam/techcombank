const axios = require('axios')

module.exports = function keeplogin(token,device){
  let data = '';
  var config = {
    method: 'post',
    url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:OK\',action:\'click\'}',
    headers: { },
    data : data
  };
  axios(config)
  .then(function (response) {
    let config = {
      method: 'post',
      url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Nhập mã mở khoá để xác thực\',action:\'getText\'}',
      headers: { },
      data : ""
    };
    axios(config)
    .then(function (response) {
      if(response.data.value.retval){
        let data = '';
        let config = {
          method: 'post',
          url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/screen/texts?token='+token+'&text='+"25800",
          headers: { },
          data : data
        };
        axios(config)
        .then(async function (response) {
          keeplogin(token,device)
        })
        .catch(function (error) {
          console.log(error);
        });
      }else{
        keeplogin(token,device)
      }
    }).catch(err => console.log(err))
  }).catch(function (error) {
    console.log(error);
  });
}



