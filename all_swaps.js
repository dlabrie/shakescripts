fetch("https://api.shakepay.com/transactions/history", {
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
  "body": "{\"pagination\":{\"descending\":true,\"rowsPerPage\":5000,\"page\":1},\"filterParams\":{}}",
  "method": "POST",
  "mode": "cors",
  "credentials": "include"
}).then(
    function(response) {
        if (response.status !== 201) {
            console.log("Looks like there was a problem. Status Code: "+response.status);
            return;
        }

        response.json().then(function(data) {
            var transactions = data.data;
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

            var strPrint = "";
            for (let i in swapperBalance) {
                if(swapperBalance[i] < -1 || swapperBalance[i] > 1)
                    strPrint += i + " \t " + swapperBalance[i]+"\n";
            }
            console.log(strPrint);
        });
    }
)
.catch(function(err) {
    console.log('Fetch Error :-S', err);
});