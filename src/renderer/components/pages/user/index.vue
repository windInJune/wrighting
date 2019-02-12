<template>
    <el-container style="padding-top: 32px; height:100%">
        <!--邀请码弹窗-->
        <Inviting :codeFlag="codeFlag" v-on:closeDialog="hiddenDialog" v-if="codeFlag"></Inviting>
        <!--菜单栏-->
        <menuBar :shouldShow="showUser" :showPluginBox="showPluginBox" @hidePluginBox="hidePluginBox"></menuBar>
        <!-- 新建书本弹出层 -->
        <!-- <el-dialog class="book-open-cla"  :visible.sync="bookNewVisible" width="540px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false"> -->
          <!-- <book-new @closeOpenBookNew="toggleBookNew" :userCenterFlag="bookNewVisible" :book_uuid="changeBook" :openDialogPurpose="openDialogPurpose" v-if="bookNewVisible" ref="myBookNew"></book-new>         -->
          <book-new @closeOpenBookNew="toggleBookNew" :userCenterFlag="bookNewVisible" :book_uuid="changeBook" :openDialogPurpose="openDialogPurpose" :triggerWindow="currentWindowName" v-if="bookNewVisible" ref="myBookNew"></book-new>                  
          <book-img :borderadius="false" @closeOpenBookNew="closeOpenBookImg" :userCenterFlag="bookImgVisible" :book_uuid="changeBook" v-if="bookImgVisible"></book-img>        
        <!-- </el-dialog> -->
        <el-aside width="200px">
          <div class="aside-center boxSize">
            <div class="aside-center-author">
              <div class="avatar">
                <img :src="GET_USET_DATA.avatar||defaultBigAvatar" :onerror="errorBigImg" alt="">
                <!-- <div class="vip-box"><img src="../../../assets/img/vip.png"  alt=""></div> -->
              </div>
              <span class="nickname-ind">{{GET_USET_DATA.nickname}}</span>
              <div class="invitation-btn" v-if="testShow"><button @click="codeFlag = true">邀请好友</button></div>
            </div>
            
            <div class="aside-center-product boxSize">
              <p :class="activedTab=='booklist' ? 'tabactived row':'row'" @click="showCont='booklist', activedTab='booklist' ">书籍列表</p>
              <!-- <p class="row" @click="showPluginBox = true">插件箱</p> -->
              <p :class="activedTab=='codestatistics' ? 'tabactived row':'row'" @click="showCont='codestatistics', activedTab='codestatistics'">码字统计</p>
              <p :class="activedTab=='pluginbox' ? 'tabactived row':'row'" @click="showCont='pluginbox', activedTab='pluginbox'">插件箱</p>
              <p :class="activedTab=='ranklist' ? 'tabactived row':'row'" @click="showCont='ranklist', activedTab='ranklist' ">排行榜</p>
              <!-- <p class="row" @click="goTaoshu">橙瓜淘书</p>
              <p class="row" @mouseenter="enter()" @mouseleave="leave()">橙瓜APP</p>
              <p class="row" @click="goShuju">橙瓜数据</p> -->
              <div class="code-box" v-show="showCode">
                  <img :src="appLink"  alt="" style="margin-top: 5px">
              </div>
            </div>
            <div class="line"></div>
            
            <div class="aside-center-action boxSize">
              <p class="row" @click="goTaoshu">橙瓜淘书</p>
              <p class="row" @mouseenter="enter()" @mouseleave="leave()">橙瓜APP</p>
              <p class="row" @click="goShuju">橙瓜数据</p>

              <!-- <p class="row" >码字统计</p>
              <p class="row" >插件箱</p>
              <p class="row" >投稿网站信息</p>
              <p class="row" >橙瓜活动</p> -->
            </div>
            <div class="aside-center-message boxSize">
                <div class="doubt-box" v-on:mouseenter="show=!show" v-on:mouseleave="show=!show">
                <div class="doubt" >
                    <img src="../../../assets/img/group.png"  alt="" >
                    <ul v-if="show" >
                        <li @click="goTucao">我要吐槽</li>
                        <li v-on:mouseenter="copyShow=!copyShow" v-on:mouseleave="copyShow=!copyShow">QQ群:878323893 <span @click="copyQQ('878323893')" v-if="copyShow">复制</span></li>
                    </ul>
                </div>
            </div>
            <div class="version">版本号：ver{{version}}</div>
            </div>
          </div>
        </el-aside>
        <!-- 书本列表 -->
        <el-main class="user-book-main" v-if="showCont=='booklist'">
          <div  class="main-center">
            <div class="btn-box">
                <button v-show="false">同步书籍</button>
                <button @click="toggleBookNew('new')">新建书籍</button>
                <!-- <button @click="getLocalAndOnlineBooks">测试本地接口按钮</button> -->
                <!-- <button @click="onlineTest">测试线上接口按钮</button> -->
            </div>
            <div style="flex: 1;overflow-y: scroll;">
              <ul class="finished-ul">
                  <li v-for="(item) in GET_NOT_OVER_BOOK_L1" :key="item.client_uuid" @contextmenu.capture.stop="contextMenu($event, item.client_uuid)">
                      <div @click="openBook(item)" v-if="item.avatar && item.avatar !='' && item.avatar !='null'">
                        <img :src="item.avatar" alt="">
                      </div>
                      <div @click="openBook(item)" v-else>
                        <img src="../../../assets/img/book_bg.png" alt="">
                        <span>{{item.title.slice(0,1)}}</span>
                      </div>
                      <h3 class="book-title ellipsis" :title="item.title">{{item.title}}</h3>
                      <div>目前字数{{item.word_count}}</div>
                      <div v-if="testShow">最后保存时间</div>
                      <div v-if="testShow">2018-08-14  10:30</div>
                  </li>
                  <li class="speedAddBook" @click="addBookShow = true">
                      <div>
                        <img src="../../../assets/img/xinjian.png" alt="">
                        <span></span>
                      </div>
                      <div class="speedAddBook-title">
                        <input type="text" v-model.trim="formLabelAlign.title" v-focus  @keyup.enter="speedAddBook" @blur="addBookShow=false" v-if="addBookShow" placeholder="请输入书名" maxlength="50">
                      </div>
                  </li>
              </ul>
              <!-- <div class="not-book-list" v-show="!GET_NOT_OVER_BOOK.length">
                <img :src="imgWu">
              </div> -->
            </div>
            <!-- <el-tabs class="login-el-tabs" v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="书籍列表" name="finished">
                    <ul class="finished-ul" v-show="GET_NOT_OVER_BOOK.length">
                        <li v-for="(item) in GET_NOT_OVER_BOOK" :key="item.client_uuid" >
                            
                            <div @click="openBook(item.client_uuid)">
                              <img src="../../../assets/img/book_bg.png" alt="">
                              <span>{{item.title.slice(0,1)}}</span>
                            </div>
                            <h3 class="book-title ellipsis" :title="item.title">{{item.title}}</h3>
                            <div>目前字数{{item.word_count}}</div>
                            <div v-if="testShow">最后保存时间</div>
                            <div v-if="testShow">2018-08-14  10:30</div>
                        </li>
                    </ul>
                    <div class="not-book-list" v-show="!GET_NOT_OVER_BOOK.length">
                      <img :src="imgWu">
                    </div>
                </el-tab-pane>
                <el-tab-pane label="已完结" name="unfinished" v-if="testShow">
                    <ul class="finished-ul" v-show="GET_OVER_BOOK.length">
                        <li v-for="(item) in GET_OVER_BOOK" :key="item" @click="openBook(item.client_uuid)">
                            <div class="book-title ellipsis" :title="item.title">{{item.title}}</div>
                            <div>目前字数{{item.word_count}}</div>
                            <div style="margin-top:18px;"><img src="../../../assets/img/finished.png" alt=""></div>
                            <div style="margin-top:5px;">最后保存时间</div>
                            <div>2018-08-14  10:30</div>
                        </li>
                    </ul>
                    <div class="not-book-list" v-show="!GET_OVER_BOOK.length">
                      <img :src="imgWu">
                    </div>
                </el-tab-pane>
            </el-tabs> -->
          </div>
        </el-main>
        <!-- 插件箱 -->
        <el-main v-if="showCont == 'pluginbox'">
          <plugin></plugin>
        </el-main>
        <!-- 排行榜 -->
        <el-container v-if="showCont=='ranklist'" class="rank-cont">
          <el-main class="user-book-main" >
            <div  class="main-center">
                <div class="day-switch">
                    <el-button-group>
                      <el-button @click="rankToday" :class="{'actived': rankDay}" size="mini">今日</el-button>
                      <el-button @click="rankYesterday" :class="{'actived': !rankDay}" size="mini">昨日</el-button>
                    </el-button-group>
                    <p v-if="rankDay" style="color:#999999;font-size:12px;padding-top: 4px;">* 每10分钟更新一次榜单</p>
                </div>	
                
                <el-tabs class="login-el-tabs ranks-el-tabs" v-model="activeRank" @tab-click="handleClick">
                  <el-tab-pane label="时长排行榜" name="time">
                    <div class="rank-title">
                      <span class="flex-one">排名</span>
                      <span class="flex-two">昵称</span>
                      <span class="flex-three">当前码字时长</span>
                    </div>
                    <ul class="rank-list">
                      <li v-for="(item) in GET_TIME_LIST" :key="item.id" :class="{ hightfont: item.uid == GET_USET_DATA.uid }">
                        <span class="flex-one">{{item.order}}</span>
                        <div class="user-nickname flex-two">
                          <div class="user-avatar">
                            <span v-if="item.uid == GET_USET_DATA.uid">我</span>
                            <img v-else :src="item.avatar || defaultSmallAvatar" :onerror="errorSmallImg" alt="">
                          </div>
                          <span>{{item.nickname}}</span>
                        </div>
                        <span class="flex-three">{{formatTime(item.writing_times)}}</span>
                      </li>

                      <!-- <li v-for="n in 50" :key="n.id">
                        <span class="flex-one">{{n}}</span>
                        <div class="user-nickname flex-two">
                          <div class="user-avatar"><img :src="GET_USET_DATA.avatar||'http://img.chenggua.com/1494812392000311.png'" alt=""></div>
                          <span>月月鸟</span>
                        </div>
                        <span class="flex-three">20小时15分钟</span>
                      </li> -->
                      

                    </ul>
                  </el-tab-pane>

                  <el-tab-pane label="字数排行榜" name="word">
                    <div class="rank-title">
                      <span class="flex-one">排名</span>
                      <span class="flex-two">昵称</span>
                      <span class="flex-three">当前码字字数（字）</span>
                    </div>
                    <ul class="rank-list">
                       <li v-for="(item) in GET_WORD_LIST" :key="item.index" :class="{ hightfont: item.uid == GET_USET_DATA.uid }">
                          <span class="flex-one">{{item.order}}</span>
                          <div class="user-nickname flex-two">
                            <div class="user-avatar">
                              <span v-if="item.uid == GET_USET_DATA.uid">我</span>
                              <img v-else :src="item.avatar || defaultSmallAvatar" :onerror="errorSmallImg" alt="">
                            </div>
                            <span>{{item.nickname}}</span>
                          </div>
                          <span class="flex-three">{{item.writing_words}}</span>
                        </li>
                    </ul>  
                  </el-tab-pane>
              </el-tabs>
            </div> 
  
          </el-main>
          <el-footer>
            <span class="flex-one">{{GET_OWN_RANK.data.order?GET_OWN_RANK.data.order:'未上榜'}}</span>
            <div class="user-nickname flex-two">
              <div class="user-avatar">我</div>
              <span>{{GET_USET_DATA.nickname}}</span>
            </div>
            <span class="flex-three">{{  GET_OWN_RANK.state ? GET_OWN_RANK.data[GET_OWN_RANK.type] : (GET_OWN_RANK.data[GET_OWN_RANK.type]? formatTime(GET_OWN_RANK.data[GET_OWN_RANK.type]):'0')}}</span>
          </el-footer>
        </el-container>
        <codestatistics  v-if="showCont=='codestatistics'"></codestatistics>
        <water-mark v-if="waterMarkVisible"></water-mark>
    </el-container>

