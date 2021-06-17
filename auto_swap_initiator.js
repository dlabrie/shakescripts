var swapperBalance = [];
var transactionCatalog = [];

(async function () {
    var swappers = [
        // https://swap.labrie.ca
        "domi167", "hydra", "somiadow", "stmich", "wils", "burnttoaster", "charlc", "criz", "dylanfrankcom", "maxbrisson", "terbearyyc"
    ];
    var wallet = null;
    var walletResponse = await fetch("https://api.shakepay.com/wallets", { "headers": { "accept": "application/json", "accept-language": "en-US,en;q=0.9,fr;q=0.8", "authorization": window.sessionStorage.getItem("feathers-jwt"), "cache-control": "no-cache", "content-type": "application/json", "pragma": "no-cache", "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"", "sec-ch-ua-mobile": "?0", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-site" }, "referrerPolicy": "same-origin", "body": null, "method": "GET", "mode": "cors", "credentials": "include" });
    var wallets = await walletResponse.json();
    for (let i in wallets.data) {
        if (wallets.data[i].currency == "CAD") {
            wallet = wallets.data[i];
            break;
        }
    }

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    var pullMore = true;
    var page = 1;

    while (pullMore === true) {
        console.log("pulling 2000 transactions from Shakepay api");
        var transactionsResponse = await fetch("https://api.shakepay.com/transactions/history", { "headers": { "accept": "application/json", "accept-language": "en-US,en;q=0.9,fr;q=0.8", "authorization": window.sessionStorage.getItem("feathers-jwt"), "content-type": "application/json", "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"", "sec-ch-ua-mobile": "?0", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-site" }, "referrerPolicy": "same-origin", "body": "{\"pagination\":{\"descending\":true,\"rowsPerPage\":2000,\"page\":" + page + "},\"filterParams\":{}}", "method": "POST", "mode": "cors", "credentials": "include" })
        var transactionsData = await transactionsResponse.json();

        var transactions = transactionsData.data;
        if (transactions.length == 0) {
            console.log("No more transactions to process");
            pullMore = false;
            break;
        }

        for (var i = 0; i < transactions.length; i++) {
            var t = transactions[i];

            if (typeof transactionCatalog[t.transactionId] != 'undefined') continue;
            transactionCatalog[t.transactionId] = 1;

            if (t.type != "peer") continue;
            if (t.currency != "CAD") continue;

            createdAt = parseInt(Date.parse(t.createdAt));
            if (createdAt < startTime.getTime()) {
                console.log("No more transactions to process");
                pullMore = false;
                break;
            }

            if (t.direction == "credit") {
                var swapper = t.from.label.replace("@", "");
                if (typeof swapperBalance[swapper] === 'undefined') {
                    swapperBalance[swapper] = 0;
                }
                swapperBalance[swapper] = parseFloat(swapperBalance[swapper]) + parseFloat(t.amount);
            }
            if (t.direction == "debit") {
                var swapper = t.to.label.replace("@", "");
                if (typeof swapperBalance[swapper] === 'undefined') {
                    swapperBalance[swapper] = 0;
                }
                swapperBalance[swapper] = parseFloat(swapperBalance[swapper]) - parseFloat(t.amount);
            }
        }
        page++;
    }

    var swapper = null;
    for (let i in swappers) {
        swapper = swappers[i].toLowerCase();
        if (typeof swapperBalance[swapper] !== 'undefined') {
            console.log("skipping, you already swap with " + swapper + " today");
            continue;
        }
        if (wallet.balance < 5) {
            console.log("Not enough funds to continue");
            break;
        }
        if (confirm("Send $5 to " + swapper)) {
            wallet.balance -= 5;
            console.log("Sending $5 to " + swapper)
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
                "body": "{\"amount\": \"5.00\",\"fromWallet\": \"" + wallet.id + "\",\"note\": \"🏓💎🙌  swap initiated by domi167\",\"to\": \"" + swapper + "\",\"toType\": \"user\"}",
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
            var sendMoney = await sendMoneyResponse.json();
            console.log(sendMoney)
        } else {
            console.log("Did not send $5 to " + swapper);
        }
    }
})();