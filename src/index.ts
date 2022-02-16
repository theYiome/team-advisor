import { app, BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import { trayImageBluer as trayIcon } from './imagesBase64';
import someImg from "./images/icon.png";
// import someicon from './icons/close-k-10.png';

const isDevelopment = process.env.NODE_ENV !== 'production';

if(require('electron-squirrel-startup')) {
    app.exit(0);
    process.exit(0);
}

// attempts to update the app
require('update-electron-app')({notifyUser: false});

// create required dir structure
import * as fsPromises from 'node:fs/promises';
try {
    fsPromises.mkdir(app.getPath("userData"), { recursive: true });
} catch(error) { 
    console.warn(error) 
};

let tray = null;

// This allows TypeScript to pick up the magic constant that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

const createWindow = (): void => {
    console.log(process.argv);
    const startHidden = process.argv.includes("--hidden");

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 720,
        width: 750,
        minWidth: 600,
        minHeight: 300,
        maxWidth: 1200,
        darkTheme: true,
        maximizable: false,
        show: !startHidden,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true,
            backgroundThrottling: false
        }
    });

    require("@electron/remote/main").enable(mainWindow.webContents);

    // and load the index.html of the app.
    console.log("MAIN_WINDOW_WEBPACK_ENTRY", MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools if not production build.
    if (isDevelopment) mainWindow.webContents.openDevTools();

    const electronLocalshortcut = require('electron-localshortcut');
    electronLocalshortcut.register(mainWindow, 'F12', () => {
        // Open DevTools
        mainWindow.webContents.openDevTools();
    });

    // Tray and window hiding
    mainWindow.on('close', function (event) {
        event.preventDefault();
        mainWindow.hide();
        return false;
    });

    const x = nativeImage.createFromPath(someImg);
    // console.log({someImg, trayIcon, size: x.getSize()});
    const icon = nativeImage.createFromDataURL(trayIcon);
    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => mainWindow.show()
        },
        {
            label: 'Quit',
            click: () => {
                mainWindow.destroy();
                app.quit();
            }
        }
    ]);

    tray.on('click', function (e) {
        if (mainWindow.isVisible())
            mainWindow.hide()
        else
            mainWindow.show()
    });

    tray.setToolTip('Team Advisor');
    tray.setContextMenu(contextMenu);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

require('@electron/remote/main').initialize();