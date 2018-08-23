// preload.js
const { ipcRenderer } = require('electron')
const got = require('got');

window.sendToElectron= function (channel) {
    console.log(channel)
  ipcRenderer.send(channel)
}


window.getProfile= function () {
    // got(`https://www.zwiftgps.com/profile/`).then(response => {
    //     console.log(response);
    //   }).catch(error => {
    //     console.log(error);
    //   });
    window.loadDoc('/profile/', 'profile');
}


// window.loadDoc= function (url, cFunction) {
window.loadDoc= function (url, channel) {
    var xhttp;
    xhttp=new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // cFunction(this);
        // console.log(xhttp.responseText);
        // ipcRenderer.send('profile', xhttp.responseText);
        ipcRenderer.sendToHost(channel, xhttp.responseText);
    }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
  }
//   function myFunction(xhttp) {
//     document.getElementById("demo").innerHTML =
//     xhttp.responseText;
//   }