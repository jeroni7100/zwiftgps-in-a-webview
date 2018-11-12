// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


const {ipcRenderer, remote} = require('electron')
const argv = require('minimist')(remote.process.argv.slice(2));
const fs = require('fs')
const path = require('path')
var myWebview = document.getElementById('foo');

const got = require('got');

// let ignoreMouseEventsValue = true;
let useMouseInZwiftGPSValue = false;
let useMouseToDragValue = false;

let opacity = 0;
if (argv.opacity) {
  // Use command line arguments:
  // --opacity=<0|50|80|100>
  opacity = argv.opacity;
}

let riderProfile

function enableDrag() {
  document.querySelector('html').classList.add('zh-interactive');
  document.querySelector('html').classList.remove('zh-click-through');
}

function disableDrag() {
  document.querySelector('html').classList.remove('zh-interactive');
  document.querySelector('html').classList.add('zh-click-through');
}

function hideElements() {
  myWebview.executeJavaScript("b = document.querySelectorAll('button.app-button, .ghosts, .info-panel, div.strava-connected'); if (b) {  document.querySelector('div.menu-content').click();  b.forEach(function(s) { s.classList.add('zh-hidden'); }); }");
  myWebview.executeJavaScript("document.querySelector('body').classList.add('zh-click-through'); document.querySelector('body').classList.remove('zh-interactive');");
}

function showElements() {
  myWebview.executeJavaScript("b = document.querySelectorAll('.zh-hidden'); if (b) { b.forEach(function(s) {  s.classList.remove('zh-hidden'); }); }");
  myWebview.executeJavaScript("document.querySelector('body').classList.remove('zh-click-through'); document.querySelector('body').classList.add('zh-interactive');");
}

function closeMenu() {
  myWebview.executeJavaScript("document.querySelector('div.menu-content').click();")
}

function changeBackground () {
  // change background opacity as per configuration (global)
  opacity = remote.getGlobal('background')
  if (opacity) {
    setOpacity(opacity <= 1 ? opacity * 100 : opacity)
  } 
} // changeBackground


ipcRenderer.on('change-background', (event) => {
  console.log('change-background')
  changeBackground()
})

function setOpacity(opacity) {
  myWebview.executeJavaScript(`console.log(${opacity});`);
  myWebview.executeJavaScript(`i = document.querySelectorAll('.map.custom-map > .map-route > .full-size.img'); if (i) { i.forEach(function(e) { e.classList.remove('bg20pct', 'bg50pct', 'bg100pct', 'bg80pct', 'bg0pct'); e.classList.add('bg${opacity}pct'); }); }`);
}

function setZoom(zoom) {
  // myWebview.executeJavaScript(`console.log(${zoom});`);
  // myWebview.executeJavaScript(`i = document.querySelectorAll('.zoom-area'); if (i) { i.forEach(function(e) { e.classList.remove('bg20pct', 'bg50pct', 'bg100pct', 'bg80pct', 'bg0pct'); e.classList.add('bg${opacity}pct'); }); }`);
  // i.dispatchEvent(new Event('input', { bubbles: true }))
}

function doOnUseMouseToDrag(useMouseToDrag) {
  if (useMouseToDragValue = useMouseToDrag) {
    enableDrag();
  } else {
    disableDrag();
  }
}

ipcRenderer.on('use-mouse-to-drag', (event, useMouseToDrag) => {
  doOnUseMouseToDrag(useMouseToDrag)
})

function doOnUseMouseInZwiftGPS(useMouseInZwiftGPS) {
  if (useMouseInZwiftGPSValue = useMouseInZwiftGPS) {
    showElements();
  } else {
    hideElements();
    closeMenu();
  }
}

