'use strict'

import { ipcMain, app, BrowserWindow, Menu } from 'electron'
import { autoUpdater } from "electron-updater"
const log = require('electron-log');
const process = require('process');
const ipcMainPacker = require('./ipcMain');
const path = require('path')
const fs = require('fs')
// import * as apis from '../renderer/store/API.js'
// console.log(apis)
// const menuSets = require('./menuSets')

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

log.info('current version...');
log.info(autoUpdater.currentVersion);
log.info('App starting');

let needCheckUpdate = true;

// 子进程启动次数
process.env.TRY_SPAWN = 0
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}


let mainWindow = null;
let updateWindow = null;
const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`

function createWindow() {
    // if (process.env.NODE_ENV === 'development') {
    //     BrowserWindow.addDevToolsExtension();
    // }
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 750,
        minWidth: 1100,
        minHeight: 750,
        width: 1100,
        useContentSize: false,
        icon: 'static/imgs/Icon.icns',
        title: '橙瓜码字',
        frame: false,//去掉最顶部的导航 以及 最大化 最小化 关闭按钮
        // webPreferences: {
        //   devTools: false
        // }
    })
    mainWindow.loadURL(winURL)
    // mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // })
    // mainWindow.webContents.openDevTools()
    // const menu = Menu.buildFromTemplate(menuSets)
    // Menu.setApplicationMenu(menu)
    mainWindow.on('closed', () => {
        mainWindow = null
        let openedWins = BrowserWindow.getAllWindows();
        openedWins.forEach((aWin) =>{
            console.log("try to close a win: " + aWin.id);
            aWin.close();
        });
    })
    //去掉顶部菜单
    mainWindow.setMenu(null);
}

function createUpdateWindow(releaseVersion, releaseNote, releaseName){
    console.log("create an update window");
    updateWindow = new BrowserWindow({
        height: 400,
        width: 400,
        title: '橙瓜更新',
        frame: false,
        resizable: true
    })

    // updateWindow.webContents.openDevTools()

    let updateWindowHtml = winURL + '#/update'

    updateWindow.loadURL(updateWindowHtml)

    log.info("working?")
    updateWindow.webContents.on("did-finish-load", () => {
        log.info("update window ready to show, send note to updatewindow")
        updateWindow.webContents.send("release-note", {releaseVersion: releaseVersion, releaseNote: releaseNote, releaseName: releaseName})
    })

    ipcMain.on("update-now", () => {
        console.log("update-now event captured in index");
        downloadUpdate();
    });

    ipcMain.on("skip-update", () => {
        console.log("skip-update event captured in index");
        // createWindow()
        // makeWorkerAndIpcListener()
        // updateWindow.close()
        startWithoutUpdate()
    })
}



app.on('ready', () => {
  
    // 启动node 子进程
    registerSingleInstance();
})

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
        app.quit()
    // }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

autoUpdater.on('checking-for-update', () => {
    console.log("checking updates!!!!!!")
})
autoUpdater.on('update-available', (info) => {
    log.info("updates available!!!!!!")
    log.info(info);
    createUpdateWindow(info.version, info.releaseNotes, info.releaseName)
    // log.info("called download update");
})
autoUpdater.on('update-not-available', (info) => {
    log.info("updates not available!!!!!!!")
    // createWindow()
    // makeWorkerAndIpcListener()
    // updateWindow.close()
    startWithoutUpdate()
})
autoUpdater.on('error', (err) => {
    log.info("autoupdate got error")
    log.info(err)
    if(!mainWindow){
        startWithoutUpdate()
    }
    //todo show mainwindow
})

autoUpdater.on('download-progress', (progressObj) => {
    log.info("download progress");
    log.info(progressObj);
    if(updateWindow){
        if(updateWindow.webContents){
            updateWindow.webContents.send("download-progress", progressObj)
        }
    }
})

autoUpdater.on('update-downloaded', (info) => {
    log.info("downloaded");
    log.info(info);
    if(updateWindow){
        updateWindow.webContents.send("update-downloaded")
        if (process.env.NODE_ENV !== 'development'){
            setTimeout(() => {autoUpdater.quitAndInstall(false, false)}, 1000)
        }else{
            //this is dev, just close update and start normal login window
            startWithoutUpdate()        
        }
    }
    // add logic to quit and install
    // or show mainwindow 

    // check this issue for more detail https://github.com/electron-userland/electron-builder/issues/3025
    // nsis-updater failed to reinstall
    // autoUpdater.quitAndInstall(false, false);
})

function downloadUpdate(){
    console.log("should download update");
    autoUpdater.downloadUpdate();
}

function startWithoutUpdate(){
    createWindow()
    makeWorkerAndIpcListener()
    if(updateWindow) updateWindow.close()
}

function makeWorkerAndIpcListener(){
    // ipcMainPacker.default.serverWorker();
    // ipcMainPacker.default.serverWorker(log, mainWindow);
    log.info('ipcMain:/n-----------------------------------')
    ipcMainPacker.default.create(log, mainWindow);
}

function registerSingleInstance(){
    let secondInstance = app.makeSingleInstance((argv, workingDir) => {
        console.log("a new instance is created")
        console.log("arg is: ")
        console.log(argv)
        console.log("working dir is: ")
        console.log(workingDir)
        if(mainWindow){
            // mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            ipcMainPacker.default.showEditor();
        }
    })

    if(secondInstance){
        app.quit();
    }else{
        if(needCheckUpdate){
            autoUpdater.checkForUpdates();
            //use this boolean to make it check only once when started
            needCheckUpdate = false;
        }
    }
    // else{
    //     ipcMainPacker.default.serverWorker();
    //     console.log('ipcMain:/n')
    //     ipcMainPacker.default.create(mainWindow);
    // }
}