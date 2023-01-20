const axios = require('axios')
const puppeteer = require('puppeteer');
const dateValue = require('../constant/date')
const bankList = require('../constant/bank')
const removeTone = require('../middlewares/removeVietnameseTone')
const bankInfo = require('../models/bankinfo.model')
const queue = require('../models/queue.model')
const transactions = require('../models/transactions.model')
const keeplogin = require('../controllers/keeplogin')
const fs = require('fs');
var otp = "2580"
var data = {}
module.exports = async(req,res,next)=>{
  data = req.data
  await login(req,res,next)
  res.json("Done")
}

var loadbodata = async() => {
  try {
    let getInfo = await queue.findOne().sort({createdAt:1}).exec()
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
  keeplogin(data.portal,data.device,data.token)
  return puppeteer.launch({
    headless: false,
    // executablePath: './chrome/chrome.exe',
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
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0})
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
    url: data.portal+'portal?path=TotalControl/v2/devices/'+data.device+'/screen/inputs?token='+data.token+'&x=300&y=200&state=press',
    headers: { },
    data:""
  };
  setTimeout(()=>{
    axios(config)
    .then(function (response) {
      let config = {
        method: 'post',
        url: data.portal+'portal?path=TotalControl/v2/devices/'+data.device+'/sendAai?token='+data.token+'&params={query:\'T:Cho phép đăng nhập\',action:\'click\'}',
        headers: { },
        data : ""
      };
      axios(config)
      .then(function (response) {
        console.log(response.data.value.retval)
        if(!response.data.value.retval){
          confirmLogin(page)
        }else{
          enterOtp(data)
        }
      }).catch(err => {
        console.log(err)
        confirmLogin(page)
      })
    }).catch(err => {
      console.log(err)
      confirmLogin(page)
    })
  },2000)
}

