'use strict'
const { ipcMain, BrowserWindow, Menu, MenuItem, dialog, app, globalShortcut } = require('electron')
const fs = require('fs-extra')
const path = require('path')
const child_process = require("child_process")
const util = require('util')
import * as apis from '../renderer/store/API.js'
// console.log(api)
// var sqlite3 = require('sqlite3').verbose()

const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}`
let editor;
let lockEditor = false;
let saveEditor = false;
let duringImportOrExport = false;

let musicPop = null;

let preCloseStepFinished = false;
let usingOfflineDB = false;

let shouldSpawnSyncChild = true;
let outline;
export default {
  showEditor: function(){
    console.log("hit this")
    if(editor){
      editor.show()
      editor.focus()
    }
  },
  worker: null,
  log: null,
  mainWindow: null,
  workerSender: function (data){
    if(shouldSpawnSyncChild){
      if(this.worker){
        try {
          this.worker.send(data)
        } catch (error) {
          console.log('worker send 异常：')
          console.log(error)
        }
      }else{
        console.log('worker管道已经被关闭, 重新开启worker管道！')
        this.serverWorker()
      }
    }else{
      console.log("should not spawn a sync child, just swallow: " + util.inspect(data));
    }
  },
  serverWorker: function(){
    let trySpawn = process.env.TRY_SPAWN
    this.log.info(`当前子进程已经启动过<${trySpawn}>次~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    if(trySpawn>5){
        this.log.info("子进程重试次数已过5");
      // setTimeout(function(){
        // console.log(`触发定时器启动~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
        this.mainWindow.webContents.send('TRY_SPAWN_WARN', {type: 'try_spawn_warn'})
        editor&&editor.webContents.send('TRY_SPAWN_WARN',{type: 'try_spawn_warn'})
      // },10000)      
      return false;
    }
    process.env.TRY_SPAWN = ++trySpawn
    this.log.info('准备启动worker！！')
    // let shellPath = path.join(__static,'/shell').replace('app.asar', 'app.asar.unpacked');
    //   let shellFile = process.platform === 'win32' ? (path.join(shellPath, 'node.exe')) : (path.join(shellPath, 'node'))
      let electronPath = '';
      if(process.env.NODE_ENV === 'development'){
          let formPath = process.platform === 'darwin'?'/Electron.app/Contents/MacOS/Electron':'/electron.exe'
          electronPath = path.join(app.getAppPath(), '/node_modules/electron/dist', formPath);
      }else{
        let formPath = process.platform === 'darwin'?'MacOS/橙瓜码字':'/橙瓜码字.exe'
          electronPath = path.join(app.getAppPath(), '../../', formPath);
      }
      let workerPath = path.join(__static, '/js/worker.js')
      // let workerPath = path.join(__static, '/js/worker.js').replace('app.asar', 'app.asar.unpacked')
      console.log(`workerPath is: ${workerPath}`)
      console.log(`child_process is: `)
      let api = JSON.stringify(apis)
      console.log("electronPath path is: " + electronPath);
      // worker = child_process.spawn(shellFile, [ '--inspect', '--harmony', workerPath],{
      this.worker = child_process.spawn(electronPath, ['--inspect', '--harmony', workerPath], {  
        env:{
          API: api,
          NODE_ENV: process.env.NODE_ENV,
          APPPATH: app.getAppPath(),
          ELECTRON_RUN_AS_NODE: 1,
          LOGS: app.getPath('logs')
          // ELECTRON_NO_ASAR: 1,
          // PATH: process.env.PATH,
        }, 
        // detached: true,
        stdio: ['ipc']
      });
      this.log.info('----------------------------child_process ipc')
      this.worker.on('exit', (code, signal) => {
        this.log.error('exit code:'+code)
        this.log.error('exit signal:'+JSON.stringify(signal))
        this.worker = null
      })
      this.worker.stdout.on('data', (data) => {
        console.log(`输出：${data}`); 
      });
      this.worker.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      })
      this.worker.on('close', (code, signal) => {
        this.log.error(`退出worker: ${code}`);
        this.log.error('signal: ' + signal)
        if(signal === 'SIGTERM'){
          this.log.info('接受到用户触发关闭窗口，不重新启动子进程；')
          return false;
        }
        //process.nextTick 太快了
        //或可考虑 setImmediate()
        setTimeout(() => {
          this.serverWorker()
          let data = {}
          data.loginTime = process.env.USER_LOGIN_TIME
          data.uid = process.env.USER_DATA_UID
          data.token = process.env.USER_DATA_TOKEN
          this.workerSender({type: 'initDB', data: data})
        }, 100)
      });

      // 子进程监听
      this.worker.on('message', (m) => {
        switch (m.type){
          case 'changeChapterContent':
            if(editor){
              editor.webContents.send('changeChapterContent', m.data)
            }else{
              console.log('编辑窗口已经被关闭~')
            }
          break;
          case 'worker-closed':
            if(!!this.worker){
              this.worker.kill('SIGTERM')
            }
            // 将子进程重启次数清空重新计算
            process.env.TRY_SPAWN = 0;
            console.log('关闭子进程:')
          break;
          case 'changeStatisticsVersion':
            if(editor){
              editor.webContents.send('changeStatisticsVersion', m.data)
            }
          break;
          case 'worker-success': 
            if(editor){
              editor.webContents.send('worker-success')            
            }
          break;
          case 'worker-error':
            if(editor){
              console.log('含有编辑窗口，通知渲染进程同步失败了11111111111111111111')
              editor.webContents.send('worker-error', m.data)            
            }
          break;
          case 'chapter-success': 
            if(editor){
              editor.webContents.send('msg', {type: 'chapter_success',msg: m.message})            
            }
          break;
          case 'chapter-error':
            if(editor){
              editor.webContents.send('chapter_error', m.message)            
            }
          break;
        }
      });
      this.log.info('当前子进程的PID为：' + this.worker.pid)
  },

  preCloseTask: function(mainWindow, callback) {
    console.log("do preClose operations")
    if(usingOfflineDB){
      if(mainWindow){
        console.log("send pre close clear")
        mainWindow.webContents.send("pre-close-clear")
      }
    }
    this.copyDB();
    preCloseStepFinished = true;
    // console.log(process.env);

    callback("done");
  },

  copyDB: function() {
    if(!process.env.USER_ID_CHENGGUA){
      console.log("no user id, cannot make a valid db name, db copy not done, just return");
      return;
    }
    let curDBPath = path.join(app.getAppPath(), process.env.NODE_ENV === 'development'?'userData':'../userData', process.env.USER_ID_CHENGGUA+'.db')
    let curDate = new Date().getTime()

    let curDBStats = fs.statSync(curDBPath);

    let destDBPath = path.join(app.getPath("documents"), `橙瓜码字文稿备份/${process.env.USER_NAME_CHENGGUA}-${process.env.USER_ID_CHENGGUA}/书籍备份/${process.env.USER_ID_CHENGGUA}-${curDate}.db`);
    console.log("curDBPath is: " + curDBPath);
    console.log("destDBPath is: " + destDBPath);
    //this is fs-extra has copySync
    // electron v1.8.7 's node is v8.2.1, copySync is added to node native module in v8.5.0
    if(curDBStats) fs.copySync(curDBPath, destDBPath);
  },


  create: function(log, mainWindow) {
        log.info('module this :!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      if(!this.log){
        this.log = log;
        this.mainWindow = mainWindow
      }
      //   mainWindow.on('closed', () => {
      //     if(editor){
      //       editor.close()
      //     }
      //     mainWindow.webContents.send('userLogout')
      //     focusedWindo.close();
      //     mainWindow = null
      // })

      globalShortcut.register('Ctrl+U', () =>{
        console.log("tester's unlock triggered");
        editor.setKiosk(false);
        editor.setAlwaysOnTop(false);
        lockEditor = false;
        editor.webContents.send("tester-unlock");
        // if(musicPop) musicPop.setParentWindow(null);
      })

      ipcMain.on('focus-editor', (event) => {
        editor.show();
        editor.focus();
      })

      ipcMain.on('window-max',(event)=>{
          var focusedWindo= BrowserWindow.getFocusedWindow();
          if(!focusedWindo) return;
          if(focusedWindo.getTitle() === '橙瓜码字编辑器'){
            console.log("this case max");
            if(lockEditor){
              console.log("wats lockEditor " + lockEditor);
              // event.sender.send("show-lock-message");
              event.sender.send("msg",{type: 'show_lock_message'});
              return;
            }
          }

          if(focusedWindo.isMaximized()){
            focusedWindo.unmaximize()
          }else{
            focusedWindo.maximize()
          }
      })
      ipcMain.on('window-min',(event)=>{
          var focusedWindo= BrowserWindow.getFocusedWindow();
          if(!focusedWindo) return;
          console.log("title: " + focusedWindo.getTitle());
          console.log("id: " + focusedWindo.id)
          console.log(focusedWindo)
          if(focusedWindo.getTitle() === '橙瓜码字编辑器'){
            console.log("this case min");
            if(lockEditor){
              // event.sender.send("show-lock-message");
              event.sender.send("msg", {type: "show_lock_message"});
              return;
            }
          }

          focusedWindo.minimize()        

      })

      ipcMain.on('window-close',(event)=>{
        var focusedWindo= BrowserWindow.getFocusedWindow();
        if(!focusedWindo) return;
          if(focusedWindo.getTitle() === '橙瓜码字编辑器'){
            console.log("this case close");
            if(lockEditor){
              console.log("editor locked, no close")
              // event.sender.send("show-lock-message");
              event.sender.send("msg", {type: "show_lock_message"});
              return;
            }
            if(duringImportOrExport){
              console.log("importing or exporting")
              // event.sender.send("show-file-message");
              event.sender.send("msg",{type: 'show_file_message'});
              return;
            }
          }
          console.log(focusedWindo.id)
        if(focusedWindo.id != mainWindow.id){
          focusedWindo.close()
        // }else{
        //   // if(editor){
        //   //   editor.close()
        //   // }
        //   // mainWindow.webContents.send('userLogout')
        //   focusedWindo.close();
        }else{
          console.log("window close event on window-close")
          // event.preventDefault();
          mainWindow.close();
        }
      })
      ipcMain.on('newWindow', (event, prop) => {
              const modalPath = path.join(winURL, '/index.html', prop.path)
              let child = new BrowserWindow({ title: prop.name, minWidth: 1100, minHeight: 750 })
              child.on('close', () => { child = null })
              child.loadURL(modalPath)
              child.show()
      })
      //灵感随笔右键菜单
      ipcMain.on('creNoteRightClickMenu', (event) => {
              //! 生成菜单
              const menu = new Menu();
              menu.append(new MenuItem({
                  label: '创建灵感随笔',
                  click: () => {
                      event.sender.send('createNoteMessage', 'params')

                  }
              }));
              menu.append(new MenuItem({ type: 'separator' }));
              menu.append(new MenuItem({
                  label: '选择灵感随笔',
                  click: () => {
                      event.sender.send('selectNoteMessage', 'params')
                          // Electron.shell.openExternal('https://www.baidu.com');
                  }
              }));
              const win = BrowserWindow.fromWebContents(event.sender);
              menu.popup(win);
      })
      //没有灵感随笔时只创建新建右键菜单
      ipcMain.on('onlyCreNoteRightClickMenu', (event) => {
          const menu = new Menu();
          menu.append(new MenuItem({
              label: '创建灵感随笔',
              click: () => {
                  event.sender.send('createNoteMessage', 'params')
              }
          }));
          const win = BrowserWindow.fromWebContents(event.sender);
          menu.popup(win);
      })
      // 目前启用  码字主页添加书籍推动首页更新书籍列表数据
      ipcMain.on('ipc-updateBook', (event, data) => {
        console.log(`ipc-updateBook 收到了书籍：`)
        console.log(data.pathName)
        if(data.pathName === 'editor'){
          mainWindow.webContents.send('action-updateBook');
        }else if((data.pathName === 'user')&&(editor)){
          editor.webContents.send('action-updateBook');
        }
      })

      ipcMain.on('ipc-addBook', (event, data) => {
        if(data.view === 'editorWindow'){
          //编辑窗口 新建书籍后，通知主窗口，主窗口数据更新
          mainWindow.webContents.send('add-book', data.book);
        }
      })
      //触发大纲选书
      ipcMain.on('ipc-outlineOpenBook', (event, prop) => {
        event.sender.send('outline-new-book', prop)
      })

      //触发空白大纲选书
      ipcMain.on('ipc-outlineOpenBooks', (event, prop) => {
        event.sender.send('outline-new-books', prop)
      })
      // 打开码字主页
      ipcMain.on('ipc-openBook', (event, prop) => {
        /**
         * 逻辑不严谨需要修改，ID递增用户关闭后可再次打开
         */ 
          if(!editor){
            const modalPath = winURL +'/index.html' + prop.path
            // file:///Users/NishavayaZhou/Documents/个人文件/道文/码字/chenggua-writing/build/cg-edit-darwin-x64/cg-edit.app/Contents/Resources/app.asar/dist/electron/index.html#/editor
            // const modalPath = 'file:///Users/NishavayaZhou/Documents/个人文件/道文/码字/chenggua-writing/build/cg-edit-darwin-x64/cg-edit.app/Contents/Resources/app.asar/dist/electron/index.html#/editor'
            editor = new BrowserWindow({
                width: 1100,
                minWidth: 1100,
                height: 750,
                minHeight: 750,
                title: '橙瓜码字编辑器',
                // resizable: true,
                // minimizable: true,
                maximizable: true,
                icon: 'static/imgs/Icon.icns',
                // fullscreenable: false,
                show: false,
                frame: false,
                kiosk: false,
                alwaysOnTop: false,
                // webPreferences: {
                //   devTools: false
                // }
            })
            saveEditor = true
            // editor.setMenu(null);
            editor.on('close', (event) => {
              if(lockEditor){
                event.preventDefault();
                return;
              }
              if(saveEditor){
                editor.webContents.send('editorClose');
                event.preventDefault();
                return;
              }
              // editor = null
            })

            editor.on('closed', (event) => {
            this.workerSender({type: 'editorClosed'})
              editor = null;  
            })

            // editor.on('blur', (event) => {
            //   let a = new Date().getTime();
            //   console.log("editor lost focus + ", a);
            //   // process.nextTick(() => {
            //   setTimeout( () => {
            //     console.log("editor is maximized? " + editor.isMaximized());
            //     console.log("full screen? " + editor.isFullScreen());
            //     console.log("is visible?" + editor.isVisible());
            //     console.log("is focused?" + editor.isFocused());
            //     console.log("is minimizable??" + editor.isMinimizable());
            //     console.log("is always on top?" + editor.isAlwaysOnTop());
            //     console.log("is kiosk? " + editor.isKiosk());

            //     editor.maximize();
            //     editor.show();
            //     editor.focus();
            //   }, 50);
            // });

            editor.on('minimize', () => {
              console.log("minimize!!")
              if(lockEditor){
                editor.restore();
              }
            });
            editor.on('maximize',() => {
              editor.webContents.send('isMaximize');
            })
            editor.on('unmaximize',() => {
              editor.webContents.send('isUnmaximize');
            })
            
            // setInterval(() => {
            //   // console.log("check:  " + new Date().getTime());
            //   if(editor){
            //     if(editor.isMaximized() === false){
            //       editor.restore();
            //       // editor.maximize();
            //     }
            //   }
            // }, 100)


            editor.loadURL(modalPath)
            // editor.webContents.openDevTools()
            editor.once('ready-to-show', () => {
              editor.show()
              editor.webContents.send('book-open', {windowId: editor.id, book: prop.book});
            })

          }else{
            editor.show()
            editor.webContents.send('book-open', {windowId: editor.id, book: prop.book});
            // event.sender.send('user-book-open', {windowId: editor.id, book_uuid: prop.book_uuid})
          } 
      })

      mainWindow.on('close', (event) => {
        console.log("mainwindow try to close");
        if(lockEditor){
          event.preventDefault();
          return;
        }
        log.info('通知子进程关闭！！！！！！！！')
        console.log("preCloseStepFinished is: " + preCloseStepFinished);
        if(preCloseStepFinished === false){
          console.log("this way?")
          event.preventDefault();
          this.preCloseTask(mainWindow, (taskResult) => {
            if(taskResult === "done"){
              console.log("preClose task done")
            }else{
              console.log("preClose task failed");
            }
            this.workerSender({type: 'windowsClosed'})
            app.quit()
          });
        }else{
          this.workerSender({type: 'windowsClosed'})
          app.quit()
        }

        // console.log("main window on close!!!!!!");
      })
   
      //打开大纲页面
      ipcMain.on('ipc-openOutLine', (event, prop) => {
        if(outline){
          outline.focus();
          return
        };
        const modalPath = winURL +'/index.html' + prop.path
        outline  =  new BrowserWindow({
            width: 1100,
            minWidth: 1100,
            height: 750,
            minHeight: 750,
            title: '橙瓜码字编辑器',
            // resizable: true,
            // minimizable: true,
            maximizable: true,
            icon: 'static/imgs/Icon.icns',
            // fullscreenable: false,
            show: false,
            frame: false,
            kiosk: false,
            alwaysOnTop: false,
            // webPreferences: {
            //   devTools: false
            // }
        })
        outline.loadURL(modalPath)
        // outline.webContents.openDevTools()
        outline.show()

        outline.on('close', (event) => {
          outline = null;
        })
      })



      ipcMain.on('closewindow', (event) => {
        saveEditor = false
        if(editor){
          editor.close()
        }
      })
      // 大纲
      ipcMain.on('ipc-outline', (event, prop) => {
        let type = prop.type;
        if(type != 3) return;
        var menu = new Menu();
        menu.append(new MenuItem({ 
          label: '重命名',
          visible: type == 3,
          click:() => {
            event.sender.send('change-outline-title', prop)
          }
        }))
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({
            label: '删除',
            visible: type == 3,
             click: () => {
                event.sender.send('outline-del', prop)
            }
        }))
        menu.popup()
    })
