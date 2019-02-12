<template>
	<div class="music-holder">
		<div class="title-bar">
	        <li><i @click="close" class="close-button iconfont icon-guanbichuangkou1" style="font-size:13px"></i></li>
	        <li><i @click="min" class="min-button iconfont icon-zuixiaohua" style="font-size:13px"></i></li>
		</div>
		<div style="width: 1100px; height: 750px; overflow-y: hidden">
			<webview src="https://music.163.com/" style="width: 1100px; height: 718px"></webview>
		</div>
	</div>
</template>

<script>
import { remote, ipcRenderer } from "electron";
let webview = null

export default{
	name: 'music',
	data() {
		return {

		}
	},
	computed: {
	},
	methods: {
		min(){
			remote.getCurrentWindow().hide();
		},
		close(){
			ipcRenderer.send('hide-bubble');
			remote.getCurrentWindow().close();
		}
	},
	created(){

	},
	mounted(){
		this.$nextTick(function(){
			webview = document.querySelector('webview');
			webview.addEventListener("dom-ready", function(){
				console.log("curURL: " + webview.getURL());
				// webview.loadURL("https://www.baidu.com/");
			});

			webview.addEventListener("will-navigate", function(url){
				console.log("it's trying to navigate to: ")
				console.log(url);
			});

			webview.addEventListener("new-window", function(e){
				console.log("a new window event: ");
				console.log(e);
				console.log(e.url);
			});


		})
	},
	beforeUpdate(){

	}
}


</script>

<style>
.music-holder {
	overflow-x: hidden;
}

.min-button {
	line-height: 32px;
	float: right;
	margin-right: 10px;
}

.close-button {
	line-height: 32px;
	float: right;
	margin-right: 20px;
}
</style>