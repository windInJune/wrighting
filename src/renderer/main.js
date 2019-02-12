import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import './element-variables.scss'
// import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import store from './store'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import SqliteDB from './datastore'
require('../../static/fonts/iconfont.css')
import { remote } from "electron";
const localStore = require('store/dist/store.modern');
const path = require("path")

console.log("current window in main.js");
// console.log(remote.getCurrentWindow().getTitle());

let userData = localStorage.getItem('user');

if((remote.getCurrentWindow().getTitle() === "橙瓜码字编辑器")){   // || (remote.getCurrentWindow().getTitle() === "橙瓜码字" && process.env.NODE_ENV === 'development')
  if(userData && (userData !={})){
    let user = JSON.parse(userData)
    if((user.user.user_center.uid)&&(user.user.user_center.token)) {
      let dbname = localStore.get("use-db");
      if(dbname){
        dbname = path.basename(dbname, ".db");
      }else{
        dbname = user.user.user_center.uid;
      }
      var sqliteDB = new SqliteDB(dbname, function(result){console.log("mainjs database: result: " + result)});
      window.sqliteDB = sqliteDB;
      Vue.prototype.$sqliteDB = sqliteDB
    }
  }
}

// if(userData && (userData !={})){
//   let user = JSON.parse(userData)
//   if((user.user.user_center.uid)&&(user.user.user_center.token)) {
//     var sqliteDB = new SqliteDB(user.user.user_center.uid);
//     window.sqliteDB = sqliteDB;
//     Vue.prototype.$sqliteDB = sqliteDB
//   }
// }

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)
    /* eslint-disable no-new */
// Vue.prototype.$sqliteDB = sqliteDB
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>',
    render: h => h(App)
}).$mount('#app')
