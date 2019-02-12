import axios from 'axios'
import * as api from '../API'
import * as TYPE from '../storeApi'
import { hmac256,timestamp, sqliteDBStrongDecode } from '../../../../static/js/public.js'
import { Message } from 'element-ui'


// var sqliteDB = new SqliteDB();
function initialState() {
  return {
    RANK_LIST: {
        WORD_LIST: {},
        TIME_LIST: {},
        OWN_RANK: {}
    }
  }
}
const state = {
  initialState: initialState(),
  RANK_LIST: {
      WORD_LIST: initialState().RANK_LIST.WORD_LIST,
      TIME_LIST: initialState().RANK_LIST.TIME_LIST,
      OWN_RANK: initialState().RANK_LIST.OWN_RANK
  }
}
const getters = {
    GET_WORD_LIST: (store) => {
        return store.RANK_LIST.WORD_LIST
    },
    GET_TIME_LIST: (store) => {
        return store.RANK_LIST.TIME_LIST
    },
    GET_OWN_RANK: (store) => {
        return store.RANK_LIST.OWN_RANK
    }
}

const mutations = {
   UPDATE_WORD_LIST: (store, data) => {
        state.RANK_LIST.WORD_LIST = data
   },
   UPDATE_TIME_LIST: (store, data) => {
        state.RANK_LIST.TIME_LIST = data
   },
   UPDATE_OWN_RANK: (store, data) => {
        state.RANK_LIST.OWN_RANK = data
   },
   [TYPE.RESET_RANK_MODULE]: (state, data) => {
    state[data.key] = data.value
  }
}

const actions = {
    GET_RANK: ({commit,rootState},data) => {
        let time = timestamp()
        axios.get(
            api.rankList + `?token=${rootState.user.user_center.token}&timestamp=${time}&type=${data.type}&distance=${data.day}`,
            {
                headers:{
                    'x-sign-id':hmac256(rootState.user.user_center.token,api.rankList,time)
                }
            }
        ).then((response) => {
            let msg = response.data;
            if (msg.status == 200) {
                if(data.type == 1){     //字数
                    commit('UPDATE_WORD_LIST',msg.result.ranks)
                    commit('UPDATE_OWN_RANK',{data: msg.result.own_rank,type: 'writing_words',state: 1})
                }else{
                    commit('UPDATE_TIME_LIST',msg.result.ranks)
                    commit('UPDATE_OWN_RANK',{data: msg.result.own_rank,type: 'writing_times',state: 0})
                }
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