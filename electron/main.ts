import { app, BrowserWindow } from "electron";
import * as url from "url";
import * as path from "path";

type test = string;

app.on('ready', () => {
    const mainWindow = new BrowserWindow({});
    mainWindow.loadURL(
        url.format({
            pathname: path.join(app.getAppPath(), "/dist-react/index.html"),
            protocol: "file:",
            slashes: true
        })
    );
});

