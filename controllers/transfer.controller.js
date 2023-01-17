const axios = require('axios')
const puppeteer = require('puppeteer');
const dateValue = require('../constant/date')
const bankList = require('../constant/bank')
const removeTone = require('../middlewares/removeVietnameseTone')
const bankInfo = require('../models/bankinfo.model')
const queue = require('../models/queue.model')
const transactions = require('../models/transactions.model')
const keeplogin = require('../controllers/keeplogin')
const fs = require('fs')
let data = fs.readFileSync('constant/auth.json')
let auth = JSON.parse(data)
var device = auth.device
var token = auth.token
var otp = "2580"
var page = "a"

keeplogin(token,device)
var loadbodata = async() => {
  try {
    let getInfo = await queue.findOne().exec()
    if(getInfo){
      return getInfo
    }else{
      return false
    }
  } catch (error) {
    return false
  }
}

async function login(req,res,next){
  return puppeteer.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials'
    ]
}).then(async function(browser) {
    const page = await browser.newPage();
    try {
      await page.goto('https://onlinebanking.techcombank.com.vn/#/login',{timeout: 0});
      await page.waitForSelector('.dropdown-item')
      await page.evaluate(()=>{
        document.getElementsByClassName('dropdown-item')[0].click()
      })
      await page.waitForSelector('#username')
      await page.click('[id="username"]',{timeout: 0})
      await page.keyboard.type(req.body.username)
      await page.click('[id="password"]',{timeout: 0})
      await page.keyboard.type(req.body.password)
      await page.click('[id="kc-form-buttons"]',{timeout: 0})
      confirmLogin(page)
      await page.waitForSelector('.tcb-topbar__nav-expand-marker',{timeout: 0})
      page.goto("https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other")
      transfer(page)
    }catch(error){
      console.log({
        satuscode: 500,
        mess:"Input login: Failed",
        err:error
      })
    }
  })
}

