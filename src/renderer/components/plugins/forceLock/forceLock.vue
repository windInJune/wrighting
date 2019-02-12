<template>
<my-dialog :width="dialoginf.width" :height="dialoginf.height" :title="dialoginf.title" v-on:closeDialog="closeDialog">
	<div>
		<el-tabs class="force-lock" @tab-click="handleClick">
			<el-tab-pane v-for="(item, index) in navs" :key="item.id" :label="item.title" :name="item.tabIndex">
				<div class="main-container">
					<div class="type-bar">
						<div class="type-description">{{item.typeName}}</div>
						<el-tooltip class="question-mark" :content="item.help" placement="right" effect="light" popper-class="help">
							<el-button>?</el-button>
						</el-tooltip>
					</div>
					<div class="date-container" v-if="item.name === 'clock'">
						<div class="left-part">定时任务日期</div>
						<div class="right-part">
							<div class="radio-container">
								<el-radio v-for="radio in item.radios" v-model="item.radioInput" :label="radio.label">{{radio.name}}</el-radio>
							</div>
							<div class="date-picker">
								<el-date-picker v-model="item.dateInput" type="daterange" range-separator="至" unlink-panels :picker-options="pickerOptions0" size="small"></el-date-picker>
							</div>
							<div class="dropdown">
								<el-dropdown trigger="click" placement="bottom" size="small">
									<el-button>
										{{item.hrInput}}<i class="el-icon-arrow-down el-icon--right"></i>
									</el-button>
									<el-dropdown-menu slot="dropdown" class="goodone">
										<el-dropdown-item v-for="hr in hrs">{{hr}}</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</div>
						</div>
					</div>
					<div class="input-bar">
						<div class="input-bar-description">{{item.inputDescription}}</div>
						<input type="number" v-model="item.inputValue" class="input-box" :step="item.name === 'word' ? 1000 : 1">   
						<div class="input-unit">{{item.inputUnit}}</div>
						<div class="save-button" :class="item.inputValue > 0?'save-text':'no-save'" v-if="index < 2" @click="saveSetting(item.name, item.inputValue)">保存</div>
					</div>
					<div class="input-bar" v-if="item.name === 'mix'">
						<div class="input-bar-description">{{item.additionalDescription}}</div>
						<input type="number" v-model="item.additionalValue" class="input-box">
						<div class="input-unit">{{item.additionalUnit}}</div>
						<!-- <div class="save-button" :class="item.additionalValue > 0?'save-text':'no-save'" v-if="index < 2">保存</div> -->
					</div>
					<div class="secondary-container" v-if="index < 2">
						<div class="type-bar" v-if="item.secondaryName">
							<div class="type-description">{{item.secondaryName}}</div>
							<el-tooltip class="question-mark" :content="item.secondaryHelp" placement="right" effect="light" popper-class="help">
								<el-button>?</el-button>
							</el-tooltip>
						</div>
						<div class="input-bar">
							<div class="input-bar-description">{{item.secondaryDescription}}</div>
							<input type="number" v-model="item.secondaryInputValue" class="input-box">
							<div class="input-unit">{{item.inputUnit}}</div>
						</div>
					</div>
					<div class="confirm-button" @click="confirm(item)">确定
					</div>
				</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</my-dialog>
</template>

