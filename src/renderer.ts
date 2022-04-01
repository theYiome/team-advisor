/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './app';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

import { app, getCurrentWindow } from '@electron/remote';
const {webFrame} = require('electron')

const win = getCurrentWindow(); /* Note this is different to the
html global `window` variable */

// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        handleWindowControls();
    }
};

window.onbeforeunload = (event) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
    win.removeAllListeners();
}

function handleWindowControls() {
    document.getElementById('quit-button').addEventListener("click", event => {
        win.destroy();
        app.quit();
    });

    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    document.getElementById('max-button').addEventListener("click", event => {
        if(win.isMaximized())
            win.unmaximize();
        else
            win.maximize();
    });

    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });

    // document.getElementById('zoom-in-button').addEventListener("click", event => {
    //     const currentLevel = webFrame.getZoomLevel();
    //     if (currentLevel < 2) {
    //         webFrame.setZoomLevel(currentLevel + 1);
    //     }
    // });

    // document.getElementById('zoom-out-button').addEventListener("click", event => {
    //     const currentLevel = webFrame.getZoomLevel();
    //     if (currentLevel > -1) {
    //         webFrame.setZoomLevel(currentLevel - 1);
    //     }
    // });
}