async function confirmLogin(page){
  console.log("Input login: Pass")
  let config = {
    method: 'post',
    url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/screen/inputs?token='+token+'&x=300&y=200&state=press',
    headers: { },
    data:""
  };
  setTimeout(()=>{
    axios(config)
    .then(function (response) {
      let config = {
        method: 'post',
        url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Cho phép đăng nhập\',action:\'click\'}',
        headers: { },
        data : ""
      };
      axios(config)
      .then(function (response) {
        console.log(response.data.value.retval)
        if(!response.data.value.retval){
          confirmLogin(page)
        }else{
          enterOtp(page)
        }
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },2000)
}

async function enterOtp(){
  var config = {
    method: 'post',
    url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Nhập mã mở khoá để xác thực\',action:\'getText\'}',
    headers: { },
    data : ""
  };
  axios(config)
  .then(function (response) {
    if(!response.data.value.retval){
      enterOtp()
    }else{
      var config = {
        method: 'post',
        url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/screen/texts?token='+token+'&text='+otp,
        headers: { }
      };
      setTimeout(()=>{
        axios(config)
        .then(function (response) {
          console.log("OTP: Pass")
        })
        .catch(function (error) {
          console.log("OTP: Failed")
        });
      },500)
    }
  }).catch(function (error) {
    console.log(error);
  });
}

async function transfer(page){
  loadbodata().then( async e =>{
    let bank_info = await page.$eval('.bb-account-info__product-number',(e)=>{
      return e.textContent
    })
    console.log(bank_info)
    let bank_balance = await page.$eval('.integer',(e)=>{
      return e.textContent
    })
    console.log(bank_balance)
    let findAccount = await bankInfo.findOneAndUpdate({account_name:bank_info},{balance:bank_balance},{new:true}).exec()
    console.log(findAccount)
    if(!findAccount){
      try {
        await bankInfo.create({
          account_name:bank_info,
          balance:bank_balance
        })
      } catch (error) {
        transfer(page)
      }
    }
    if(e!=false){
      let allData = e
      var bankDefine = bankList[allData.bank]
      console.log("Load data: Pass")
      let checkWithdraw = await transactions.findOne({withdrawid:allData.withdrawid}).exec()
      if(checkWithdraw){
        try {
          console.log("State: "+checkWithdraw.withdrawid)
          await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
          transfer(page)
        } catch (error) {
          transfer(page)
        }
      }else{
        let amount = allData.amount
        let playerName = allData.name
        let account = allData.account
        await page.waitForSelector('.selector-input',{timeout: 10000}).catch((err)=>{
          console.log(err)
          transfer(page)
        })   
        let ammount = await page.waitForXPath(`//input[@placeholder='0']`) 
        await page.evaluate(async(amount) => { 
          document.getElementsByClassName("input-amount")[0].value=amount
        },amount);
        await ammount.click()
        await ammount.type(" ")
        console.log("Set Amount: Pass")
        await page.click('[class="selector-input"]',{timeout: 0})
        let choosebank = await page.waitForXPath(`//input[@placeholder='Select a bank']`) 
        await choosebank.click()
        await page.waitForSelector('.bank-item',{timeout: 15000}).catch((err)=>{
          console.log(err)
          transfer(page)
        })  
        await page.evaluate(async(bankDefine) => {
          let bank = document.querySelectorAll('.bank-item')
          bank.forEach(e =>{
            console.log(bankDefine)
            if(e.textContent.includes(bankDefine)){
              e.click()
            }
          })
        },bankDefine);
        console.log("Chose bank: Pass")
        let benificialinput = await page.waitForXPath(`//input[@aria-label='beneficiary']`,{timeout: 0}) 
        await page.evaluate(async(account) => {
          document.getElementsByClassName("beneficiary-input__input form-control")[0].value=account
        },account);
        await benificialinput.click()
        await benificialinput.type(" ")
        console.log("Set Account: Pass")
        let message = await page.waitForXPath(`//textarea[@formcontrolname='description']`,{timeout: 0}) 
        var bankmess = removeTone(playerName).toUpperCase()
        await page.evaluate(async(bankmess) => {
          document.querySelectorAll('textarea')[0].value= bankmess
        },bankmess);
        await message.click()
        await message.type(" ")
        console.log("Set Message: Pass")
        let checkAmount = await page.$eval('.input-amount',(e)=> e.value.replace(/\,/g,''))
        if((checkAmount*1)==(amount*1)){
          try {
            console.log("Check Amount: Pass")
            await page.waitForXPath(`//bb-input-text-ui[@formcontrolname="accountName"]`,{timeout: 30000})
            await page.evaluate(async() => {
              document.getElementsByClassName('bb-load-button')[0].click()
            });
            await page.waitForSelector('.text-uppercase',{timeout: 30000})
            console.log('okla')
            let bankAccName = await page.$eval('.text-uppercase',(e)=>{
              return document.getElementsByClassName('text-uppercase')[1].textContent
            })
            console.log(bankAccName.replace(/\s/g,''))
            console.log(playerName.replace(/\s/g,''))
            console.log(removeTone(playerName).replace(/\s/g,'').toUpperCase()==removeTone(bankAccName).replace(/\s/g,'').toUpperCase())
            if(removeTone(playerName).replace(/\s/g,'').toUpperCase()==removeTone(bankAccName).replace(/\s/g,'').toUpperCase()){
              console.log("Check Name: Pass")
              await page.evaluate(()=>{
                document.getElementsByClassName('bb-load-button btn-primary btn-md btn')[0].click()
              })
              await page.waitForSelector('#base-timer-label')
              confirmTransfer(page,allData)
            }else{
              approve(page,"Sai thông tin ngân hàng! Quý khách vui lòng liên hệ CSKH 24/7",allData)
            }
          } catch (error) {
            approve(page,"Sai thông tin ngân hàng hoặc ngân hàng bảo trì! Quý khách vui lòng liên hệ CSKH 24/7",allData)
          }
        }else{
          console.log("Check Amount: Failed")
          await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
          transfer(page)
        }
      }
    }else{
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
      transfer(page)
    }
  }).catch(err => {
    console.log("Load data: Failed")
    console.log(err)
    transfer(page)
  })
}

async function confirmTransfer(page,allData){
  console.log("Transfer: Pass")
  let config = {
    method: 'post',
    url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/screen/inputs?token='+token+'&x=300&y=200&state=press',
    headers: { },
    data:""
  };
  setTimeout(()=>{
    axios(config)
    .then(function(response){
      let config = {
        method: 'post',
        url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Xác thực mã mở khoá\',action:\'getText\'}',
        headers: { },
        data : ""
      };
      axios(config)
      .then(async function (response) {
        console.log(response.data.value.retval)
        if(!response.data.value.retval){
          let check = await page.$eval('#base-timer-label', e => e.textContent)
          console.log(check)
          if((check*1)<30){
            await page.evaluate(()=>{
              document.getElementsByClassName("bb-button-bar__button")[1].click()
              setTimeout(()=>{
                  document.getElementsByClassName('confirmation__button')[1].click()
              },1000)
            })
          }
          confirmTransfer(page,allData)
        }else{
          var config = {
            method: 'post',
            url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Xác thực mã mở khoá\',action:\'click\'}',
            headers: { }
          };
          axios(config)
          .then(function (response) {
            console.log("Transfer: Pass")
            confirm(page,allData)
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      }).catch(err => console.log(err))
    }).catch(err => console.log(err))
  },1000)
}

async function transOtp(page,allData){
  console.log("Transfer Confirmation: Pass")
  let config = {
    method: 'post',
    url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Nhập mã mở khoá để xác thực\',action:\'getText\'}',
    headers: { }
  };
  axios(config)
  .then(async function (response) {
    let config = {
      method: 'post',
      url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/screen/texts?token='+token+'&text='+otp,
      headers: { }
    };
    axios(config)
    .then(function (response) {
      confirm(page,allData)
    })
  }).catch(err => console.log(err));
}

async function confirm(page,allData){
  let checkSuccess = await page.$('#base-timer-label')
  console.log(checkSuccess)
  if(checkSuccess){
    console.log("Transfer OTP: Failed")
    transOtp(page,allData)
  }else{
    await page.waitForSelector('.successful__cover',{timeout: 10000}).then(async() => {
      console.log("Success")
      let mess = "TCB1 Chuyển khoản thành công"
      await approve(page,mess,allData)
    }).catch(async(res) => {
      console.log("Failed")
      approve(page,"Có lỗi trong quá trình xuất khoản",allData)
      let config = {
        method: 'post',
        url: 'http://localhost:8090/TotalControl/v2/devices/'+device+'/sendAai?token='+token+'&params={query:\'T:Nhập mã mở khoá để xác thực\',action:\'getText\'}',
        headers: { }
      };
      axios(config)
      .then(async function (response) {
        if(!response.data.value.retval){
          console.log("not okay")
          await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
          console.log("Failed")
          khoadon(page)
        }else{
          khoadon(page)
        }
      }).catch(err => console.log(err));
    })
  }
}

async function approve(page,mess,allData){
  await transactions.create({
    auditor: allData.auditor,
    withdrawid: allData.withdrawid,
    player_id: allData.player_id,
    name: allData.name,
    amount: allData.amount,
    account: allData.account,
    bank: allData.bank,
    mess: mess
  })
  await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
  transfer(page)
}

module.exports = async(req,res,next)=>{
  await login(req,res,next)
  res.json("Done")
}