ipcRenderer.on('use-mouse-in-zwiftgps', (event, useMouseInZwiftGPS) => {
  doOnUseMouseInZwiftGPS(useMouseInZwiftGPS)
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
  
  myWebview.insertCSS(`.route-line { stroke: none !important; } .zwift-app { background: transparent !important; } .map-attribute {display: none; } .map.custom-map { background: none !important; } .map.custom-map > .map-route > .full-size.img { opacity: ${opacity}; } .bg20pct { opacity: 0.2 !important; } .bg50pct { opacity: 0.5 !important; } .bg80pct { opacity: 0.8 !important; } .bg100pct { opacity: 1.0 !important; } .bg0pct { opacity: 0 !important; } .zh-hidden { left: -9999px !important; } .cookie-warning.show { display: none; }`);
  
  try {
    let css = fs.readFileSync(path.join(__dirname, 'world-zwiftgps.css'))
    if (css) myWebview.insertCSS(css.toString())
  } catch (e) {}

  // myWebview.executeJavaScript('window.injectStyleLink("https://api.zwifthacks.com/zwiftmap/css/world-zwiftgps.css");')
  
  // let url = 'https://api.zwifthacks.com/zwiftmap/css/world-zwiftgps.css?' + Date.now();
  // myWebview.executeJavaScript(`head = document.getElementsByTagName('head')[0]; link = document.createElement('link'); link.type = 'text/css'; link.rel = 'stylesheet'; link.href = '${url}'; head.appendChild(link);`);
  
  // if (ignoreMouseEventsValue) {
  if (!useMouseInZwiftGPSValue) {
    hideElements();
  }
  if (useMouseToDragValue) {
    enableDrag();
  } else {
    disableDrag();
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
      console.log(riderProfile)
    }
});



const regex = {
  world_changed: /https:\/\/www\.zwiftgps\.com\/mapSettings\/\?world=(\d+)/m ,
  profile: /https:\/\/www\.zwiftgps\.com\/profile\// ,
  host: /https:\/\/www\.zwiftgps\.com\/host\// ,
  svg_roads: /(<g id="roads"[\s\S]*)<g id="livedata"/
};

// Catch webrequests to e.g. handle change of world 
const filter = {
  urls: ['https://*.zwiftgps.com/*']
}

// remote.session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
remote.session.fromPartition('zwiftgps').webRequest.onHeadersReceived(filter, (details, callback) => {
  console.log(details.url, details.statusCode)
  processRequest(details.statusCode, details.url)
  callback({ cancel: false })
})

// Does not work in Electron 3
// myWebview.addEventListener('did-get-response-details', (e) => {
//   processRequest(e.httpResponseCode, e.newURL)
// })


function processRequest(httpResponseCode, newURL) {
  // console.log('Guest page did-get-response-details:', e)
  // console.log('Info:', newURL)
  if (httpResponseCode == 200 && (w = regex.host.exec(newURL)) !== null) {
    // Login screen
    if (argv.riderid || remote.getGlobal('riderid')) {
     myWebview.executeJavaScript(`i = document.querySelector('input#riderid'); s = document.querySelector('input[value="Log in" i]'); if (i) { lastval = i.value; i.value = ${argv.riderid || remote.getGlobal('riderid')}; i._valueTracker.setValue(lastval); i.dispatchEvent(new Event('input', { bubbles: true })); if (s) s.click(); }`) 
    }
  } else if (httpResponseCode == 200 && (w = regex.profile.exec(newURL)) !== null) {
    // ZwiftGPS got response from /profile/ URL, so should be able to get riderProfile via preload.js function:
    if (!riderProfile) {
        console.log('HEY! A profile!!!!');
        // myWebview.executeJavaScript('window.sendToElectron("ping");')
        myWebview.executeJavaScript('window.getProfile();')
    }

  } else if (httpResponseCode == 200  && (w = regex.world_changed.exec(newURL)) !== null) {
    // ZwiftGPS changed the world/map being displayed, so time to manipulate the 
    // route svg

    let world = w[1];
    if (world == 8) world = 4;
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
    // if (ignoreMouseEventsValue) {
    if (!useMouseInZwiftGPSValue) {
        hideElements();
    }
    if (useMouseToDragValue) {
      enableDrag();
    } else {
      disableDrag();
    }

  }

}

