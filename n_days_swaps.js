var localTime = new Date();
var localTimeOffset = localTime.getTimezoneOffset();
var msOffset = (localTimeOffset-240) * 60 * 1000;
var easternTime = new Date(localTime.getTime() + msOffset);
var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);

var daysToGoBack = 1;
var startTime = new Date(midnightStart.getTime() - msOffset - 1000*3600*24*(daysToGoBack));
var endTime = new Date(midnightStart.getTime() - msOffset - 1000*3600*24*(daysToGoBack-1)) ;

var pullMore = true;
var swapperBalance = [];
var page = 1;

console.log("Going to pull logs for transactions between\n"+startTime.toUTCString()+" to\n"+endTime.toUTCString())
while (pullMore === true) {
    console.log("Pulling 2000 transactions from Shakepay api")
    var transactionsResponse = await fetch("https://api.shakepay.com/transactions/history", {"headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"content-type": "application/json","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},"referrerPolicy": "same-origin","body": "{\"pagination\":{\"descending\":true,\"rowsPerPage\":2000,\"page\":"+page+"},\"filterParams\":{}}","method": "POST","mode": "cors","credentials": "include"})
    var transactionsData = await transactionsResponse.json();

    var transactions = transactionsData.data;
    if( transactions.length == 0) {
        console.log("No more transactions to process");
        pullMore = false;
        break;
    }

    for (var i = 0; i < transactions.length; i++) {
        var t = transactions[i];                

        if(t.type!="peer") continue;
        if(t.currency!="CAD") continue;

        createdAt = parseInt(Date.parse(t.createdAt));
        if(createdAt < endTime.getTime()) {
            console.log("Skipping "+t.createdAt);
            continue;
        }

        if(createdAt < startTime.getTime()) {
            console.log("No more transactions to process");
            pullMore = false;
            break;
        }

        if(t.direction=="credit") {
            var swapper = t.from.label.replace("@","");
            if(typeof swapperBalance[swapper] === 'undefined') {
                swapperBalance[swapper]=0;
            }
            swapperBalance[swapper]=parseFloat(swapperBalance[swapper])+parseFloat(t.amount);
        }
        if(t.direction=="debit") {
            var swapper = t.to.label.replace("@","");
            if(typeof swapperBalance[swapper] === 'undefined') {
                swapperBalance[swapper]=0;
            } 
            swapperBalance[swapper]=parseFloat(swapperBalance[swapper])-parseFloat(t.amount);
        }
    }
    page++;
}

console.log(swapperBalance);