</template>
<script type="text/ecmascript-6">
    import Inviting from '@/components/pages/user/Inviting.vue'
    import menuBar from '@/components/pages/menuBar/menuBar.vue'
    import bookNew from '@/components/pages/bookNew/bookNew';
    import bookImg from '@/components/pages/bookNew/bookImg';
    import codestatistics from '@/components/pages/codestatistics/codestatistics';
    import plugin  from '@/components/pages/user/plugin';
    import waterMark from '@/components/plugins/waterMark/waterMark';
    import getMsg from 'static/js/msgApi.js'
    import {category, appVersion} from './../../../store/API.js'
    import { mapActions, mapGetters, mapMutations } from 'vuex'
    // import { setTimeout } from 'timers';
    import { ipcRenderer, shell, clipboard } from "electron";
    import localQuery from '@/helper/query.js';
    import compare from '@/helper/compare.js';
// import { setInterval } from 'timers';
    // import { setTimeout } from 'timers';
    const store = require('store/dist/store.modern');
    export default {
        name: 'Login',
        data () {
            return {
                show:false,
                copyShow: false,
                codeFlag:false,
                activeName:'finished',
                activeRank:'time',
                toggleRank: 'time',
                rankDay: true,
                bookNewVisible: false,
                bookImgVisible: false,
                imgWu: "static/imgs/user/wu.png",
                appLink: "static/imgs/user/PhoneCode.png",
                defaultBigAvatar: "static/imgs/user/touxiang_big.png",
                defaultSmallAvatar: "static/imgs/user/touxiang_small.png",
                errorBigImg: 'this.src="' + require('../../../../../static/imgs/user/touxiang_big.png') + '"',
                errorSmallImg: 'this.src="' + require('../../../../../static/imgs/user/touxiang_small.png') + '"',
                testShow: false,
                read_links:{
                  tucao:'https://support.qq.com/products/41004',
                  shuju:'http://www.chenggua.com/shuju/index.html',
                  taoshu:'http://www.chenggua.com/book-shop/index/index.html'
                },
                bookKeys:{
                  time: 500,
                  type: true
                },
                showCode:false,
                subscribe: '',
                showUser: true,
                showPluginBox: false,
                version: appVersion,
                showCont: 'booklist',
                activedTab: 'booklist',
                formLabelAlign: {
                  title: "",
                  goal_word_count: "",
                  book_type: "",
                  summary: "",
                  version: 0,
                  is_deleted: 0,
                  creation_status: 0
                },
                addBookShow: false,
                changeBook: '',
                waterMarkVisible: true,
                myBooks: [],
                openDialogPurpose: '',
                currentWindowName: 'mainWindow'
            }
        },
        computed:{
          ...mapGetters({
              GET_INFO_BOOK: 'GET_INFO_BOOK',
              GET_OVER_BOOK: 'GET_OVER_BOOK',
              GET_NOT_OVER_BOOK_L1: 'GET_NOT_OVER_BOOK_L1',
              GET_USET_DATA: 'user/GET_USET_DATA',
              GET_WORD_LIST: 'GET_WORD_LIST',
              GET_TIME_LIST: 'GET_TIME_LIST',
              GET_OWN_RANK: 'GET_OWN_RANK'
          })
        },
        methods: {
          ...mapActions({
            LIST_BOOK: 'LIST_BOOK',
            LIST_BOOK_L1: 'LIST_BOOK_L1',
            LIST_BOOKS_O_L: 'LIST_LOCAL_AND_ONLINE_BOOKS',
            CLIENT_LIST_BOOK: 'CLIENT_LIST_BOOK_L1',
            TESTER_RACE: 'TESTER_RACE',
            OPEN_BOOK: 'OPEN_BOOK',
            PLUGIN_SETTING: 'PLUGIN_SETTING',
            resetAllState: 'resetAllState',
            GET_RANK: 'GET_RANK',
            ADD_BOOK: 'ADD_BOOK',
            DELETE_BOOK: 'DELETE_BOOK',
            CREATE_NEW_BOOK_L1: 'CREATE_NEW_BOOK_L1'
          }),
          ...mapMutations({
            ADD_BOOK_L1: 'ADD_BOOK_L1',
            USER_LOGOUT: 'user/USER_LOGOUT'
          }),
          goTucao(){
             shell.openExternal(this.read_links.tucao)
          },
          goTaoshu(){
             shell.openExternal(this.read_links.taoshu)
          },
          goShuju(){
             shell.openExternal(this.read_links.shuju)
          },
          handleClick(tab, event) {
            if(this.toggleRank != tab.name){
              if(tab.name == 'word'){
                this.GET_RANK({type: 1,day: this.rankDay? 0:1})
              }else if(tab.name=='time'){
                this.GET_RANK({type: 2,day: this.rankDay? 0:1})
              }
              this.toggleRank = tab.name
            }
            
            // console.log(tab, event);
          },
          hiddenDialog (data){
            this.codeFlag = false;
          },
          openBook (data) {
            console.log("open book: ");
            console.log(data);
            if(!this.bookKeys.type)return false;
            this.changeBookType()
            let slef = this;
            console.log("category:!!!!!");
            console.log(category);
            console.log(category[0]);
            
            if(!data.hasOwnProperty('update_time')){
              data.update_time = 0
            }
            this.OPEN_BOOK({update_time: data.update_time, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, book: data})
            // this.OPEN_BOOK({update_time: res[0].update_time, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, book: data})
            // this.$sqliteDB.queryData(`select * from module_record where client_uuid = '${data.client_uuid}' and category = ${category[0]}`).then((res) => {
            //   console.log("open book query: ");
            //   console.log(res);
            //   if(res.length){
            //     this.OPEN_BOOK({update_time: res[0].update_time, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, book: data})
            //   }else{
            //     console.log('数据库内没有该书！')
            //   }
            // })
          },
          changeBookType(){
            let _this = this;
            _this.bookKeys.type = false
            setTimeout(function(){
              _this.bookKeys.type = true
            }, _this.bookKeys.time)
          },
          toggleBookNew(type){
            if(type){
              this.bookNewVisible = true
              // this.changeBook = ''
              this.openDialogPurpose = type
            }else{
              this.bookNewVisible = false
              this.changeBook = ''
              this.openDialogPurpose = ''
            }

          },
          getLocalAndOnlineBooks(){
            console.log("interesting?")
            let localBooks = [];
            let onlineBooks = [];
            // console.log(localQuery.listLocalBooks({uid: this.GET_USET_DATA.uid}))
            localQuery.listLocalBooks({uid: this.GET_USET_DATA.uid}).then((res)=>{
              console.log("res is: ");
              console.log(res);
              localBooks = res;
              localBooks.forEach((aLocalBook) => {
                aLocalBook.book_uuid = aLocalBook.client_uuid;
              })
            }, (err)=>{
              console.log("err is: ");
              console.log(err);
            }).finally(() => {
              console.log("pull online data")
              this.LIST_BOOK_L1({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token}).then((onlineRes) => {
                console.log("online res: ");
                console.log(onlineRes);
                if(onlineRes.data.status === 200){
                  onlineBooks = onlineRes.data.result.books
                  onlineBooks.forEach((anOnlineBook) => {
                    anOnlineBook.client_uuid = anOnlineBook.book_uuid;
                  })
                }
              }, (onlineErr) => {
                console.log("online error: ");
                console.log(onlineErr);
              }).finally(() => {
                this.myBooks = compare(localBooks, onlineBooks);
                console.log("lets compare!!!!!!!!")
              })
            });
            // this.TESTER_RACE({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
            // this.CLIENT_LIST_BOOK({uid: this.GET_USET_DATA.uid});
            // this.LIST_BOOK_L1({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
          },
          onlineTest(){
            // console.log("online test ZZZZZZZZZZZZZZZZZZZ")
            this.LIST_BOOK_L1({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
          },
          closeOpenBookImg(type){
            this.bookImgVisible = type
            this.changeBook = ''
          },
          sendBookList(){
            // console.log("send book list ZZZZZZZZZZZZZZZZZZZZZ")
            console.log(JSON.stringify(this.GET_USET_DATA));
            this.LIST_BOOK({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
          },
          enter(){
            this.showCode = true;
          },
          leave(){
            this.showCode = false;
          },
          updateOnlineStatus () {
            // console.log("navigator status changed: ");
            // console.log(window.navigator.onLine)
            ipcRenderer.send('online-status-changed', navigator.onLine)
          },
          hidePluginBox(res){
            this.showPluginBox = res;
          },
          copyQQ(data){
            clipboard.writeText(data)
          },
          rankToday(){
            if(!this.rankDay){    //保证当前选中时只执行一次
              this.rankDay = true
              if(this.activeRank=='word'){
                this.GET_RANK({type: 1,day: 0})
              }else if(this.activeRank=='time'){
                this.GET_RANK({type: 2,day: 0})
              }

            }
          },
          rankYesterday(){
            if(this.rankDay){
              this.rankDay = false
              if(this.activeRank=='word'){
                this.GET_RANK({type: 1,day: 1})
              }else if(this.activeRank=='time'){
                this.GET_RANK({type: 2,day: 1})
              }
            }
          },
          addZero(anInt){
            if(anInt < 10){
              return '0' + anInt;
            }else{
              return '' + anInt;
            }
          },
          formatTime(time){
            var hr = parseInt(time/3600);
            var min = Math.ceil((time%3600)/60);
            return hr ? `${this.addZero(hr)}小时${this.addZero(min)}分钟` : `${this.addZero(min)}分钟` 
          },
          speedAddBook(){
            const reg = new RegExp(
              "[\-a-zA-Z0-9\d .·()（）“”,，？：!！\u4e00-\u9fa5]*"
            );
            let formLabelAlign = this.formLabelAlign
            let execObj = reg.exec(formLabelAlign.title)
            if (formLabelAlign.title == "") {
              // callback(new Error("请输入书本名称！"));
            } else if ((execObj === null)||( execObj[0]!== execObj.input)) {
              // callback(new Error("请不要输入特殊字符"));
              this.$message({showClose: true, message: '请不要输入特殊字符', type: 'warning', customClass: 'bookWarning'})
            }else if (formLabelAlign.title.length>50) {
              // callback(new Error("请不要输入特殊字符"));
              this.$message({showClose: true, message: '书名称不能超过50字', type: 'warning', customClass: 'bookWarning'})
            } else{
              this.CREATE_NEW_BOOK_L1({formLabelAlign: formLabelAlign, view: 'mainWindow', user: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
              // this.ADD_BOOK({ book: formLabelAlign, uid: this.GET_USET_DATA.uid,token: this.GET_USET_DATA.token  })
              // this.$refs.myBookNew.onSubmit(formLabelAlign, true);
            }
          },

          alignBook(){
            // console.log("align ZZZZZZZZZZZZZZZZ")
            let localBooks = this.CLIENT_LIST_BOOK({uid: this.GET_USET_DATA.uid});
            console.log("local: ");
            console.log(localBooks);
            let onlineBooks = this.LIST_BOOK_L1({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
            console.log("online: ");
            console.log(onlineBooks);
          },


          /***
           * 清除所有ipcRenderer监听的listener，防止路由跳转(切换用户)导致多次触发event
           *  */  
          removeAllListeners(){
            ipcRenderer.removeAllListeners('action-updateBook')
            ipcRenderer.removeAllListeners('userLogout')
            ipcRenderer.removeAllListeners('book-delete')
            ipcRenderer.removeAllListeners('book-state-list')
            ipcRenderer.removeAllListeners('book-editor-change')
            ipcRenderer.removeAllListeners('book-menu-open')
            ipcRenderer.removeAllListeners('add-book')
          },

          clearStorage(){
            store.remove('use-db')
          },

          contextMenu(e, uuid){
            console.log(uuid)
            if(uuid){
              ipcRenderer.send('ipc-bookMenu', {uuid})
            }
          }
        },
        directives: {
          focus: {
            // 指令的定义
            inserted: function (el,binding,vnode,oldVnode) {
              // console.log(vnode)
              // if(el.style.display === 'none'){
              el.focus()
                  // console.log(el.focus)
              // }
            }
          }
        },
        created(){
          let _this = this;
          // this.sendBookList()
           _this.subscribe = _this.$store.subscribe((mutation, state) => {
              if(mutation.type == 'OPEN_BOOK'){
                console.log("mutation payload is: ");
                console.log(mutation.payload);
                ipcRenderer.send('ipc-openBook', {path: '#/editor', book: mutation.payload.data.book})
              }else if((mutation.type == 'GET_BOOK_MESSAGE')){
                if((mutation.payload.status == 200)){
                    _this.formLabelAlign.title = '';
                    _this.addBookShow = false;
                    // ipcRenderer.send('ipc-updateBook', {pathName: this.$route.name});
                    _this.$message({showClose: true, message: '书本创建成功!', type: 'success', customClass: 'bookWarning'})
                  }else if((mutation.payload.status != 200)){
                    _this.$message({showClose: true, message: mutation.payload.message, type: 'warning', customClass: 'bookWarning'})
                  }
              }else if(mutation.type == 'DELETE_BOOK'){
                 if((mutation.payload.status == 200)){
                  //  通讯更新编辑窗口数据
                    console.log({book_uuid: mutation.payload.book_uuid, uid: _this.GET_USET_DATA.uid})
                    ipcRenderer.send('ipc-userChangeBook', {book_uuid: mutation.payload.book_uuid, uid: _this.GET_USET_DATA.uid})
                    _this.$message({showClose: true, message: `书籍删除成功！`, type: 'success', customClass: 'bookWarning'})                   
                 }else{
                    _this.$message({showClose: true, message: `${mutation.payload.status}: ${mutation.payload.message}`, type: 'warning', customClass: 'bookWarning'})                   
                 }
              }
            })
          ipcRenderer.on('userLogout', () => {
            console.log('man window to user long')
            // console.log(this.resetAllState)
            // let obj = {"token":"","uid":"","phone":"","avatar":"","long_header":"","signature":"","nickname":"","gender":0,"guest_name":"","guest_avatar":"http://img.chenggua.com/guest_images/591.jpg","guest_color":"","is_new":0, "status": 200};
            setTimeout(function(){
              // console.log('loh')
              _this.resetAllState()
              // _this.USER_LOGOUT()
            },1000)

            // this.$router.push({name: 'passwordLogin'})
          });
          ipcRenderer.on('TRY_SPAWN_WARN', (event, data) => {
            this.$alert(getMsg(data.type), '', {
              confirmButtonText: '好的',
              callback: action => {
                // this.$message({
                //   type: 'info',
                //   message: `action: ${ action }`
                // });
              }
            });
          })
          // ipcRenderer.on('action-updateBook', (event) => {
          //   console.log('感知书籍列表更新，~~~~~~~~~~')
          //   //TODO: 小洲，更换获取书籍的方式
          //   this.sendBookList()
          // })

          //编辑窗口新建书籍后，通知主窗口更新书籍列表, 书籍列表的更新都
          //通过主窗口更新。所以这里需要把view转为mainWindow
          ipcRenderer.on('add-book', (event, data) => {
            this.ADD_BOOK_L1({book: data, view: 'mainWindow'});
          });


          ipcRenderer.on('book-delete', (event, data) => {
            console.log(data)
            _this.$confirm('你确定要删除此书籍!', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              ipcRenderer.send('book-state-list', data)
              // data.uid = _this.GET_USET_DATA.uid
              // slef.VOLUME_DEL_BOOK(arg).then((res) => {
                // _this.$message({
                //   type: 'success',
                //   message: '删除成功!'
                // });
              // },(err) => {
              //   console.log(err)
              // })
              // if(arg.volume_uuid === this.chapter.volume_uuid){
              //   this.clearChapterDisplay();
              // }

            }).catch((e) => {
              console.log('取消删除')
              console.log(e)
              _this.$message({
                type: 'info',
                message: '已取消删除'
              });          
            });
          })
          ipcRenderer.on('book-state-list', (event, data) => {
            console.log(data)
            if(data.bookType){
               _this.$message({showClose: true, message: '该书本处于打开状态，请先关闭该书！', type: 'warning', customClass: 'bookWarning'})
            }else{
              let sendData = {
                token: _this.GET_USET_DATA.token,
                book_uuid: data.book_uuid
              }
              console.log(sendData)
              _this.DELETE_BOOK(sendData)
            }
          })
          ipcRenderer.on('book-editor-change', (event, data) => {
            // _this.$route.
            if(data.uuid){
              this.changeBook = data.uuid
              this.toggleBookNew('change');
              // this.openDialogPurpose = "change"
              // this.bookNewVisible = true
            }
          })
           ipcRenderer.on('book-img-change', (event, data) => {
            // _this.$route.
            if(data.uuid){
              this.changeBook = data.uuid
              this.bookImgVisible = true
            }
          })
          ipcRenderer.on('book-menu-open', (event, data) => {
            // _this.$route.
            if(data.uuid){
              this.openBook(data.uuid)
            }
          })

          ipcRenderer.on('pre-close-clear', () => {
            console.log('pre-close-clear received!');
            this.$sqliteDB.close();
            this.clearStorage();
          })




          _this.PLUGIN_SETTING({uid: this.GET_USET_DATA.uid})
          _this.GET_RANK({type:2,day: 0})
        },
        beforeDestroy() {
          this.removeAllListeners()
          if(this.subscribe){
            this.subscribe()
          }
        },
        mounted() {
          //登录重新获取书籍数据
          // this.getLocalAndOnlineBooks();
          setTimeout(() => {
            //给点时间绑库，之后再进行本地查询
            this.LIST_BOOKS_O_L({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token});
            console.log("这里应该跑过了！~！！！！！")
            // localQuery.updateChapterContentInDB({data: {chapter_uuid: 'ec06364a-8fc5-4ebc-abc8-48148f5621a3', content: '这个是测试的内容了啦啦啦啦', needUpload: true}})
          }, 100);

          // console.log("mounted12: ");
          window.addEventListener('online',  this.updateOnlineStatus)
          window.addEventListener('offline',  this.updateOnlineStatus)
          // console.log(this.GET_NOT_OVER_BOOK);
          let shouldLock = store.get('timeGoal') || store.get('wordGoal');
          console.log("should lock is: " + shouldLock);
          console.log("not over book length is: " + this.GET_NOT_OVER_BOOK_L1.length);



          if(shouldLock && this.GET_NOT_OVER_BOOK_L1.length){
            this.openBook(this.GET_NOT_OVER_BOOK_L1[0].client_uuid);
          }
          setInterval(() => {
            if(this.rankDay){
              if(this.activeRank=='word'){
                this.GET_RANK({type: 1,day: 0})
              }else if(this.activeRank=='time'){
                this.GET_RANK({type: 2,day: 0})
              }
            }
            console.log(this.activeRank,this.rankDay)
          }, 600000);

          this.waterMarkVisible = store.get("use-db") ? true : false;
          // this.alignBook();
        },
        components: {
          bookNew,
          bookImg,
          Inviting,
          menuBar,
          plugin,
          waterMark,
          codestatistics
        }
    }
</script>


<style>
.el-message{
    top: 50px !important;
  }
 .bookWarning{
      top: 50px
    }
    .el-aside {
        color: #333;
        /* height: 719px; */
        height: 100%;
        border-right: solid 1px #edeff3;
    }

  .user-book-main {
        color: #333;
        /* height: 719px; */
        height: 100%;
        padding: 0 !important;
        overflow: hidden;
    }
  .login-el-tabs .el-container{
    height: 100%;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
  }
    .login-el-tabs .el-tabs__item.is-top:nth-child(2) {
        margin-left: 47px;
    }
    .login-el-tabs .el-tabs__header{
      margin:0;
    }
    .login-el-tabs .el-tabs__content {
        width: 100%;
        /* height: 589px; */
        /* margin-top: -15px; */
        overflow-y: scroll;
        flex: 1;
    }
    .ranks-el-tabs .el-tabs__content{
      overflow: hidden !important;
      display: flex;
      flex-direction: column;
    }
    .login-el-tabs .el-tabs{
        margin-top:22px;
    }
    .login-el-tabs .el-tabs__nav-wrap::after{
        height:1px;
        background-color: #e4e7ed;
    }
    .login-el-tabs .el-tabs__active-bar:nth-child(1),.login-el-tabs .el-tabs__active-bar:nth-child(2){
        margin-left: 47px;
    }

    .login-el-tabs .el-tabs__active-bar{
        height: 4px;
        border-radius: 2px;
        background-color: #fbbd36;
    }
    .login-el-tabs .el-tabs__item.is-active {
        color: #333333;
        font-size: 14px;
    }
    .login-el-tabs .el-tabs__item {
        color: #999999;
    }

    .login-el-tabs .el-tabs__item:hover{
        color: #333333;
    }
    .login-el-tabs #pane-finished, .login-el-tabs #pane-unfinished, .login-el-tabs .el-tab-pane .not-book-list{
      width: 100%;
      height: 100%;
    }
</style>
<style scoped>
.aside-center{
  width: 100%;
  overflow: hidden;
  padding-bottom: 50px;

  /* padding-left: 68px; */
}
.aside-center .aside-center-author{
  padding-top: 40px;
  margin: 0 auto;
  text-align: center;
}
   .aside-center .aside-center-author .avatar{
        width: 72px;
        height:72px;
        /* overflow: hidden; */
        margin: 0 auto 10px;
        position: relative;
    }
   .aside-center .aside-center-author .vip-box{
        width: 21px;
        height: 21px;
        background: #ffffff;
        position: absolute;
        right: -7px;
        top: 50px;
        line-height: normal;
        border-radius: 50%;
    }
  .aside-center .aside-center-author  .vip-box img{
        width: 18px;
        height:18px;
        margin: 2px 0 0 1px;
    }
  .aside-center .aside-center-author .avatar > img{
        width: 72px;
        height:72px;
        border-radius: 50%;
    }
  .aside-center .aside-center-author .nickname-ind{
        font-size: 14px;
        color:#333333;
    }
   .aside-center .aside-center-author .invitation-btn{
        width: 100%;
        height: auto;
        text-align: center;
        margin-top: 12px;
    }
   .aside-center .aside-center-author .invitation-btn button{
        width: 68px;
        height:28px;
        background: #FFFFFF;
        outline: none;
        border: none;
        font-size: 12px;
        color:#333333;
        cursor: pointer;
        border-radius: 14px;
        border: solid 1px #999999;
    }
    .aside-center .aside-center-action{
      margin-top:40px;
    }
    .aside-center .aside-center-product{
      margin-top:35px;
    }
    .aside-center .aside-center-action,.aside-center .aside-center-product{
      font-size: 14px;
      padding-left: 68px;
      color: #333333;
    }
    .aside-center-action .row{
      /* color: #fff; */
    }
    .row{
        cursor: pointer;
        margin-top:20px;
        position: relative;
    }
    .tabactived::after{
      content: "";
      height: 10px;
      width: 10px;
      background: #fbbd36;
      border-radius: 50%;
      display: block;
      clear: both;
      position: absolute;
      left: -18px;
      top: 4.5px;
    }
    .line{
        width: 90px;
        height: 34px;
        margin: 0 auto;
        border-bottom: solid 1px #edeff3;
    }
    .doubt-box{
        width: 60px;
        height: 34px;
        margin-left: 68px;
        margin-top:70px;
        text-align: center;
    }
    .doubt{
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: #ffffff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
        cursor: pointer;
        position: relative;
    }
    .doubt::after{
      content: '';
      width: 7px;
      height: 7px;
      background-color: #fbbd36;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .doubt img{
        margin-top: 7px;

    }
    .version{
        width: 100%;
        height: auto;
        color: #333333;
        padding-left: 68px;
        font-size: 10px;
        color: #999999;
        box-sizing: border-box;
        margin-top: 20px;
    }
    .doubt ul{
        width:120px;
        height:64px;
        background-color: #ffffff;
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.13);
        position: fixed;
        left: 110px;
        top:533px;
        z-index: 999;
    }
    .doubt ul li{
        display: block;
        width: 100%;
        height:32px;
        line-height: 32px;
        text-align: center;
        font-size: 12px;
        color: #333333;
        cursor: pointer;
    }
    .doubt ul li:hover{
        background: #f8f8f8
    }
    .doubt ul li:nth-child(2){
        font-size: 10px;
        cursor: initial;
    }
    .doubt ul li:nth-child(2) span{
      display: inline-block;
      padding: 0 4px;
      background: #DCDCDC;
      float: right;
      cursor: pointer;
    }

    .btn-box{
        width: 100%;
        height: auto;
        margin-top: 24px;
        margin-bottom: 30px
    }

    .btn-box button{
        width: 120px;
        height: 36px;
        border-radius: 18px;
        background-color: #3e4347;
        outline: none;
        border: none;
        font-size: 14px;
        color:#ffffff;
        cursor: pointer;
    }
    .btn-box button:nth-child(1){
        margin-left: 40px;
    }
    .btn-box button:nth-child(2){
        margin-left: 20px;
    }
    .finished-ul{
        margin: 0px 0 0 40px;
        overflow: hidden;
        padding-bottom: 30px
    }
    .finished-ul li{
        /* width:186px; */
        width:110px;
        /* height: 250px; */
        margin-right: 60px;
        /* border-radius: 6px;
        background-color: #ffffff;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
        border: 1px solid rgba(0, 0, 0, 0.04);
        text-align: center; */
        float: left;
        margin-top: 30px;
    }
    .finished-ul li.speedAddBook div:nth-of-type(1) span{
      font-size: 26px;
      color: #cccccc;
      font-weight: bold;
    }
    .finished-ul li.speedAddBook .speedAddBook-title{
      width: 146px;
      height: 30px;
      margin-top: 14px;
      /* border: solid 1px #d9d9d9; */
    }
    .finished-ul li.speedAddBook .speedAddBook-title input{
      width: 100%;
      height: 100%;
      border-radius: 4px;
      font-size: 14px;
      padding-left: 10px;
      box-sizing: border-box;
      outline: none;
      border: solid 1px #d9d9d9;
    }
    .finished-ul li .book-title{
      height: 22px;
      width: 140px;
      font-size: 16px;
      color: #333333;
      font-weight: normal;
      margin: 15px auto 0;
    }
    .finished-ul li:hover{
        /* background-color: #f8f8f8; */
    }
    .finished-ul li div:nth-of-type(1):hover{
      box-shadow: 0 2px 10px rgba(0,0,0,.32);
    }
    .finished-ul li div:nth-of-type(2){
        font-size: 12px;
        color: #999999;
        margin-top: 3px;
    }

    .finished-ul li div:nth-of-type(1){
        /* margin-top: 26px; */
        cursor: pointer;
        height: 140px;
        text-align: center;
        overflow: hidden;
        position: relative;
        border-radius: 6px;
    }
    .finished-ul li div:nth-of-type(1) span{
      display: inline-block;
      color: #f5f0f0;
      font-size: 36px;
      font-weight: bold;
      position: absolute;
      line-height: 140px;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
    }
    .finished-ul li div:nth-of-type(3){
        font-size: 12px;
        color:#999999;
        margin-top: 12px;
    }

    .finished-ul li div:nth-of-type(4){
        font-size: 12px;
        color:#999999;
        margin-top: 3px;
    }
    .login-el-tabs{
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .login-el-tabs .not-book-list{
      position: relative;
    }
    .login-el-tabs .not-book-list img{
        width: 156px;
        height: 190px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -95px; /* 高度的一半 */
        margin-left: -78px; /* 宽度的一半 */
    }
    /* 排行榜 */
    .rank-cont .day-switch{
      height: 58px;
      
      padding: 20px 0 0 47px;
    }
    .rank-cont .day-switch .actived{
      background: #fafafa;
    }
    .ranks-el-tabs .el-tab-pane{
      display: flex ;
      flex-direction: column;
      height: 100%;
    }
    
    .login-el-tabs .rank-title{
      height: 49px;
      display: flex;
      justify-content: space-around;
    }
    .login-el-tabs .rank-title span{
      line-height: 49px;
      font-size: 14px;
      color: #999999;
    }
    .login-el-tabs .rank-list{
      overflow-y: auto;
      flex: 1;
    }
    .login-el-tabs .rank-list li{
      height: 56px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-size: 14px;
    }
    .login-el-tabs .rank-list li.hightfont{
      font-weight: bold;
    }
    .login-el-tabs .rank-list li:nth-child(2n+1){
      background-color: #f5f7f9;
    }
    .login-el-tabs .rank-list .user-nickname{
      display: flex;
      align-items: center;
    }
    .login-el-tabs .rank-list .user-nickname span{
      flex: 1;
    }
    .login-el-tabs .rank-list .user-avatar{
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 10px;
    }
    .login-el-tabs .rank-list .user-avatar span{
      display: inline-block;
      width: 28px;
      height: 28px;
      text-align: center;
      line-height: 28px;
      color: #fff;
      font-weight: bold;
      border-radius: 50%;
      overflow: hidden;
      background-color: #fbbd36;
    }

   
    .login-el-tabs .rank-list .user-avatar img{
      width: 100%;
      min-height: 100%;
    }
    .el-footer{
      height: 56px !important;
      display: flex;
      padding: 0;
      justify-content: space-around;
      align-items: center;
      font-size: 14px;
      border-top: solid 1px #d8d8d8;
    }
    .el-footer .user-nickname{
      display: flex;
      align-items: center;
    }
    .el-footer .user-nickname .user-avatar{
      width: 28px;
      height: 28px;
      text-align: center;
      line-height: 28px;
      color: #fff;
      font-weight: bold;
      border-radius: 50%;
      overflow: hidden;
      background-color: #fbbd36;
      margin-right: 10px;
    }
    .flex-one{
      width: 150px;
      box-sizing: border-box;
      padding: 0 20px;
      text-align: center;
    }
    .flex-two{
      flex: 1;
      /* padding-left: 160px; */
      min-width: 250px;
      padding-left: 17.77%;
      padding-right: 30px;
      box-sizing: border-box;
    }
    .flex-three{
      width: 250px;
      box-sizing: border-box;
      padding: 0 20px;
    }
    .login-el-tabs .rank-list .flex-three{
      width: 246px;
    }
    

    .main-center{
      /* height: 719px; */
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
	.code-box{
        position:fixed;
        /* top:420px; */
        top: 338px;
        left:200px;
        z-index:999999;
        width: 178px;
        height:178px;
        text-align: center;
         box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);
        background-color: #ffffff;
    }
    .code-box img{
      width: 160px;
      height: 160px;
    }

   
</style>
