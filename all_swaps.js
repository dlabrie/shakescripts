(async function () {
    var pullMore = true;
    var swapperBalance = [];
    var swapperTransactions = [];
    var swapperSinceMay3rd = [];
    var transactionCatalog = [];
    var page = 1;

    /*
        If you made a donation to someone and would like to have it ignored,
        add each underneath here. If you made a donation to me of let's say 5.01 do:
        swapperBalance["domi167"] = 5.01.
    
        If someone sent you money as a gift, or those pesty cent senders, 
        add them here with a negative amount.
    
        swapperBalance["pestycentsender"] = -0.02; 
                          ^^^^  THIS IS A FICTIONAL USERNAME
    */

    while (pullMore === true) {
        console.log("pulling 2000 transactions from Shakepay api")
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
            if (createdAt < 1618963200000) { //april 20 at night
                // we hit april 20
                console.log("No more transactions to process, we hit 4/20 (nice) transactions");
                pullMore = false;
                break;
            }

            if (createdAt >= 1620014400000) { //may 3rd
                swapperSinceMay3rd[swapper] = 1;
            }

            if (t.direction == "credit") {
                var swapper = t.from.label.replace("@", "");
                if (typeof swapperBalance[swapper] === 'undefined') {
                    swapperBalance[swapper] = 0;
                }
                if (typeof swapperTransactions[swapper] === 'undefined') {
                    swapperTransactions[swapper] = [];
                }
                swapperBalance[swapper] = parseFloat(swapperBalance[swapper]) + parseFloat(t.amount);
                swapperTransactions[swapper].push(t);
            }
            if (t.direction == "debit") {
                var swapper = t.to.label.replace("@", "");
                if (typeof swapperBalance[swapper] === 'undefined') {
                    swapperBalance[swapper] = 0;
                }
                if (typeof swapperTransactions[swapper] === 'undefined') {
                    swapperTransactions[swapper] = [];
                }
                swapperBalance[swapper] = parseFloat(swapperBalance[swapper]) - parseFloat(t.amount);
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
        if (swapperBalance[i] > 1) {
            strPrint += "" + swapperTransactions[i][0].createdAt + " for $" + swapperTransactions[i][0].amount + " (" + swapperTransactions[i][0].direction + ") | " + i + " | " + swapperBalance[i].toFixed(2) + "\n";
        }
    }
    strPrint += "\n---------- The following people owe you ----------\n";
    for (let i in swapperBalance) {
        if (swapperBalance[i] < -1) {
            strPrint += "" + swapperTransactions[i][0].createdAt + " for $" + swapperTransactions[i][0].amount + " (" + swapperTransactions[i][0].direction + ") | " + i + " | " + swapperBalance[i].toFixed(2) + "\n";
        }
    }

    strPrint += "\n\nSo far you have swapped with " + tierCounter + " different Shakepay friends since April 20 🏓";

    strPrint += "\n\nSo far you have swapped with " + swapperSinceMay3rd.length + " different Shakepay friends since May 3rd 🏓";

    console.log(strPrint);
})();