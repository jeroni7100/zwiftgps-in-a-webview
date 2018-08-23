# zwiftgps-in-a-webview

**Proof of Concept running ZwiftGPS in an Electron webview**

The full ZwiftGPS functionality is available. The standard ZwiftHacks/ZwiftMap SVG map is injected into the ZwiftGPS map to:

- enable additional styling of the road segments, e.g. depending on altitude
- have the route for Richmond show when background is removed

The default is to make the standard minimap background image fully transparent, but this can be modified by a command line argument.

Some UI elements from ZwiftGPS are hidden (positioned far to the left of the viewport via CSS) by default, but their visibility can be toggled with the global keyboard shortcut Alt+Super+Z.
When the UI elements are hidden, the map window ignores mouse input (it is passed on to the underlying window), so use the Alt+Super+Z shortcut to enable zoom, scroll etc.


Main files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.
- `renderer.js` - .
- `preload.js` - 


## To Use

To run this you'll need [Node.js](https://nodejs.org/en/download/) and [npm](http://npmjs.com). From your command line:

```bash
# Install dependencies
npm install
# Run the app
npm start
```

### Command line arguments:

The app supports the following command line arguments:

- `--devtools` - open DevTools for the webview'ed document 
- `--opacity=<0|50|80|100>` - opacity of the minimap background (default value 0) 

Examples:

```bash
# Run the app with devtools window
npm start -- --devtools
```

```bash
# Run the app with 50% opacity of the map 
npm start -- --opacity=50
```




## Resources

- [zwiftgps.com](https://www.zwiftgps.com) - ZwiftGPS

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
