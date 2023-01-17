var day = new Date().getDay()
var date = new Date().getDate()
var allDate = []
var month = new Date().getMonth()+1
var year = new Date().getFullYear()
for(let i=1;i<=31;i++){
    allDate.push(i)
}
var currentStartDay= new Date(month+"-"+date+"-"+year).getTime()
var currentEndDay= (new Date(month+"-"+date+"-"+year).getTime())+86399999
var currentStartDayOfMonth= (new Date(year,month-1,1).getTime())
var currentEndDayOfMonth= (new Date(year,month,0).getTime()+86399999)
var previosdateStart= (currentStartDay-86400000)
var previosdateEnd= (previosdateStart+86399999)
const dateValue = {
    day: day,
    date: date,
    allDate: allDate,
    month: month,
    year: year,
    currentStartDay: currentStartDay,
    currentEndDay: currentEndDay,
    currentStartDayOfMonth: currentStartDayOfMonth,
    currentEndDayOfMonth: currentEndDayOfMonth,
    reFormatDate: function(time){
        let dateFormated = ''
        dateFormated+= new Date(time).getFullYear()+"-"
        if((new Date(time).getMonth()+1)<10){
            dateFormated+= ('0'+(new Date(time).getMonth()+1))+"-"
        }else{
            dateFormated+= (new Date(time).getMonth()+1)+"-"
        }
        if(new Date(time).getDate()<10){
            dateFormated+= ('0'+new Date(time).getDate())
        }else{
            dateFormated+= new Date(time).getDate()
        }
        return dateFormated
    },
    previosdateStart: previosdateStart,
    previosdateEnd: previosdateEnd,
}

module.exports = dateValue
