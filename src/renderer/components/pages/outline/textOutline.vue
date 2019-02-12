<template>
    <div style="height:100%;">
       <el-container  style="padding-top:72px;">
            <el-aside width="220px" class="set-el-aside" style="padding-bottom:60px;">
                <div class="outline-img-box" @click="dialogTableVisible = true">
                   <span>选择书籍</span>
                </div>
                   <!-- <el-aside class="chapter-box" :style="{width:isFlodLeft?'0':'180px'}" ref="chapterBox">
                        <el-tree v-if="filterBookItem"  ref="bookTree" :data="filterBookItem.SubCategories" empty-text="" :props="defaultProps" :default-expanded-keys="treeConfig.defaultExpanded" :lazy="false" @current-change="treeChange" @node-click="treeClick" @node-contextmenu="showMenu" highlight-current node-key="client_uuid" show-checkbox :class="treeConfig.showCheckbox ? 'showBox': 'hideBox'">
                            <div class="custom-tree-node" slot-scope="{ node, data }">
                                <title-change :data="data" :node="node"  :ref="data.client_uuid"></title-change>
                            </div>
                        </el-tree>
                    </el-aside> -->
                <el-tree
                ref="outlinetree"
                :data="datas"
                node-key="client_uuid"
                :accordion="true"
                :default-expanded-keys="firstListBook"  highlight-current   @node-contextmenu="showMenu" @node-click="checkFn" @check-change="chackChange" @current-change="currentChange">
                <span class="custom-tree-node" slot-scope="{ node, data }" :class="data.type == 1?'bookName':''">
                    <span  v-if="data.changeType"    @dblclick="changeTitle($event, data)" :title="data.label">
                        <i v-if="data.type == 2 && data.category == 201" class="iconfonts icon-dagang_dagang" style="font-size:12px;"></i>
                        <i v-else-if="data.type == 2 && data.category == 202" class="iconfonts icon-dagang_plot" style="font-size:12px;"></i>
                        <i v-else-if="data.type == 2 && data.category == 203" class="iconfonts icon-dagang_character" style="font-size:12px;"></i>
                        <i v-else class="" style="font-size:12px;"></i>
                        {{ data.label }}
                    </span>
                    <input :maxlength="20"  v-if="!data.changeType && data.type==3" :value="data.label" @input="data.label = $event.target.value" v-on:keyup.enter="blurChange($event, data)" v-focus @blur="blurChange($event, data)" class="custom-tree-node-title-input"   typet="text" title="请输入只包含中文、英文、阿拉伯数字、逗号、问号、冒号、感叹号的字符" />
                    <span v-if="data.label == '情节大纲' || data.label == '人物设置'">
                        <el-button
                            type="text"
                            size="mini"
                            @click.stop="() => append(data)" class="iconfonts icon-dagang_add">
                        </el-button>
                    </span>

                </span>
                </el-tree>
            </el-aside>
            <el-main class="set-el-main">
                    <div v-if="nodeData.category == 201">
                        <div class="dataBlank"   v-for="(item,index) in nodeData.content.topData" :key="'key1'+index">
                            <p class="cont-title">
                                <span>{{item.title}}</span>
                                <span>
                                    <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                    <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1" @click="deleteItemFn(index)"></i>
                                </span>
                            </p>
                            <div style="position:relative">
                                <el-input type="textarea"  :rows="item.minRows" autosize placeholder="请输入" :maxlength="item.maxNum"  v-model.trim="item.content" ></el-input>
                                <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                            </div>
                        </div>
                        <div class="customDiv" @click="addCustomData" :class="[nodeData.content.customData.length>=5?'gray':'']">
                            <span class="iconfonts icon-dagang_add"></span>
                            添加更多自定义项</div>
                        <div class="dataBlank"   v-for="(item,keys) in nodeData.content.customData" :key="'key2'+keys">
                            <p class="cont-title">
                                <span>
                                    <span>{{item.title}}</span>
                                    <span class="reName" @click="reNameFn(item,keys)">修改</span>
                                </span>
                                <span>
                                    <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                    <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1" @click="deleteCustomFn(keys)"></i>
                                </span>
                            </p>
                            <div style="position:relative">
                                <el-input type="textarea"   :rows="item.minRows" autosize placeholder="请输入" :maxlength="item.maxNum"  v-model.trim="item.content" ></el-input>
                                <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="nodeData.category == 202">
                        <div class="dataBlank"  v-for="(item,index) in nodeData.content.topData" :key="'key3'+index">
                            <p class="cont-title">
                                <span>
                                    {{item.title}}
                                </span>
                                <span>
                                    <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                    <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1"  @click="deleteItemFn(index)"></i>
                                </span>
                            </p>
                            <div style="position:relative">
                                <el-input type="textarea"  :rows="item.minRows" autosize placeholder="请输入"  :maxlength="item.maxNum" v-model.trim="item.content" ></el-input>
                                <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                            </div>
                        </div>
                        <div class="customDiv" @click="addCustomData" :class="[nodeData.content.customData.length>=5?'gray':'']">
                            <span class="iconfonts icon-dagang_add"></span>
                            添加更多自定义项</div>
                        <div class="dataBlank"   v-for="(item,keys) in nodeData.content.customData" :key="'key4'+keys">
                            <p class="cont-title">
                                <span>
                                    <span>{{item.title}}</span>
                                    <span class="reName" @click="reNameFn(item,keys)">修改</span>
                                </span>
                                <span>
                                    <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                    <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1" @click="deleteCustomFn(keys)"></i>
                                </span>
                            </p>
                            <div style="position:relative">
                                <el-input type="textarea"  :rows="item.minRows" autosize placeholder="请输入" :maxlength="item.maxNum" v-model.trim="item.content" ></el-input>
                                <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                            </div>
                        </div>
                    </div>
                    <div v-if="nodeData.category == 203">
                        <div class="personTitle">人物基本信息<span>（每项最多十个字）</span> </div>
                        <div class="perSonStaticInfoBox">
                            <div class="personBlank">
                                <p class="cont-title">
                                    <span>人物姓名</span>
                                </p>
                                <div style="position:relative">
                                    <el-input type="textarea"  :rows="1" :maxlength="10" autosize  v-model.trim="nodeData.label" placeholder="请输入,必填"  ></el-input>
                                </div>
                            </div>
                            <div class="personBlank"  v-for="(item,index) in nodeData.content.basicData" :key="'key5'+index">
                                <p class="cont-title">
                                    <span>{{item.title}}</span>
                                </p>
                                <div style="position:relative">
                                    <el-input type="textarea"  :rows="item.minRows" autosize :maxlength="item.maxNum"  v-model.trim="item.content" placeholder="请输入"  ></el-input>
                                </div>
                            </div>
                        </div>
                        <div class="personTitle">人物特征信息</div>
                        <div class="dataBlank"  v-for="(item,index) in nodeData.content.topData" :key="'key6'+index">
                            <p class="cont-title">
                                <span>{{item.title}}</span>
                                <span>
                                    <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                    <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1"  @click="deleteItemFn(index)"></i>
                                </span>
                            </p>
                            <div style="position:relative">
                                <el-input type="textarea"  :rows="item.minRows" autosize  :maxlength="item.maxNum" placeholder="请输入"  v-model.trim="item.content" ></el-input>
                                <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                            </div>
                        </div>
                        <div class="customDiv" @click="addCustomData" :class="[nodeData.content.customData.length>=5?'gray':'']">
                            <span class="iconfonts icon-dagang_add"></span>
                            添加更多自定义项
                        </div>
                            <div class="dataBlank"   v-for="(item,keys) in nodeData.content.customData" :key="'key7'+keys">
                                <p class="cont-title">
                                    <span>
                                        <span>{{item.title}}</span>
                                        <span class="reName" @click="reNameFn(item,keys)">修改</span>
                                    </span>
                                    <span>
                                        <i v-if="!item.canEdit" class="iconfonts icon-dagang_edit r10"></i>
                                        <i v-if="!item.showDelete" class="iconfonts icon-dagang_delete1" @click="deleteCustomFn(keys)"></i>
                                    </span>
                                </p>
                                <div style="position:relative">
                                    <el-input type="textarea"  :rows="item.minRows" autosize placeholder="请输入" :maxlength="item.maxNum"  v-model.trim="item.content" ></el-input>
                                    <div class="wordsmaxnum" v-if="item.maxNum">{{item.content.length}}/{{item.maxNum}}</div>
                                </div>
                            </div>
                    </div>
                    <p class="save">
                        <el-button @click="saveData">保存</el-button>
                    </p>
            </el-main>
            <book-open @closeOpenWindow="closeOpenWindow(false)" :userCenterFlag="dialogTableVisible" v-if="dialogTableVisible"></book-open>
        </el-container>
    </div>  