<script>
import { Tabs } from "element-ui";
import myDialog from "@/components/pages/dialog/dialog";
const store = require('store/dist/store.modern');
const lockLimit = {
	minimumWordLimit: 1000,
	minimumTimeLimit: 10,
	wordLimitRange: {
		low: 3000,
		high: 300000
	},
	timeLimitRange: {
		low: 180,
		high: 1440
	}
}
export default {
	data (){
		return {
			// wordInput: '',
			pickerOptions0: {
				disabledDate(time) {
					return time.getTime() < Date.now() - 8.64e7;
				}
			},
            dialoginf: {
              width: 540,
              height: 444,
              title: "强制锁定"
            },
            dateWhenOpen: new Date(),
            lockObject: {
            	type: '',
            	wordLimit: '',
            	timeLimit: ''
            },
            hrs:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
            navs: [{
                    title: '字数锁定',
                    id: 'wordCountLock',
                    tabIndex: '0',
                    name: 'word',
                    typeName: '锁定字数上限',
                    inputDescription: '上限字数',
                    inputValue: store.get("wordLimit") ? store.get("wordLimit") : 3000,
                    inputUnit: '字',
                    secondaryName: '设置锁定字数',
                    secondaryDescription: '锁定字数',
                    secondaryInputValue: store.get("formerwordSetting") ? store.get("formerwordSetting") : 1000,
                    secondaryInputUnit: '字',
                    lockText: '字数',
                    help: "1. 设置上限后，大于该上限的锁定一律到上限字数时自动解锁；如未设置上限，则无上限锁定字数。 2. 建议设置上限字数，避免误锁定！",
                    secondaryHelp: "1. 点击确定后立即启动；2. 复制黏贴不算字数；3. 当锁定后码字字数达到该数值时将立即解锁；4. 否则无论关机还是重启都不会解锁，请谨慎设置！"
                },
                {
                    title: '时间锁定',
                    id: 'timeElaplock',
	                tabIndex: '1',
                    name: 'time',
                    typeName: '锁定时间上限',
                    inputDescription: '上限时间',
                    inputValue: store.get("timeLimit") ? store.get("timeLimit") : 180,
                    inputUnit: '分钟',
                    secondaryName: '设置锁定时间',
                    secondaryDescription: '锁定时间',
                    secondaryInputValue: store.get("formertimeSetting") ? store.get("formertimeSetting") : 10,
                    secondaryInputUnit: '分钟',
                    lockText: '分钟',
                    help: "1. 设置上限后，大于该上限的锁定一律到上限时间时自动解锁；如未设置上限，则无上限锁定时间。2. 建议设置上限时间，避免误锁定！",
                    secondaryHelp: "1. 点击确定后立即启动；2. 空闲时间不计入锁定时间；3. 当锁定后码字时间达到该数值时将立即解锁；4. 否则无论关机还是重启都不会解锁，请谨慎设置！"
                },
      //           {
      //               title: '混合锁定',
      //               id: 'mixtureLock',
	     //            tabIndex: '2',
      //               name: 'mix',
      //               typeName: '字数-时间混合锁定',
      //               inputDescription: '锁定时间',
      //               inputValue: 0,
      //               inputUnit: '分钟',
      //               additionalDescription: '锁定字数',
      //               additionalValue: 0,
      //               additionalUnit: '字',
      //               help: "1. 点击确定后立即启动；2. 空闲时间不计入锁定时间；3. 复制黏贴不算字数；4. 当锁定后码字时间达到该数值时将立即解锁；5. 时间和字数中任意一个达到设置的数值后都都将自动解锁；6. 如若其中任意一个达到锁定上限时也将自动解锁；7. 否则无论关机还是重启都不会解锁，请谨慎设置！"
      //           },
      //           {
      //               title: '定时锁定',
      //               id: 'dateTimeLock',
	     //            tabIndex: '3',
      //               name: 'clock',
      //               typeName: '定时任务锁定',
      //               inputDescription: '假如没有完成',
      //               inputValue: 0,
      //               inputUnit: '字, 其余字数将进入锁定',
      //               help: '1. 点击确定后该任务即设置成功；2. 在设置的日期范围内如没有完成填写的字数，软件将立即进入锁定状态；3. 锁定的字数为差额字数，如设置20点之前完成5000字，但到20点时只完成了3650字，则锁定1350字，需完成后才能解锁；且复制黏贴不算字数4. 无论关机还是重启都不会解锁，请谨慎设置！5. 点击取消后清除已设置的任务，恢复为默认值。',
      //               radioInput: '',
      //               dateInput: [new Date(), new Date()],
      //               hrInput: new Date().getHours(),
      //               radios: [{
      //               	name: '今日',
						// label: 'today'
      //               }, {
      //               	name: '七日',
      //               	label: 'week'
      //               }, {
      //               	name: '每日',
      //               	lable: 'everyday'
      //               }, {
      //               	name: '固定日期',
      //               	label: 'date'
      //               }],
      //               startTime: '请输入日期',
      //               endTime: '请输入日期'
      //           }
            ],
		}
	},
	methods: {
		handleClick(tab, event){
			console.log("tab clicked");
			console.log(tab);
			// console.log("cur page input: " + this.navs[tab.index].inputValue);
			// // console.log(event);
			// if(this.navs[parseInt(tab.index)].title === "定时锁定"){
			// 	// this.dateWhenOpen = new Date();
			// 	// this.navs[parseInt(tab.index)].dateInput = new Date();
			// }
		},
        closeDialog(type) {
        	console.log("close dialog called");
        	this.$emit("closeForceLock", type, this.lockObject);
        },
        saveSetting(type, limit){
        	if(!limit){
        		this.$message({showClose: true, message: `请输入有效的上限`,type: 'error'});
        		return;
        	}else{
        		if(limit.toString() !== parseInt(limit).toString()){
        			this.$message({showClose: true, message: `请输入有效的数字`,type: 'error'});
        			return;   			
        		}
        	}
        	let tempComp = '';
        	let tempUnit = '';
        	if(type === 'word' || type === 'time'){
	    		let tempRange = lockLimit[`${type}LimitRange`];

				if(limit < tempRange.low || limit > tempRange.high){
    				if(type === 'word'){
                		this.$message({showClose: true, message: `请填写最少${tempRange.low},最多${tempRange.high}的字数上限`,type: 'error'});
                		return;
                	}else if(type === 'time'){
                		this.$message({showClose: true, message: `请填写最少${tempRange.low},最多${tempRange.high}的分钟上限`,type: 'error'});	
                		return;
                	}
	            }
        		// tempComp = lockLimit[`minimum${type[0].toUpperCase()+type.substr(1)}Limit`];
        		// tempUnit = (type === 'word') ? "字":"分钟";
        		// if(limit < tempComp){
          //       	this.$message({showClose: true, message: `上限至少为${tempComp}${tempUnit}`,type: 'error'});
        		// 	return;
        		// }
        	}
        	// }else if(type === 'time'){
        	// 	if(limit < minimumTimeLimit){
         //        	this.$message({showClose: true, message: `上限至少为${minimumTimeLimit}分钟`,type: 'error'});
         //        	return;       			
        	// 	}
        	// }
        	store.set(`${type}Limit`, limit);
        	this.$message({showClose: true, message: `上限已保存为${limit}${tempUnit}`,type: 'success'});
        },
        confirm(item){
        	console.log("confirm button clicked: ");
        	console.log(item);
        	if(!item.secondaryInputValue){
        		this.$message({showClose: true, message: `请输入有效的数字`,type: 'error'});
        		return;     		
        	}else{
        		//deal with nums like 1e7
        		if(item.secondaryInputValue.toString() !== parseInt(item.secondaryInputValue).toString()){
        			this.$message({showClose: true, message: `请输入有效的数字`,type: 'error'});
        			return;      			
        		}
        	}

        	if(item.name === 'word' || item.name === 'time'){
        		let tempComp = lockLimit[`minimum${item.name[0].toUpperCase()+item.name.substr(1)}Limit`];
        		console.log("locklimit is: ");
        		console.log(lockLimit);
        		console.log("item name is: " + item.name);
        		let tempRange = lockLimit[`${item.name}LimitRange`];
        		console.log("tempRange is: ");
        		console.log(tempRange);
        		if(parseInt(item.secondaryInputValue) < tempComp){
                	this.$message({showClose: true, message: `锁定${item.lockText}至少为${tempComp}${item.secondaryInputUnit}`,type: 'error'});
        			return;        			
        		}else if(item.inputValue < tempRange.low || item.inputValue > tempRange.high){
        				if(item.name === 'word'){
	                		this.$message({showClose: true, message: `请填写最少${tempRange.low},最多${tempRange.high}的字数上限`,type: 'error'});
	                	}else if(item.name === 'time'){
	                		this.$message({showClose: true, message: `请填写最少${tempRange.low},最多${tempRange.high}的分钟上限`,type: 'error'});	
	                	}
        				return;
        		


        		}else{
        			this.lockObject.type = item.name;
        			this.lockObject[`${item.name}Limit`] = ((parseInt(item.secondaryInputValue) > parseInt(item.inputValue)) && (parseInt(item.inputValue) !== 0)) ? parseInt(item.inputValue) : parseInt(item.secondaryInputValue);
        			store.set(`former${item.name}Setting`, item.secondaryInputValue);
        			console.log("lock obj");
        			console.log(this.lockObject);
                	this.$message({showClose: true, message: `进入强制锁定模式：目标${this.lockObject[`${item.name}Limit`]}${item.secondaryInputUnit}`,type: 'warning'});
        			this.closeDialog(false);
        		}
        	}else if(item.name === 'mix'){
     		
        	}
        }	
	},
	components: {
		myDialog
	}
}	
</script>
<style>

