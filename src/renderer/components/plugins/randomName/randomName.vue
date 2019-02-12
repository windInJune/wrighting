<template>
<my-dialog :width="dialoginf.width"
               :height="dialoginf.height"
               :title="dialoginf.title" v-on:closeDialog="closeDialog">
  <div class="plugins rname-plug">
      <el-tabs class="plugins_randomName" v-model="parentId" @tab-click="handleClick">
          <el-tab-pane v-for="(item) in navs" :key="item.id" :label="item.title" :name="item.parent_id">
              <random-content :list="item.list" :navIndex="navIndex" :parentId="parentId"></random-content>
          </el-tab-pane>
      </el-tabs>
  </div>
</my-dialog>
</template>

<script>
import { Menu, Row, Col, Tabs } from "element-ui";
import { clipboard } from 'electron';
import NameSet from "./nameSet";
import myDialog from "@/components/pages/dialog/dialog";
// import $ from 'jquery';
import listFn from "./jquery.city.select.js"
import nameData from "./name.json";
import randomContent from '@/components/plugins/randomName/randomContent'
import {mapActions, mapGetters, mapMutations} from 'vuex'

export default {
    data() {
         return {
            // nameData: JSON.parse(
            //     fs.readFileSync(path.join(__dirname, "./name.json"))
            // ),
            dialoginf: {
              width: 950,
              height: 680,
              title: "随机取名"
            },
            activeName: 'person',
            //tab导航数据
            navs: [{
                    title: '人名',
                    id: 'person',
                    parent_id: '100',
                    list: [{
                            title: '中国人名',
                            id: 'person_zh',
                            category_id: '120'
                        },
                        {
                            title: '西方人名',
                            id: 'person_en',
                            category_id: '121'
                        },
                        {
                            title: '日本人名',
                            id: 'person_jp',
                            category_id: '122'
                        },
                        {
                            title: '网名',
                            id: 'person_web',
                            category_id: '123'
                        },
                        {
                            title: "收藏列表",
                            id: "collect_list"
                        }
                    ]
                },
                {
                    title: '地名',
                    id: 'place',
                    parent_id: '200',
                    list: [{
                            title: '中国地名',
                            id: 'place_zh',
                            category_id: '201'
                        },
                        {
                            title: '其他地名',
                            id: 'place_en',
                            category_id: '202'
                        },
                        {
                            title: '宇宙星球',
                            id: 'place_star',
                            category_id: '203'
                        },
                        {
                            title: '各方势力',
                            id: 'place_force',
                            category_id: '204'
                        },
                        {
                            title: "收藏列表",
                            id: "collect_list"
                        }
                    ]
                },
                {
                    title: '秘籍招式',
                    id: 'martial',
                    parent_id: '300',
                    list: [{
                            title: '功法秘籍',
                            id: 'martial_god',
                            category_id: '301'
                        },
                        {
                            title: '武学秘籍',
                            id: 'martial_move',
                            category_id: '302'
                        },
                        {
                            title: '魔幻法术',
                            id: 'martial_magic',
                            category_id: '303'
                        },
                        {
                            title: "收藏列表",
                            id: "collect_list"
                        }
                    ]
                },
                {
                    title: '装备',
                    id: 'equip',
                    parent_id: '400',
                    list: [{
                            title: '冷兵器',
                            id: 'equip_cool',
                            category_id: '401'
                        },
                        {
                            title: '热兵器',
                            id: 'equip_hot',
                            category_id: '402'
                        },
                        {
                            title: '法宝',
                            id: 'equip_magic',
                            category_id: '403'
                        },
                        {
                            title: "收藏列表",
                            id: "collect_list"
                        }
                    ]
                },
                // {
                //     title: '头衔衣着',
                //     id: 'clothing',
                //     list: [{
                //             title: '头衔',
                //             id: 'equip_cool'
                //         },
                //         {
                //             title: '衣着',
                //             id: 'equip_hot'
                //         }
                //     ]
                // },
                
                {
                    title: '其他',
                    id: 'other',
                    parent_id: '600',
                    list: [
                        // {
                        //     title: '仙侠类',
                        //     id: 'other_god'
                        // },
                        // {
                        //     title: '武侠类',
                        //     id: 'other_man'
                        // },
                        // {
                        //     title: '魔法类',
                        //     id: 'other_magic'
                        // },
                        {
                            title: '其他',
                            id: 'other',
                            category_id: '600'
                        },
                        {
                            title: "收藏列表",
                            id: "collect_list"
                        }
                    ]
                }
            ],
            navIndex: 0,
            parentId: '100'
        };
    },
    methods: {
        ...mapActions({
            RANDOM_NAME_LIST: 'RANDOM_NAME_LIST'
        }),
        handleClick(tab, event) {
            this.navIndex = tab.index
            console.log(tab, event)
            console.log(this.parentId)
        },
        closeDialog(type) {
          this.$emit("closeOpenRandomName", type);
        }
    },
    components: {
        Tabs,
        NameSet,
        randomContent,
        Menu,
        Row,
        Col,
        myDialog
    },
    created() {
        this.RANDOM_NAME_LIST()
    },
    
}
</script>