</template>
<script>
  import myDialog from '@/components/pages/dialog/dialog.vue'
  import { mapGetters,mapActions } from 'vuex';
  import uuid from 'uuid-random'
  import { sqliteDBStrongDecode, arabiaToSimplifiedChinese, arrayReachJson } from '../../../../../static/js/public.js'
  import { ipcRenderer, remote, MenuItem, Menu, ipcMain } from "electron";
  import axios from 'axios'
  import * as api from '../../../store/API.js'
  import { hmac256,timestamp } from "../../../../../static/js/public.js";
  import bookOpen from '@/components/pages/bookOpen/outlineBookOpen';
  export default {
    name: '', 
      components:{myDialog},
      props: {
          settingsFlag: Boolean
      },
    data () {
        return {
             dialogTableVisible: false,
             targitChange:true, //防止多次操作
             treeImg: {
                book: "static/imgs/outline/4-copy-3.png",
                volume: "static/imgs/outline/group-14-copy-2.png",
                closeVolume: "static/imgs/outline/group-14-copy-2.png"
            },
            datas: [], //左侧列表书籍
            formData:{
                storySubject:'',
                storyStyle:'',
                storyLine:'',
                storyBright:'',
                storyCharacter:'',
                storyBackground:'',
                storyCore:''
            },
            bookId:'',
            listBook:[],//书籍集
            firstListBook:[],//初始化选中的节点 指定第一本书的大纲
            nodeData:{
                category:201,
                content:{
                  topData:[],
                  customData:[]
                }
            },//当前选中节点数据，不是本书大纲跟不是type =3 的不重新赋值
            //默认数据集（创建新的时候使用）
            staticData:{
              //默认本书大纲数据集（创建新的时候使用）
              storyData:{
                types: 201,
                allEdit:true,
                topData:[{
                    title:'故事题材',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:100,
                    showDelete:true
                },
                {
                    title:'故事风格',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:100,
                    showDelete:true
                },{
                    title:'故事主线',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'故事亮点',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'主角性格',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'故事背景',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'故事核心',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'升级体系',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:false
                },{
                    title:'故事起因',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:false
                },{
                    title:'故事高潮',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:false
                },{
                    title:'故事结尾',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:false
                },{
                    title:'世界背景设定',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:false
                }],
                customData:[]
              },
              //情节默认数据集（创建新的时候使用）
              plotData:{
                types: 202,
                allEdit:true,
                topData:[{
                    title:'情节地点',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:100,
                    showDelete:true
                },
                {
                    title:'涉及人物',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:100,
                    showDelete:true
                },{
                    title:'发生时间',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:100,
                    showDelete:true
                },{
                    title:'情节开端',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'情节发展/阻力',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'情节高潮',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                },{
                    title:'情节结尾/新情节开端',
                    content:'',
                    canEdit:true,
                    minRows:4,
                    maxNum:2000,
                    showDelete:true
                }],
                customData:[]
              },
              //情节默认数据集（创建新的时候使用）
              personData:{
                types: 203,
                allEdit:true,
                basicData:[{
                    title:'人物性别',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:10,
                    showDelete:true
                },{
                    title:'人物年龄',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:10,
                    showDelete:true
                },{
                    title:'人物类型',
                    content:'',
                    canEdit:true,
                    minRows:1,
                    maxNum:10,
                    showDelete:true
                },
                ],
                topData:[{
                    title:'性格优点',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },
                {
                    title:'性格缺点',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'外貌特征',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'人物特长',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'人物标志',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'兴趣爱好',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'出身及经历',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'标志物品',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'等级及职业',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'说话风格',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                },{
                    title:'目标及理想',
                    content:'',
                    canEdit:true,
                    minRows:3,
                    maxNum:1000,
                    showDelete:true
                }],
                customData:[]
              },
            },
            //待保存的数据集
            waitSaveData:{
               storyData:{}  
            }
        }
    },
    computed: {
        // ...mapGetters({
        //     GET_INFO_BOOK: 'GET_INFO_BOOK',
        //     GET_USET_DATA: 'user/GET_USET_DATA'
        // })
    },
    directives: {
        focus: {
            inserted: function (el, {value}) {
                console.log('触发发focus操作')
                // console.log(value)
                // if (value) {
                el.focus()
                // }
            }
        }
    },
    methods: {
        // ...mapActions({
        //      OUTLINE_TEXT: "outline/OUTLINE_TEXT",
        // }),
        reNameFn(e,index){
            this.$prompt('请人输入新的名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /\S/,
                inputErrorMessage: '名字不能为空'
            }).then(({ value }) => {
                this.nodeData.content.customData[index].title = value
                this.$message({
                    type: 'success',
                    message:  '修改成功，记得保存哦！'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消修改'
                });       
            });
        },
        addCustomData(){
            if(this.nodeData.content.customData.length >=5){
                this.$message({
                    type: 'success',
                    message: '最多添加5项!'
                });
                return;
            };
            let _title = "自定义" + arabiaToSimplifiedChinese(Number(this.nodeData.content.customData.length) + Number(1))
            this.nodeData.content.customData.push({
                title:_title,
                content:'',
                canEdit:true,
                minRows:3,
                maxNum:1000,
                showDelete:false
            })
        },
        //自定义选项删除
        deleteCustomFn(e){
            this.$confirm('删除该项?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                    this.nodeData.content.customData.splice(e,1)
                    this.$message({
                        type: 'success',
                        message: '删除成功，保存后生效!'
                    });
                }).catch(() => {
                      
            });
        },
        //默认选项删除
        deleteItemFn(e){
            console.log(e)
            this.$confirm('删除该项?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).then(() => {
                    this.nodeData.content.topData.splice(e,1)
                    this.$message({
                        type: 'success',
                        message: '删除成功，保存后生效!'
                    });
                }).catch(() => {
                      
            });
        },
        chackChange(e,ischeck,hascheck){
          
        },
        currentChange(e,ndos){
            if(e.type == 3 || (e.type == 2 && e.category == 201)){
              this.nodeData = e;
            }
        },
        closeOpenWindow(type){
            this.dialogTableVisible = type
        },
        //修改左侧type=3 子节点名字
        changeTitle(e,data){
            if(data.type == 3){
              let _arrIndex = data.category == 202?1:2;
                let _index =  this.listBook.findIndex(function(value, index, arr) {
                            return value == data.bookid;
                }) //查找当前书籍在节点中的
                this.datas[_index].children[_arrIndex].children = this.datas[_index].children[_arrIndex].children.map(function(item,index){
                    if(item.client_uuid == data.client_uuid){
                        item.changeType = false;
                    }
                    return item;
                })
                this.targitChange = false;
            }
           
        },
        //失去焦点改变
        blurChange(e,data){
            if(this.targitChange) return;
            if(e.target.value == ""){
                this.targitChange = false;
                return false;
            }
            this.targitChange = true;
            this.change(data.category,e.target.value,data.client_uuid,data.bookid,data.content)
        },
        //添加方法
        append(data) {
            let client_uuid = uuid();
            let _name = "";
            if(data.category == 202){
                _name = "情节"+arabiaToSimplifiedChinese(Number(data.children.length) + Number(1))
            }else if(data.category == 203){
                _name = "人物"+arabiaToSimplifiedChinese(Number(data.children.length) + Number(1))
            }   
            let  staticCont = "";
            data.category == 202? staticCont = JSON.parse(JSON.stringify(this.staticData.plotData))  : staticCont = JSON.parse(JSON.stringify(this.staticData.personData));
            const newChild = {category:data.category ,bookid:data.bookid, client_uuid: client_uuid,type:3,content:staticCont, label: _name,title:_name,changeType:true,version:1, children: [] };
            this.save(client_uuid,data.category,_name,newChild,staticCont,data)
        },
        //显示右键菜单
        showMenu(event, data, node, dom) {
            console.log(data)
            ipcRenderer.send("ipc-outline", data);
        },
        //保存新子节点方法
        save (client_uuid,category,title,newChild,staticCont,data){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": data.bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(staticCont),
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
                headers: {
                    'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
                }
            }
            ).then(res => {
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    if (!data.children) {
                      that.$set(data, 'children', []);
                    }
                    data.children.push(newChild);
                    // that.$message({showClose: true, message: `添加成功`, type: 'success'})
                }else{
                    that.$message({showClose: true, message: `添加失败`, type: 'error'})
                }
            })
        },
        //删除方法
        delete (category,title,client_uuid,bookid){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": bookid,
                    "syllabuses": [
                        {   "is_deleted":1,
                            "client_uuid": client_uuid,
                            "content": "",
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
            headers: {
                'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
            }
            }
          ).then(res => {
              if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                        let _arrIndex = category == 202?1:2;
                        // let _length = 
                         let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == bookid;
                        }) //查找当前书籍在节点中的
                      
                        that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.filter(function(item,index){
                            return item.client_uuid != client_uuid;
                        })
                        // that.$message({showClose: true, message: `删除成功`, type: 'success'})
                    }else{
                        that.$message({showClose: true, message: `删除失败`, type: 'error'})
                    }
              }
          })
        },
        //修改方法
        change (category,title,client_uuid,bookid,content){
            let that = this;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(content),
                            "category": category,
                            "title": title,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
            headers: {
                'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
            }
            }
            ).then(res => {
                console.log(res)
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                      let _arrIndex = category == 202?1:2;
                      let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == bookid;
                        }) //查找当前书籍在节点中的
                        that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.filter(function(item,index){
                            item.changeType = true;
                            return item;
                        })
                }else{
                    that.$message({showClose: true, message: `修改失败`, type: 'error'})
                }
                that.targitChange = false;
            })
        },
        checkFn($event, data){
            // console.log(this.$refs.outlinetree.getCurrentNode())
        },
        //初始化左侧栏
        showOutLine(bookInfo){
                let userData = JSON.parse(localStorage.getItem('user'));
                let time = timestamp();
                let that = this;
                let _datas = {
                        category:200,
                        client_uuid:uuid(),
                        label: bookInfo.title,
                        bookid:bookInfo.book_uuid,
                        type:1,
                        changeType:true,
                        children: [{
                            label: '本书大纲',
                            client_uuid:bookInfo.book_uuid,
                            bookid:bookInfo.book_uuid,
                            children: [],
                            content:JSON.parse(JSON.stringify(that.staticData.storyData)),
                            category:201,
                            type:2,
                            changeType:true
                        },
                        {
                            label: '情节大纲',
                            bookid:bookInfo.book_uuid,
                            changeType:true,
                            children: [],
                            type:2,
                            client_uuid:uuid(),
                            category:202
                        },
                        {
                            label: '人物设置',
                            bookid:bookInfo.book_uuid,
                            changeType:true,
                            children: [],
                            client_uuid:uuid(),
                            type:2,
                            category:203
                        }]
                    }
                    axios({
                        url: api.outline_get + `?token=${userData.user.user_center.token}&timestamp=${time}&book_uuid=${bookInfo.book_uuid}&types=2`,
                        method: 'GET',
                        headers: {
                            'x-sign-id': hmac256(userData.user.user_center.token, api.outline_get, time, '')
                        }
                    }).then(res => {
                           if(res.data.result.texts){
                                let _data = res.data.result.texts.map(function(item,index){
                                //202 情节大纲 203 人物设置 201本书大纲
                                if(item.category == 202){
                                    item.type = 3;
                                    item.changeType = true;
                                    item.content = JSON.parse(item.content);
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[1].children.push(item)
                                }
                                if(item.category == 203){
                                    item.type = 3;
                                    item.changeType = true;
                                    item.content = JSON.parse(item.content);
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[2].children.push(item)
                                }
                                if(item.category == 201){
                                    item.type = 2;
                                    item.changeType = true;
                                    item.label = item.title;
                                    item.bookid = bookInfo.book_uuid;
                                    _datas.children[0].content = JSON.parse(item.content);
                                }
                            })
                        }
                        that.datas.push(_datas)
                        if(that.bookId == bookInfo.bookId){
                             that.nodeData = _datas.children[0]; //初始化当前节点数据
                        }
                    })
        },
        //右侧保存按钮
        saveData(){
            if(this.nodeData.label == ""){
                this.$message({showClose: true, message: `人物姓名不能为空`, type: 'success'})
                return;
            }
            let that = this;
            let client_uuid = this.nodeData.client_uuid;
            let userData = JSON.parse(localStorage.getItem('user'));
            let token = userData.user.user_center.token
            let time = timestamp();
            var parameters = {
                    "book_uuid": this.nodeData.bookid,
                    "syllabuses": [
                        {
                            "client_uuid": client_uuid,
                            "content": JSON.stringify(this.nodeData.content),
                            "category": this.nodeData.category,
                            "title": this.nodeData.label,
                            "garbish":false,
                            "version": 0
                        }
                    ]
                }
            axios.post(
            api.OUTLINE_TEXT + `?token=${token}&timestamp=${time}`, 
            parameters,
            {
                headers: {
                    'x-sign-id': hmac256(token,api.OUTLINE_TEXT,time,parameters)
                }
            }
            ).then(res => {
                if(res.data.status == 200 && res.data.result.syllabuses[0].code == 200){
                    that.$message({showClose: true, message: `保存成功`, type: 'success'})
                }else{
                    that.$message({showClose: true, message: `保存失败`, type: 'error'})
                }
            })
        }
    },
    created() {
        var bookInfo =JSON.parse(localStorage.getItem("filterBookItem"));
        let that = this;
        this.bookId = bookInfo.bookId;
        this.listBook.push(bookInfo.bookId)
        this.firstListBook.push(bookInfo.bookId)
        this.showOutLine(bookInfo)
        ipcRenderer.on("change-outline-title", (event, arg) => {
            let _arrIndex = arg.category == 202?1:2;
                let _index =  that.listBook.findIndex(function(value, index, arr) {
                            return value == arg.bookid;
                        }) //查找当前书籍在节点中的
            that.datas[_index].children[_arrIndex].children = that.datas[_index].children[_arrIndex].children.map(function(item,index){
                if(item.client_uuid == arg.client_uuid){
                    item.changeType = false;
                }
                return item;
            })
            this.targitChange = false;
        });
        ipcRenderer.on("outline-del", (event, arg) => {
            this.delete(arg.category,arg.title,arg.client_uuid,arg.bookid)
        });
        ipcRenderer.on("outline-new-book", (event, arg) => {
            let hasOpenBook =  this.listBook.some(function(item, index, array){
                return item == arg.book.book_uuid
            })
            if(!hasOpenBook){
                this.listBook.push(arg.book.book_uuid)
                this.showOutLine(arg.book)
            }
        });
    },
    mounted(){
        let that = this;
        //设置初始化选中节点
        setTimeout(() => {
            that.$refs.outlinetree.setCurrentKey(that.bookId)
        }, 1000);
    },
    components: {
        bookOpen
    }
  }