.goodone{
	height: 200px;
	overflow-y: scroll;
	overflow-x: hidden;
	margin-top: 0px;
	width: 60px;
	position: relative;
	left: -5px;
	/*no good important*/
	margin-top: 0px !important;
}

.help{
	width: 314px;
	height: auto;
}

.save-text{
	color: #333;
	cursor: pointer;
}
.no-save{
	color: #999;
	cursor: auto;
}

.force-lock .main-container{
	width: 460px;
	height: 283px;
	// background-color: red;
	padding: 25px 40px 40px 40px;
}

.force-lock .main-container .date-container{
	height: 95px;
	// background-color: red;
	margin-bottom: 30px;
	overflow: hidden;
}

.force-lock .main-container .date-container .left-part{
	float: left;
	width: 92px;
	// background-color: orange;
	font-size: 14px;
	line-height: 19px;
}

.force-lock .main-container .date-container .right-part{
	height: 95px;
	// background-color: blue;
	margin-left: 92px;
}

.force-lock .main-container .date-container .right-part .radio-container{
	height: 19px;
}

.force-lock .main-container .date-container .right-part .date-picker{
	margin-top: 10px;
}

.force-lock .main-container .date-container .right-part .dropdown{
	margin-top: 10px;
}

.force-lock .main-container .date-container .right-part .dropdown .el-dropdown-selfdefine{
	width: 60px;
	height: 26px;
	text-align: center;
	padding: 0px;
}

