<template>
<el-dialog :visible=true width="540px" modal :show-close="waitingType === 'imported' || waitingType === 'exported'" class="waiting" :before-close="close">
	 <!-- :title="waitingMessage"  -->
	<!-- <p>{{waitingMessage}}</p> -->
	<div class="icon-holder">
	    <i class="el-icon-circle-check done-icon" v-if="waitingType === 'imported' || waitingType === 'exported'"></i>
	    <i class="el-icon-loading waiting-icon" v-if="waitingType === 'import' || waitingType === 'export'"></i>
<!-- 	    <div class="dots">
	    	<span class="dot">.</span>
	    	<span class="dot">.</span>
	    	<span class="dot">.</span>
	    </div> -->
	    <span class="message">{{waitingMessage}}</span>
	</div>
	<div v-if="waitingType === 'import' || waitingType === 'imported'">
		<div class="error-container">
			<div class="error-list">
				<p v-for="oneDetail in importFileDetail"><span class="chapter-name">{{oneDetail.name}}</span>导入文本<span class="red">{{oneDetail.error}}</span>{{oneDetail.operation}}</p>
				<p v-if="waitingType === 'imported' && importFileDetail.length === 0">真棒！都导入成功了</p>
			</div>
		</div>
		<div class="button-bar">
			<div class="button" v-if="waitingType === 'imported'" @click="close()">知道了
			</div>
		</div>
	</div>
</el-dialog>
</template>

<script type="text/javascript">
	
	export default {
	    name: '',
	    props: {
	        waitingMessage: String,
	        waitingType: String,
	        importFileDetail: Array,
	    },
	    data () {
	        return {
	        	//nothing here
	        }
	    },
	    methods: {
	    	close(){
	    		console.log("waiting close clicked");
	    		this.$emit('toggle-waiting-modal',  {value:false, type: 'confirm'});
	    	}
	    }
	}




</script>

<style>

.waiting {
	font-size: 16px;
	color: #333;
}

.waiting .icon-holder{
	width: 423px;
	margin-bottom: 6px;
}

.waiting .icon-holder .dots{
	width: 20px;
	height: 20px;
	border-radius: 10px;
	background-color: rgb(96, 98, 102);
	margin-left: 20px;
	color: white;
	line-height: 20px;
}

.waiting .icon-holder .dots .dot{
	color: white;
	position: relative;
	left: -4px;
	top: -4px;
	float: left;
}

.waiting .error-container{
	height: 227px;
	padding: 31px 0px;
	box-sizing: border-box;
	margin-right: 17px;
}

.waiting .error-container .error-list{
	height: 159px;
	overflow-y: auto;
}

.waiting .error-container .error-list .chapter-name{
	overflow: hidden;
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
	float: left;
}

.waiting .error-container .error-list .red{
	color: red;
}

.waiting .error-container .error-list p{
	height: 19px;
	line-height: 19px;
	font-size: 14px;
	color: #333;
}

.waiting .error-container .error-list p + p{
	margin-top: 16px;
}

.waiting .button-bar{
	height: 36px;
}

.waiting .button-bar .button{
	width: 88px;
	height: 36px;
	background-color: #f3f3f3;
	color: #666;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	line-height: 36px;
	text-align: center;
	box-sizing: border-box;
	float: right;
	cursor: pointer;
}

.waiting .waiting-icon{
	margin: auto;
	font-size: 18px;
}

.waiting .done-icon{
	font-size: 20px;
	float: left;
	margin-right: 8px;
	margin-top: 2px;
}

.waiting .message{
	line-height: 24px;
	font-size: 18px;
	color: #333;
}

.waiting .el-dialog__body{
	height: auto;
	padding: 13px 30px 40px 70px;
}

</style>