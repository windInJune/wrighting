import crypto from 'crypto'
import {URL} from 'url'
//七牛插件
import * as qiniu from 'qiniu-js'
import axios from 'axios'

/**
 * Array sort 排序
 * @param {*} obj1 ;
 * @param {*} obj2 ;
 */
function compare (obj1, obj2) {
  let val1 = obj1.sort
  let val2 = obj2.sort
  if (val1 < val2) {
    return -1
  } else if (val1 > val2) {
    return 1
  } else {
    return 0
  }
}
/**
 * 将数字转换为数字
 * @param {string} Num
 */
function arabiaToSimplifiedChinese (num) {
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']       //changeNum[0] = '零'
  let unit = ['', '十', '百', '千', '万']
  num = parseInt(num)
  let getWan = (temp) => {
    let strArr = temp.toString().split('').reverse()
    let newNum = ''
    for (var i = 0; i < strArr.length; i++) {
      newNum = (i == 0 && strArr[i] == 0 ? '' : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? '' : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum
    }
    return newNum
  }
  let overWan = Math.floor(num / 10000)
  let noWan = num % 10000
  if (noWan.toString().length < 4) noWan = '0' + noWan
  return overWan ? getWan(overWan) + '万' + getWan(noWan) : getWan(num)
}
/**
 * @param {*} api 数组序列化成JSON的key值','拼接成的字符串
 * @param {*} arr 需要序列化成JSON数组，排序必须与api排序一致
 */
function arrayReachJson (api, arr) {
  let apiArr = api.split(',')
  let obj = {}
  apiArr.forEach((item, index) => {
    obj[item] = arr[index]
  })
  return obj
}
/***
 * 计算字数的长度
 * @param {string} str
 */
function fnGetCpmisWords (str) {
  let sLen = 0;
  try{
    //先将回车换行符做特殊处理
    str = str.replace(/(\r\n+|\s+|　+)/g,"龘");
    //处理英文字符数字，连续字母、数字、英文符号视为一个单词
    str = str.replace(/[\x00-\xff]/g,"m");
    //合并字符m，连续字母、数字、英文符号视为一个单词
    str = str.replace(/m+/g,"*");
      //去掉回车换行符
    str = str.replace(/龘+/g,"");
    //返回字数
    sLen = str.length;
  }catch(e){

  }
  return sLen;
}
/**
 * 对插库内容的改。
 * 如若字符串是用'号包裹，插入内容中含有单引号，则会插入失败；
 * 必须将'更改为双'('')；
 * 根据sqlite特性，在插入库时会将''转换为'
 * 
 * 如若字符串是用"号包裹，同理如上
 * @param {string} str
 * 需要修改的字符串内容
 * @param {type} type
 * 插库使用的引号
 * " OR '
 */
function sqliteDBStrongDecode(str, type){
  let types = type||"'"
  let reg = new RegExp(types, "g")
  let  strings= str.toString().replace(reg, types+types)
  return strings
}
function hmac256(token,url,time,data) {
  var md5 = crypto.createHash('md5');
  var secretStr = token + time + new URL(url).pathname;
  var key = (md5.update(secretStr).digest('hex')).toLowerCase();
  return crypto.createHmac('sha256', key).update( (data ? JSON.stringify(data) : '') ).digest('hex');
}
/**
 *返回的时间格式：yyyy-MM-dd HH时MM分SS
 *
 * @returns
 */
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + '时' + date.getMinutes()
          + '分' + date.getSeconds() + '秒';
  return currentdate;
}
function timestamp() {
  return parseInt(new Date().getTime()/1000)
}

function handleFileSelect(evt) {
	let files = evt.target.files[0];
	if(!files.type.match('image.*')){
		this.$message({
			message: '您上传文件不是图片',
			center: true
		});
		return;
  }
  let _promise = new Promise(function(r,s){
    axios.get('http://api.chenggua.com/common/qiniu/uptoken').then(res => {
      console.log(res.data.result)
      let key = "";
      let a = new Date();
      let index = files.type;
      key = parseInt(a.getTime()) + "." + index.slice(index.indexOf("/") + 1);
      let observable = qiniu.upload(files, key, res.data.result)
      let observer = {
        next(res){
          console.log(res)
        },
        error(err){
          console.log(err)
        }, 
        complete(res){
          r(`http://img.chenggua.com/${res.key}`)
        }
      }
      observable.subscribe(observer) // 上传开始
    })
  })
	return _promise;
}
function putb64(base64_upload_data){
  let promise = new Promise(function(resolve, reject) {
      axios.get('http://api.chenggua.com/common/qiniu/uptoken').then(res => {
          base64_upload_data = base64_upload_data.replace(/^.*?base64,/, '');
          let pic = base64_upload_data;
          let url = "http://up.qiniu.com/putb64/-1"; //非华东空间需要根据注意事项 1 修改上传域名
          let xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);
          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          xhr.setRequestHeader("Authorization", "UpToken "+res.data.result+"");
          xhr.send(pic);
          xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    let obj = xhr.response
                    if (typeof obj !== 'object') {
                        obj = JSON.parse(obj);
                    }
                    let _data = {};
                    _data.data = obj;
                    resolve(_data);
                } else {
                    reject('error');
                }
            }
          }
      })
    });
    return promise;
}
export {putb64, compare, arabiaToSimplifiedChinese, arrayReachJson, fnGetCpmisWords,hmac256,timestamp, sqliteDBStrongDecode, getNowFormatDate ,handleFileSelect }