.force-lock .main-container .confirm-button{
	width: 88px;
	height: 36px;
	border-radius: 4px;
	background-color: #3e4347;
	text-align: center;
	font-size: 14px;
	line-height: 36px;
	color: white;
	position: absolute;
	bottom: 40px;
	right: 40px;
	cursor: pointer;
}

.force-lock .main-container .secondary-container .type-bar,
.force-lock .main-container .type-bar{
	font-size: 18px;
	height: 24px;
	line-height: 24px;
	color: #333;
	margin-bottom: 26px;
}

.force-lock .main-container .secondary-container .type-bar .type-description,
.force-lock .main-container .type-bar .type-description{
	width: auto;
	float: left;
}

.force-lock .main-container .secondary-container .type-bar .question-mark,
.force-lock .main-container .type-bar .question-mark{
	padding: 0px;
	margin-top: 2px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.13);
	margin-left: 8px;
	// background-color: blue;
	float: left;
	font-size: 12px;
	line-height: 20px;
	font-family: STYuanti-TC;
	font-weight: bold;
	text-align: center;
}

.force-lock .main-container .secondary-container .input-bar,
.force-lock .main-container .input-bar{
	overflow: hidden;
}

.force-lock .main-container .input-bar + .input-bar{
	margin-top: 18px;
}

.force-lock .main-container .secondary-container .input-bar .input-bar-description,
.force-lock .main-container .input-bar .input-bar-description{
	float: left;
	font-size: 14px;
	line-height: 26px;
}

.force-lock .main-container .secondary-container .input-bar .input-box,
.force-lock .main-container .input-bar .input-box{
	box-sizing: border-box;
	float: left;
	width: 120px;
	height: 26px;
	border: 1px solid #d9d9d9;
	border-radius: 4px;
	margin: 0px 8px;
	padding: 3px 8px;
}

.force-lock .main-container .secondary-container .input-bar .input-unit,
.force-lock .main-container .input-bar .input-unit{
	float: left;
	font-size: 14px;
	line-height: 26px;
}

.force-lock .main-container .input-bar .save-button{
	margin-left: 30px;
	font-size: 14px;
	line-height: 26px;
	float: left;
}

.force-lock .main-container .secondary-container{
	width: 460px;
	border-top: 1px solid #edeff3;
	margin-top: 46px;
	padding-top: 40px;
}


.force-lock .el-tabs__nav-scroll{
    padding-left: 40px;
    height: 50px;
    line-height: 50px;
}

.force-lock .el-tabs__item{
    color: #999999;
}

.force-lock .el-tabs__item.is-active{
    color: #333333;
}

.force-lock .el-input__inner{
	height: 26px;
}
.force-lock .el-input__inner .el-range-separator,
.force-lock .el-input__inner .el-range__icon{
	position: relative;
	top: -2px;
}

</style>