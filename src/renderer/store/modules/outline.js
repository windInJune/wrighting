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


const outlineModule = {
    state: {
      
    },
    getters: {
       
    },
    actions: {
        [storeApi.OUTLINE_TEXT]({commit}, outlineData) {
            
            let parameters = {
                "book_uuid": outlineData.bookId,
                "syllabuses": outlineData.syllabuses
              }
            let time = timestamp()
            axios.post(
                api.OUTLINE_TEXT + `?token=${outlineData.token}&timestamp=${time}`, 
                parameters,
                {
                  headers: {
                    'x-sign-id': hmac256(outlineData.token,api.OUTLINE_TEXT,time,parameters)
                  }
                }
                ).then((res) => {
                  let msg = res.data;
                  if(msg.status === 200){
                    
                  }else{
                  }
                })


        },
        
    },
    mutations: {

        [storeApi.SIGNUP_PHONE_IS_REGIST](state) {
            state.is_registered = true
        },
        
    }
}




export default outlineModule