// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let ignoreMouseEvents = true;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1000, height: 1000, show: true, alwaysOnTop: true, transparent: true, frame: false, webPreferences: {
    preload: './preload.js'
    }
    })

  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents);
  mainWindow.webContents.send('ignore-mouse', ignoreMouseEvents)


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

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('ready-to-show', function () {
    console.log('Event show catched !!!!')
  })
  
}




/**
 * 
 */
function actionOnGlobalShortcut () {
	console.log('Alt+Super+Z is pressed')
  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents = !ignoreMouseEvents);
  mainWindow.webContents.send('ignore-mouse', ignoreMouseEvents)
}





// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

	  // Register a 'Super+Z' shortcut listener.
	  let ret = globalShortcut.register('Alt+Super+Z', actionOnGlobalShortcut)

	  if (!ret) {
	  	console.log('registration failed')
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