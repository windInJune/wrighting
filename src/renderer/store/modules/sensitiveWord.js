import axios from 'axios'
import * as api from '../API'
import * as TYPE from '../storeApi'
import { hmac256,timestamp, sqliteDBStrongDecode } from '../../../../static/js/public.js'
import uuid from 'uuid-random'


// var sqliteDB = new SqliteDB();
function initialState() {
  return {
    SENSITIVE_WORDS: {
        BASE:{},
        USER:{}
    }
  }
}
const state = {
  initialState: initialState(),
  SENSITIVE_WORDS: {
      BASE: initialState().SENSITIVE_WORDS.BASE,
      USER: initialState().SENSITIVE_WORDS.USER
  }
}
const getters = {
    GET_SENSITIVE_WORDS: (store) => {
        return store.SENSITIVE_WORDS
    }
}

const mutations = {
    [TYPE.SENSITIVE_WORDS]: (store, data) => {
        state.SENSITIVE_WORDS.BASE = data[0];
    },
    SENSITIVE_WORDS_USER: (store,data) => {
        state.SENSITIVE_WORDS.USER = data[0];
    },
    [TYPE.UPDATE_SENSITIVE_WORDS_CONTENT]: (store,data) => {
        state.SENSITIVE_WORDS.USER.content = data.content
    },
    [TYPE.UPDATE_SENSITIVE_WORDS_VERSION]: (store,data) => {
        state.SENSITIVE_WORDS.USER.version = data.version
    },
    [TYPE.UPDATE_SENSITIVE_WORDS_ISUPLOAD]: (store,data) => {
        state.SENSITIVE_WORDS.USER.is_upload = 1
    },
    [TYPE.RESET_SENSITIVEWORD_MODULE]: (state, data) => {
      state[data.key] = data.value
    }
}

const actions = {
    [TYPE.SENSITIVE_WORDS]: ({commit,rootState}, data) => {
        sqliteDB.queryData(`SELECT * FROM sensitive_words WHERE category = 'base'`).then((res) => {
            commit('SENSITIVE_WORDS', res)
        })
        sqliteDB.queryData(`SELECT * FROM sensitive_words WHERE category = 'user' AND uid = ${rootState.user.user_center.uid}`).then((res) => {
            if (res.length == 0) {  //初次登录插入用户敏感词
                let time = timestamp()
                axios.get(
                    api.sensitiveWordSearch + `?token=${rootState.user.user_center.token}&timestamp=${time}`,
                    {
                        headers: {
                            'x-sign-id': hmac256(rootState.user.user_center.token,api.sensitiveWordSearch,time)
                        }
                    }
                    ).then((response) => {
                    let msg = response.data;
                    if (msg.status == 200) {
                        let resData = msg.result.sensitive_words
                        let UUID = uuid();
                        let dataObj = {
                            client_uuid: UUID,
                            category: 'user',
                            uid: rootState.user.user_center.uid,
                            content: resData.content,
                            is_upload: 1,
                            version: resData.version
                        };
                        let dataArry = [
                            UUID,
                            'user',
                            rootState.user.user_center.uid,
                            resData.content,
                            1,
                            resData.version,
                        ];

                        sqliteDB.insertData("INSERT INTO sensitive_words VALUES(?,?,?,?,?,?)", [dataArry]).then((res) => {
                            commit('SENSITIVE_WORDS_USER', [dataObj]);
                        });
                    }
                })
            }else{
                commit('SENSITIVE_WORDS_USER', res)
            }
        })
    },
    [TYPE.UPDATE_SENSITIVE_WORDS_CONTENT]: ({commit,dispatch,rootState},data) => {
        sqliteDB.executeSql(`UPDATE sensitive_words SET content = '${sqliteDBStrongDecode(data.content, "'")}', is_upload = 0 WHERE category = 'user' AND uid = ${rootState.user.user_center.uid}`).then((res) => {
            commit('UPDATE_SENSITIVE_WORDS_CONTENT',data)
            dispatch('POST_SENSITIVE_WORDS',{
                content: data.content,
                version: data.version
            })
        })
    },
    POST_SENSITIVE_WORDS: ({commit,rootState},postdata) => {
        let time = timestamp()
        axios.post(
            api.sensitiveWordSync + `?token=${rootState.user.user_center.token}&timestamp=${time}`,
            postdata,
            {
                headers: {
                    'x-sign-id': hmac256(rootState.user.user_center.token,api.sensitiveWordSync,time,postdata)
                }
            }
        ).then((response) => {
            let msg = response.data;
            if (msg.status == 200) {
                var resDatas = msg.result;
                if (resDatas.code == 200) {
                    //同步成功更改本地库版本号及同步状态
                    sqliteDB.executeSql(`UPDATE sensitive_words SET version = ${resDatas.version}, is_upload = 1  WHERE category = 'user' AND uid = ${rootState.user.user_center.uid}`).then((res) => {
                        //更改sore状态
                        commit(TYPE.UPDATE_SENSITIVE_WORDS_VERSION, resDatas)
                        commit(TYPE.UPDATE_SENSITIVE_WORDS_ISUPLOAD, resDatas)
                    })
                }else if (resDatas.code == 409) {          //版本冲突，远程有新版本
                    alert('远程有新版本，是否覆盖本地')
                    sqliteDB.executeSql(`UPDATE sensitive_words SET content = '${sqliteDBStrongDecode(resDatas.current_data.content,"'")}', is_upload = 1, version = ${resDatas.current_data.version}  WHERE category = 'user' AND uid = ${rootState.user.user_center.uid}`).then((res) => {
                        console.log('替换成功')
                        commit(TYPE.UPDATE_SENSITIVE_WORDS_VERSION, resDatas.current_data)
                        commit(TYPE.UPDATE_SENSITIVE_WORDS_ISUPLOAD, resDatas.current_data)
                        commit(TYPE.UPDATE_SENSITIVE_WORDS_CONTENT, resDatas.current_data)
                    })
                }
                //修改随笔同步时间模块
                // sqliteDB.executeSql(`UPDATE module_record SET update_time = ${msg.result.update_time} WHERE category = 109`).then((res) => {
                //     commit('UPDATE_TIME', {update_time: msg.result.update_time})
                // })

                console.log('同步成功')
            } else {
                console.log('同步失败')
            }
        })
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}