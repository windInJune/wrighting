// const axios = require('axios')
const URL = require('url');
const sqlite3 = require('sqlite3');
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const log = require('electron-log');
const API = JSON.parse(process.env.API);
const controlTime = 5000;
var statics, DBbridge, http;
var eventHeap = [];
var eventTack = null;
let onlineStatus = true
let closedType = false;
let consumer = setInterval(
  controlEvent, 
  controlTime);
log.transports.file.level = 'info';
log.transports.file.file = path.join(process.env.LOGS, 'workerLogs.log');
log.info('worker starting');
if (process.env.NODE_ENV !== 'development') {
  statics = path.join(process.env.APPPATH, '../userData').replace(/\\/g, '\\\\')
  http = require('https');
} else {
  http = require('http');
  statics = './userData'
}
process.on('message', (data) => {
  console.log('read evevt: ')
  // if(!data.type){console.log('event type null'); return false}
  if(data.type === 'online-status-changed'){
    // if(data.data){
      log.info(`网络连接状态改变：${data.data}`)
    //   consumer = setInterval(
    //     controlEvent, 
    //     controlTime);
    // }else{
    //   log.info(`网络断开`)
    //   clearInterval(consumer);
    //   consumer = null
    // }
    onlineStatus = data.data;        
    return false;
  }else if(data.type === 'windowsClosed'){
    log.info('软件被关闭，记录当前队列，结束进程');
    saveEventList(
      function(){
        DBbridge = null;
        eventHeap = [];
        process.send({type: 'worker-closed'})
      }
    )
    return false
  }else if(data.type === 'userLogout'){
    log.info('用户登出，存储队列，结束当前进程!!!!!')
    saveEventList(
      function(){
        DBbridge = null;
        eventHeap = []
        process.send({type: 'worker-closed'})
      }
    )
    // console.log(DBbridge)
    return false;
  }else if(data.type === 'user_book_path'){
    process.env.USER_PATH = data.data
    // log.transports.file.file = path.join(data.data, 'log.txt')
    // log.info(`用户登录，：${data.data}`)
    return false;
  }else if(data.type === 'initDB'){
    log.info('开始绑定数据库。')
    process.env.USER_LOGIN_TIME = data.data.loginTime
    process.env.USER_UID = data.data.uid
    process.env.USER_TOKEN = data.data.token
    DBbridge = new sqlite3.Database(path.join(statics, data.data.uid+'.db'),function(){
      DBbridge.get('select * from testDemo', function(err, row){
        log.info(`数据库绑定成功，查询库内是否含有，tableTest表`)
        if(err){
          if(err.message.indexOf('no such table')){
            DBbridge.run('CREATE TABLE tableTest(uid text, eventList text)',function(tabeErr){
              log.info(`tableTest表创建完成`);
              insertSql()
            })
          }
        }else{
          log.info(`含有tableTest表`);
          insertSql()
        }
        console.log(row)
      })
    });
    return false;
  }else if(data.type === 'editorClosed'){
    log.info('编辑窗口被关闭，存储队列信息');
    saveEventList()
    return false
  }
  enqueue(data);
  // console.log(data)
  
  /*** 
  if((eventHeap.length)||(eventTack)){
    // eventHeap.push(data)
    let temporary = [];
    temporary.push(data)
    console.log(`eventHeap list: ${JSON.stringify(eventHeap)}`)
    let msgData = ((typeof temporary[0].data) === 'string') ? JSON.parse(temporary[0].data) : temporary[0].data;
    // 处理需要更新的内容状态数据
    for(var i = 0;i<eventHeap.length;i++){
      if(eventHeap[i].type == temporary[0].type){
        let item = eventHeap[i];
        switch(item.type){
          case 'bookSend':
          // 判断是否含有同一章同步数据
            let sendData = JSON.parse(item.data);
            if(sendData.bodyData.chapters[0].chapter_uuid === msgData.bodyData.chapters[0].chapter_uuid){
              // item.data = temporary[0].data
              temporary.shift()
            }
            // if(eventHeap.length>=2){
            //   eventCallback(eventTack)
            // }
          break;
          default:
            // 处理匹配之外的数据 
            eventHeap.push(data)
          break;
        }
      }
    }
    // 处理不需要更新的内容数据
    if(temporary.length){
      if(data.type === 'online-status-changed'){
      // 更新网络状态
        console.log(`网络状态发生改变，含有任务未执行,网络状态更新为: ${temporary[0].data}`)
        onlineStatus = msgData;
        if(onlineStatus&&(eventTack||eventHeap.length)){
          eventCallback(eventTack)              
        }
        temporary.shift()
        return false
      }else if(data.type === 'user_book_path'){
        // log.transports.file.file = path.join(data.data, 'log.txt')
        process.env.USER_PATH = data.data
        log.info(`用户登录，定义用户存贮路径,存在队列，立即执行：${data.data}`)
        return false;
      }
      let reData = temporary.shift()
      eventHeap.push(reData)
      // 在eventHeap事件列表内，无与该相同的数据
    }
  }else{
    // event列表内为空
    // console.log(`eventTack a ${eventTack}`)
    // if(!eventTack){
      // 当前无事件执行。
      if(data.type === 'online-status-changed'){
        console.log(`网络发生改变，事件队列为空，当前没有事件需要执行，网络状态更改为: ${data.data}`)
        onlineStatus = data.data;        
        return false;
      }else if(data.type === 'userLogout'){
        DBbridge = null;
        console.log('用户登出，抛弃用户库!')
        // console.log(DBbridge)
        log.info('用户登出，抛弃用户库!')
        return false;
      }else if(data.type === 'user_book_path'){
        process.env.USER_PATH = data.data
        // log.transports.file.file = path.join(data.data, 'log.txt')
        log.info(`用户登录，定义用户存贮路径,立即执行：${data.data}`)
        return false;
      }
      eventTack = data;
      // console.log(`info eventTack: ${JSON.stringify(eventTack)}`)
      // if(data.type === 'bookSend') return false;
      eventCallback(eventTack)
    // }else{
      // eventHeap.push(data)
    // }
  }
    */
});
function enqueue(tack){
  // 判断是否该任务最外层是否含有操作的uuid，若有uuid则进行去重
  if(tack.uuid){
    for(let i = 0; i<eventHeap.length; i++){
      if((eventHeap[i].uuid)&&(eventHeap[i].uuid === tack.uuid)){
        switch(tack.type){
          case 'bookSend' :
            console.log(`含有相同章节同步，抛出当前需要追加队列的事件`)
            return false;
          // break;
        }
      }
    }
  }
  // else{
    eventHeap.push(tack)
  // }
  
  // console.log(`事件队列中含有${eventHeap.length}条。`)
}
function controlEvent(){
  // 先存储DB库后再检查是否有无事件可执行
  saveEventList(function(){
    // 无网络，队列内无任务
    if(!eventHeap.length||!onlineStatus) return false;
    let itemEvent = dequeue();
    // console.log(`时间已经达到：${controlTime}，队列中返回第一条可执行事件;`)
    if(itemEvent){
      onTask(itemEvent)
    }
  })
}
function dequeue(){
  let event = eventHeap.shift();
  return event
}
function onTask(task){
  console.log(`action sync type: ${JSON.stringify(task)}`)
  log.info(`action sync type: ${task.type}`)
  if((task)&&(task.type)){
    switch (task.type){
      case 'bookSend':
      // 章节内容更新
        var time = timestamp();
        console.log(task.data)
        var datas = typeof(task.data) ==='string'? JSON.parse(task.data) : task.data;
        try {
          DBbridge.get(`select * from chapter_content where chapter_uuid='${datas.bodyData.chapters[0].chapter_uuid}' and is_deleted = 0 and uid='${datas.uid}'`, function(err, row) {
            if(!err){
              datas.bodyData.chapters[0].content = row.content
              console.log('开始请求章节内容同步版本: '+datas.bodyData.chapters[0].update_number)
              datas.bodyData.chapters[0].update_number = (datas.bodyData.chapters[0].update_number||row.version)
              // datas.bodyData.chapters[0].update_number = row.version
              var writeData = JSON.stringify(datas.bodyData)
              var options = URL.parse(`${API.chapterContentSync}?token=${process.env.USER_TOKEN}&timestamp=${time}`)
              options.method= "POST";
              options.headers= {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-sign-id': hmac256(process.env.USER_TOKEN,API.chapterContentSync,time,datas.bodyData),
                'Content-Length': Buffer.byteLength(writeData)
              };
              
              var controller = {
                options: options,
                type: "POST",
                data: task,
                body: writeData
              }
              httpRequst(controller, bookSend)
              // 章节内容本地保存
              log.info(`子进程内user存储路径: ${{content:row.content,chapter: datas.chapterPath}}`)
              chapterLocaFile({content:row.content,chapter: datas.chapterPath})
            }else{
              log.error(`bookSend 章节内容查库失败uuid: ${datas.bodyData.chapters[0].chapter_uuid}; error: ${err}`)
            }
          })
        } catch (error) {
          log.error(task)
          log.error(error)
        }




        // axios.post(API.chapterContentSync+`?token=`, datas.bodyData).then((res) => {
        //   let msg = res.data;
        //   console.log(`action status code: ${msg.statics}`)
        //   if(msg.status == 200){
        //     if(msg.result.datas[0].code == 200){
        //       DBbridge.run(`update chapter_content SET  version='${msg.result.datas[0].update_number}', is_upload='1' where chapter_uuid = '${datas.bodyData.chapters[0].chapter_uuid}'`, function(err, rows) {
        //           if (null != err) {
        //               console.log(err)
        //           } else {
        //             let sendData = {
        //               chapter_uuid: datas.bodyData.chapters[0].chapter_uuid,
        //               version: msg.result.datas[0].update_number,
        //               is_upload: 1
        //             }
        //             process.send({type: 'changeChapterContent', data: sendData})
        //             console.log('本地数据库version更新成功')
        //             if(eventHeap.length){
        //               console.log(`next ansy eventTack`)
        //               eventTack = eventHeap.shift()
        //               eventCallback(eventTack)
        //             }else{
        //               eventTack = null
        //             }
        //           }
        //       });
        //     }else if(msg.result.datas[0].code == 409){
        //       console.log('发生冲突开始更新version')
        //       datas.bodyData.chapters[0].update_number = msg.result.datas[0].current_data.update_number;
        //     }
        //   }else{
            
        //   }
        // })
        break;
        case 'statisticsSend':
            var time = timestamp();
            var datas = JSON.parse(task.data)
            var writeData = JSON.stringify(datas.data)
            var options = URL.parse(`${API.rankSync}?token=${process.env.USER_TOKEN}&timestamp=${time}`)
            options.method= "POST";
            options.headers= {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'x-sign-id': hmac256(process.env.USER_TOKEN, API.rankSync, time, datas.data),
              'Content-Length': Buffer.byteLength(writeData)
            };
            
            var controller = {
              options: options,
              type: "POST",
              data: task,
              body: writeData
            }
            httpRequst(controller, statisticsSend)
        break;
        case 'closed':
        console.log('event loop: '+eventHeap.length)
        console.log('eventTack: '+eventTack)
        if(eventHeap.length){
          closedType = true
          console.log('有未执行完的任务，')
        }else{
          process.kill()
        }
        break;
        // default:
        // if(eventHeap.length){
        //   eventTack = eventHeap.shift()
        //   onTask(eventTack)
        //   }else{
        //     eventTack = null
        //   }
        //   console.log('接受状态未知')
        // break;
    }
  }else{
    console.log(`event error is: ${task}`)
  }
  
}
function insertSql(){
  let uid = process.env.USER_UID
  DBbridge.get(`select * from tableTest where uid='${uid}'`,function(err, row){
    log.info(`检查tableTest内是否含有数据`)
    if(!row){
      DBbridge.run(`INSERT INTO tableTest (uid, eventList) VALUES ('${uid}', '[]')`, function(err){
        log.info(`tableTest 内无数据，添加数据`)
      })
    }else{
      log.info('tableTest 中含有数据，和eventHeap合并')
      eventHeap = eventHeap.concat(JSON.parse(row.eventList));

    }
  })
}
function saveEventList(callback){
  if(!DBbridge){
    return false;
  }
   DBbridge.run(`update tableTest SET eventList = '${JSON.stringify(eventHeap)}' where uid='${process.env.USER_UID}'`,function(err){
      if(err){
        log.error('队列信息存储失败')
        log.error(err)
      }
      callback&&callback()
    })
}
function httpRequst(controller, callback){
  if(!onlineStatus){
    onError()
    console.log('网络断开停止请求~')
    return false;
  }
  console.log('httpRequst in:');
  // controller.options.timeout= 100;
  controller.options.timeout= 60000;
  const req = http.request(controller.options, (res, error) =>{
    res.setEncoding('utf-8');
    let data = '';
    res.on('data', (chun) => {
      log.info('httpRequst data所返回 chun： ')
      // console.log('requset success run callback:')
      log.info(chun)
      // let msg = JSON.parse(chun);
      // callback(msg, controller.data)
      data += chun
    })
    res.on('end', function () {
      try {
        log.info('on end:');
        let msg = JSON.parse(data)
        callback(msg, controller.data)
      } catch (e) {
        log.error('JSON实例化失败~~~~~~')
        log.error(e.message);
      }
    })
  })
  req.on('socket', function (socket) {
    // socket.setTimeout(myTimeout);  
    socket.on('timeout', function() {
      log.info('请求超时，退出请求！！！！')
        req.abort();
    });
  });
  req.on('error', (e) => {
    if (e.code === "ECONNRESET") {
      log.error(`请求时间超时！`)    
      console.log('讲任务重新追加至队列最后；')
      enqueue(controller.data)
    }
    onError()
    log.error(`请求遇到问题: ${e.message}`);
    // if(eventHeap.length){
    //   log.info('队列中含有事件等待，执行下一个任务!')
    //   eventTack = eventHeap.shift()
    //   eventCallback(eventTack)
    // }else{
    //   log.info('队列中无任务等待，结束队列；')
    //   eventTack = null
    // }
  });

  if(controller.type == "POST"){
    req.write(controller.body)
  }
  req.end();
}
function bookSend(msg, tack){
  // log.info(`bookSend fun log message: ${JSON.stringify(msg)}`)
  var datas = JSON.parse(tack.data)
  if(msg.status == 200){
    if(msg.result.datas[0].code == 200){
      console.log(`http code: 200`)
      console.log(datas)
      DBbridge.run(`update chapter_content SET  version='${msg.result.datas[0].update_number}', is_upload='1' where chapter_uuid = '${datas.bodyData.chapters[0].chapter_uuid}'`, function(err, rows) {
          if (null != err) {
            log.info(`章节同步成功，本地库修改失败: ${err}`)
            console.log(err)
          } else {
            let sendData = {
              chapter_uuid: datas.bodyData.chapters[0].chapter_uuid,
              version: msg.result.datas[0].update_number,
              is_upload: 1
            }
            process.send({type: 'changeChapterContent', data: sendData})
            log.info(`本地数据库version更新成功: ${msg.result.datas[0].update_number}`)
            onSuccess()
          }
      });
    }else if(msg.result.datas[0].code == 409){
      // let data = JSON.parse(eventTack.data)
      log.info('版本冲突，旧版本version： ', datas.bodyData.chapters[0])
      onError({code: 409, client_uuid: datas.bodyData.chapters[0].chapter_uuid})
      // console.log('发生冲突开始更新version,versio值更新之后为： ')
      // log.info('发生冲突开始更新version,versio值更新之后为： ')
      // let data = JSON.parse(eventTack.data)
      // data.bodyData.chapters[0].update_number = msg.result.datas[0].current_data.update_number
      // eventTack.data = JSON.stringify(data)
      // console.log(eventTack.data)
      // eventCallback(eventTack)
      // datas.bodyData.chapters[0].update_number = msg.result.datas[0].current_data.update_number;
    }else{
      console.log('接口报错:')
      console.log(JSON.stringify(msg.result))
      log.error(`接口报错: ${JSON.stringify(msg.result)}`)
      log.info('推入事件队列中！')
      enqueue(tack)
      onError()
    }
  }else{
    onError()
    log.info(`书籍同步状态status非200:${msg}`)
    log.info('推入事件队列中！')
    if(msg.status === 100403){
      log.info('当前token值为：'+process.env.USER_TOKEN)
      console.log('传入的data 为： ',tack)
    }
    enqueue(tack)
    onError()
  }
}
function statisticsSend(msg, tack){
  console.log('排行请求返回msg',JSON.stringify( msg))
  var datas = JSON.parse(tack.data)
  if(msg.status==200){
    log.info('排行同步请求成功')
    process.send({type: 'changeStatisticsVersion', data: msg})
  }else if(msg.status==100409){
      log.info('排行版本冲突开始更新version,versio值更新之后为： '+msg.result.statistics[0].version)
      log.info(`data: ${tack.data}`)
      log.info(`msg: ${JSON.stringify(msg)}`)
      datas.data.statistics[0].version = msg.result.statistics[0].version
      tack.data = JSON.stringify(datas)
      onTask(tack)
      process.send({type: 'changeStatisticsVersion', data: msg})

  }else{
    log.info('推入事件队列中！')
    enqueue(tack)
  }
  console.log('统计同步发送datas',datas)
}
function chapterLocaFile(data){
  // console.log(data)
  let userPath = process.env.USER_PATH;
  let loginTime = process.env.USER_LOGIN_TIME;
  log.info(`chapterLocaFile log process.env.USER_PATH: ${userPath};loginTime: ${loginTime}`)
  if(fs.existsSync(userPath)){
    mkDirFile(userPath, data.chapter.paths).then((res) => {
      let chapterFilePath = path.join(res, `${data.chapter.fileName}-${loginTime}.txt`)
      if(fs.existsSync(chapterFilePath)){
        fs.writeFile(chapterFilePath, data.content, 'utf-8', (err) => {
          if (err) {
            log.error(`添加本地章节失败： ${err}`)
            throw err
          };
          process.send({type: 'chapter-success', message:'本地保存成功！'});    
          console.log('成功更新本地章节内容');
        })
      }else{
        fs.appendFile(chapterFilePath, data.content, 'utf-8', (err) => {
          if (err) {
            log.error(`本地章节文件存在，更新章节内容失败：${err}`)
            throw err;
          }
          process.send({type: 'chapter-success', message:'本地保存成功！'});    
          console.log('数据已追加到文件');
        })
      }
    })
  }else{
    process.send({type: 'chapter-error', message:'本地保存失败！'});
    console.error('用书缓存文件夹已经被删除~~~~')
    log.error(`用书缓存文件夹已经被删除,userPath: ${userPath}`)
  }
  // console.log(data.datas)
  // DBbridge.get(`select * from book_category where client_uuid='${datas.book_uuid}' and is_deleted = 0`, function(err, row) {
  //   if(row){
  //     let book_json = JSON.parse(row[0].book_json).SubCategories;

  //   }
}
/**
 *
 *
 * @param {string} root 文件根目录
 * @param {string} url 需要创建的文件路径: demo1/demo2/demo3
 * @returns
 */
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
function timestamp() {
  return parseInt(new Date().getTime()/1000)
}
function hmac256(token,url,time,data) {
  var md5 = crypto.createHash('md5');
  var secretStr = token + time + URL.parse(url).pathname;
  console.log('secretStr: ')
  console.log(secretStr)
  var key = (md5.update(secretStr).digest('hex')).toLowerCase();
  return crypto.createHmac('sha256', key).update( (data ? JSON.stringify(data) : '') ).digest('hex');
}
function onError(data){
  console.log('同步失败了，开始失败的通讯11111111111111111111111111111111')
  process.send({type: 'worker-error', data: data})
}
function onSuccess(){
  process.send({type: 'worker-success'})
}
// process.send({ foo: 'bar', baz: NaN });