async function enterOtp(data){
  var config = {
    method: 'post',
    url: data.portal+'portal?path=TotalControl/v2/devices/'+data.device+'/sendAai?token='+data.token+'&params={query:\'T:Nhập mã mở khoá để xác thực\',action:\'getText\'}',
    headers: { },
    data : ""
  };
  axios(config)
  .then(function (response) {
    if(!response.data.value.retval){
      enterOtp(data)
    }else{
      var config = {
        method: 'post',
        url: data.portal+'portal?path=TotalControl/v2/devices/'+data.device+'/screen/texts?token='+data.token+'&text='+otp,
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
    await page.waitForSelector('.bb-account-info__product-number',{timeout: 0})
    let bank_info = await page.$eval('.bb-account-info__product-number',(e)=>{
      return e.textContent
    })
    let bank_balance = await page.$eval('.integer',(e)=>{
      return e.textContent
    })
    let findAccount = await bankInfo.findOneAndUpdate({account_name:bank_info},{balance:bank_balance},{new:true}).exec()
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
            await page.waitForXPath(`//bb-input-text-ui[@formcontrolname="accountName"]`,{timeout: 15000})
            await page.evaluate(async() => {
              document.getElementsByClassName('bb-load-button')[0].click()
            });
            await page.waitForSelector('.text-uppercase',{timeout: 15000})
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
              console.log("Confirm transfer: "+data.portal)
              confirmTransfer(page,allData)
            }else{
              deny(page,"Sai thông tin ngân hàng! Quý khách vui lòng liên hệ CSKH 24/7",allData)
            }
          } catch (error) {
            deny(page,"Sai thông tin ngân hàng hoặc ngân hàng bảo trì! Quý khách vui lòng liên hệ CSKH 24/7",allData)
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
  let info = JSON.stringify({
    "device": data.device,
    "token": data.token,
  });

  let config = {
    method: 'post',
    url: data.portal+'verifyotp',
    headers: { 
      'Content-Type': 'application/json'
    },
    data : info
  };

  axios(config)
  .then(function (response) {
    console.log(response.data)
    confirm(page,allData)
  })
  .catch(function (error) {
    console.log(error);
  });
}

async function confirm(page,allData){
  await page.waitForSelector('.successful__cover',{timeout: 10000}).then(async() => {
    console.log("Success")
    let mess = "TCB1 Chuyển khoản thành công"
    await approve(page,mess,allData)
  }).catch(async(res) => {
    await approve(page,mess,allData)
  })
}

async function approve(page,mess,allData){
  let info = JSON.stringify({
    "applicationId": allData.withdrawid
  });

  let config = {
    method: 'post',
    url: 'https://management.cdn-dysxb.com/api/1.0/verifyWithdraw/allow',
    headers: { 
      'authorization': 'Bearer '+allData.token, 
      'origin': ' http://irp.jdtmb.com', 
      'referer': ' http://irp.jdtmb.com/', 
      'sec-fetch-mode': ' cors', 
      'sec-fetch-site': ' cross-site', 
      'x-requested-with': ' XMLHttpRequest', 
      'Content-Type': 'application/json'
    },
    data : info
  };

  axios(config)
  .then( async function (response) {
    if(response.data.Code == 200){
      await transactions.create({
        auditor: allData.auditor,
        withdrawid: allData.withdrawid,
        player_id: allData.player_id,
        name: allData.name,
        amount: allData.amount,
        account: allData.account,
        bank: allData.bank,
        mess: mess,
        token:allData.token
      })
      await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
      let info = JSON.stringify({
        "id": allData.withdrawid,
        "memo": mess
      });
      
      let config = {
        method: 'post',
        url: 'https://management.cdn-dysxb.com/VerifyWithdraw/UpdateMemo',
        headers: { 
          'authorization': ' Bearer '+allData.token, 
          'origin': ' http://irp.jdtmb.com', 
          'referer': ' http://irp.jdtmb.com/', 
          'sec-fetch-mode': ' cors', 
          'sec-fetch-site': ' cross-site', 
          'x-requested-with': ' XMLHttpRequest', 
          'Content-Type': 'application/json'
        },
        data : info
      };
      
      await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
      transfer(page)
    }else{
      await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
      transfer(page)
    }
  }).catch(async function (error) {
    await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
    await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
    transfer(page)
  });
}

async function deny(page,mess,allData){
  let info = JSON.stringify({
    "id": allData.withdrawid
  });

  let config = {
    method: 'post',
    url: 'https://management.cdn-dysxb.com/api/1.0/verifyWithdraw/deny',
    headers: { 
      'authorization': 'Bearer '+allData.token, 
      'origin': ' http://irp.jdtmb.com', 
      'referer': ' http://irp.jdtmb.com/', 
      'sec-fetch-mode': ' cors', 
      'sec-fetch-site': ' cross-site', 
      'x-requested-with': ' XMLHttpRequest', 
      'Content-Type': 'application/json'
    },
    data : info
  };
  axios(config)
  .then(async function (response) {
    let data = JSON.stringify({
      "id": allData.withdrawid,
      "portalMemo": mess
    });
    
    let config = {
      method: 'post',
      url: 'https://management.cdn-dysxb.com/VerifyWithdraw/UpdatePortalMemo',
      headers: { 
        'authorization': 'Bearer '+allData.token, 
        'origin': ' http://irp.jdtmb.com', 
        'referer': ' http://irp.jdtmb.com/', 
        'sec-fetch-mode': ' cors', 
        'sec-fetch-site': ' cross-site', 
        'x-requested-with': ' XMLHttpRequest', 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(async function (response) {
      await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
      transfer(page)
    }).catch( async function (error) {
      await queue.deleteMany({withdrawid:allData.withdrawid}).exec()
      await page.goto('https://onlinebanking.techcombank.com.vn/#/transfers-payments/pay-someone?transferType=other',{timeout: 0});
      transfer(page)
    });
  }).catch(function (error) {
    console.log(error);
    deny(page,mess,allData)
  });

}




