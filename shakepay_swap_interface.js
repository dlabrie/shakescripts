const refreshAuthToken = async () => {
    var AuthResponse = await fetch("https://api.shakepay.com/authentication", {
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
        "body": "{\"strategy\": \"jwt\",\"authToken\": \"" + window.sessionStorage.getItem("feathers-jwt") + "\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    var Auth = await AuthResponse.json();
    window.sessionStorage.setItem("feathers-jwt", Auth.accessToken);
};

setInterval(function () { refreshAuthToken() }, 900000);

/*
    If you made a donation to someone and would like to have it ignored,
    add each underneath here. If you made a donation to me of let's say 5.01 do:
    "domi167": 5.01,

    If someone sent you money as a gift, or those pesty cent senders, 
    add them here with a negative amount.

    "pestycentsender":-0.02,
           ^^^^  THIS IS A FICTIONAL USERNAME
*/
swapperBalanceInit = {
    "someshaketag":0,
}

content = `
<section class="section">
    <button aria-label="Refresh your wailist position" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="updateWaitlist()"><span class="icon animated"><i class="fas fa-redo-alt"></i></span></button>
    <h1 class="title has-text-weight-normal">Waitlist</h1>  
    <div class="columns">
        <div class="column">
            <div class="wallet-item">
                <div class="box wallet-item-content">
                    <div class="level">
                        <div class="level-right">
                            <p class="title is-4 level-item has-no-margin-bottom" id="mySwapPosition">...</p> 
                        </div>
                    </div> 
                </div> 
                <footer class="wallet-item-footer">
                    <p class="is-size-7">Waitlist Position</p>
                </footer>
            </div>
        </div> 
        <div class="column">
            <div class="wallet-item">
                <div class="box wallet-item-content">
                    <div class="level">
                        <div class="level-right">
                            <p class="title is-4 level-item has-no-margin-bottom" id="mySwapPoints" style="color:#009FFF">...</p> 
                        </div>
                    </div> 
                </div> 
                <footer class="wallet-item-footer">
                    <p class="is-size-7">Points Earned</p>
                </footer>
            </div>
        </div> 
        <div class="column">
            <div class="wallet-item">
                <div class="box wallet-item-content">
                    <div class="level">
                        <div class="level-right">
                            <p class="title is-4 level-item has-no-margin-bottom" id="mySwapToday">...</p> 
                        </div>
                    </div> 
                </div> 
                <footer class="wallet-item-footer">
                    <p class="is-size-7">Total Swaps Today</p>
                </footer>
            </div>
        </div>
        <div class="column">
            <div class="wallet-item">
                <div class="box wallet-item-content">
                    <div class="level">
                        <div class="level-right">
                            <p class="title is-4 level-item has-no-margin-bottom" id="mySwapTotal">...</p> 
                        </div>
                    </div> 
                </div> 
                <footer class="wallet-item-footer">
                    <p class="is-size-7">Total Swaps</p>
                </footer>
            </div>
        </div>
    </div> 
    </div>
    <div class="columns">
        <div class="column is-two-fifths">
            <button aria-label="Todays Swap List" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="todays_swappers()">Today's Swaps</button>
            <h1 class="title has-text-weight-normal">Swap</h1>
            <div class="card">
                <div>
                   <div class="card-content">
                        <div class="content has-text-centered">
                            <p class="heading">Send fivers like there's no tomorrow</p> 
                        </div> 
                        <div class="content">
                            <label class="label">Shaketag
                            </label> 
                            <div class="field has-addons">
                                <div class="control" style="width: 100%;">
                                    <input type="text" id="swapShaketag" placeholder="Shaketag(s) (comma delimited)" class="input" value=""> 
                                </div> 
                            </div> 
                            <div class="content">
                                <div class="content field-body">
                                    <div class="field">
                                        <label class="label">Note</label> 
                                        <div class="control">
                                            <textarea placeholder="Note" id="swapNote" rows="2" class="textarea" style="resize: none;"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> 
                    <footer class="card-footer">
                        <a class="card-footer-item" style="background:darkorange" onclick='sendAFiver()'>
                            <span class="has-text-white">Send</span>
                        </a>
                    </footer>
                </div>
            </div>
        </div>
        <div class="column is-three-fifths">
            <button aria-label="Reset transaction cache and load it again" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="resetTransactions()">Reset Cache</button>
            <h1 class="title has-text-weight-normal">Output from scripts</h1>
            <div class="wallet-item">
                <div class="box wallet-item-content" id="output" style="font-size: 15px;"></div> 
            </div>
        </div>
    </div>
    <div class="columns">
        <div class="column is-size-6">
            <button aria-label="Refresh dues" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="updateDues()"><span class="icon animated"><i class="fas fa-redo-alt"></i></span></button>
            <button aria-label="Refund" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="swapBack()">Refund</button>
            <h1 class="title has-text-weight-normal">You owe <span id="youOweAmount"></span></h1>
            <div class="box transactions-box" data-v-24d85c20="" id="youOwe"></div>
        </div>
        <div class="column is-size-6">
            <button aria-label="Send Penny Reminders" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="reminderPenny()">Penny</button>
            <button aria-label="Send Satoshi Reminders" data-microtip-position="bottom" data-microtip-size="small" role="tooltip" class="tooltip button is-pulled-right" onclick="reminderSat()">Sat</button>
            <h1 class="title has-text-weight-normal">They owe <span id="theyOweAmount"></span></h1>
            <div class="box transactions-box" data-v-24d85c20="" id="theyOwe"></div>
        </div>
    </div>
    <div class="columns">
        <div class="column is-one-quarters">
            <h1 class="title has-text-weight-normal">Transactions</h1>
            <div class="card">
                <div>
                <div class="card-content">
                        <div class="content">
                            <label class="label">Shaketag
                            </label> 
                            <div class="field">
                                <div class="control" style="width: 100%;">
                                    <input type="text" id="shaketagTransactions" placeholder="Shaketag" class="input" value=""> 
                                </div> 
                            </div> 
                        </div>
                    </div> 
                    <footer class="card-footer">
                        <a class="card-footer-item" style="background:darkorange" onclick='getTransactions()'>
                            <span class="has-text-white">Get Transactions</span>
                        </a>
                    </footer>
                </div>
            </div>
        </div>
        <div class="column is-three-quarters">
            <h1 class="title has-text-weight-normal">Results</h1>
            <div class="box transactions-box" data-v-24d85c20="" id="shaketagTransactionResults"> </div>
        </div>
    </div>
</div>
</section>
`;
homeContent = document.getElementById("dashboard-content").lastElementChild.firstElementChild.firstElementChild;
homeContent.insertAdjacentHTML("afterend", content);

var transactionCatalog = {};
var labelCatalog = {};

var parseTransaction = function(t) {
    frmid = (t.direction=="credit"?t.from.id:t.to.id);
    frmusr = (t.direction=="credit"?t.from.label:t.to.label).replace("@","");

    transactionCatalog[t.transactionId] = {
        "txn": t.transactionId, 
        "createdAt": t.createdAt,
        "createdAtUnix": parseInt(Date.parse(t.createdAt)),
        "amount": (t.direction=="credit"?t.amount:t.amount*-1), 
        "note": t.note, 
        "frmid": frmid
    };

    labelCatalog[frmid] = frmusr;
}

var updateInProgress = false;
var refreshTransactions = async () => {
    if(updateInProgress == true) {
        alert("A process to refresh transactions is already running, please try again when it's done");
        return false;
    }
    updateInProgress = true;

    let pullMore = true;
    let page = 1;

    pageSize = Object.keys(transactionCatalog).length==0?2000:200;

    // Clear the console window of all Shakepay warnings and errors. There are quite a few ...
    while (pullMore === true) {
        output(`Pulling up to ${pageSize} transactions from Shakepay API. Page ${page}`)
        if(pageSize==2000)
            var transactionsResponse = await fetch("https://api.shakepay.com/transactions/history", { "headers": { "accept": "application/json", "accept-language": "en-US,en;q=0.9,fr;q=0.8", "authorization": window.sessionStorage.getItem("feathers-jwt"), "content-type": "application/json", "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"", "sec-ch-ua-mobile": "?0", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-site" }, "referrerPolicy": "same-origin", "body": "{\"pagination\":{\"descending\":true,\"rowsPerPage\":2000,\"page\":" + page + "},\"filterParams\":{}}", "method": "POST", "mode": "cors", "credentials": "include" })
        else
            var transactionsResponse = await fetch("https://api.shakepay.com/transactions/history", { "headers": { "accept": "application/json", "accept-language": "en-US,en;q=0.9,fr;q=0.8", "authorization": window.sessionStorage.getItem("feathers-jwt"), "content-type": "application/json", "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"", "sec-ch-ua-mobile": "?0", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-site" }, "referrerPolicy": "same-origin", "body": "{\"filterParams\":{\"currencies\":[\"CAD\"]}}", "method": "POST", "mode": "cors", "credentials": "include" })
        
        var transactionsData = await transactionsResponse.json();
        var transactions = transactionsData.data;
        if (transactions.length == 0) {
            output("No more transactions to process");
            pullMore = false;
            break;
        }

        output("Processing "+transactions.length+" transactions...")

        var foundTransctions = 0;
        for (var i = 0; i < transactions.length; i++) {
            var t = transactions[i];

            if (t.type != "peer") continue;
            if (t.currency != "CAD") continue;

            createdAt = parseInt(Date.parse(t.createdAt));
            if (createdAt < 1618963200000) { //april 20 at night
                // we hit april 20
                output(Object.keys(transactionCatalog).length+" transactions loaded.");
                pullMore = false;
                break;
            }

            if(typeof transactionCatalog[t.transactionId] !== 'undefined') {
                foundTransctions++;
            } 

            parseTransaction(t);
        }

        if(foundTransctions > 10) {
            output(Object.keys(transactionCatalog).length+" transactions loaded.");
            pullMore = false;
        }
        page++;
    }

    var items = Object.keys(transactionCatalog).map(function(key) {
        return [key, transactionCatalog[key]["createdAtUnix"]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    newTransactionCatalog = {};
    for(let nwt in items) {
        newTransactionCatalog[items[nwt][0]] = transactionCatalog[items[nwt][0]];
    }
    transactionCatalog = newTransactionCatalog;

    updateInProgress = false;
};

var swapperBalance = {}
var swapperTransactions = {}
var swapperSinceMay3rd = {}

function processBalances() {
    swapperBalance = {}
    swapperTransactions = {}
    swapperSinceMay3rd = {}

    for(let i in transactionCatalog) {
        t = transactionCatalog[i];
        swapper_id = t.frmid;
        swapper_usr = labelCatalog[t.frmid];

        if (t.createdAtUnix >= 1620014400000) { //may 3rd
            swapperSinceMay3rd[swapper_id] = 1;
        }

        if (typeof swapperBalance[swapper_id] === 'undefined') {
            if (typeof swapperBalanceInit[swapper_usr] === 'undefined') {
                swapperBalance[swapper_id] = 0;
            } else {
                swapperBalance[swapper_id] = swapperBalanceInit[swapper_usr];
            }
        }
        if (typeof swapperTransactions[swapper_id] === 'undefined') {
            swapperTransactions[swapper_id] = [];
        }
        swapperBalance[swapper_id] = parseFloat(swapperBalance[swapper_id]) + parseFloat(t.amount);
        swapperTransactions[swapper_id].push(t);
    }
}

var resetTransactions = async() => {
    if(confirm("Are you sure you want to reset the transaction history and load it again?")) {
        transactionCatalog = {};
        await refreshTransactions();
    }
}

var updateDues = async() => {
    await refreshTransactions();
    processBalances();

    var strPrint = "";
    var tierCounter = 0;
    
    html = "";
    totalAmount = 0;
    for (let i in swapperBalance) {
        if (swapperBalance[i] > 1) {
            totalAmount += swapperBalance[i];
            note = swapperTransactions[i][0].note==""?"":swapperTransactions[i][0].note+"<br />"
            html+= `<div class="transaction-item">
                    <div class="columns">
                        <div class="column is-8 transaction-item__title">
                            <p class="title is-4 has-text-neutral-ultra-dark">@${labelCatalog[i]}</p> 
                            <p class="subtitle is-size-6 has-text-neutral-very-dark">${note} ${swapperTransactions[i][0].createdAt}</p>
                        </div> 
                        <div class="column is-4 transaction-item__details" style="justify-content: flex-end;">
                            <p class="title is-5 has-text-neutral-ultra-dark has-text-right">${swapperBalance[i].toFixed(2)}</p>
                        </div>
                    </div> 
                </div>`;
        }
    }
    totalAmount = totalAmount.toFixed(2);
    document.getElementById("youOwe").innerHTML = html;
    document.getElementById("youOweAmount").innerText = "$"+String(totalAmount).replace(/(.)(?=(\d{3})+$)/g,'$1,');

    html = "";
    totalAmount = 0;
    for (let i in swapperBalance) {
        if (swapperBalance[i] < -1) {
            totalAmount += swapperBalance[i];
            note = swapperTransactions[i][0].note==""?"":swapperTransactions[i][0].note+"<br />"
            html+= `<div class="transaction-item">
                    <div class="columns">
                        <div class="column is-8 transaction-item__title">
                            <p class="title is-4 has-text-neutral-ultra-dark">@${labelCatalog[i]}</p> 
                            <p class="subtitle is-size-6 has-text-neutral-very-dark">${note}${swapperTransactions[i][0].createdAt}</p>
                        </div> 
                        <div class="column is-4 transaction-item__details" style="justify-content: flex-end;">
                            <p class="title is-5 has-text-neutral-ultra-dark has-text-right">${swapperBalance[i].toFixed(2)}</p>
                        </div>
                    </div> 
                </div>`;
        }
    }
    totalAmount *= -1;
    totalAmount = totalAmount.toFixed(2);
    document.getElementById("theyOwe").innerHTML = html;
    document.getElementById("theyOweAmount").innerText = "$"+String(totalAmount).replace(/(.)(?=(\d{3})+$)/g,'$1,');

    strPrint += "So far you have swapped with " + (Object.keys(swapperSinceMay3rd).length) + " different Shakepay friends since May 3rd 🏓";
    strPrint += "\n\nSo far you have swapped with " + (Object.keys(swapperBalance).length) + " different Shakepay friends since April 20 🏓";
    output(strPrint);
}

var swappersToday = {};

var processTodaySwaps = async () => {
    swappersToday = {}

    await refreshTransactions();
    processBalances();

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);
    
    for(let i in transactionCatalog) {
        t = transactionCatalog[i];

        if(t.amount > -5.0)
            continue;

        swapper_id = t.frmid;
        swapper_usr = labelCatalog[t.frmid];
        if (t.createdAtUnix < startTime.getTime()) {
            break;
        }

        if (typeof swappersToday[swapper_id] === 'undefined') {        
            swappersToday[swapper_id] = labelCatalog[swapper_id];
        }
    }
}

var todays_swappers = async () => {
    await processTodaySwaps();

    swapperNames = Object.values(swappersToday).sort();
    strPrint = "";
    for (let i in swapperNames) {
        strPrint += swapperNames[i] + "\n";
    }
    output(strPrint);
}

var updateWaitlist = async () => {
    output("Pulling waitlist status from api");
    var waitlistResponse = await fetch("https://api.shakepay.com/card/waitlist", {
        "headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"content-type": "application/json","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},
        "referrerPolicy": "same-origin",
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
    });
    var waitlist = await waitlistResponse.json();

    badges = "";
    for (let i in waitlist.badges) {
        badges += `<img src="data:image/png;base64,${waitlist.badges[i].icon}" style="width:20px;" />&nbsp;&nbsp;`;
    }

    document.getElementById("mySwapPosition").innerHTML = String(waitlist.rank).replace(/(.)(?=(\d{3})+$)/g,'$1,')+"&nbsp;&nbsp;&nbsp;"+badges;
    document.getElementById("mySwapPoints").innerHTML = String(waitlist.score).replace(/(.)(?=(\d{3})+$)/g,'$1,');
    output(null);

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    counter = 0;
    counterToday = 0;
    for (let i in waitlist.history) {
        if(waitlist.history[i].name == "sentP2P") { 
            counter++;
            if(parseInt(Date.parse(waitlist.history[i].createdAt)) > startTime.getTime()) {
                counterToday++;
            }
        }
    }

    document.getElementById("mySwapToday").innerHTML = String(counterToday).replace(/(.)(?=(\d{3})+$)/g,'$1,');
    document.getElementById("mySwapTotal").innerHTML = String(counter).replace(/(.)(?=(\d{3})+$)/g,'$1,');
}

var getWallet = async (type) => {
    var walletResponse = await fetch("https://api.shakepay.com/wallets", { "headers": { "accept": "application/json", "accept-language": "en-US,en;q=0.9,fr;q=0.8", "authorization": window.sessionStorage.getItem("feathers-jwt"), "cache-control": "no-cache", "content-type": "application/json", "pragma": "no-cache", "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"", "sec-ch-ua-mobile": "?0", "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-site" }, "referrerPolicy": "same-origin", "body": null, "method": "GET", "mode": "cors", "credentials": "include" });
    var wallets = await walletResponse.json();
    for (let i in wallets.data) {
        if (wallets.data[i].currency == type) {
            return wallets.data[i];
        }
    }
}

var sendFunds = async (amount, wallet, swapper, note) => {
    if(swapper == "") {
        output("Invalid destination");
        return false;
    }

    if(wallet.balance < amount) {
        output("You don't have enough funds to send "+amount);
        return false;
    }

    output("Sending to "+swapper);
    var sendMoneyResponse = await fetch("https://api.shakepay.com/transactions", {
        "headers": {"accept": "application/json","accept-language": "en-US,en;q=0.9,fr;q=0.8","authorization": window.sessionStorage.getItem("feathers-jwt"),"content-type": "application/json","sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Microsoft Edge\";v=\"90\"","sec-ch-ua-mobile": "?0","sec-fetch-dest": "empty","sec-fetch-mode": "cors","sec-fetch-site": "same-site"},
        "referrerPolicy": "same-origin",
        "body": "{\"amount\": \""+amount+"\",\"fromWallet\": \"" + wallet.id + "\",\"note\": \""+note+"\",\"to\": \"" + swapper + "\",\"toType\": \"user\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    var sendMoney = await sendMoneyResponse.json();
    if(typeof sendMoney.message === "undefined") {
        output("Sent to "+swapper);
    } else {
        output(sendMoney.message);
    }
}

var sendAFiver = async () => {
    await processTodaySwaps();

    shaketags = document.getElementById("swapShaketag").value.toLowerCase().replace(/[^a-z0-9\,]/gi,"").split(",");
    note = document.getElementById("swapNote").value;

    wallet = await getWallet("CAD");
    for(let st in shaketags) {
        shaketag = shaketags[st];

        swapperNames = Object.values(swappersToday);
        for (let sn in swapperNames) {
            if(swapperNames[sn] == shaketag) {
                output("You've already sent a fiver to "+shaketag+" today.");
                return false;
            }
        }

        if(wallet.balance < 5) {
            output("Ran out of funds");
            break;
        }
        wallet.balance -= 5;
        
        if(confirm("Send $5 to "+shaketag+"?"))
            await sendFunds("5.00",wallet,shaketag,note);
    }
    document.getElementById("swapShaketag").value = "";
}

var output = (str) => {
    document.getElementById("output").innerText = str;
}

var swapBack = async() => {
    await refreshTransactions();
    processBalances();

    wallet = await getWallet("CAD");

    for (let swapper_id in swapperBalance) {
        swapper_usr = labelCatalog[swapper_id];

        amount = swapperBalance[swapper_id];
        if (amount < 4.75) continue;
        if (amount < 5) {
            output("Adjusted the balance for " + swapper_usr + " from $" + amount + " to $5");
            amount = 5;
        }

        if (parseFloat(amount) < parseFloat(wallet.balance)) {
            if (amount <= 20) {
                output("Send $" + amount + " to " + swapper_usr + "?");
                if (confirm("Send $" + amount + " to " + swapper_usr + "?")) {
                    wallet.balance -= amount;
                    wallet.balance = wallet.balance.toFixed(2);
                    output("Sending $" + amount + " to " + swapper_usr)
                    sendFunds(amount, wallet, swapper_usr, "Thanks for swapping with me 😘")
                } else {
                    output("Did not send $" + amount + " to " + swapper_usr);
                }
            } else {
                output("Ignoring balance with " + swapper_usr + " since it's outside of range (" + amount + ")");
            }
        } else {
            output("You don't have the funds to return $" + amount + " to " + swapper_usr + " since you only have $" + wallet.balance);
        }
    }
}

var reminderPenny = async() => {
    await refreshTransactions();
    processBalances();

    wallet = await getWallet("CAD");

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    for (let swapper_id in swapperBalance) {
        swapper_usr = labelCatalog[swapper_id];
        balance = swapperBalance[swapper_id].toFixed(2);
        
        if (balance > -1) continue;

        balance = balance * -1;
        lastTransaction = swapperTransactions[swapper_id][0].createdAtUnix
        if (lastTransaction > startTime.getTime()) {
            output("The last transaction with " + swapper_usr + " dates from today - " + swapperTransactions[swapper_id][0].createdAt);
            continue;
        }
        if (wallet.balance >= 0.01) {
            output("Send a penny to " + swapper_usr + "?");
            if (confirm("Send a penny to " + swapper_usr + "?")) {
                wallet.balance -= 0.01;
                wallet.balance = wallet.balance.toFixed(2);
                output("Sending a penny to " + swapper_usr)
                sendFunds(0.01, wallet, swapper_usr, "Hi " + swapper_usr + ", please send me back the $" + balance + "")
            } else {
                output("Did not send a penny to " + swapper_usr);
            }
        } else {
            output("You don't have the funds to remind " + swapper_usr);
        }
    }
}

var reminderSat = async() => {
    await refreshTransactions();
    processBalances();

    wallet = await getWallet("BTC");

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    for (let swapper_id in swapperBalance) {
        swapper_usr = labelCatalog[swapper_id];
        balance = swapperBalance[swapper_id].toFixed(2);
        
        if (balance > -1) continue;

        balance = balance * -1;
        lastTransaction = swapperTransactions[swapper_id][0].createdAtUnix
        if (lastTransaction > startTime.getTime()) {
            output("The last transaction with " + swapper_usr + " dates from today - " + swapperTransactions[swapper_id][0].createdAt);
            continue;
        }
        if (wallet.balance >= 0.00000001) {
            output("Send a satoshi to " + swapper_usr + "?");
            if (confirm("Send a satoshi to " + swapper_usr + "?")) {
                wallet.balance -= 0.00000001;
                output("Sending a satoshi to " + swapper_usr)
                sendFunds(0.00000001, wallet, swapper_usr, "Hi " + swapper_usr + ", please send me back the $" + balance + "")
            } else {
                output("Did not send a satoshi to " + swapper_usr);
            }
        } else {
            output("You don't have the funds to remind " + swapper_usr);
        }
    }
}

var getTransactions = async () => {
    await refreshTransactions();

    shaketag = document.getElementById("shaketagTransactions").value.toLowerCase();

    shaketagTransactions = []
    for(let i in transactionCatalog) {
        t = transactionCatalog[i];

        if(labelCatalog[t.frmid] === shaketag)
            shaketagTransactions.push(t);
    }
    
    html = "";
    for (let i in shaketagTransactions) {
        t = shaketagTransactions[i];
        updown = t.amount > 0 ? "to":"from";
        warningsuccess = t.amount > 0 ? "warning-light":"success";
        amount = t.amount<0 ? (t.amount*-1).toFixed(2) : t.amount.toFixed(2);
        html+= `<div data-v-6cd0ff42 class="transaction-item">
                <div data-v-6cd0ff42 class="columns">
                    <div data-v-6cd0ff42="" class="column is-2 transaction-item__icon">
                        <span data-v-6cd0ff42="" class="icon is-medium"><i data-v-6cd0ff42="" class="fal fa-2x fa-arrow-${updown}-bottom has-text-${warningsuccess}"></i></span>
                    </div>
                    <div class="column is-8 transaction-item__title">
                        <p class="title is-4 has-text-neutral-ultra-dark">@${labelCatalog[t.frmid]}</p> 
                        <p class="subtitle is-size-6 has-text-neutral-very-dark">${t.note}<br />${t.createdAt}</p>
                    </div> 
                    <div data-v-6cd0ff42="" class="column is-2 transaction-item__details" style="justify-content: flex-end;">
                        <p class="title is-5 has-text-neutral-ultra-dark has-text-right">${amount}</p>
                    </div>
                </div> 
            </div>`;
    }
    document.getElementById("shaketagTransactionResults").innerHTML = html;

}

await updateWaitlist();
updateDues();