<template>
   <div class="main">
       <div class="topOutBox">
        <ul class="statisticsTop" >
            <li :class="[type == 1?'active':'']"  @click="changeType(1)">字数</li>
            <li :class="[type == 2?'active':'']"  @click="changeType(2)">时间</li>
            <li :class="[type == 3 || type == 4?'active':'']" @click="changeType(3)">速度</li>
        </ul>
        <el-tooltip class="item" effect="dark" content="码字速度=码字总字数÷码字时长，不计入空闲时长；真实速度=码字总字数÷总时长，计入空闲时长。" placement="left">
              <img :src="wenhao" alt="">
        </el-tooltip>
       </div>
       <div class="bottomBox" id="echartsbox">
           <div class="bottomBoxTop">
               <div class="t_bs">
                   <strong>{{others[0]}}</strong>
                   <p>{{rankData[0]}}</p>
               </div>
               <div class="t_bs">
                   <strong>{{others[1]}}</strong>
                   <p>{{rankData[1]}}</p>
               </div>
               <div class="t_bs">
                   <strong>{{others[2]}}</strong>
                   <p>{{rankData[2]}}</p>
               </div>
               <div class="t_bs">
                   <strong>{{others[3]}}</strong>
                   <p>{{rankData[3]}}</p>
               </div>
           </div>
           <div class="bottomBoxBottom">
                <div class="title">
                    <strong>{{times}}日码字{{title}}统计图</strong>
                    <div class="maziSudo" v-show="type == 3 || type == 4">
                        <span :class="[type == 3?'active':'']"  @click="changeType(3)">码字速度</span>
                        <span :class="[type == 4?'active':'']" @click="changeType(4)">真实速度</span>
                    </div>
                </div>
                <p class="t_y">{{title_dw}}</p>
                <div id="echartsMain"  ref="echarts"></div>
                <ul class="dataCheck">
                    <li @click="changTime(7)"  :class="[times == 7?'active':'']" style="border-top-left-radius: 4px;border-bottom-left-radius: 4px;">7日</li>
                    <li @click="changTime(15)" :class="[times == 15?'active':'']">15日</li>
                    <li @click="changTime(30)" :class="[times == 30?'active':'']" style="border-right: 1px solid #e1e3e9;border-top-right-radius: 4px;border-bottom-right-radius: 4px;">30日</li>
                </ul>
           </div>
       </div>
   </div>
</template>

