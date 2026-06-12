const { app, BrowserWindow, ipcMain } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 340,
    height: 520,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

ipcMain.on("move-window", (event, pos) => {
  if (win) {
    win.setPosition(pos.x, pos.y);
  }
});

app.whenReady().then(createWindow);