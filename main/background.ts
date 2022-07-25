import { app } from "electron";
import log from "electron-log";
import serve from "electron-serve";
import { autoUpdater } from "electron-updater";
import { createWindow } from "./helpers";

const isProd: boolean = process.env.NODE_ENV === "production";
autoUpdater.logger = log;
log.info("App starting...");
if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
let mainWindow;

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send("message", text);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }

  autoUpdater.checkForUpdates();
})();

app.on("window-all-closed", () => {
  app.quit();
});

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...");
});
autoUpdater.on("update-available", (info) => {
  sendStatusToWindow("Update available.");
});

autoUpdater.on("update-not-available", (info) => {
  sendStatusToWindow("Update not available.");
});

autoUpdater.on("error", (err) => {
  sendStatusToWindow("Error in auto-updater. " + err);
});

autoUpdater.on("download-progress", (progressObj) => {
  sendStatusToWindow("download-progress start");
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message =
    log_message +
    " (" +
    progressObj.transferred +
    "/" +
    progressObj.total +
    ")";
  sendStatusToWindow(log_message);
});

autoUpdater.on("update-downloaded", (info) => {
  sendStatusToWindow("Update downloaded");
});
