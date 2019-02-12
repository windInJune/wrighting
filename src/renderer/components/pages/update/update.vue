<template>
	<div class="update-container">
		<div class="title-bar">{{updateMessage}}
			<i class="el-icon-close clickable-icon" @click="close"></i>
			<i class="el-icon-minus clickable-icon move-left" @click="minimize"></i>
		</div>
		<div class="update-body">
			<div class="info-panel">
				{{updateInfo}}{{releaseVersion}}
	    		<i class="el-icon-warning warning-icon"></i>
			</div>
			<div class="release-note-holder">更新日志:
				<p class="release-note" v-for="aNote in releaseNotes">{{aNote}}</p>
			</div>
			<el-progress :show-text=false :stroke-width="8" :percentage="percentage" :color="progressColor" class="progress-bar"></el-progress> 
			 <!-- v-if="downloadStatus !== 'none'" -->
			<div class="countdown-message" v-show="downloadStatus === 'none'">
				<span>{{countDownSecs}}</span>
				秒后自动开始安装
			</div>
			<div class="button-bar">
				<div class="restart-button" @click="downloadUpdate" v-show="downloadStatus === 'none'">立即更新</div>
				<div class="skip-button" @click="skip" v-show="downloadStatus === 'none' && showSkip">取消</div>
			</div>
		</div>
	</div>

</template>
<script>
  /*import {mapGetters,mapMutations} from 'vuex'*/
import { ipcRenderer, remote, MenuItem, Menu } from "electron";
  	export default {
		name: 'update',
		data () {
		    return {
		    	downloadStatus: 'none',
		    	percentage: 0,
		    	releaseNotes: [],
		    	releaseVersion: "",
		    	updateMessage: "更新提示",
		    	updateInfo: "检测到新版本",
		    	progressColor: "#fbbd36",
		    	countDownSecs: 5,
		    	showSkip: false
		    }
		},
		computed:{
		},
		methods: {
			downloadUpdate(){
				if(this.downloadStatus === 'none'){
					this.downloadStatus = "downloading"
					console.log("download update button clicked");
					ipcRenderer.send("update-now");
				}else{
					console.log("already downloading, do nothing in this case")
				}
			},

			skip(){
				console.log("skip button clicked");
				ipcRenderer.send("skip-update");
			},
			minimize(){
				console.log("minimize clicked");
				remote.getCurrentWindow().minimize();
			},
			close(){
				console.log("close clicked");
				remote.getCurrentWindow().close();
			},
			minusOneSec(){
				this.countDownSecs--;
				if(this.countDownSecs > 0){
					setTimeout(this.minusOneSec, 1000);
				}else{
					this.downloadUpdate();
				}
			},
			startCounter(){
				setTimeout(this.minusOneSec, 1000);
			}
		},
		mounted(){
			ipcRenderer.on("update-downloaded", () => {
				console.log("do fulfill");
				this.percentage = 100;	
			})

			ipcRenderer.on("release-note", (sender, arg) => {
				this.releaseVersion = arg.releaseVersion;
				this.releaseNotes = arg.releaseNote.split("\n");
				console.log("release name: " + arg.releaseName);
				let releaseNameArr = arg.releaseName.split("-")
				if(releaseNameArr.length === 2 && releaseNameArr[1] === 'h'){
					this.showSkip = false;
				}else{
					this.showSkip = true;
				}
			})

			ipcRenderer.on("download-progress", (sender, arg) => {
				this.percentage = parseInt(arg.percent);
			})

			this.startCounter()
		}
	}
</script>


<style>
.update-container .title-bar{
	width: 100%;
	height: 30px;
	background-color: #e6e7e8;
	color: #333;
	font-size: 12px;
	line-height: 30px;
	text-align: center;
	-webkit-app-region: drag;
}

.update-container .title-bar .clickable-icon{
	-webkit-app-region: no-drag;
	line-height: 30px;
	margin-right: 12px;
	position: absolute;
	right: 0px;
	cursor: pointer;
}

.update-container .title-bar .move-left{
	right: 18px;
}

.update-container .update-body{
	padding: 0px 30px;
}

.update-container .info-panel{
	box-sizing: border-box;
	height: 84px;
	padding: 40px 0px 20px 0px;
	font-size: 18px;
	line-height: 24px;
	color: #333;
}

.update-container .info-panel .warning-icon{
	float: left;
	font-size: 20px;
	line-height: 24px;
	color: #fbbd36;
	margin-right: 8px;
}

.update-container .release-note-holder{
	width: 340px;
	height: 130px;
	overflow-y: auto;
	font-size: 14px;
	line-height: 1.86;
	color: #999;
}

.update-container .progress-bar{
	width: 340px;
	margin-top: 31px;
	margin-bottom: 22px;
	border-radius: 50%;
}

.update-container .countdown-message{
	font-size: 12px;
	line-height: 16px;
	color: #999;
	text-align: right;
	margin-bottom: 12px;
}

.update-container .button-bar{
	box-sizing: border-box;
	height: 36px;
	width: 340px;
	position: fixed;
	bottom: 40px;
}

.update-container .restart-button{
	float: right;
	box-sizing: border-box;
	background-color: #3e4347;
	color: white;
	cursor: pointer;
	width: 88px;
	height: 36px;
	font-size: 14px;
	line-height: 36px;
	border-radius: 4px;
	text-align: center;
	margin-left: 20px;
}

.update-container .skip-button{
	float: right;
	box-sizing: border-box;
	background-color: #f3f3f3;
	border: 1px solid #ddd;
	cursor: pointer;
	width: 88px;
	height: 36px;
	font-size: 14px;
	line-height: 36px;
	border-radius: 4px;
	text-align: center;
}
</style>