<script type="text/ecmascript-6">
import axios from 'axios'
import { hmac256,timestamp } from "../../../../../static/js/public.js";
import * as api from '../../../store/API.js'
import { clearTimeout, setTimeout } from 'timers';
var echarts = require('echarts/lib/echarts');
// 引入柱状图
require('echarts/lib/chart/bar');
// 引入提示框和标题组件
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');
require('echarts/lib/component/dataZoom');
export default {
  props: {
    dialogTableVisible: Boolean
  },
  data() {
    return {
        myChart:null,
        type:1,
        times:7,
        title:'字数',
        title_dw:'字',
        rankData:['总码字数','今日码字数','昨日码字数','昨日字数排行'],
        others:[0,0,0,0],
        datas:[],
        sizes:[],
        wenhao:require('../../../../../static/imgs/wenhao.png')
    };
  },
  computed: {},
  methods: {
      changeType(types){
          this.type = types;
          switch(types){
              case 1:
                this.title = '字数'
                this.title_dw = '字'
                this.rankData = ['总码字数','今日码字数','昨日码字数','昨日字数排行'];
                break;
              case 2:
                this.title = '时间'
                this.title_dw = '分钟'
                this.rankData = ['总码字时长','今日码字时长','昨日码字时长','昨日码字时长排行'];
                break;
              case 3:
                this.title = '速度'
                this.title_dw = '字/分'
                this.rankData = ['今日码字速度(字/分)','今日真实速度(字/时)','昨日码字速度(字/分)','作日真实速度(字/时)'];
                break;
          }
          this.getData()
      },
      changTime(time){
          this.times = time;
          this.getData()
      },
      getData(){
        let that = this;
        let userData = JSON.parse(localStorage.getItem('user'));
        let time = timestamp();
        axios({
            url: api.rankDataList + `?token=${userData.user.user_center.token}&timestamp=${time}&interval=${this.times}&types=${this.type}`,
            method: 'get',
            headers: {
                'x-sign-id': hmac256(userData.user.user_center.token, api.rankDataList, time, '')
            }
        }).then((response) => {
            if(response.data.status != 200){
                that.$message({ message: '数据出错！', type: 'error'});
                return
            }
            let _datas = response.data.result.datas;
            that.datas = _datas.dates;
            that.others = _datas.others?_datas.others:[0,0,0,0];
            that.sizes = _datas.sizes?_datas.sizes:new Array(_datas.dates.length).fill(0);
            that.myChart = echarts.init(that.$refs.echarts);
            
            var yMax = [...that.sizes].sort(function(a,b){return a - b})[that.sizes.length - 1];

            var dataShadow = [];
            for (var i = 0; i < _datas.dates.length; i++) {
                dataShadow.push(yMax);
            }
            let option = {
                tooltip: {
                    show: "true",
                    trigger: "item",
                    backgroundColor: "rgba(0,0,0,0.7)", // 背景
                    padding: [8, 10], //内边距
                    extraCssText: "box-shadow: 0 0 3px rgba(255, 255, 255, 0.4);", //添加阴影
                    formatter: function(params) {
                        if (params.seriesName != "" && params.componentIndex) {
                            return params.name + " ： " + params.value + " " + that.title_dw;
                        }
                    }
                },
                grid: {
                    borderWidth: 0,
                    top: '60',
                    left: '70',
                    right:'50',
                    bottom:'60',
                    textStyle: {
                        color: "#fff"
                    }
                },
                xAxis: {
                    data: _datas.dates,
                    axisLabel: {
                        inside: true,
                        textStyle: {
                            color: '#999999'
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    z: 10
                },
                yAxis: {
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#999'
                        }
                    }
                },
                dataZoom: [
                    {
                        type: 'inside'
                    }
                ],
                series: [
                    { // For shadow
                        type: 'bar',
                        itemStyle: {
                            normal: {color: 'rgba(0,0,0,0.05)'}
                        },
                        barGap:'-100%',
                        barCategoryGap:'40%',
                        data: dataShadow,
                        animation: false
                    },
                    {
                        type: 'bar',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1,
                                    [
                                        {offset: 0, color: '#83bff6'},
                                        {offset: 0.5, color: '#188df0'},
                                        {offset: 1, color: '#188df0'}
                                    ]
                                )
                            },
                            emphasis: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1,
                                    [
                                        {offset: 0, color: '#2378f7'},
                                        {offset: 0.7, color: '#2378f7'},
                                        {offset: 1, color: '#83bff6'}
                                    ]
                                )
                            }
                        },
                        data: that.sizes
                    }
                ]
            };

            // Enable data zoom when user click bar.
            var zoomSize = 6;
            that.myChart.on('click', function (params) {
                that.myChart.dispatchAction({
                    type: 'dataZoom',
                    startValue: _datas.dates[Math.max(params.dataIndex - zoomSize / 2, 0)],
                    endValue: _datas.dates[Math.min(params.dataIndex + zoomSize / 2, that.sizes.length - 1)]
                });
            });
            that.myChart.setOption(option);

        })
      }
  },
  components: {},
  mounted() {
    let that = this;
    that.getData()
    window.addEventListener('resize', function() {
        that.myChart.resize();
    })
  }
};
</script>
<style lang="scss">
.main {
  width: 100%;
  .topOutBox{
      display: flex;
      justify-content: space-between;
      align-items: center;
     height: 65px;
     padding: 0 30px;
  }
  .statisticsTop {
    height: 65px;
    line-height: 65px;
    overflow: hidden;
    clear: both;
    border-bottom: 1px solid #edeff3;
    li {
      float: left;
      margin: 0 20px;
      cursor: pointer;
      color: #999999;
      position: relative;
      width: 50px;
      text-align: center;
      &.active {
        color: #000;
      }
      &.active::before {
        content: "";
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background-color: #fbbd36;
        position: absolute;
        bottom: 0;
        left: 0;
      }
    }
  }
  .bottomBox {
    padding: 20px 50px;
    background: #f5f7f9;
    .bottomBoxTop {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      .t_bs {
        height: 120px;
        width: 185px;
        display: flex;
        align-items: center;
        background: #fff;
        justify-content: center;
        flex-direction: column;
        strong {
          height: 40px;
          font-size: 30px;
          font-weight: bold;
          color: #333333;
          text-align: center;
        }
        p {
          height: 16px;
          font-size: 12px;
          text-align: center;
          color: #999999;
        }
      }
    }
    .bottomBoxBottom {
      background: #fff;
      .maziSudo{
          span{
              margin-left: 10px;
              font-size: 14px;
              cursor: pointer;
              color: #999999;
              &.active{
                color: #333333;
              }
          }
      }
      .title {
        display: flex;
        padding: 20px 40px;
        justify-content: space-between;
        height: 30px;
        align-items: center;
      }
      .t_y {
        padding: 0 40px;
        height: 20px;
        line-height: 20px;
        font-size: 14px;
        text-align: left;
        color: #999999;
      }
      .dataCheck {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-bottom: 20px;
        li {
          width: 64px;
          height: 28px;
          line-height: 28px;
          text-align: center;
          border-top: 1px solid #e1e3e9;
          border-bottom: 1px solid #e1e3e9;
          border-left: 1px solid #e1e3e9;
          cursor: pointer;
          &.active {
            background: #fafafa;
          }
        }
      }
    }
  }
  #echartsMain{
      height: 400px;
      width: 100%;
  }
}
</style>
