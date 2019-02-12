<template>
  <my-dialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" v-on:closeDialog="closeDialog">
      <div class="bookOpen">
        <el-tabs v-model="activeName">
            <el-tab-pane label="打开书籍" name="first">
                <div class="tabs-first">
                        <ul class="book-center" v-if="filterNotOverBook.length">
                            <!-- {{filterNotOverBook}} -->
                            <li class="book-list" :title="item.title" v-for="(item) in filterNotOverBook" @click="tapType = item.client_uuid, bookItem = item" :key="item.client_uuid" :data-index="item.client_uuid" :class="{tapList:(tapType==item.client_uuid)}">
                                <div class="book-list-cen">
                                    <img src="static/imgs/note/open_book.png" alt="" srcset="">
                                    <span class="ellipsis">{{item.title}}</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </el-tab-pane>
            <el-tab-pane label="已完结" name="last" v-if="show">
                <div class="tabs-last">
                    <!-- {{filterOverBook}} -->
                    <ul class="book-center">
                        <li class="book-list" :title="item.title" v-for="item in filterOverBook" @click="tapType = item.client_uuid" :key="item.client_uuid" :data-index="item.client_uuid" :class="{tapList:(tapType==item.client_uuid)}">
                            <div class="book-list-cen">
                                <img src="static/imgs/note/open_book.png" alt="" srcset="">
                                <span class="ellipsis">{{item.title}}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </el-tab-pane>
        </el-tabs>
        <div class="box-footer">
            <button class="cancelBtn" type="button" @click="closeWindow">取 消</button>
            <button class="inspectBtn" @click="openBook" type="button">确定</button>
          </div>
      </div>
    </my-dialog>
</template>

<script type="text/ecmascript-6">
import myDialog from "@/components/pages/dialog/dialog";
import localQuery from '@/helper/query.js';
import { mapActions, mapGetters } from 'vuex'
export default {
    props:{
        dialogTableVisible: Boolean
    },
  data () {
    return {
        dialoginf: {
              width: 540,
              height: 500,
              title: "打开书籍"
        },
        show: false,
        activeName: 'first',
        tapType: '',
        bookList: [],
        bookItem: {},
    }
  },
  computed: {
      ...mapGetters({
          GET_INFO_BOOK: 'GET_INFO_BOOK',
          GET_USET_DATA: 'user/GET_USET_DATA',
          GET_NOT_OVER_BOOK_L1: 'GET_NOT_OVER_BOOK_L1'
      }),
      filterOverBook(){
          return this.bookList.filter((item) => {
            if((item.creation_status == 1)&&(item.is_deleted !== 1)){
                return item
            }
          })
      },
      filterNotOverBook(){
          return this.bookList.filter((item) => {
            if((item.creation_status == 0)&&(item.is_deleted !== 1)){
                return item
            }
          })
      }
  },
  methods: {
      ...mapActions({
          INFO_BOOK: 'INFO_BOOK',
          OPEN_BOOK: 'OPEN_BOOK',
          // LIST_BOOK: 'LIST_BOOK'
      }),
      closeWindow(){
          this.$emit('closeOpenWindow', false)
      },
      openBook() {
        let id = this.tapType;
        var slef = this;
        if(!id) {
          slef.$message({showClose: true, message: '请选择你要打开的书籍！', type: 'warning'});
           return false
        }
        console.log('tapType')
        // localQuery.queryBookItem({client_uuid: slef.tapType, uid: slef.GET_USET_DATA.uid}).then((res) => {
        //   if(res){
            slef.$electron.ipcRenderer.send('ipc-openBook', {path: '', book: slef.bookItem})
            slef.closeWindow()
        //   }else{
        //     console.log('数据库内没有该书！')
        //   }
        // }, (err) => {
        //   console.log("书本查库必败~~~~~")
        //   console.log(err);
        // })
        // this.OPEN_BOOK({update_time: 0, uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token, book_uuid: id}).then((res) => {
        // })
      },
      closeDialog() {
          this.$emit("closeOpenWindow", false);
        }
  },
  components:{
    myDialog
  },
  created(){
    this.bookList = JSON.parse(localStorage.getItem('book-list'))
    // this.OPEN_BOOK({update_time: 0, uid: 101304569, book_uuid: 'book-a002'})
    // this.INFO_BOOK({sql:'select * from book_category where parent_client_uuid = ', id: 0})
    // this.LIST_BOOK({uid: this.GET_USET_DATA.uid, token: this.GET_USET_DATA.token})
  }
}
</script>
<style>
.bookOpen .el-tabs__nav{
    padding: 0 30px;
}
.bookOpen .el-tabs--top .el-tabs__item.is-top:nth-child(2){
  margin-left: 0 !important
}
.bookOpen .el-tabs__nav .el-tabs__active-bar{
    left: 31px;
}
.bookOpen .el-tabs__nav  .el-tabs__item {
    font-size: 14px;
    color: #999999;
}
.bookOpen .el-tabs__nav .is-active{
    color: #333333;
}
.bookOpen .el-tabs__nav .el-tabs__item{
  height: 50px;
  line-height: 50px;
}
.bookOpen .el-tabs__nav .el-tabs__active-bar {
    width: 46px;
    height: 4px;
    border-radius: 2px;
    background-color: #fbbd36;
}
.tapList{
    background-color: #fafafa;
}
</style>
<style scoped>
    .bookOpen .book-center{
    }
    .tabs-first,.tabs-last{
        width: 100%;
        height: 285px;
        font-size: 14px;
        color: #333333;
        overflow-y: scroll;
    }
    .bookOpen .book-center .book-list{
        width: 100%;
        box-sizing: border-box;
        -webkit-box-sizing: border-box;
        cursor: pointer;
        padding: 0 30px;
    }
    .bookOpen .book-center .book-list .book-list-cen{
        width: 100%;
        height: 100%;
        overflow: hidden;
        padding: 13px 0;
        line-height: 30px;
        border-bottom: 1px solid #edeff3
    }
    .bookOpen .book-center .book-list .book-list-cen span{
      display: inline-block;
      max-width: 420px;
    }
    .bookOpen .book-center .book-list img{
         width: 33px;
        height: 27px;
        object-fit: contain;
        margin-right: 14px
    }
     .bookOpen .book-center .book-list img, .bookOpen .book-center .book-list span{
         float: left;
     }
     .box-footer{
        text-align: right;
        padding-right:30px;
        margin-top: 50px;
    }
    .box-footer button{
      width: 88px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      font-size:14px;
      outline: none;
    }
    .box-footer .cancelBtn{
      border: solid 1px #dddddd;
      background-color: #f3f3f3;
      margin-right:20px;
      color: #666666;
    }
    .box-footer .inspectBtn{
      border: none;
      background-color: #3e4347;
      color: #ffffff;
}
</style>
