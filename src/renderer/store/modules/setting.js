import axios from 'axios'
import * as api from '../API'
import * as TYPE from '../storeApi'
import { hmac256 } from '../../../../static/js/public.js'
import uuid from 'uuid-random'
import localStore from 'store/dist/store.modern'
// var sqliteDB = new SqliteDB();
function initialState() {
  return {
    SETTING: {
        PLUGIN_SETTING: {},
        BASICS_SETTING: {},
        TYPE_SETTING: {indent: true, line: true},
        UPDATE_TIME: 0
    }
  }
}
const state = {
  initialState: initialState(),
  SETTING: {
      PLUGIN_SETTING: initialState().SETTING.PLUGIN_SETTING,
      BASICS_SETTING: initialState().SETTING.BASICS_SETTING,
      TYPE_SETTING: initialState().SETTING.TYPE_SETTING,
      UPDATE_TIME: initialState().SETTING.UPDATE_TIMEs
  }
}
const getters = {
    GET_PLUGIN_SETTING: (store) => {
        return store.SETTING.PLUGIN_SETTING
    },
    GET_TYPE_SETTING: (store) => {
        return store.SETTING.TYPE_SETTING
    }
}

const mutations = {
    PLUGIN_SETTING: (store, data) => {
        store.SETTING.PLUGIN_SETTING = data
        var pluginsArr = ['enable_syllabus','enable_coercion_lock','enable_random_name','enable_notes','enable_random_lock','enable_proofread','ebable_forecast_pay','enable_night_mode','enable_senwords']
        var toggle = false
        for (let i in pluginsArr) {
            if(data[pluginsArr[i]] != 0){
                toggle = true
                break
            }
        }
        toggle ? store.SETTING.PLUGIN_SETTING['display'] = true : store.SETTING.PLUGIN_SETTING['display'] = false
    },
    UPDATE_TIME: (store, data) => {
        store.SETTING.UPDATE_TIME = data.update_time
    },
    UPDATE_PLUGIN_SETTING: (store, data) => {
        for (let key in data) {
            store.SETTING.PLUGIN_SETTING[key] = data[key]
        }

        var pluginsArr = ['enable_syllabus','enable_coercion_lock','enable_random_name','enable_notes','enable_random_lock','enable_proofread','ebable_forecast_pay','enable_night_mode','enable_senwords']
        var toggle = false
        for (let i in pluginsArr) {
            if(data[pluginsArr[i]] != 0){
                toggle = true
                break
            }
        }
        toggle ? store.SETTING.PLUGIN_SETTING['display'] = true : store.SETTING.PLUGIN_SETTING['display'] = false
    },
    UPDATE_NOTE_VERSION: (store, data) => {
        store.SETTING.PLUGIN_SETTING['version'] = data.version
    },
    UPDATE_NOTE_ISUPLOAD: (store, data) => {
        store.SETTING.PLUGIN_SETTING['is_upload'] = 1
    },
    [TYPE.RESET_SETTING_MODULE]: (state, data) => {
      state[data.key] = data.value
    },
    UPDATE_TYPE_SETTING: (store, data) => {
        store.SETTING.TYPE_SETTING.indent = data.indent
        store.SETTING.TYPE_SETTING.line = data.line
    }
}

