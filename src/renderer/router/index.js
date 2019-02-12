import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/pages/LandingPage'
import bookNew from '@/components/pages/bookNew/bookNew'
import bookOpen from '@/components/pages/bookOpen/bookOpen'
import editor from '@/components/pages/editor/editor'
import update from '@/components/pages/update/update'
import music from '@/components/pages/music/music'
import bename from '@/components/plugins/randomName/randomName'
import passwordLogin from '@/components/pages/login/passwordLogin'
import codeLogin from '@/components/pages/login/codeLogin'
import setNickname from '@/components/pages/login/setNickname'
import user from '@/components/pages/user/index'
import workbench from '@/components/pages/user/workbench'
import inviting  from '@/components/pages/user/inviting'
import userCenterIndex  from '@/components/pages/user/userCenterIndex'
import personalInformation  from '@/components/pages/user/personalInformation'
import accountSecurity  from '@/components/pages/user/accountSecurity'
import plugin  from '@/components/pages/user/plugin'
import activity  from '@/components/pages/user/activity'
import statistics  from '@/components/pages/user/statistics'
import updatePhone  from '@/components/pages/security/updatePhone'
import bindPhone  from '@/components/pages/security/bindPhone'
import updatePassword  from '@/components/pages/security/updatePassword'
import threeBindPhone  from '@/components/pages/threeLogin/threeBindPhone'
import threeSetName  from '@/components/pages/threeLogin/threeSetName'
import settingsIndex  from '@/components/pages/settings/settingsIndex'
import dialog  from '@/components/pages/dialog/dialog'
import menuBar  from '@/components/pages/menuBar/menuBar'
import outlineIndex from '@/components/pages/outline/outlineIndex'

Vue.use(Router)


export default new Router({
  // mode: 'history',
    routes: [
    //   {
    //  path: '/',
    //  name: 'index',
    //  component: index
    //  },
     {
      path: '/',
      redirect:'passwordLogin'
      },
        {
            path: '/menuBar',
            name: 'menuBar',
            component: menuBar
        },
        {
            path: '/dialog',
            name: 'dialog',
            component: dialog
        },
        {
            path: '/editor',
            name: 'editor',
            component: editor
        },
        {
            path: '/update',
            name: 'update',
            component: update
        },
        {
            path: '/music',
            name: 'music',
            component: music
        },
        {
            path: '/bename',
            name: 'bename',
            component: bename
        },
        {
            path: '/newBook',
            name: 'newBook',
            component: bookNew
        },
        {
            path: '/bookOpen',
            name: 'bookOpen',
            component: bookOpen
        },
        {
            path: '/passwordLogin',
            name: 'passwordLogin',
            component: passwordLogin
        },
        {
            path: '/codeLogin',
            name: 'codeLogin',
            component: codeLogin
        },
        {
            path: '/setNickname',
            name: 'setNickname',
            component: setNickname
        },
        {
            path: '/user',
            name: 'user',
            component: user,

        },
        {
            path: '/userCenterIndex',
            name: 'userCenterIndex',
            component: userCenterIndex
        },
        {
            path: '/personalInformation',
            name: 'personalInformation',
            component: personalInformation
        },
        {
            path: '/accountSecurity',
            name: 'accountSecurity',
            component: accountSecurity
        },
        {
            path: '/plugin',
            name: 'plugin',
            component: plugin
        },
        {
            path: '/activity',
            name: 'activity',
            component: activity
        },
        {
            path: '/statistics',
            name: 'statistics',
            component: statistics
        },
        {
            path: '/settingsIndex',
            name: 'settingsIndex',
            component: settingsIndex,

        },
        {
            path: '/inviting',
            name: 'inviting',
            component: inviting
        },
        {
            path: '/updatePhone',
            name: 'updatePhone',
            component: updatePhone
        },
        {
            path: '/bindPhone',
            name: 'bindPhone',
            component: bindPhone
        },
        {
            path: '/updatePassword',
            name: 'updatePassword',
            component: updatePassword
        },
        {
            path: '/threeBindPhone',
            name: 'threeBindPhone',
            component: threeBindPhone
        },
        {
            path: '/threeSetName',
            name: 'threeSetName',
            component: threeSetName
        },
        {
            path: '/outlineIndex',
            name: 'outlineIndex',
            component: outlineIndex
        }
    ]
})