</script>
<style>

</style>

<style lang="scss">
    .is-current>div>span{
        color: #000 !important;
    }
    .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
        background-color: #f8f8f8;
    }
    .el-tabs__content{
        height:100%;
    }
    .container{
        font-family: "微软雅黑";
    }
    .set-el-aside {
        color: #333;
        border-right: solid 1px #edeff3;
    }
    
    .outline-img-box{
        width: 100%;
        height: 40px;
        line-height:40px;
        text-align:center;
        font-size:12px;
        background:#f8f8f8;
        overflow: hidden;
        cursor: pointer;
    }
    .outline-img-box img{
        float: left;
        cursor: pointer;
    }
    .outline-img-box img:first-child{
        margin-left: 40px;
    }
    .outline-img-box img:nth-of-type(2){
        margin-left: 46px;
    }
    .set-el-main > .text-title {
        width: 100%;
        height:auto;
        overflow: hidden;
        overflow-y: scroll;
    }
    .set-el-main > .text-title .cont-title{
        font-size: 14px;
        height: 19px;
        line-height: 19px;
        padding: 20px 0 12px;
    }
    .set-el-main > .text-title > span{
        font-size: 14px;
        color:#333333;
        font-weight: bold;
    }
    .set-el-main > .text-title > ul{
        float: right;
        margin-right: -12px;
    }
    .set-el-main > .text-title > ul >li{
        float: left;
        font-size: 12px;
        color: #666666;
        width: 50px;
        text-align: center;
        cursor: pointer;
    }
    .set-el-main > .text-title > ul >li:hover{
        color: #333333;
    }
    .set-el-main > .text-title > ul >li:first-child{
        width: 80px;
        border-right: 1px solid #edeff3;
    }
    .el-container {
        height: 100%;
        }
        .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    color: #999999;
  }
 .custom-tree-node-title-input{
    width: 120px;
    height: 20px;
    border-radius: 2px;
    border: solid 1px var(--colorBorderDefault);
    outline: none;
    box-sizing: border-box;
  }
  .cont-title{
      margin-bottom:12px;
      font-size: 14px;
      height: 30px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      i{
          cursor: pointer;
      }
  }
  .el-textarea{
      margin-bottom:20px;
  }
  .r10{
      margin-right:10px;
  }
  .save{
      margin-bottom:60px;
      display:flex;
      justify-content: flex-end;
  }
  .wordsmaxnum{
          font-size: 15px;
    color: #cccccc;
    position: absolute;
    right: 20px;
    bottom: 30px;
  }
  .customDiv{
      margin-top: 30px;
      font-size: 14px;
      margin-bottom:10px;
      cursor: pointer;
  }
  .reName{
      font-size: 12px;
      margin-left:20px;
      color:#999999;
      cursor: pointer;
  }
  .gray{
      color:#999999;
  }
  .personTitle{
    height: 20px;
    font-family: MicrosoftYaHei;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: left;
    color: #333333;
    margin-bottom: 10px;
    margin-top: 30px;
    span{
        color: #999999;
    }
  }
  .perSonStaticInfoBox{
      display: flex;
      align-items: center;
      justify-content: flex-start;
       flex-wrap:wrap;
      .personBlank{
          width: 38%;
          .el-textarea{
              width: 80%;
          }
      }
  }
  .el-tree--highlight-current>div>div>span,.is-expanded>.el-tree-node__content>span{
      color: #000;
  }
 
</style>

    