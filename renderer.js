// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer} = require('electron')
// const hasFlag = require('electron').remote.require('has-flag')
const argv = require('minimist')(require('electron').remote.process.argv.slice(2));
// console.dir(argv);

var myWebview = document.getElementById('foo');

const got = require('got');

let ignoreMouseEventsValue = true;

let opacity = 0;
if (argv.opacity) {
  // Use command line arguments:
  // --opacity=<0|50|80|100>
  opacity = argv.opacity;
}

let riderProfile


function hideElements() {
  myWebview.executeJavaScript("b = document.querySelectorAll('button.app-button, .ghosts, .info-panel, div.strava-connected'); if (b) {  b.forEach(function(s) { document.querySelector('div.menu-content').click();  s.classList.add('zh-hidden'); }); }");
}

function showElements() {
  myWebview.executeJavaScript("b = document.querySelectorAll('.zh-hidden'); if (b) { b.forEach(function(s) {  s.classList.remove('zh-hidden'); }); }");
}

function closeMenu() {
  myWebview.executeJavaScript("document.querySelector('div.menu-content').click();")
}

function setOpacity(opacity) {
  myWebview.executeJavaScript(`console.log(${opacity});`);
  myWebview.executeJavaScript(`i = document.querySelectorAll('.map.custom-map > .map-route > .full-size.img'); if (i) { i.forEach(function(e) { e.classList.remove('bg50pct', 'bg100pct', 'bg80pct', 'bg0pct'); e.classList.add('bg${opacity}pct'); }); }`);
}

function doOnIgnoreMouse(ignoreMouseEvents) {
  if (ignoreMouseEventsValue = ignoreMouseEvents) {
    hideElements();
    closeMenu();
  } else {
    showElements();
  }
}

ipcRenderer.on('ignore-mouse', (event, ignoreMouseEvents) => {
  console.log('Received ignore-mouse', ignoreMouseEvents);
  doOnIgnoreMouse(ignoreMouseEvents)
})


myWebview.addEventListener("did-start-loading", function (e) {
  if (argv.devtools) {
     myWebview.openDevTools();
  }
});

// myWebview.addEventListener("did-finish-load", function (e) {
//   console.log('did-finish-load');
// });

myWebview.addEventListener('dom-ready', function (e) {
  console.log('dom-ready');
  
  myWebview.insertCSS(`.route-line { stroke: none !important; } .zwift-app { background: transparent !important; } .map-attribute {display: none; } .map.custom-map { background: none !important; } .map.custom-map > .map-route > .full-size.img { opacity: ${opacity}; } .bg50pct { opacity: 0.5 !important; } .bg80pct { opacity: 0.8 !important; } .bg100pct { opacity: 1.0 !important; } .bg0pct { opacity: 0 !important; } .zh-hidden { left: -9999px !important; }`);
    
  let url = 'https://api.zwifthacks.com/zwiftmap/css/world-zwiftgps.css';
  myWebview.executeJavaScript(`head = document.getElementsByTagName('head')[0]; link = document.createElement('link'); link.type = 'text/css'; link.rel = 'stylesheet'; link.href = '${url}'; head.appendChild(link);`);
  
  if (ignoreMouseEventsValue) {
    hideElements();
  }

})

// myWebview.addEventListener('console-message', (e) => {
//   console.log('Guest page logged a message:', e.message)
// })
// myWebview.addEventListener('will-navigate', (e) => {
//   console.log('Guest page will-navigate:', e.url)
// })
// myWebview.addEventListener('did-navigate', (e) => {
//   console.log('Guest page did-navigate:', e.url)
// })
// myWebview.addEventListener('did-navigate-in-page', (e) => {
//   console.log('Guest page did-navigate-in-page:', e);
// })


// Process the data from the webview
// Handle ipc-messages send with ipcRenderer.sendToHost in preload.js
myWebview.addEventListener('ipc-message', function(event){
    // console.log(event);
    // console.info(event.channel);
    if (event.channel == 'profile') {
      riderProfile = event.args[0]
      // console.log(riderProfile)
    }
});



const regex = {
  world_changed: /https:\/\/www\.zwiftgps\.com\/mapSettings\/\?world=(\d+)/m ,
  profile: /https:\/\/www\.zwiftgps\.com\/profile\// ,
  host: /https:\/\/www\.zwiftgps\.com\/host\// ,
  svg_roads: /(<g id="roads"[\s\S]*)<g id="livedata"/
};

myWebview.addEventListener('did-get-response-details', (e) => {
  console.log('Guest page did-get-response-details:', e)
  console.log('Info:', e.newURL)
  if (e.httpResponseCode == 200 && (w = regex.host.exec(e.newURL)) !== null) {
    // Login screen
    if (argv.riderid) {
     myWebview.executeJavaScript(`i = document.querySelector('input#riderid'); if (i) { i.value = ${argv.riderid} };`) 
    }
  } else if (e.httpResponseCode == 200 && (w = regex.profile.exec(e.newURL)) !== null) {
    // ZwiftGPS got response from /profile/ URL, so should be able to get riderProfile via preload.js function:
    if (!riderProfile) {
        console.log('HEY! A profile!!!!');
        // myWebview.executeJavaScript('window.sendToElectron("ping");')
        myWebview.executeJavaScript('window.getProfile();')
    }

  } else if (e.httpResponseCode == 200  && (w = regex.world_changed.exec(e.newURL)) !== null) {
    // ZwiftGPS changed the world/map being displayed, so time to manipulate the 
    // route svg

    let world = w[1];
    console.log('World:', world);

    // request svg map from zh (promise)
    // then - extract roads and alter the svg in webview
    
    got(`https://api.zwifthacks.com/zwiftmap/svg/world/${world}`).then(response => {
      console.log(response.url);
      
      let s;
      
      if ((s = regex.svg_roads.exec(response.body)) !== null) {
        
        let road = s[1].replace(/\n|\r/g, '').replace(/<g id="pois"[\s\S]*?<\/g><\/g>/, '');
        // .replace(/\.\d+,/g, ',').replace(/\.\d+[ "]/g, ' ');

        cmd = `var g = document.querySelector('div.zoom-container svg g#roads'); if (g) { g.parentNode.removeChild(g); }; var r = document.querySelector('div.zoom-container svg g#riders'); var p = r.parentNode; var newG = document.createElement('g'); p.insertBefore(newG, r); newG.outerHTML = '${road}';  `;
        myWebview.executeJavaScript(cmd);


        setOpacity(opacity)

      }

    }).catch(error => {
      console.log(error.response.body);
    });

    // hide UI elements if in ignoreMouseEvents / overlay mode
    if (ignoreMouseEventsValue) {
        hideElements();
    }


  }
})