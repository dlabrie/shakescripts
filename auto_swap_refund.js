var wallet = null;

var walletResponse = await fetch("https://api.shakepay.com/wallets", { "headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"cache-control": "no-cache","content-type": "application/json","pragma": "no-cache","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},"referrerPolicy": "same-origin","body": null,"method": "GET","mode": "cors","credentials": "include"});
var wallets = await walletResponse.json();
for (let i in wallets.data) {
    if(wallets.data[i].currency == "CAD") {
        wallet = wallets.data[i];
        break;
    } 
}

var pullMore = true;
var swapperBalance = [];
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

//  
var balance = 0;
for(let swapper in swapperBalance) {
    balance = swapperBalance[swapper].toFixed(2);
    if(balance<=4.95) continue;
    if(balance<5) balance=5;
    if(balance < wallet.balance) {
        if(balance >= 1 && balance <= 20) {
            if(confirm("Send $"+balance+" to "+swapper)) {
                wallet.balance -= balance;
                console.log("Sending $"+balance+" to "+swapper)
                var sendMoneyResponse = await fetch("https://api.shakepay.com/transactions", {
                    "headers": {
                      "accept": "application/json",
                      "accept-language": "en-US,en;q=0.9,fr;q=0.8",
                      "authorization": window.sessionStorage.getItem("feathers-jwt"),
                      "content-type": "application/json",
                      "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"",
                      "sec-ch-ua-mobile": "?0",
                      "sec-fetch-dest": "empty",
                      "sec-fetch-mode": "cors",
                      "sec-fetch-site": "same-site"
                    },
                    "referrerPolicy": "same-origin",
                    "body": "{\"amount\": \""+balance+"\",\"fromWallet\": \""+wallet.id+"\",\"note\": \"🏓💎🙌  quick swaps by domi167\",\"to\": \""+swapper+"\",\"toType\": \"user\"}",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                  });
                var sendMoney = await sendMoneyResponse.json();
                console.log(sendMoney)
            } else {
                console.log("Did not send $"+balance+" to "+swapper);
            }
        } else {
            console.log("Ignoring swap with "+swapper+" since it's outside of range ("+balance+")");
        }
    } else {
        console.log("You don't have the funds to return $"+balance+" to "+swapper);
    } 
} 

