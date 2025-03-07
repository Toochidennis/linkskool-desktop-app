const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// if (env === 'development') {
//     require('electron-reload')(__dirname, {
//         electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//         hardResetMethod: 'exit',
//     });
// }

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: Math.min(1200, width * 0.8), // 80% of screen width or 1200px, whichever is smaller
        height: Math.min(800, height * 0.8),
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('http://localhost:3000');

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    // Listen for maximize/unmaximize events
    mainWindow.on('maximize', () => {
        mainWindow.webContents.send('window-maximized');
    });

    mainWindow.on('unmaximize', () => {
        mainWindow.webContents.send('window-restored');
    });

    // IPC handlers for window controls
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    });

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    ipcMain.on('set-fullscreen', (_, isFullScreen) => {
        mainWindow.setFullScreen(isFullScreen);
        mainWindow.webContents.send('hide-controls', isFullScreen);
    });

    // IPC handlers for activation state.
    ipcMain.handle('get-activation-state', async () => {
        return ActivationModel.isActivated();
    });

    ipcMain.handle('validate-activation-code', async (_, activationCode) => {
        return ActivationModel.validateActivation(activationCode);
    });
}

// App event handlers
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