const actions = {
    PLUGIN_SETTING: ({commit,rootState}, data) => {
        sqliteDB.queryData(`select * from plugins_setting where uid = '${data.uid}'`).then((res) => {
            commit('PLUGIN_SETTING', res[0])
            localStore.set('setting',res[0])
        })
    },
    LOCAL_PLUGIN_SETING:({commit,rootState}, data)=>{
        // var setting = localStore.get('setting')
        commit('UPDATE_PLUGIN_SETTING', data)
    },
    UPDATE_PLUGIN_SETTING: ({commit, dispatch,rootState}, data) => {
        sqliteDB.executeSql(`UPDATE plugins_setting SET 
        enable_syllabus = ${data.enable_syllabus},
        enable_coercion_lock = ${data.enable_coercion_lock},
        enable_random_name = ${data.enable_random_name},
        enable_notes = ${data.enable_notes},
        enable_random_lock = ${data.enable_random_lock},
        enable_proofread = ${data.enable_proofread},
        ebable_forecast_pay = ${data.ebable_forecast_pay},
        enable_night_mode = ${data.enable_night_mode},
        enable_senwords = ${data.enable_senwords},
        is_upload = 0
        WHERE uid = '${rootState.user.user_center.uid}'`)
        .then((res) => {
            commit('UPDATE_PLUGIN_SETTING', data)

            dispatch('POST_PLUGIN_SETTING', {
               time: parseInt(new Date().getTime()/1000),
               data: {
                    plugin_setting:{
                        enable_syllabus: data.enable_syllabus,      //大纲
                        enable_coercion_lock: data.enable_coercion_lock,     //强制锁定
                        enable_random_name: data.enable_random_name,      //随机取名
                        enable_notes: data.enable_notes,        //灵感随笔
                        enable_random_lock: data.enable_random_lock,      //随机锁定
                        enable_proofread: data.enable_proofread,        //校对
                        ebable_forecast_pay: data.ebable_forecast_pay,     //稿费预测
                        enable_night_mode: data.enable_night_mode,       //夜间模式
                        enable_senwords: data.enable_senwords,         //敏感词
                        version: data.version
                    }
               }
            })

        })
    },
    //发送同步操作
    POST_PLUGIN_SETTING: ({commit,rootState},data) => {
        axios({
            url: api.settingSync + `?token=${rootState.user.user_center.token}&timestamp=${data.time}`,
            method: 'post',
            data: data.data,
            headers: {
                'x-sign-id': hmac256(rootState.user.user_center.token, api.settingSync, data.time, data.data)
            }
        }).then((response) => {
            let msg = response.data;
            if (msg.status == 200) {
                var dataResult = msg.result.plugin_setting;
                    if (dataResult.code == 200) {

                        //同步成功更改本地库版本号及同步状态
                        sqliteDB.executeSql(`UPDATE plugins_setting SET 
                        version = ${dataResult.version}, 
                        is_upload = 1
                        WHERE uid = '${rootState.user.user_center.uid}'`)
                        .then((res) => {
                            //更改sore状态
                            commit('UPDATE_NOTE_VERSION', dataResult)
                            commit('UPDATE_NOTE_ISUPLOAD', dataResult)
                        })

                        var setting = localStore.get('setting')
                        setting['version'] = dataResult.version
                        localStore.set('setting',setting)
                        
                    }else if (dataResult.code == 409) {          //版本冲突，远程有新版本
                        alert('远程有新版本，是否覆盖本地')
                        var current_data = dataResult.current_data

                        //同步成功更改本地库版本号及同步状态
                        sqliteDB.executeSql(`UPDATE plugins_setting SET 
                        enable_syllabus = ${current_data.enable_syllabus},
                        enable_coercion_lock = ${current_data.enable_coercion_lock},
                        enable_random_name = ${current_data.enable_random_name},
                        enable_notes = ${current_data.enable_notes},
                        enable_random_lock = ${current_data.enable_random_lock},
                        enable_proofread = ${current_data.enable_proofread},
                        ebable_forecast_pay = ${current_data.ebable_forecast_pay},
                        enable_night_mode = ${current_data.enable_night_mode},
                        enable_senwords = ${current_data.enable_senwords},
                        version = ${current_data.version}, 
                        is_upload = 1
                        WHERE uid = '${rootState.user.user_center.uid}'`)
                        .then((res) => {
                            //更改sore状态
                            commit('UPDATE_NOTE_VERSION', current_data)
                            commit('UPDATE_NOTE_ISUPLOAD', current_data)
                        })
                        var setting = localStore.get('setting')
                        setting['version'] = current_data.version
                        localStore.set('setting',setting)

                    }
                // //修改随笔同步时间模块
                // sqliteDB.executeSql(`UPDATE module_record SET update_time = ${msg.result.update_time} WHERE category = 101`).then((res) => {
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