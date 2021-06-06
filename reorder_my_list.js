var swappers = [
    "domi167","somiadow","stmich","hydra"
];

var localTime = new Date();
var localTimeOffset = localTime.getTimezoneOffset();
var msOffset = (localTimeOffset-240) * 60 * 1000;
var easternTime = new Date(localTime.getTime() + msOffset);
var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
var startTime = new Date(midnightStart.getTime() - msOffset);

var pullMore = true;
var swapperBalance = [];
var swapperTransactions = [];
var page = 1;

while (pullMore === true) {
    console.log("pulling 2000 transactions from Shakepay api")
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
        t["createdAtUnix"] = createdAt;
        if(createdAt < startTime.getTime()) {
            console.log("No more transactions to process");
            pullMore = false;
            break;
        }

        if(t.direction=="credit") {
            var swapper = t.from.label.replace("@","");
            if(typeof swapperTransactions[swapper] === 'undefined') {
                swapperTransactions[swapper]=[];
            } 
            swapperTransactions[swapper].push(t);
        }
        if(t.direction=="debit") {
            var swapper = t.to.label.replace("@","");
            if(typeof swapperTransactions[swapper] === 'undefined') {
                swapperTransactions[swapper]=[];
            }
            swapperTransactions[swapper].push(t);
        }
    }
    page++;
}

console.log("Finding people who you have initiated a swap with so we can put them at the beginning of the list.")
sortedSwapperList = []
for(let swapper in swapperTransactions) {
    if(swapperTransactions[swapper].length < 2) continue;
    if(swappers.includes(swapper) == false) continue;

    swapperTransactions[swapper].reverse()
    var foundADebit = false
    var foundACredit = false
    var returned = 0
    for (var i = 0; i < swapperTransactions[swapper].length; i++) {
        var swap = swapperTransactions[swapper][i];
        if (foundACredit == true && foundADebit == false) {
            console.log("We didn't initiate with "+swapper);
            break;
        }

        if (swap["direction"] == "debit") {
            foundADebit = true;
        } 

        if (swap["direction"] == "credit") {
            foundACredit = true;
            if (foundADebit == true) {
                returned = swap["createdAtUnix"];
            }
        }
        
        if (foundACredit == true && foundADebit == true)
            console.log("Found a debit&credit with "+swapper);
            sortedSwapperList[swapper]=swap["createdAtUnix"];
            break;
    }
}

for(let i in swappers) {
    swapper = swappers[i].toLowerCase();

    if(typeof sortedSwapperList[swapper] === 'undefined') {
        sortedSwapperList[swapper] = 999999999999999;
    }
}

sortedSwapperList = Object.keys(sortedSwapperList).map(function(key) {
    return [key, sortedSwapperList[key]];
});
sortedSwapperList.sort(function(first, second) {
    return first[1] - second[1];
});

str = [];
for(let i in sortedSwapperList) {
    str[i]= '"'+sortedSwapperList[i][0]+'"';
}
console.log(str.join(","));