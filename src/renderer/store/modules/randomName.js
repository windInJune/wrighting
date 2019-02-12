import axios from 'axios'
import * as api from '../API'
import * as TYPE from '../storeApi'
import { hmac256,timestamp, sqliteDBStrongDecode } from '../../../../static/js/public.js'
import uuid from 'uuid-random'
import { Message } from 'element-ui'


// var sqliteDB = new SqliteDB();
function initialState() {
  return {
    RANDOM_NAMES: {
        NAME_LIST: [],
        UPDATE_TIME: 0
    }
  }
}
const state = {
  initialState: initialState(),
  RANDOM_NAMES: {
      NAME_LIST: initialState().RANDOM_NAMES.NAME_LIST,
      UPDATE_TIME: initialState().RANDOM_NAMES.UPDATE_TIME
  }
}
const getters = {
    GET_RANDOM_NAMES: (store) => {
        return store.RANDOM_NAMES
    }
}

const mutations = {
    [TYPE.RANDOM_NAME_LIST]: (store, data) => {
        store.RANDOM_NAMES.NAME_LIST = data;
        //名字列表转数组
        for (let i = 0; i < store.RANDOM_NAMES.NAME_LIST.length; i++) {
            store.RANDOM_NAMES.NAME_LIST[i].content = strFormat(store.RANDOM_NAMES.NAME_LIST[i].content);
        }

        function strFormat(data) {
            if (data && data != '[]') {  //非空判断
                var arr1 = data.replace(/^\[/g, '').replace(/\]$/g, '').split(',')
                console.log('arr1',arr1)
                var arr2 = []
                for (let i = 0; i < arr1.length; i++) {
                    arr2.push(arr1[i].replace(/^\"/g, '').replace(/\"$/g, ''));
                }
                return arr2
            } else {
                return []
            }
        }

    },
    UPDATE_TIME: (store, data) => {
        store.RANDOM_NAMES.UPDATE_TIME = data.update_time
    },
    [TYPE.UPDATE_RANDOM_NAME_CONTENT]: (store, data) => {
        for(let i = 0; i<store.RANDOM_NAMES.NAME_LIST.length;i++){
          if(store.RANDOM_NAMES.NAME_LIST[i]['category_id'] == data.category_id){
            if(data.type == 'add'){
                store.RANDOM_NAMES.NAME_LIST[i].content.push(data.content);
            }else if(data.type == 'delete'){
                store.RANDOM_NAMES.NAME_LIST[i].content.splice(data.index,1);
            }

          }
        }
    },
    [TYPE.UPDATE_RANDOM_NAME_VERSION]: (store, data) => {
        for(let i = 0; i<store.RANDOM_NAMES.NAME_LIST.length;i++){
          if(store.RANDOM_NAMES.NAME_LIST[i]['client_uuid'] == data.random_name_uuid){          //client_uuid需修改
            store.RANDOM_NAMES.NAME_LIST[i].version = data.version;
          }
        }
    },
    [TYPE.UPDATE_RANDOM_NAME_ISUPLOAD]: (store, data) => {
        for(let i = 0; i<store.RANDOM_NAMES.NAME_LIST.length;i++){
          if(store.RANDOM_NAMES.NAME_LIST[i]['category_id'] == data.category_id){
            store.RANDOM_NAMES.NAME_LIST[i].is_upload = 1;
          }
        }
    },
    [TYPE.RESET_RANDOMNAME_MODULE]: (state, data) => {
      state[data.key] = data.value
    }
}

const actions = {
    [TYPE.RANDOM_NAME_LIST]: ({commit}, data) => {
        sqliteDB.queryData(`SELECT * FROM name_content `).then((res) => {
            commit('RANDOM_NAME_LIST', res)
            console.log(res)
        })
    },
    [TYPE.UPDATE_RANDOM_NAME_CONTENT]: ({ commit,dispatch,state}, data) => {
        //获取对应category_id的数组下标
        var categoryIndex;
        for(let i = 0; i<state.RANDOM_NAMES.NAME_LIST.length;i++){
            if(state.RANDOM_NAMES.NAME_LIST[i]['category_id'] == data.category_id){
                categoryIndex = i;
            }
        }
        //分类收藏数量判断是否存储
        if(state.RANDOM_NAMES.NAME_LIST[categoryIndex].content.length >= 1000 && data.type == 'add'){
            Message({
                showClose: true,
                message: '单个分类收藏不能超过1000条！',
            })
            // alert('单个分类收藏不能超过1000条！')
        }else if(data.type == 'add' && state.RANDOM_NAMES.NAME_LIST[categoryIndex].content.indexOf(data.content) > -1){
            Message({
                showClose: true,
                message: '已收藏！',
            })
            // alert('已收藏！')
        }else{
            //先修改state值，后本地存入
            commit(TYPE.UPDATE_RANDOM_NAME_CONTENT, data)

            var nawArry = []
            var names = state.RANDOM_NAMES.NAME_LIST[categoryIndex].content
            for (let j = 0; j < names.length; j++) {
                nawArry.push(`"${names[j]}"`) ;
            }
            var newContent = `[${String(nawArry)}]`
            sqliteDB.executeSql(`UPDATE name_content SET content = '${sqliteDBStrongDecode(newContent, "'")}', is_upload = 0 WHERE category_id = '${data.category_id}'`).then((res) => {
              dispatch('POST_RANDOMNAME', {
                    random_names: [
                        {
                            random_name_uuid: data.random_name_uuid,
                            category_id: Number(data.category_id),
                            content: newContent,
                            version: data.version,
                            token: data.token
                        }
                    ]
                })

            })

        }
        
    },
    GET_CLOUD_NAMES: ({commit,dispatch},data) => {
        let time = timestamp()
        axios.get(
            api.randomNameList + `?token=${data.token}&timestamp=${time}`,
            {
                params: {
                    update_time: 0
                }
            },
            {
                headers:{
                    'x-sign-id':hmac256(data.token,api.randomNameList,time)
                }
            }
        ).then((response) => {
            let msg = response.data;
            if (msg.status == 200) {
                var resDatas = msg.result.random_names;
                for (let i = 0; i < resDatas.length; i++) {
                    sqliteDB.executeSql(`UPDATE name_content SET client_uuid = '${resDatas[i].random_name_uuid}', content = '${sqliteDBStrongDecode(resDatas[i].content, "'")}', is_upload = 1, version = ${resDatas[i].version}  WHERE category_id = '${resDatas[i].category_id}'`).then((res) => {
                        console.log('替换成功')
                    })
                }
               
            }
        })
    },

    //发送同步操作
    POST_RANDOMNAME: ({commit},postdata) => {
        let time = timestamp()
        axios.post(
            api.randomNameSync + `?token=${postdata.random_names[0].token}&timestamp=${time}`,
            postdata,
            {
                headers:{
                    'x-sign-id': hmac256(postdata.random_names[0].token,api.randomNameSync,time,postdata)
                }
            }
        ).then((response) => {
            let msg = response.data;
            if (msg.status == 200) {
                var resDatas = msg.result.datas;
                for (let i = 0; i < resDatas.length; i++) {
                    if (resDatas[i].code == 200) {
                        //同步成功更改本地库版本号及同步状态
                        sqliteDB.executeSql(`UPDATE name_content SET version = ${resDatas[i].version}, is_upload = 1  WHERE client_uuid = '${resDatas[i].random_name_uuid}'`).then((res) => {
                            //更改sore状态
                            commit(TYPE.UPDATE_RANDOM_NAME_VERSION, resDatas[i])
                            commit(TYPE.UPDATE_RANDOM_NAME_ISUPLOAD, resDatas[i])
                        })
                    }else if (resDatas[i].code == 409) {          //版本冲突，远程有新版本
                        alert('远程有新版本，是否覆盖本地')
                        sqliteDB.executeSql(`UPDATE name_content SET content = '${sqliteDBStrongDecode(resDatas[i].current_data.content)}', is_upload = 1, version = ${resDatas[i].current_data.version}  WHERE client_uuid = '${resDatas[i].random_name_uuid}'`).then((res) => {
                            console.log('替换成功')
                            commit(TYPE.UPDATE_RANDOM_NAME_VERSION, resDatas[i].current_data)
                            commit(TYPE.UPDATE_RANDOM_NAME_ISUPLOAD, resDatas[i].current_data)
                            commit(TYPE.UPDATE_RANDOM_NAME_CONTENT, {content:resDatas[i].current_data.content,client_uuid:resDatas[i].random_name_uuid})
                        })
                    }
                }
                //修改随笔同步时间模块
                sqliteDB.executeSql(`UPDATE module_record SET update_time = ${msg.result.update_time} WHERE category = 106`).then((res) => {
                    commit('UPDATE_TIME', {update_time: msg.result.update_time})
                })

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