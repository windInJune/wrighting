<template>
    <myDialog  :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title"
				@closeDialog="closeDialog">
        <el-container>
            <el-aside width="179px" class="set-el-aside">
                <ul @click="activeIndex($event)">
                    <li :class="active_id == 'backup' ? 'active default' : 'default'" id="backup">本地备份</li>
                    <li :class="active_id == 'recovery' ? 'active default' : 'default'" id="recovery" v-show="false">恢复模式</li>
                    <li :class="active_id == 'typesetting' ? 'active default' : 'default'" id="typesetting">排版格式</li>
                    <!-- <li :class="active_id == 'typing' ? 'active default' : 'default'" id="typing">打字特效</li> -->
                    <!-- <li :class="active_id == 'saveSetting' ? 'active default' : 'default'" id="saveSetting">保存设置</li> -->
                </ul>
            </el-aside>
            <el-main class="set-el-main" style="padding: 0px">
                <div v-show="active_id == 'backup'">
                	<div class="backup-holder">
	                    <div class="description">文本保存位置</div>
                        <div class="outer-scroll-eater">
                            <div class="path-container">{{backUpFolderPath}}</div>
                        </div>
	                    <div class="openFolderBtn" @click="openFolder">查看</div>
               		</div>
<!--                     <div class="checkbox-row"><el-checkbox v-model="checked" >选中文字时不显示选中字数</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >打开时默认全屏显示</el-checkbox></div>
                    <div class="checkbox-row"><el-checkbox v-model="checked" >开启版本自动更新</el-checkbox></div> -->
                </div>
                <div v-show="active_id == 'recovery'">
                    <div class="recovery-header">现有的本地库
                    	<i class="el-icon-loading" v-if="scanning"></i>
                    </div>
                    <div class="no-backup-db" v-if="backedDB.length === 0">未查询到有本地库镜像</div>
                    <div class="db-container">
                        <div :class="aBackedDb.selected === true ? 'db-item active-db-item': 'db-item'" v-for="(aBackedDb, index) in backedDB" :key="aBackedDb.id" @click="selectDB(index)">
                            <div class="db-name">{{aBackedDb.displayName}}</div>
                            <!-- <div class="select-btn" @click="selectDB(aBackedDb)">选择</div> -->
                        </div>
                    </div>
                    <div class="button-bar">
                        <div class="confirm-button" @click="confirmDB">确定</div>
                        <div class="cancel-button" @click="closeDialog">取消</div>
                    </div>
                </div>
                <div v-show="active_id == 'typesetting'">
                    <div class="text-align-container">
                        <div class="checkbox-row"><el-checkbox v-model="indentChecked" @change="handleCheckChange">行首自动空两个字</el-checkbox></div>
                        <div class="checkbox-row"><el-checkbox v-model="lineChecked" @change="handleCheckChange">段落之间自动空一行</el-checkbox></div>
                    </div>
                </div>
            </el-main>
        </el-container>
    </myDialog>
</template>


<script>
import myDialog from "@/components/pages/dialog/dialog";
import { remote, shell } from "electron";
import {mapActions,mapMutations, mapGetters} from 'vuex'
const store = require('store/dist/store.modern');
const path = require('path');
const fs = require('fs-extra');

