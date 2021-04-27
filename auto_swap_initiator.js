var swappers = [
	"domi167","hydra"
];
var wallet = null;

var walletResponse = await fetch("https://api.shakepay.com/wallets", { "headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"cache-control": "no-cache","content-type": "application/json","pragma": "no-cache","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},"referrerPolicy": "same-origin","body": null,"method": "GET","mode": "cors","credentials": "include"});
var wallets = await walletResponse.json();
for (let i in wallets.data) {
    if(wallets.data[i].currency == "CAD") {
        wallet = wallets.data[i];
        break;
    } 
}

var transactionsResponse = await fetch("https://api.shakepay.com/transactions/history", {"headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"content-type": "application/json","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},"referrerPolicy": "same-origin","body": "{\"pagination\":{\"descending\":true,\"rowsPerPage\":6000,\"page\":1},\"filterParams\":{}}","method": "POST","mode": "cors","credentials": "include"})
var transactionsData = await transactionsResponse.json();
var transactions = transactionsData.data;
var swapperBalance = [];
for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];                

    if(t.type!="peer") continue;
    if(t.currency!="CAD") continue;

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

var swapper = null;
for(let i in swappers) {
    swapper = swappers[i];
    if(typeof swapperBalance[swapper] !== 'undefined') {
        console.log("skipping, you already swap with "+swapper+" today");
        continue;
    }
    if(wallet.balance < 5) {
        console.log("Not enough funds to continue");
        break;
    }
    if(confirm("Send $5 to "+swapper)) {
        wallet.balance -= balance;
        console.log("Sending $5 to "+swapper)
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
            "body": "{\"amount\": \"5.00\",\"fromWallet\": \""+wallet.id+"\",\"note\": \"🏓💎🙌  swap initiated by domi167\",\"to\": \""+swapper+"\",\"toType\": \"user\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
            });
        var sendMoney = await sendMoneyResponse.json();
        console.log(sendMoney)
    } else {
        console.log("Did not send $5 to "+swapper);
    }
} 


