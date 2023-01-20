let sumbit = document.querySelectorAll('.submit')
sumbit[0].  addEventListener('click',()=>{
  let baseUrl = document.getElementsByClassName('url')[0].value
  let auth = document.getElementsByClassName('select_auth')[0].value
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    "baseUrl": baseUrl
  });

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://localhost:5000/autho?auth="+auth, requestOptions)
    .then(response => response.text())
    .then(result => {
      if(result.valid==false){
        alert("Không Tìm thấy tài khoản")
        document.getElementsByClassName('result')[0].textContent="Thất bại!"
        document.getElementsByClassName('result')[0].style.background="red"
      }else{
        document.getElementsByClassName('result')[0].textContent="Thành công!"
        document.getElementsByClassName('result')[0].style.background="rgb(47, 255, 116)"
      }
    })
    .catch(error => console.log('error', error));
  // let auth = document.getElementsByClassName('select_auth')[0].value
  // let username = document.getElementsByClassName('username')[0]
  // let password = document.getElementsByClassName('password')[0]
  // let baseUrl = document.getElementsByClassName('url')[0]
  // let myHeaders = new Headers();
  // myHeaders.append("Content-Type", "application/json");
  
  // let raw = JSON.stringify({
  //   "username": username.value,
  //   "password": password.value,
  //   "url": baseUrl.value
  // });
  
  // let requestOptions = {
  //   method: 'POST',
  //   headers: myHeaders,
  //   body: raw,
  //   redirect: 'follow'
  // };
  
  // fetch("http://localhost:3000/connection?auth="+auth+"&device="+auth, requestOptions)
  //   .then(response => response.json())
  //   .then(result => {
  //     if(!result.device){
  //       alert("Chưa kết nối thiết bị")
  //       document.getElementsByClassName('result')[0].textContent="Thất bại!"
  //       document.getElementsByClassName('result')[0].style.background="red"
  //     }else{
  //       document.getElementsByClassName('result')[0].textContent="Thành công!"
  //       document.getElementsByClassName('result')[0].style.background="rgb(47, 255, 116)"
  //     }
  //   })
  //   .catch(error => console.log('error', error));
})