export default {
	data () {
		return {
            dialoginf: {
              width: 750,
              height: 450,
              title: "基础设置"
            },
            checked: false,
            active_id: 'backup',
            backUpFolderPath: '',
            backedDB: [],
            scanning: false,
            indentChecked: true,
            lineChecked: true,
            selectedDBIndex: null
		}
	},
	methods: {
        ...mapMutations({
            UPDATE_TYPE_SETTING: 'UPDATE_TYPE_SETTING'
        }),
        activeIndex (event){
            event = window.event || event || e;
            var target = event.target || window.event.srcElement;
            // 下面是获取属性id，因为每个菜单项都有一个标识id，那么可以根据id来做不同的处理
            var id = target.getAttribute('id');
            this.active_id = id;

        },

        selectDB(index){
            if(this.selectedDBIndex !== null) this.backedDB[this.selectedDBIndex].selected = false;
            console.log("index: " + index);
            console.log("select db: ");
            console.log(this.backedDB[index]);
            this.backedDB[index].selected = true;
            this.selectedDBIndex = index;
            // if(this.backedDB[index]){
            //     store.set("use-db", this.backedDB[index].fileName);
            // }
        },

        confirmDB(){
            if(this.selectedDBIndex !== null){
                store.set("use-db", this.backedDB[this.selectedDBIndex].fileName);
                console.log("this db path is: " + this.backedDB[this.selectedDBIndex].filePath);
                let selectedDBPath = path.join(this.backUpDBPath, this.backedDB[this.selectedDBIndex].filePath);
                console.log("exe path is: " + remote.app.getPath('exe'));
                let userDataRelativeLoc = process.env.NODE_ENV === 'development' ? (process.platform==='win32'?'../../../../userData/':'../../../../../../../userData/') : 'resources/userData/'
                let destDBPath = path.join(remote.app.getPath('exe'), `${userDataRelativeLoc}${this.backedDB[this.selectedDBIndex].filePath}`);
                console.log("selected db path is: " + selectedDBPath);
                console.log("destDBPath is: " + destDBPath);
                fs.copy(selectedDBPath, destDBPath, (err) => {
                    if(err){
                        console.log("backup db copy to userdata failed due to ");
                        console.log(err);
                    }else{
                        console.log("backup db copied to right folder")
                    }

                })
            }else{
                this.$message({showClose: true, message: '请选择一个本地库',type: 'error'});
            }
        },

        closeDialog() {
        	console.log("close settings dialog called");
        	this.$emit("closeSettings");
        },

        openFolder() {
            // shell.showItemInFolder(this.backUpFolderPath);
            fs.stat(this.backUpFolderPath, (err, stats) => {
                if(err){
                    this.$message({showClose: true, message: '找不到指定的文件夹', type: 'error'})
                    return;
                }
                shell.openItem(this.backUpFolderPath);
            })

        },

        scanDBFolder() {
        	console.log("should scan local db folder to get backed up DBs");
        	this.scanning = true;
        	fs.readdir(this.backUpDBPath, (err, files) => {
        		if(err){
	        		console.log(err.message);
	        		console.log(err.code);
	        		if(err.code !== 'ENOENT'){
	        			this.$message({showClose: true, message: '扫描备份库失败',type: 'error', iconClass: "none"});
	        			return;
	        		}else{
	        			fs.mkdir(this.backUpDBPath, (err) => {
	        				if(err){
	        					console.log("mk dir error")
	        					console.log(err);
	        				}
	        			})
        			}
        		}

        		if(files){
        			files.forEach((aFile) => {
        				console.log(aFile);
                        if(path.extname(aFile) === '.db'){
                            let basename = path.basename(aFile, '.db')
                            let tempArr = basename.split("-");
                            if(tempArr.length === 2 && tempArr[0] === this.GET_USET_DATA.uid.toString()){
                                let modTime = new Date(parseInt(tempArr[1]));
                                // let displayName = `${modTime.getFullYear()}年${modTime.getMonth()+1}月${modTime.getDate()}${modTime.toLocaleTimeString()}`
                                let displayName = modTime.toLocaleString('zh-CN', {hour12:false});
                                this.backedDB.push({fileName: aFile, displayName: displayName, selected: false, filePath: aFile})
                            }
                        }
        			})

                    console.log("lets say backedDB: ");
                    console.log(this.backedDB);

                    this.scanning = false;

        		}


        		// console.log(files);
        	})


        },

        handleCheckChange(val){
            console.log('indentChecked',this.indentChecked)
            console.log('lineChecked',this.lineChecked)

            var settingData = store.get('typeSetting') || {}
            settingData[this.GET_USET_DATA.uid] = {indent: this.indentChecked, line: this.lineChecked}
            store.set('typeSetting',settingData)
            this.UPDATE_TYPE_SETTING({indent: this.indentChecked, line: this.lineChecked})
        }
	},

	mounted() {
		// this.backUpFolderPath
		this.backUpFolderPath = path.join(remote.app.getPath("documents"), `橙瓜码字文稿备份/${this.GET_USET_DATA.nickname}-${this.GET_USET_DATA.uid}`);
		this.backUpDBPath = path.join(remote.app.getPath("documents"), `橙瓜码字文稿备份/${this.GET_USET_DATA.nickname}-${this.GET_USET_DATA.uid}/书籍备份`);

        this.scanDBFolder();
        
        var typeSetting = store.get('typeSetting')
        if(typeSetting){
            if(typeSetting[this.GET_USET_DATA.uid]){
                this.indentChecked = typeSetting[this.GET_USET_DATA.uid].indent
                this.lineChecked = typeSetting[this.GET_USET_DATA.uid].line
                // this.UPDATE_TYPE_SETTING({indent: this.indentChecked, line: this.lineChecked})
            }
            
        }

	},

	computed: {
	    ...mapGetters({
	      GET_USET_DATA: 'user/GET_USET_DATA',
	      GET_TYPE_SETTING: 'GET_TYPE_SETTING'
	    })
	},

	components: {
		myDialog
	}
}

</script>

