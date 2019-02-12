import axios from 'axios'
import Vue from 'vue'
import * as api from '../API'
import * as storeApi from '../storeApi'
import router from '../../router/index'
import SqliteDB from './../../datastore'
import { ipcRenderer, remote } from "electron";
import { hmac256, timestamp, getNowFormatDate } from '../../../../static/js/public';
import fs from 'fs'
import qs from 'qs'
const path = require('path');
const store = require('store/dist/store.modern');

let globalSql = null;

function initialState() {
  return {
    is_registered: false, //是否注册
    code_status:'',  //验证码登录返回状态
    password_status:'',  //登录返回状态
    password_message:'',  //登录返回的message
    user_center: {}
  }
}
const userModule = {
    state: {
      initialState: initialState(),
      is_registered: initialState().is_registered, //是否注册
      code_status: initialState().code_status,  //验证码登录返回状态
      password_status: initialState().password_status,  //登录返回状态
      password_message: initialState().password_message,  //登录返回的message
      user_center: initialState().user_center
    },
    getters: {
        [storeApi.SIGNUP_PHONE_REGIST_STATUS]: ( state ) => {
            return state.is_registered
        },
        [storeApi.LOGIN_CODE_STATUS]: ( state ) => {
            return state.code_status
        },
        [storeApi.LOGIN_PASSWORD_STATUS]: ( state ) => {
            return state.password_status
        },
        [storeApi.GET_USET_DATA]: ( state ) => {
          return state.user_center
      }
    },
    actions: {
        [storeApi.USER_SIGNIN]({commit,dispatch}, userCen) {
            axios.post(api.USER_SIGNIN, { 'username': Number(userCen.userTel), 'password': userCen.userPwd}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => {
                // success
                var userCon = {};
                if(response.data.status === 200 ){
                    console.log(userCen.autoLogin);
                    
                    // SqliteDB.insertData
                    userCon.uid= response.data.result.uid;
                    userCon.usedbName= response.data.result.uid;
                    userCon.token= response.data.result.token;
                    userCon.type= 'USER_SIGNIN'
                    console.log(Object.assign(response.data,{autoLogin:userCen.autoLogin}))
                    window.localStorage.setItem('yourpassword',userCen.userPwd);
                    commit(storeApi.UP_LOGIN_PASSWORD_STATUS, Object.assign(response.data,{autoLogin:userCen.autoLogin}) )
                    dispatch(storeApi.USER_OPEN_DB, userCon)
                    // dispatch(storeApi.USER_DOWNLOAD_SQL,{token: response.data.result.token,uid: response.data.result.uid})
                }else{
                    commit(storeApi.UP_LOGIN_PASSWORD_STATUS,response.data)
                }
            },(error) => {
                // error
                commit(storeApi.UP_LOGIN_PASSWORD_STATUS, {statue: 404504})
                console.log(error)
            });
        },
        [storeApi.USER_OPEN_DB]({dispatch}, data){
          var statics;
          if (process.env.NODE_ENV !== 'development') {
            statics = path.join(remote.app.getAppPath(), '../userData').replace(/\\/g, '\\\\')
          } else {
            statics = path.join(remote.app.getAppPath(), './userData')
          }
          console.log("dbname: " + data.usedbName);
          fs.stat(path.join(statics, data.usedbName+'.db'), function (err,stats) {
              console.log("check if db exists: ");
              console.log("check dbsize got err? ")
              console.log(err)
              console.log("db stats is: ");
              console.log(stats);
              // fs.stat(path.join(statics, dbname+'.db'),function (err,stats) {
              if(!err){
                console.log("db file stats ok")
                  if(stats && stats.size>0){
                      console.log("db size is larger than 0, maybe meaningful")
                      globalSql = new SqliteDB(data.usedbName, function(newDBResult){
                          if(newDBResult === "done"){
                              console.log("db created in user")
                              window.sqliteDB = globalSql;
                              Vue.prototype.$sqliteDB = globalSql;
                              // ipcRenderer.send('ipc-userLogin', {uid: data.user.user_center.uid, usedbName: dbname, loginTime: getNowFormatDate()});
                              ipcRenderer.send('ipc-userLogin', {uid: data.uid, token: data.token, usedbName: data.usedbName, loginTime: getNowFormatDate()});
                              router.push({
                                  name: 'user'
                              })

                          }else{
                              console.log("open db failed")
                          }
                      });

                  }else{
                      console.log("db size is 0!")
                      if(data.type === 'VERIFY_TOKEN'){
                        store.clearAll();
                        ipcRenderer.send('VERIFY_TOKEN')
                        return false;
                      }
                      dispatch(storeApi.USER_DOWNLOAD_SQL, data)
                  }
              }else{
                  console.log("db file stats error")
                  if(data.type === 'VERIFY_TOKEN'){
                    store.clearAll();
                    ipcRenderer.send('VERIFY_TOKEN')
                    return false;
                  }
                  dispatch(storeApi.USER_DOWNLOAD_SQL, data)
              }   
          })
        },
        getIsPhone({commit}, data) {
            axios.post(api.getIsPhone, { 'phone': Number(data.loginName)}, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then((response) => {
                    // success
                    //该手机号码已注册
                    if(response.data.status == 40204){
                        commit(storeApi.SIGNUP_PHONE_IS_REGIST)
                    }
                    //获取验证码
                    axios.post(api.getCode, { 'phone': Number(data.loginName)}, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        })
                        .then((response) => {
                        }, (error) => {
                            // error
                            console.log(error)
                        });

                }, (error) => {
                    // error
                    console.log(error)
                });
        },
        [storeApi.USER_REGISTER]({commit, dispatch}, data) {

            axios.post(api.USER_REGISTER, { 'phone': Number(data.username), 'password': data.password, 'nickname': data.nickname,'gender': Number(data.gender),'code': Number(data.code)}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => {
                // success
                if(response.data.status === 200 ){
                    // router.push({name: 'user'})
                    // userCon = {
                    //     userid: response.data.result.uid,
                    //     token: response.data.result.token,
                    //     coode: 200,
                    //     avatar: response.data.result.avatar,
                    //     nickname: response.data.result.nickname,
                    // };
                    commit(storeApi.UP_LOGIN_PASSWORD_STATUS,response.data)
                    dispatch(storeApi.USER_DOWNLOAD_SQL,{token: response.data.result.token,uid: response.data.result.uid})
                }else{
                  commit(storeApi.UP_LOGIN_PASSWORD_STATUS,{status: response.data.status, message: response.data.message})
                }
            },(error) => {
                // error
                console.log(error)
            });


            /*axios.get(api.USER_REGISTER + '?username='+ Number(data.username) +'&password=' + data.password +'&nickname=' + data.nickname +'&gender=' + Number(data.gender) +'&code=' + Number(data.code)).then((response) => {
             if(response.data.status === 200 ){
             router.push({name: 'user'})
             userCon = {
             userid: response.data.result.uid,
             token: response.data.result.token,
             coode: 200,
             avatar: response.data.result.avatar,
             nickname: response.data.result.nickname,
             };
             }
             })*/
        },
        [storeApi.USER_CODE_SIGNIN]({commit, dispatch}, userCen) {
            axios.post(api.USER_CODE_SIGNIN, { 'phone': Number(userCen.userTel), 'code': Number(userCen.code)}, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => {
                // success
                var userCon = {};
                if(response.data.status === 200 ){
                    userCon = {
                        userid: response.data.result.uid,
                        token: response.data.result.token,
                        coode: 200,
                        avatar: response.data.result.avatar,
                        nickname: response.data.result.nickname,
                    };
                    commit(storeApi.UP_LOGIN_PASSWORD_STATUS,Object.assign(response.data,{autoLogin:userCen.autoLogin}) )
                    dispatch(storeApi.USER_DOWNLOAD_SQL,{token: response.data.result.token,uid: response.data.result.uid})
                }else{
                  commit(storeApi.UP_LOGIN_PASSWORD_STATUS,response.data)
                    // commit(storeApi.UP_LOGIN_CODE_STATUS,response.data.status)
                }


            },(error) => {
                // error
                console.log(error)
            });
        },
        [storeApi.USER_DOWNLOAD_SQL]({commit}, data){
          let time = timestamp()  
          axios.get(
                api.USER_DOWNLOAD_SQL+`?token=${data.token}&timestamp=${time}`,
                {
                    headers: {
                        'x-sign-id': hmac256(data.token,api.USER_DOWNLOAD_SQL,time)
                    }
                }
          ).then((response) => {
            console.log("in download sql case");
            globalSql = new SqliteDB(data.uid, function(newDBResult){
                if(newDBResult === "done"){
                    console.log("db created in download sql case");
                    globalSql.importSqlFile(response.data).then(function(err){
                        if(err){
                            console.log("import sql file failed: ");
                            console.log(err);
                        }else{
                            console.log("sql file imported");
                            ipcRenderer.send('ipc-userLogin', {uid: data.uid, token: data.token, loginTime: getNowFormatDate()});
                            window.sqliteDB = globalSql;
                            Vue.prototype.$sqliteDB = globalSql;
                            router.push({name: 'user'})
                        }
                    })
                }else{
                    console.log("open db failed in download sql case")
                }
            });
            // sqliteDB.importSqlFile(response.data).then((error) => {
            //   console.log('init sqliteDB')
            //   if(error){
            //     console.log(error)
            //   }else{
            //     ipcRenderer.send('ipc-userLogin', {uid: data.uid, loginTime: getNowFormatDate()});
            //     window.sqliteDB = sqliteDB;
            //     Vue.prototype.$sqliteDB = sqliteDB;
            //     // history(0);
            //     router.push({name: 'user'})
            //   }
            // })

            // let dbname = store.get("use-db");
            // if(dbname){
            //   dbname = path.basename(store.get("use-db"), '.db');
            //   let sqliteDB = new SqliteDB(dbname);

            //   globalSql = new SqliteDB(dbname);
            //   window.sqliteDB = sqliteDB;
            //   Vue.prototype.$sqliteDB = sqliteDB;
            //   console.log("download db but use a backup db")
            //   console.log("db bind download sql but has local old db case: " + dbname)

            //   globalSql.queryData(`select * from book_category where client_uuid = '8a6fed1b-f6be-43f2-88dc-f6f386b216c4'`).then((rows) => {
            //     console.log("if rows: ?")
            //     console.log(rows)
            //   })


            //   // history(0);
            //   // setTimeout(() => {
            //   ipcRenderer.send('ipc-userLogin', {uid: data.uid});
            //   router.push({name: 'user'})
            //   // }, 500)


            // }else{
            //   dbname = data.uid
            //   let sqliteDB = new SqliteDB(dbname);
            //   sqliteDB.importSqlFile(response.data).then((error) => {
            //     console.log('init sqliteDB')
            //     if(error){
            //       console.log(error)
            //     }else{

            //       console.log("download db")
            //       window.sqliteDB = sqliteDB;
            //       Vue.prototype.$sqliteDB = sqliteDB;
            //       // setTimeout(() => {
            //         ipcRenderer.send('ipc-userLogin', {uid: data.uid});
            //         router.push({name: 'user'})
            //       // }, 500)


            //       console.log("db bind download sql and use downloaded db case: " + dbname)
            //       // history(0);

            //     }
            //   })
            // }

            // // console.log("dbname" + dbname);

            // // console.log('dbpath',statics)

          },(error) => {
            commit(storeApi.UP_LOGIN_PASSWORD_STATUS, {statue: 404504})
          })
        },
        [storeApi.USER_CHANGE_DATA]({commit}, data){
          axios.post(api.USER_CHANGE_DATA, data).then((res) => {
            let msg = res.data;
            if(msg.status == 200){
              let sendData = data
              data.status = 200
              console.log(data)
              commit(storeApi.USER_CHANGE_DATA, data)
            }else{
              let sendData = msg
              commit(storeApi.USER_CHANGE_DATA, sendData)          
            }
          })
        },
        [storeApi.VERIFY_TOKEN]({commit,dispatch}, data){
            axios({
                url: api.verifyToken,
                method: 'post',
                data: {
                    token: data.user.user_center.token
                }
            }).then(response => {
                let msg = response.data
                console.log(__dirname)
                if (msg.status == 200) {
                    // commit(storeApi.UP_LOGIN_PASSWORD_STATUS, data )
                    console.log("verify token okay: code is: " + msg.status)
                    var userCon={};
                    let dbname = store.get("use-db");
                    let useOfflineDB = false;
                    if(dbname){
                      dbname = path.basename(dbname, '.db');
                      useOfflineDB = true;
                    }else{
                      dbname = data.user.user_center.uid
                    }
                    if(!dbname) dbname = data.user.user_center.uid
                    userCon.uid = data.user.user_center.uid
                    userCon.token = data.user.user_center.token
                    userCon.usedbName = dbname
                    userCon.type = 'VERIFY_TOKEN'
                    dispatch(storeApi.USER_OPEN_DB,userCon)


                    // console.log("dbname" + dbname);
                    // // let dbempty = store.get("non-exist");
                    // // console.log("nonexist db: " + dbempty);
                    // console.log('dbpath',statics)

                    // let fsStat = fs.statSync(path.join(remote.app.getPath('exe'), statics, dbname+'.db'))
                    // console.log("check if db exists: ");
                    // console.log("check dbsize got err? ")
                    // console.log("db stats is: ");
                    // console.log(fsStat);
                    // if(fsStat && fsStat.size > 0){
                    //     let sqliteDB = new SqliteDB(dbname, function(newDBResult){
                    //         if(newDBResult === "done"){
                    //             console.log("db created in user")
                    //             window.sqliteDB = sqliteDB;
                    //             Vue.prototype.$sqliteDB = sqliteDB;
                    //             // setTimeout(() => {
                    //             ipcRenderer.send('ipc-userLogin', {uid: data.user.user_center.uid, usedbName: dbname, loginTime: getNowFormatDate()});
                    //             router.push({
                    //                 name: 'user'
                    //             })
                    //             // }, 5000)
                    //         }else{
                    //             console.log("open db failed")
                    //         }
                    //     });

                    // }
                    // if(!dbname) dbname = data.user.user_center.uid

                    // console.log("dbname: " + dbname);
                    // fs.stat(path.join(statics, dbname+'.db'), function (err,stats) {
                    //     console.log("check if db exists: ");
                    //     console.log("check dbsize got err? ")
                    //     console.log(err)
                    //     console.log("db stats is: ");
                    //     console.log(stats);
                    //     // fs.stat(path.join(statics, dbname+'.db'),function (err,stats) {
                    //     if(!err){
                    //         if(stats && stats.size>0){
                    //             console.log("db size is larger than 0, maybe meaningful")
                    //             globalSql = new SqliteDB(dbname, function(newDBResult){
                    //                 if(newDBResult === "done"){
                    //                     console.log("db created in user")
                    //                     window.sqliteDB = globalSql;
                    //                     Vue.prototype.$sqliteDB = globalSql;
                    //                     ipcRenderer.send('ipc-userLogin', {uid: data.user.user_center.uid, token: data.user.user_center.token, usedbName: dbname, loginTime: getNowFormatDate()});
                    //                     router.push({
                    //                         name: 'user'
                    //                     })

                    //                 }else{
                    //                     console.log("open db failed")
                    //                 }
                    //             });

                    //         }else{
                    //             console.log("db size is 0!")
                    //         }
                    //     }else{
                    //         console.log("db file stats error")
                    //     }   
                    // })
                } else {
                    console.log("verify token is not okay: " + msg.status);

                }
            })
        }
    },
    mutations: {


        [storeApi.SIGNUP_PHONE_IS_REGIST](state) {
            state.is_registered = true
        },
        [storeApi.UP_LOGIN_CODE_STATUS](state,userCon) {
            state.code_status = userCon
        },
        [storeApi.UP_LOGIN_PASSWORD_STATUS](state,userCon) {
            state.password_status = userCon.status;
            state.password_message = userCon.message||''
            if(userCon.status == 200){
              state.user_center = userCon.result,
              state.user_center['autoLogin'] = userCon.autoLogin
            }
        },
        [storeApi.USER_LOGOUT](state, rootState){
          // state.user_center = {};
          window.sqliteDB = null;
          Vue.prototype.$sqliteDB = null;
          globalSql = null;
          router.push({name: 'passwordLogin'})
        },
        [storeApi.USER_CHANGE_DATA](state,data){
          if(data.status == 200){
            delete data.status
            if(data.profile.nickname){
              state.user_center.nickname = data.profile.nickname
            }
            if(data.profile.gender){
              state.user_center.gender = data.profile.gender
            }
            if(data.profile.signature){
              state.user_center.signature = data.profile.signature
            }
            if(data.profile.avatar){
                state.user_center.avatar = data.profile.avatar
            }
            // Object.assign(,data)
          }
        },
        [storeApi.RESET_USER_MODULE]: (state, data) => {
          state[data.key] = data.value
        }
    }
}
// ipcRenderer.on('loginBindDB', (event, prop) => {
//   if(prop){
//     ipcRenderer.send('ipc-userLogin', {uid: data.uid, loginTime: getNowFormatDate()});
//     window.sqliteDB = sqliteDB;
//     Vue.prototype.$sqliteDB = sqliteDB;
//     console.log('router to')
//     router.push({name: 'user'})
//   }
// })



export default userModule