//空白大纲
    ipcMain.on('ipc-outlines', (event, prop) => {
      let type = prop.type;
      if(type != 3) return;
      var menu = new Menu();
      menu.append(new MenuItem({ 
        label: '重命名',
        visible: type == 3,
        click:() => {
          event.sender.send('change-outline-titles', prop)
        }
      }))
      menu.append(new MenuItem({ type: 'separator' }))
      menu.append(new MenuItem({
          label: '删除',
          visible: type == 3,
           click: () => {
              event.sender.send('outline-dels', prop)
          }
      }))
      menu.popup()
  })

      // 书籍卷右键菜单
      ipcMain.on('ipc-showMenu', (event, prop) => {
          let type = prop.type;
          let index = prop.index;
          let CIndex = prop.CIndex;
          let last = prop.last;
          var menu = new Menu();
          menu.append(new MenuItem({
              label: '创建新卷',
              visible: type == 2, 
              click: () => {
                  event.sender.send('volume-add', prop)
              }
          }))
          menu.append(new MenuItem({ type: 'separator', visible: type == 2 }))
          menu.append(new MenuItem({
              label: '创建新章',
              click: () => {
                  event.sender.send('chapter-add', prop)
              }
          }))
          menu.append(new MenuItem({ type: 'separator' }))
          menu.append(new MenuItem({ 
            label: '重命名' ,
            click:() => {
              event.sender.send('change-title', prop)
            }
          }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '上移一卷', enabled: (index!=0), visible: type == 2}))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '下移一卷', visible: type == 2, enabled: !last }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '上移一章', 
          //     enabled: (CIndex!=0), 
          //     visible: type == 3,
          //     click: () => {
          //         event.sender.send('chapter-up', prop)
          //     }
          // }))
          // menu.append(new MenuItem({ type: 'separator'}))
          // menu.append(new MenuItem({ label: '下移一章', visible: type == 3, enabled: !last }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '置顶本章', enabled: (CIndex!=0), visible: type == 3 }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '置底本章', enabled: !last, visible: type == 3 }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '置顶本卷', enabled: (index!=0), visible: type == 2 }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '置底本卷', enabled: !last, visible: type == 2 }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '移动到指定位置', visible: type == 3 }))
          // menu.append(new MenuItem({ type: 'separator' }))
          // menu.append(new MenuItem({ label: '打开所在文件夹' }))
          menu.append(new MenuItem({ type: 'separator' }))
          menu.append(new MenuItem({
              label: '删除本卷',
              visible: type == 2,
               click: () => {
                  event.sender.send('volume-del', prop)
              }
          }))
          menu.append(new MenuItem({ 
              label: '删除本章',
              visible: type == 3,
              click: () => {
                  event.sender.send('chapter-del', prop)
              }
          }))
          console.log('go')
          menu.popup()
      })
      ipcMain.on('ipc-bookMenu', (event, prop) => {
        var menu = new Menu();
        menu.append(new MenuItem({
          label: '打开书籍',
          click: () => {
              event.sender.send('book-menu-open', prop)
          }
        }))
        menu.append(new MenuItem({ type: 'separator'}))
        menu.append(new MenuItem({
          label: '修改书籍信息',
          click: () => {
              event.sender.send('book-editor-change', prop)
          }
        }))
        menu.append(new MenuItem({ type: 'separator'}))
        menu.append(new MenuItem({
          label: '修改书籍封面',
          click: () => {
              event.sender.send('book-img-change', prop)
          }
        }))
        menu.append(new MenuItem({ type: 'separator'}))
        menu.append(new MenuItem({
          label: '删除书籍',
          click: () => {
              event.sender.send('book-delete', prop)
          }
        }))
        menu.popup()
      })
      ipcMain.on('book-state-list', (event, prop) => {
        if(editor){
          editor.webContents.send('book-state-list', prop)
        }else{
          console.log('没有')
          event.sender.send('book-state-list', {bookType: false, book_uuid: prop.uuid})
        }
      })
      ipcMain.on('send-book-state-list', (event, prop) => {
        mainWindow.webContents.send('book-state-list', prop)        
      })
      ipcMain.on('ipc-userChangeBook', (event, prop) => {
        if(editor){
          editor.webContents.send('ipc-userChangeBook', prop)
        }
      })
      ipcMain.on('ipc-importChapter',(event, prop) => {
        dialog.showOpenDialog({
          title: '选择导入的TXT的内容',
          buttonLabel: '确定',
          filters: [
            {name: 'Textfile', extensions: ['txt']}
          ],
          properties: ['openFile', 'multiSelections'],
          message: '选择导入的TXT的内容'
        }, (filenames) => {
          // fs.open(this.filenames[0], 'r', (err, fd) => {
          //   if(err){
          //     return err
          //   }
            // console.log("file is: " + filenames);
            if(editor && filenames){
              event.sender.send('import-chapter', filenames);
              console.log("set it to true!")
              duringImportOrExport = true;
            }
          // })
        })
      })
      ipcMain.on('ipc-exportChapter',(event, data) => {
        console.log("data is: " + util.inspect(data));
        let defaultName = "";
        if(data.length > 1){
          defaultName = `${data[0].bookTitle}导出的部分章节`
        }else{
          defaultName = `${data[0].bookTitle}-${data[0].volumeTitle}-${data[0].title}`
        }

        dialog.showSaveDialog({
          title: '选择导出位置',
          defaultPath: `~/${defaultName}`,
          properties: 'openFile',
          filters: [
            {name: 'Microsoft Word 文件(*.docx)', extensions: [ 'docx']},
            {name: '纯文本(*.txt)', extensions: [ 'txt']}
          ],
        }, (filename) => {
          if(!filename) return false
          event.sender.send('export-chapter', filename, data);
          console.log("set it to true!")
          duringImportOrExport = true;
        })
      })

      ipcMain.on('lock-editor', () => {
        console.log("force lock!!!!!");
        editor.setKiosk(true);
        editor.setAlwaysOnTop(true);
        lockEditor = true;
        // if(musicPop) musicPop.setParentWindow(editor);
        // console.log("is kiosk?: " + editor.isKiosk());
      })

      ipcMain.on('unlock-editor', () => {
        console.log("unlock!!!!");
        editor.setKiosk(false);
        editor.setAlwaysOnTop(false);
        // if(musicPop) musicPop.setParentWindow(null);
        console.log("is kiosk? " + editor.isKiosk());
        lockEditor = false;
      })

      ipcMain.on('hide-bubble', () => {
        if(lockEditor){
          //in lock editor status, dont hide music bubble even when window is closed
          return;
        }else{
          if(editor) editor.webContents.send('hide-bubble');
        }
      })

      ipcMain.on('import-or-export-finished', () => {
        duringImportOrExport = false;
      })

      // 用户登录，关联用户库
      ipcMain.on('ipc-userLogin', (event, prop) => {
        console.log('on user login')
        console.log(prop)
        process.env.USER_LOGIN_TIME = prop.loginTime
        process.env.USER_DATA_UID = prop.uid
        process.env.USER_DATA_TOKEN = prop.token
        if(prop.usedbName && prop.usedbName !== prop.uid){
          console.log("use an offlinedb: (no sync)" + prop.usedbName)
          shouldSpawnSyncChild = false;
          usingOfflineDB = true;
        }else{
          this.serverWorker()
          this.workerSender({type: 'initDB', data: prop})
        }
        // worker.send({type: 'initDB', data: prop})
        // let fileName = prop.uid
        // let sqlPath = path.join( app.getAppPath(), process.env.NODE_ENV === 'development'?'userData':'../userData', fileName+'.sql')
        // let dbPath = path.join( app.getAppPath(), process.env.NODE_ENV === 'development'?'userData':'../userData', fileName+'.db')
        // console.log('sql file path:'+sqlPath)
        // console.log('db file path:'+dbPath)
        // fs.appendFile(sqlPath, prop.sql,(err, data) => {
        //   if(err) return false;
        //   var child = spawn("sqlite3", [dbPath])
        //   fs.createReadStream(sqlPath).pipe(child.stdin)
        //   event.sender.send('loginBindDB', prop.uid)
        // })
      })
      // 用户登出窗口初始化
      ipcMain.on('ipc-userLogout', (event, prop) => {
        if(editor){
          editor.close()
        }
        mainWindow.webContents.send('userLogout')
        this.workerSender({type: 'userLogout'})
        // worker.send({type: 'userLogout'})
      })
      //插件箱更改
      ipcMain.on('ipc-pluginsSetting', (event) => {
        if(editor){
          editor.webContents.send('pluginsChanged')
        }
        // event.sender.send('pluginsChanged')
      })
      //主窗口最大化与常规化监听
      ipcMain.on('isMaxOrUnmax', () =>{
        if(mainWindow.isMaximized()){
          mainWindow.webContents.send('isMaximize');
        }else{
          mainWindow.webContents.send('isUnmaximize');
        }

      })
      mainWindow.on('maximize',()=>{
        mainWindow.webContents.send('isMaximize');
      })
      mainWindow.on('unmaximize',()=>{
        mainWindow.webContents.send('isUnmaximize');
      })
      ipcMain.on('ipc-ansyBook', (event, prop) => {
        console.log(prop)
        this.workerSender({type: 'bookSend', data: prop.data, uuid: prop.uuid})
      })
      //监听统计数据同步消息
      ipcMain.on('ipc-syncStatistics',(event,prop)=>{
        this.workerSender({type: 'statisticsSend', data: prop})
        console.log('statisticsSend')
        console.log(prop)
      })
      ipcMain.on('online-status-changed', (event, prop) => {
        this.workerSender({type: 'online-status-changed', data: prop})
        // worker.send({type: 'online-status-changed', data: prop})
      })
      ipcMain.on('ipc-info-book-file', (event, prop) => {
        // console.log(prop)
        let documentPath = app.getPath('documents');
        const reg = new RegExp("[\"?:*<>|\\r\\n/\\\\]",'g')
        let nickName = prop.user.nickname.replace(reg,"")
        let appData = '橙瓜码字文稿备份'
        mkDirFile(documentPath, path.join(appData, (nickName+'-'+prop.user.uid))).then((userPath) => {
          process.env.USER_PATH = userPath
          process.env.USER_NAME_CHENGGUA = nickName;
          process.env.USER_ID_CHENGGUA = prop.user.uid.toString();
          this.workerSender({type: 'user_book_path',data: userPath})
          // this.worker.env.USER_PATH = userPath
          for(let i = 0; i< prop.bookList.length; i++){
            let bookItem = prop.bookList[i];
            // console.log(path.join(userPath, bookItem.title+'-'+bookItem.client_uuid))
            fs.mkdirSync(path.join(userPath, bookItem.title+'-'+bookItem.client_uuid))
          }
        })
      })
      ipcMain.on('ipc-info-volumes-file', (event, prop) => {
        console.log("user path:? " + process.env.USER_PATH);
        console.log("book title: " + prop.bookDetail.title);
        console.log("client uuid: " + prop.bookDetail.client_uuid);
        let bookPath = path.join(process.env.USER_PATH, prop.bookDetail.title + '-' +prop.bookDetail.client_uuid );
        if(fs.existsSync(bookPath)){
          for(let i = 0; i<prop.volumes.length; i++){
            mkDirFile(bookPath, `${prop.volumes[i].title}-${prop.volumes[i].client_uuid}`)
          }
        }else{
          console.error(`查询不到书本路径：${bookPath}`);
        }
      })
      ipcMain.on('ipc-add-volumes-file', (event, prop) => {
        let userPath = process.env.USER_PATH;
        if(fs.existsSync(userPath)){
          mkDirFile(userPath, prop.volumeFile ).then((res) => {
            console.log(`用户新建卷完成path: ${res}`)
          })
        }else{
          console.log('用户存储路径不存在~~'+userPath)
          editor.webContents.send('operate-file-err',{message: '文件操作失败!'})
        }
      })
      ipcMain.on('ipc-book-subset-change-name', (event, prop) => {
        let userPath = process.env.USER_PATH;
        let loginTime = process.env.USER_LOGIN_TIME;
        console.log(prop)
        let oldChapterPath = path.join(userPath, prop.type==='chapter'? `${prop.oldPath}-${loginTime}.txt`: prop.oldPath);
        let newChapterPath = path.join(userPath, prop.type==='chapter'? `${prop.newPath}-${loginTime}.txt`: prop.newPath);
        console.log(`oldChapterPath: ${oldChapterPath}`)
        console.log(`newChapterPath: ${newChapterPath}`)
        if(fs.existsSync(oldChapterPath)){
          fs.rename(oldChapterPath, newChapterPath,(err) => {
            if(err) {
              editor.webContents.send('operate-file-err',{message: '文件操作失败!'})
              throw err
            };
            console.log(`名称修改完成，oldPath: ${oldChapterPath}, newPath：${newChapterPath}`)
          })
        }else{
          console.log(`原先章节文件以不存在，path：${oldChapterPath}`)
          console.log(`开始生成新路径: ${newChapterPath}`)
          let baseName = path.extname(newChapterPath);
          let dirName = (baseName? path.dirname(newChapterPath):newChapterPath)
          let documentPath = app.getPath('documents');
          let filePath = dirName.split(documentPath)[1]
          if(filePath){
            mkDirFile(documentPath, filePath).then((res) => {
              if(baseName){
                let chapterFilePath = path.join(res, path.basename(newChapterPath));
                fs.appendFile(chapterFilePath, '', 'utf8', (err) => {
                  if (err) {
                    log.error(`本地章节文件存在，更新章节内容失败：${err}`)
                    throw err;
                  }
                  console.log('文件创建成功')
                })
              }
            })
          }
          // if(prop.type === 'chapter'){
          //   worker.send({
          //     type: 'book-subset-change-name'
          //   })
          // }else if(prop.type === 'volume'){

          // }
          // editor.webContents.send('operate-file-err',{message: '文件操作失败!'})
        }
      })
      ipcMain.on('ipc-book-subset-delete', (event, prop) => {
        let filePath = path.join(process.env.USER_PATH, prop.deletePath)
        if(fs.existsSync(filePath)){
          console.log('有该内容开始删除')
          fs.remove(filePath, (err) => {
            if (err) {
              editor.webContents.send('operate-file-err',{message: '文件操作失败!'})
              return console.error(err)
            }
            console.log('文件删除成功~')
          })
        }else{
          console.log('没有所需要删除的文件路径: '+filePath)
        }
      })

      ipcMain.on('create-music-window', () => {
        console.log("user tried to open a music window");
        // console.log("editor size：");
        // console.log(editor.getSize());

        // let [width, height] = editor.getSize();
        if(!musicPop){
          musicPop = new BrowserWindow({parent: editor, title: "锁定音乐", modal: false, show: true, resizable: false, center: true, width: 1100, height: 750, frame: false, webPreferences:{nodeIntegration: true}})
          // musicPop.webContents.openDevTools()
          musicPop.loadURL(winURL + '/index.html' + '#/music')
          // musicPop.loadURL("https://www.xiami.com/")
          musicPop.once('ready-to-show', () => {
            musicPop.show();
          })

          musicPop.webContents.on('did-get-redirect-request', () => {
            console.log("get redirect request")
          })

          musicPop.webContents.on('new-window', () => {
            console.log("child window tried to open a new window")
          })

          musicPop.webContents.on('will-navigate', () => {
            console.log("child window will nav")
          })

          musicPop.on('closed', () => {
            musicPop = null
          })
        }else{
          musicPop.show()
        }
      })
      // 紧急修复模式下，未能读取到数据库；
      ipcMain.on('VERIFY_TOKEN', () => {
        mainWindow.webContents.send('VERIFY_TOKEN')
      })

      function mkDirFile(root, url){
        let pathSin = url.split(path.sep);
        let pathStr = path.join(root, pathSin.shift())
        let pathUrl = pathSin.join(path.sep)
        if((url)&&(fs.existsSync(pathStr))){
          return mkDirFile(pathStr, pathUrl)
        }else if((url)&&(!fs.existsSync(pathStr))){
          fs.mkdirSync(pathStr)
          return mkDirFile(pathStr, pathUrl)
        }else{
          return new Promise((resolve) => {
            resolve(pathStr)
          })
        }
      }
  }
}