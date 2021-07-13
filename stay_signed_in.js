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
  console.log(Auth);
  window.sessionStorage.setItem("feathers-jwt", Auth.accessToken);
};

setInterval(function () { refreshAuthToken() }, 600000);