<style scoped>
    .container{
        font-family: "微软雅黑";
    }
    .set-el-aside {
        color: #333;
        height: 420px;
        border-right: solid 1px #edeff3;
        background-color: #f5f7f9;
    }
    .set-el-aside ul{
        margin: 40px 0 0 56px;
    }
    .set-el-aside ul li{
        font-size: 14px;
        display: block;
        width: auto;
        height: 50px;
        line-height: 50px;
        position: relative;
        cursor: pointer;
    }
    .default{
        color: #999999;
    }
    .active{
        color:#333333;
    }
    .active:after{
        content: "";
        height: 10px;
        width: 10px;
        background: #fbbd36;
        border-radius: 50%;
        display: block;
        clear: both;
        position: absolute;
        left: -18px;
        top:19px;
    }
    .set-el-main {
        color: #333;
        height: 420px;
    }

    .set-el-main .no-backup-db {
    	margin-top: 20px;
    }

    .set-el-main .recovery-header {
        height: 60px;
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid #d8d8d8;
        font-size: 14px;
        font-weight: bold;
        color: #333;
        line-height: 60px;
        padding-left: 40px;
    }

    .set-el-main .db-container {
        height: 246px;
        overflow-y: auto;
    }

    .set-el-main .db-container .db-item{
        display: block;
        height: 40px;
        padding-left: 40px;
        line-height: 40px;
        border-bottom: 1px solid #d8d8d8;
        cursor: pointer;
    }

    .set-el-main .db-container .active-db-item {
        background-color: #fafafa;
    }

    .set-el-main .db-container .db-item .db-name{
        display: inline-block;
        float: left;
    }

    .set-el-main .db-container .db-item .select-btn{
        display: inline-block;
        float: right;
        margin-right: 20px;
        background-color: rgba(217, 217, 217, 1);
        padding: 0px 5px;
        border-radius: 3px;
        cursor: pointer;
    }

    .set-el-main .button-bar {
        height: 36px;
        line-height: 36px;
        margin-top: 37px;
        padding-right: 30px;
    }

    .set-el-main .button-bar .confirm-button {
        float: right;
        background-color: #3e4347;
        width: 88px;
        height: 36px;
        line-height: 36px;
        border-radius: 4px;
        text-align: center;
        color: white;
        cursor: pointer;
    }

    .set-el-main .button-bar .cancel-button {
        float: right;
        background-color: #f3f3f3;
        width: 88px;
        height: 36px;
        line-height: 36px;
        border-radius: 4px;
        text-align: center;
        margin-right: 20px;
        cursor: pointer;
    }

    .set-el-main .text-align-container {
        padding: 55px 0px 0px 40px;
    }

    .set-el-main .backup-holder {
    	height: 100px;
    	width: 100%;
        padding-top: 55px;
        padding-left: 40px;
    }

    .set-el-main .backup-holder .outer-scroll-eater {
        box-sizing: border-box;
        width: 222px;
        height: 30px;

        margin-left: 10px;
        float: left;
        overflow: hidden;
    }

    .set-el-main .backup-holder .path-container {
        box-sizing: border-box;
        width: 222px;
        height: 33px;
        line-height: 30px;
        text-align: center;
        white-space: nowrap;
        padding: 0px 8px;
        overflow-x: auto;
        overflow-y: hidden;
        background-color: #f5f7f9;
        -webkit-user-select: text;
    }

    .set-el-main .description {
        margin-top: 3px;
    	float: left;
        color: #999;
    }

    .set-el-main .openFolderBtn {
    	width: 50px;
    	height: 30px;
    	text-align: center;
    	line-height: 30px;
    	border-radius: 5px;
    	float: left;
    	margin-left: 10px;
        margin-top: 0px;
    	cursor: pointer;
    }

    .el-checkbox{
        color: #333333;
        font-size: 14px;
    }
    .el-checkbox__input.is-checked+.el-checkbox__label {
        color: #333333;
        font-size: 14px;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #fbbd36;
        border-color: #fbbd36;
    }
    .el-checkbox__input.is-focus .el-checkbox__inner{
        border-color: #d9d9d9;
    }


    .el-checkbox__inner{
        width: 18px;
        height:18px;

    }
    .el-checkbox__inner::after {
        -webkit-box-sizing: content-box;
        box-sizing: content-box;
        content: "";
        border: 1px solid #fff;
        border-left: 0;
        border-top: 0;
        height: 9px;
        left: 6px;
        position: absolute;
        top: 2px;
    }
    .el-checkbox__inner:hover{
        border: 1px solid #d9d9d9;
    }
    .checkbox-row:first-child{
        margin-top: 0;
    }

    .checkbox-row{
        margin-top: 25px;
    }
    .saveTitle{
        color: #333333;
        font-size: 18px;
    }
    .custom-text{
        width: 45px;
        height: 20px;
        border: solid 1px #d9d9d9;
        outline: none;
        border-radius: 4px;
        text-align: center;
        margin: 0 4px 0 7px;
    }
    .location-text{
        width: 200px;
        height:28px;
        border: solid 1px #d9d9d9;
        outline: none;
        border-radius: 4px;
        margin-left: 12px;
    }
    .interval{
        font-size: 14px;
        margin-left: 30px;
        margin-top: 15px;
    }
    .location-box{
        margin-top: 50px;
    }
    .location-box span:first-child{
        font-size: 14px;
        color: #999999;
    }
    .location-box span:nth-of-type(2){
        font-size: 14px;
        color: #333333;
        cursor: pointer;
        margin-left: 10px;
    }
</style>