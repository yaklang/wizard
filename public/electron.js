const {app, BrowserWindow, dialog, Menu} = require('electron')
const path = require("path");
const url = require("url");
const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");

app.on('ready', () => {
    var palmPath = ""
    var availablePaths = [
        path.join(__dirname, "../../palm-server/darwin/amd64/palm-server",),
        path.join(__dirname, "../palm-server/darwin/amd64/palm-server",),
        "palm-server/darwin/amd64/palm-server"
    ]
    availablePaths.forEach(e => {
        if (!!palmPath) {
            return
        }
        if (fs.existsSync(e)) {
            palmPath = e
        }
    })

    if (!palmPath) {
        dialog.showMessageBox({message: "BUG: 找不到核心服务器，无法启动"})
        return
    }

    var basePalmDir = path.join(os.homedir(), ".palm-desktop")
    if (!fs.existsSync(basePalmDir)) {
        try {
            fs.mkdirSync(basePalmDir, {})
        } catch (e) {
            dialog.showMessageBox({message: `创建本地缓存失败 ${basePalmDir}: Reason: ${e}`})
        }
    }

    // basePalmDir = 1
    var backend = childProcess.execFile(palmPath, [
        "--electron",
    ], {cwd: basePalmDir})

    backend.stdout.on("data", (data) => {
        console.info(data)
        // dialog.showMessageBox({message: data})
    })
    // backend.stderr.on("data", (data) => {
    //     dialog.showMessageBox({message: data})
    // })
    backend.on("error", err => {
        dialog.showMessageBox({message: `核心引擎启动失败: ${err}`})
        app.exit(1)
    })
    backend.on("exit", (code, signal) => {
        dialog.showMessageBox({message: `核心引擎启动失败[CODE: ${code}]: SIG:${signal}`})
        app.exit(1)
    })

    let mainWindow = new BrowserWindow({
        width: 1160,
        height: 720,
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([]));

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, "../build/index.html"),
        protocol: 'file:',
        slashes: true
    });

    // dialog.showMessageBox({message: startUrl})
    try {
        mainWindow.loadURL(startUrl);
    } catch (e) {
        dialog.showMessageBox({message: "无法加载核心界面，可能是引擎启动失败"})
    }
});