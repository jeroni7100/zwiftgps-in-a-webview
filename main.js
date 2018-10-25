// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const argv = require('minimist')(process.argv.slice(2));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let useMouseToDrag = false;
let useMouseInZwiftGPS = false;

function ignoreMouseEvents() {
  return !useMouseToDrag && !useMouseInZwiftGPS
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 1000, show: true, alwaysOnTop: true, transparent: true, frame: false, resizable: true,  webPreferences: {
    preload: './preload.js'
    }
    })

  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents());

  mainWindow.webContents.on('dom-ready', function () {
    // console.log('Event dom-ready catched !!!!')
    mainWindow.webContents.send('use-mouse-to-drag', useMouseToDrag)
    mainWindow.webContents.send('use-mouse-in-zwiftgps', useMouseInZwiftGPS)
  
  })
  
  // and load the index.html of the app.

  let url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'index.html')
  })

  // let url = 'https://www.zwiftgps.com';

  mainWindow.loadURL(url, { 
	  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', function () {
    if (argv.clearcache) {
      mainWindow.webContents.session.clearStorageData(function(){console.log('cleared all cookies ');});
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  
}




/**
 * 
 */
function actionOnGlobalShortcutS () {
  console.log('Alt+Super+S is pressed')
  useMouseInZwiftGPS = !useMouseInZwiftGPS;
  if (useMouseInZwiftGPS) { useMouseToDrag = false}
  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents());
  mainWindow.webContents.send('use-mouse-in-zwiftgps', useMouseInZwiftGPS)
  mainWindow.webContents.send('use-mouse-to-drag', useMouseToDrag)
}


/**
 * 
 */
function actionOnGlobalShortcutZ () {
  console.log('Alt+Super+Z is pressed')
  useMouseToDrag = !useMouseToDrag;
  if (useMouseToDrag) { useMouseInZwiftGPS = false }
  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents());
  mainWindow.webContents.send('use-mouse-to-drag', useMouseToDrag)
  mainWindow.webContents.send('use-mouse-in-zwiftgps', useMouseInZwiftGPS)
}





// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

    let ret

    // Register a 'Alt+Super+Z' shortcut listener
    // for making window movable and resizable
	  ret = globalShortcut.register('Alt+Super+Z', actionOnGlobalShortcutZ)

	  if (!ret) {
	  	console.log('registration failed: Alt+Super+Z')
	  }

    // Register a 'Alt+Super+S' shortcut listener
    // for accessing ZwiftGPS menu and functions
	  ret = globalShortcut.register('Alt+Super+S', actionOnGlobalShortcutS)

	  if (!ret) {
	  	console.log('registration failed: Alt+Super+S')
	  }

})



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// ipcMain.on('profile', (event, arg) => {
//   console.log(arg)
// })