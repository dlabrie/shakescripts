var pullMore = true;
var swapperBalance = [];
var swapperTransactions = [];
var transactionCatalog = [];
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

        if(typeof transactionCatalog[t.transactionId] != 'undefined') continue;
        transactionCatalog[t.transactionId] = 1;            

        if(t.type!="peer") continue;
        if(t.currency!="CAD") continue;

        createdAt = parseInt(Date.parse(t.createdAt));
        if(createdAt < 1618963200000) {
            // we hit april 20
            console.log("No more transactions to process, we hit 4/20 (nice) transactions");
            pullMore = false;
            break;
        }

        if(t.direction=="credit") {
            var swapper = t.from.label.replace("@","");
            if(typeof swapperBalance[swapper] === 'undefined') {
                swapperBalance[swapper]=0;
                swapperTransactions[swapper]=[];
            }
            swapperBalance[swapper]=parseFloat(swapperBalance[swapper])+parseFloat(t.amount);
            swapperTransactions[swapper].push(t);
        }
        if(t.direction=="debit") {
            var swapper = t.to.label.replace("@","");
            if(typeof swapperBalance[swapper] === 'undefined') {
                swapperBalance[swapper]=0;
                swapperTransactions[swapper]=[];
            } 
            swapperBalance[swapper]=parseFloat(swapperBalance[swapper])-parseFloat(t.amount);
            swapperTransactions[swapper].push(t);            
        }
    }
    page++;
}

var strPrint = "";
var tierCounter = 0;
strPrint += "---------- You owe the following people ----------\n";
for (let i in swapperBalance) {
    tierCounter++;
    if(swapperBalance[i] > 1) {
        strPrint += "" + swapperTransactions[i][0].createdAt + " for $"+swapperTransactions[i][0].amount+" ("+swapperTransactions[i][0].direction+") | " + i + " | " + swapperBalance[i].toFixed(2) + "\n";
    }
}
strPrint += "\n---------- The following people owe you ----------\n";
for (let i in swapperBalance) {
    if(swapperBalance[i] < -1) {
        strPrint += "" + swapperTransactions[i][0].createdAt + " for $"+swapperTransactions[i][0].amount+" ("+swapperTransactions[i][0].direction+") | " + i + " | " + swapperBalance[i].toFixed(2) + "\n";
    }
}

strPrint+="\n\nSo far you have swapped with "+tierCounter+" different Shakepay friends 🚀"
console.log(strPrint);
