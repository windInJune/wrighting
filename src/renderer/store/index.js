import Vue from 'vue'
import Vuex from 'vuex'
import modules from './modules'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
export default new Vuex.Store({
    actions:{
      resetAllState({ dispatch, commit }) {
        console.log(`resetAllState      action`)
        for (const currentModule in modules) {
          if (modules[currentModule].state.hasOwnProperty("initialState")) {
            dispatch("resetModuleState", currentModule);
          }
        }
        console.log('user/USER_LOGOUT')
        // 清除上个用户的DB库，跳转页面
        commit('user/USER_LOGOUT')
      },
      resetModuleState: ({ commit }, currentModule) => {
        const initialState = modules[currentModule].state.initialState;
        Object.keys(initialState).forEach(key => {
          console.log(`key: RESET_${currentModule.toUpperCase()}_MODULE`)
          commit(`RESET_${currentModule.toUpperCase()}_MODULE`, {key: key, value: initialState[key]});
        });
      }
    },
    modules,
    plugins: [createPersistedState({
      key: 'user',
      paths: ['user.user_center'],
      // reducer: (data) => {
      //   return {user_center: data.user.user_center}
      // },
      // getItem: (key) => {
      //   console.log(key);
      //   return localStorage.getItem(user)
      // }
    })],
    strict: process.env.NODE_ENV !== 'production'
})