<style >
    .plugins, .el-tabs, .el-tabs__content, .el-tab-pane{
        height: 100%;
        
    }
    .rname-plug{
        height: 649px;
        overflow: hidden;
    }
    ul,li {
        list-style: none;
    }

    html,
    body {
        -webkit-app-region: no-drag;
        width: 100%;
        height: 100%;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        background: #fff;
    }

    body {
        overflow: hidden;
        /* border: 1px solid #ccc; */
    }

    .titleDiv {
        -webkit-app-region: drag;
        height: 24px;
        background: rgb(217, 217, 217);
        box-shadow: inset 0 -0.5px 0.5px 0 rgb(217, 217, 217);
    }

    .nodata {
        padding: 0 20px;
        line-height: 2;
        color: #999;
        font-size: 14px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    h6 {
        font-weight: normal;
        font-size: 12px;
        color: #999;
    }

    .btn {
        cursor: pointer;
        /* box-shadow: 0 1px 1px 0 rgb(217, 217, 217); */
    }

    /* .btn:hover {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, .2);
    } */

    .btn-primary {
        width: 160px;
        height: 36px;
        line-height: 36px;
        border-radius: 4px;
        /* background-color: rgb(53, 193, 135); */
        background-color: #3e4347;
        color: #fff;
        text-align: center;
        margin: 0 auto;
        margin-bottom: 15px;
        font-size: 14px;
    }

    .mt8 {
        margin-top: 8px;
    }

    .mt15 {
        margin-top: 15px;
    }

    .name_wrap {
        display: flex;
        height: 100%;
    }

    .name_wrap .name_nav {
        flex: none;
        width: 150px;
        height: 538px;
        font-size: 12px;
        background: rgb(241, 241, 241);
        /*background: rgb(250,252,254);*/
    }

    .name_nav .nav_list h6 {
        height: 36px;
        line-height: 36px;
        position: relative;
        padding-left: 24px;
        cursor: pointer;
    }

    .name_nav .nav_list h6:after {
        content: '';
        display: block;
        position: absolute;
        left: 8px;
        top: 12px;
        width: 0px;
        height: 0px;
        border: 5px solid transparent;
        border-left: 6px solid #999;
    }

    .name_nav .nav_list h6.cur:after {
        border: 5px solid transparent;
        border-top: 6px solid #999;
        top: 15px;
        left: 5px;
    }

    .name_nav .sub_list li {
        height: 36px;
        line-height: 36px;
        padding-left: 24px;
        color: #333;
        cursor: pointer;
    }

    .name_nav .sub_list li.cur {
        background-color: rgb(53, 193, 135);
        color: #fff;
    }

    .name_wrap .name_set {
        /* width: 210px; */
        /* border-right: 1px solid #e5e5e5; */
        flex: none;
        /* padding: 0 20px; */
        margin: 0 auto;
    }

    .name_set .item {
        margin-bottom: 30px;
        color: #666;
    }

    .name_set .item h6 {
        line-height: 34px;
        color: #666;
        font-size: 14px;
    }

    .name_set .item input[type="text"] {
        width: 160px;
        height: 30px;
        line-height: 30px;
        border-radius: 4px;
        border: solid 1px #d9d9d9;
        font-size: 14px;
        outline: none;
        padding-left: 5px;
        color: #333;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }

    .name_set .item .row {
        display: flex;
        align-items: center;
    }

    .name_set .item .row.between {
        justify-content: space-between;
    }

    .name_set .item .btn-min {
        font-size: 12px;
        width: 72px;
        height: 24px;
        color: #666;
        /* border-radius: 12px; */
        line-height: 24px;
        text-align: center;
        cursor: pointer;
    }
    .name_set .item .btn-min:hover{
        color: #333;
    }

    .name_set .item input[type="radio"] {
        opacity: 0;
    }

    .name_set .item .beauty {
        width: 12px;
        height: 12px;
        display: inline-block;
        box-sizing: border-box;
        position: relative;
        border-radius: 50%;
        border: 1px solid #d9d9d9;
    }

    .name_set .item .beauty.checked:after {
        content: '';
        display: block;
        position: absolute;
        top: -1px;
        left: -1px;
        width: 4px;
        height: 4px;
        border: 4px solid #fbbd36;
        border-radius: 50%;
        background-color: #fff;
    }

    .name_set .item label {
        line-height: 14px;
        width: 55px;
        padding-left: 5px;
        font-size: 14px;
        color: #666;
    }

    .name_set .item .list_box {
        position: relative;
        /* padding: 10px 8px; */
        width: 160px;
        height: 30px;
        line-height: 30px;
        border-radius: 4px;
        border: solid 1px #d9d9d9;

        /* height: 44px; */
        box-sizing: border-box;
        margin-bottom: 15px;
    }

    .name_set .item .list_box .select_btn {
        position: relative;
    }
    .name_con{
        width: 510px;
        margin: 0 auto;
        padding-bottom: 40px;
    }
    .name_con ul {
        width: 510px;
        display: flex;
        flex-flow: row wrap;
        /* margin-top: 34px; */
        justify-content: space-between;
        border-radius: 6px;
        background-color: #ffffff;
        box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.08);
        padding: 10px 0;
    }

    .name_con ul li {
        position: relative;
        /* height: 34px; */
        font-size: 0;
    }

    .name_con ul li span.li-item {
        display: inline-block;
        width: 130px;
        height: 34px;
        line-height: 34px;
        padding: 0 4px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        cursor: pointer;
        font-size: 14px;
        color: #666666;
    }

    .name_con ul li span.cur {
        background-color: #eee;
    }

    .name_con ul li .tips {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translate(-50%, 0);
        height: 30px;
        /* padding: 0 12px; */
        font-size: 14px;
        line-height: 30px;
        border-radius: 5px;
        background-color: #3e4347;
        white-space: nowrap;
        color: #fff;
        text-align: center;
        /* cursor: copy; */
        z-index: 1000;
    }
    .name_con ul li .tips span{
        display: inline-block;
        padding: 0 12px;
        height: 30px;
        line-height: 30px;
    }    

    .name_con ul li .tips:after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        border: 4px solid transparent;
        border-top-color: rgb(62, 67, 71);
        position: absolute;
        bottom: -8px;
        left: 0px;
        right: 0px;
        margin: 0 auto;
    }

    .name_con ul li .tips.right {
        right: 0px;
        left: auto;
        transform: translate(0, 0)
    }

    .name_con ul li .tips.right:after {
        left: auto;
        right: 65px;
    }

    .name_con ul li .tips.left {
        left: 0px;
        right: auto;
        transform: translate(0, 0)
    }

    .name_con ul li .tips.left:after {
        right: auto;
        left: 65px;
    }

    .select_btn dl {
        position: relative;
        height: 100%;
        cursor: pointer;
    }

    .select_btn dl dt {
        line-height: 28px;
        padding-left: 11px;
        font-size: 14px;
    }

    .select_btn dl dd {
        position: absolute;
        right: 0;
        top: 0;
        width: 12px;
        height: 24px;
        padding: 4px 0;
        box-sizing: border-box;
        font-size: 0;
    }

    .select_btn .up_btn,
    .down_btn {
        display: block;
        width: 12px;
        height: 8px;
        /* background-image: url("./images/up.png"); */
        background-size: 100%;
        cursor: pointer;
    }

    .down_btn {
        /* background-image: url("./images/down.png"); */
    }

    .list_box ul {
        display: none;
        position: absolute;
        width: 100%;
        max-height: 168px;
        top: 24px;
        left: 0;
        background: #fff;
        box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.16), 0 2px 5px 0 rgba(0, 0, 0, 0.26);
        z-index: 10;
        overflow: auto;
    }

    .list_box ul.up {
        top: auto;
        bottom: 24px;
    }

    .list_box ul li {
        height: 24px;
        line-height: 24px;
        text-align: center;
        font-family: PingFangSC-Medium, 微软雅黑;
        font-size: 10px;
        color: rgb(102, 102, 102);
    }

    .list_box ul li:hover,
    .list_box ul li.active {
        background: rgb(217, 217, 217);
    }

    .name_wrap .name_con {
        flex: auto;
    }

    h6{
        font-size: 14px;
    }
   
</style>
<style>

.plugins_randomName .el-tabs__active-bar{
    background-color: #fbbd36;
    height: 4px;
    border-radius: 4px; 
}
.plugins_randomName .el-tabs__item{
    color: #999999;
}
.plugins_randomName .el-tabs__item.is-active{
    color: #333333;
}
.plugins_randomName .el-tabs__item:hover{
    color: #333333;
}
.plugins_randomName .el-tabs__nav-scroll{
    padding-left: 58px;
    height: 50px;
    line-height: 50px;
}
.plugins_randomName .el-menu-item{
    padding-left: 46px !important;
    position: relative;
}
.plugins_randomName .el-menu-item:focus, .el-menu-item:hover{
    background-color: rgba(255,255,255, 0);
}
.plugins_randomName .el-menu-item.is-active{
    color: #333333;
}
.plugins_randomName .el-menu-item.is-active::before{
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #fbbd36;
    position: absolute;
    top: 23px;
    left: 26px;
}
.plugins_randomName .el-menu-item{
    color: #999999;
}
.plugins_randomName .el-menu{
    border: none;
}
.plugins_randomName .el-tabs__header{
    margin: 0;
}
</style>

