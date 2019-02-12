<template>
<div class="plugins">
    <el-tabs class="plugins_randomName" v-model="activeName" @tab-click="handleClick">

        <el-tab-pane v-for="(item) in navs" :key="item.id" :label="item.title" :name="item.id">
          <!-- <span slot="label">{{item.title}}</span> -->
          <!-- <user-name :list="item.list"></user-name> -->
          <div>
          <el-row>
                <el-col :span="6">
                    <!-- <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">
                        <el-submenu v-for="(item, index) in navs" :key="item.id" :index="index+''">
                            <template slot="title">
                                <i class="el-icon-location"></i>
                                <span>{{item.title}}</span>
                            </template>
                            <el-menu-item-group v-for="(items, indexs) in item.list" :key="items.id">
                                <el-menu-item :index="index + '-'+ indexs">{{items.title}}</el-menu-item>
                            </el-menu-item-group>
                        </el-submenu>
                    </el-menu> -->
                    
                    <el-menu  class="el-menu-vertical-demo" @select="handleOpen" @close="handleClose">
                        <el-menu-item v-for="(item,index) in item.list" :key="item.id" :index="String(index+1)" @click="seleNav(item.id)">
                           {{item.title}}
                        </el-menu-item>
                    </el-menu>

                    <!-- <el-tabs v-model="activeName" tab-position="left" style="height: 200px;">
                    <el-tab-pane v-for="item in list" :key="item.id" :label="item.title" :name="item.id">
                        {{item.title}}
                    </el-tab-pane>
                    </el-tabs> -->

                </el-col>
                <el-col :span="8">
                    <div class="name_wrap">
                        <!-- <div class="name_nav">
                    <div class="nav_list" v-for="nav in navs">
                    <h6 @click="foldNav(nav)" :class="{cur: nav.id == curFold}">{{nav.title}}</h6>
                    <ul class="sub_list" v-show="nav.id == curFold">
                        <li v-for="sub_nav in nav.list" :class="{cur: navCur==sub_nav.id}" @click="seleNav(sub_nav.id)">{{sub_nav.title}}</li>
                    </ul>
                    </div>
                </div> -->
                        <div class="name_set">
                            <name-set :renderObj="renderObj"></name-set>
                        </div>

                    </div>
                    
                </el-col>

                <el-col :span="10">
                    <div class="name_con">
                        <ul>
                            <li v-for="(name, index) in names" :key="name.id">
                                <span v-if="name!='null'" :class="{cur: curCopy==name}" @click.stop="tips(name, index, $event)">
                                {{name}}
                                </span>
                                <div class="tips" :class="{right: (index%3==2) && tipsWidthOver, left: (index%3==0) && tipsWidthOver}" v-show="curCopy == name" @click.stop="copy(name)">
                                    {{name}}　|　复制
                                </div>
                                <p class="nodata" v-if="name=='null'">
                                    {{hint}}
                                </p>
                            </li>
                        </ul>
                    </div>
                    
                </el-col>
            </el-row>
            </div>
        </el-tab-pane>
    </el-tabs>


</div>
</template>

<script>
import { Tabs } from 'element-ui'
import { ipcRenderer } from 'electron'
// import userName from '@/components/randomName/userName'
import { Menu, Row,Col } from "element-ui";
import { clipboard } from 'electron';
import fs from "fs";
import path from "path";
import NameSet from "./nameSet";
// import $ from 'jquery';
import listFn from "./jquery.city.select.js"
import nameData from "./name.json";

export default {
    data() {
        function e(e, a, r) {
            let i = {};
            if (($.extend(!0, i, t[e]), a))
                switch (e) {
                    case "title":
                        i.text = a;
                        break;
                    case "inputT":
                        a.attrs || a.props || a.domProps ?
                            Object.assign(i.props, a) :
                            Object.assign(i.props.attrs, a);
                        break;
                    case "inputR":
                        $.extend(!0, i.child[0].props, a);
                        break;
                    case "label":
                        (i.text = a.text), (i.props.attrs.for = a.for);
                        break;
                    case "btnMin":
                    case "btnPri":
                        (i.text = "string" == typeof a ? a : a.text),
                        Object.assign(i.props, a.props);
                        break;
                    case "row":
                        Object.assign(i.child, a.child);
                        break;
                    case "select":
                        Object.assign(i.child[0].props.attrs, a);
                }
            return r && (i.props.class += " " + r), i;
        }
        let t = {
                title: {
                    tag: "h6",
                    text: "标题"
                },
                inputT: {
                    tag: "input",
                    props: {
                        attrs: {
                            type: "text",
                            placeholder: "请输入"
                        },
                        on: {
                            input: this.textChange
                        },
                        domProps: {
                            value: ""
                        }
                    }
                },
                inputR: {
                    tag: "span",
                    props: {
                        class: "beauty"
                    },
                    child: [{
                        tag: "input",
                        props: {
                            attrs: {
                                type: "radio",
                                name: "def",
                                id: "def"
                            },
                            on: {
                                change: this.radioChange
                            }
                        }
                    }]
                },
                label: {
                    tag: "label",
                    text: "",
                    props: {
                        attrs: {
                            for: ""
                        }
                    }
                },
                btnMin: {
                    tag: "div",
                    text: "",
                    props: {
                        class: "btn btn-min"
                    }
                },
                btnPri: {
                    tag: "div",
                    text: "",
                    props: {
                        class: "btn btn-primary",
                        on: {
                            click: this.createName
                        }
                    }
                },
                row: {
                    tag: "div",
                    props: {
                        class: "row"
                    },
                    child: []
                },
                select: {
                    tag: "div",
                    props: {
                        class: "list_box"
                    },
                    child: [{
                        tag: "div",
                        props: {
                            class: "select_btn",
                            attrs: {
                                id: ""
                            }
                        }
                    }]
                }
            },
            a = {
                person_zh: {
                    class: "person_zh",
                    list: [
                        [
                            e("title", "姓氏"),
                            e("inputT", {
                                placeholder: "请输入或选择(最多10字)",
                                id: "xing"
                            }),
                            e(
                                "row", {
                                    child: [
                                        e("btnMin", {
                                            text: "随机单姓",
                                            props: {
                                                on: {
                                                    click: this.xing
                                                }
                                            }
                                        }),
                                        e("btnMin", {
                                            text: "随机复姓",
                                            props: {
                                                on: {
                                                    click: this.fuxing
                                                }
                                            }
                                        })
                                    ]
                                },
                                "between mt8"
                            )
                        ],
                        [
                            e("title", "性别"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "male"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "男",
                                        for: "male"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "female"
                                        }
                                    }),
                                    e("label", {
                                        text: "女",
                                        for: "female"
                                    })
                                ]
                            })
                        ],
                        [
                            e("title", "字数"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "word_num",
                                            id: "two"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "二字名",
                                        for: "two"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "word_num",
                                            id: "three"
                                        }
                                    }),
                                    e("label", {
                                        text: "三字名",
                                        for: "three"
                                    })
                                ]
                            })
                        ],
                        [
                            e("btnPri", {
                                text: "生成名字",
                                props: {
                                    attrs: {
                                        id: "zhname"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "生成尊称",
                                props: {
                                    attrs: {
                                        id: "zcname"
                                    }
                                }
                            })
                        ]
                    ]
                },
                person_en: {
                    class: "person_en",
                    list: [
                        [
                            e("title", "语言"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "lang",
                                            id: "zh"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "中文",
                                        for: "zh"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "lang",
                                            id: "en"
                                        }
                                    }),
                                    e("label", {
                                        text: "英文",
                                        for: "en"
                                    })
                                ]
                            })
                        ],
                        [
                            e("title", "姓氏"),
                            e("inputT", {
                                placeholder: "请输入或选择",
                                id: "xing"
                            }),
                            e(
                                "btnMin", {
                                    text: "随机姓氏",
                                    props: {
                                        on: {
                                            click: this.enxing
                                        }
                                    }
                                },
                                "mt8"
                            )
                        ],
                        [
                            e("title", "性别"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "male"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "男",
                                        for: "male"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "female"
                                        }
                                    }),
                                    e("label", {
                                        text: "女",
                                        for: "female"
                                    })
                                ]
                            })
                        ],
                        [
                            e("btnPri", {
                                text: "生成名字",
                                props: {
                                    attrs: {
                                        id: "enname"
                                    },
                                    on: {
                                        click: this.createName
                                    }
                                }
                            })
                        ]
                    ]
                },
                person_jp: {
                    class: "person_jp",
                    list: [
                        [
                            e("title", "语言"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "lang",
                                            id: "zh"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "中文",
                                        for: "zh"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "lang",
                                            id: "jp"
                                        }
                                    }),
                                    e("label", {
                                        text: "日文",
                                        for: "jp"
                                    })
                                ]
                            })
                        ],
                        [
                            e("title", "姓氏"),
                            e("inputT", {
                                placeholder: "请输入或选择",
                                id: "xing"
                            }),
                            e(
                                "btnMin", {
                                    text: "随机姓氏",
                                    props: {
                                        on: {
                                            click: this.jpxing
                                        }
                                    }
                                },
                                "mt8"
                            )
                        ],
                        [
                            e("title", "性别"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "male"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "男",
                                        for: "male"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "female"
                                        }
                                    }),
                                    e("label", {
                                        text: "女",
                                        for: "female"
                                    })
                                ]
                            })
                        ],
                        [
                            e("btnPri", {
                                text: "生成名字",
                                props: {
                                    attrs: {
                                        id: "jpname"
                                    },
                                    on: {
                                        click: this.createName
                                    }
                                }
                            })
                        ]
                    ]
                },
                person_web: {
                    class: "person_web",
                    list: [
                        [
                            e("title", "性别"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "male"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "男",
                                        for: "male"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "sex",
                                            id: "female"
                                        }
                                    }),
                                    e("label", {
                                        text: "女",
                                        for: "female"
                                    })
                                ]
                            })
                        ],
                        [
                            e("title", "符号"),
                            e("row", {
                                child: [
                                    e("inputR", {
                                        attrs: {
                                            name: "sign",
                                            id: "sign"
                                        },
                                        domProps: {
                                            checked: !0
                                        }
                                    }),
                                    e("label", {
                                        text: "有",
                                        for: "sign"
                                    }),
                                    e("inputR", {
                                        attrs: {
                                            name: "sign",
                                            id: "unsign"
                                        }
                                    }),
                                    e("label", {
                                        text: "无",
                                        for: "unsign"
                                    })
                                ]
                            })
                        ],
                        [
                            e("btnPri", {
                                text: "生成名字",
                                props: {
                                    attrs: {
                                        id: "webname"
                                    }
                                }
                            })
                        ]
                    ]
                },
                place_zh: {
                    class: "place_zh",
                    list: [
                        [
                            e("title", "行政区划"),
                            e("select", {
                                id: "place_zh_areas"
                            }),
                            e("btnPri", {
                                text: "生成非真实地名",
                                props: {
                                    attrs: {
                                        id: "norealzharea"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "生成真实地名",
                                props: {
                                    attrs: {
                                        id: "realzharea"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "地点单位"),
                            e("select", {
                                id: "place_zh_maps"
                            }),
                            e("btnPri", {
                                text: "生成非真实地名",
                                props: {
                                    attrs: {
                                        id: "norealzhmap"
                                    }
                                }
                            })
                        ]
                    ]
                },
                place_en: {
                    class: "place_en",
                    list: [
                        [
                            e("title", "地点单位"),
                            e("select", {
                                id: "place_en_maps"
                            }),
                            e("btnPri", {
                                text: "生成非真实地名",
                                props: {
                                    attrs: {
                                        id: "norealenmap"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "真实地名"),
                            e("btnPri", {
                                text: "生成西方地名",
                                props: {
                                    attrs: {
                                        id: "realenarea"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "生成日本地名",
                                props: {
                                    attrs: {
                                        id: "realjparea"
                                    }
                                }
                            })
                        ]
                    ]
                },
                place_force: {
                    class: "place_force",
                    list: [
                        [
                            e("title", "国家"),
                            e("select", {
                                id: "place_force_country"
                            }),
                            e("btnPri", {
                                text: "生成东方国名",
                                props: {
                                    attrs: {
                                        id: "eastcountry"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "生成西方国名",
                                props: {
                                    attrs: {
                                        id: "westcountry"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "势力单位"),
                            e("select", {
                                id: "place_force_east"
                            }),
                            e("btnPri", {
                                text: "生成东方势力",
                                props: {
                                    attrs: {
                                        id: "eastforce"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "势力单位"),
                            e("select", {
                                id: "place_force_west"
                            }),
                            e("btnPri", {
                                text: "生成西方势力",
                                props: {
                                    attrs: {
                                        id: "westforce"
                                    }
                                }
                            })
                        ]
                    ]
                },
                place_star: {
                    class: "place_star",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "东方星球",
                                    props: {
                                        attrs: {
                                            id: "eaststar"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "西方星球",
                                props: {
                                    attrs: {
                                        id: "weststar"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "编号星球",
                                props: {
                                    attrs: {
                                        id: "numberstar"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "未知星球",
                                props: {
                                    attrs: {
                                        id: "unknownstar"
                                    }
                                }
                            })
                        ]
                    ]
                },
                martial_god: {
                    class: "martial_god",
                    list: [
                        [
                            e("title", "招式"),
                            e("select", {
                                id: "zhaoshi-prefix"
                            }),
                            e("btnPri", {
                                text: "生成招式",
                                props: {
                                    attrs: {
                                        id: "zhaoshi"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "秘籍"),
                            e("select", {
                                id: "miji-prefix"
                            }),
                            e("btnPri", {
                                text: "生成秘籍",
                                props: {
                                    attrs: {
                                        id: "miji"
                                    }
                                }
                            })
                        ]
                    ]
                },
                martial_move: {
                    class: "martial_move",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "武功招式",
                                    props: {
                                        attrs: {
                                            id: "wgzs"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "武功秘籍",
                                props: {
                                    attrs: {
                                        id: "wgmj"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "道家功法",
                                props: {
                                    attrs: {
                                        id: "djgf"
                                    }
                                }
                            })
                        ]
                    ]
                },
                martial_magic: {
                    class: "martial_magic",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "随机魔法",
                                    props: {
                                        attrs: {
                                            id: "sjmf"
                                        }
                                    }
                                },
                                "mt15"
                            )
                        ]
                    ]
                },
                equip_cool: {
                    class: "equip_cool",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "刀",
                                    props: {
                                        attrs: {
                                            id: "dao"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "剑",
                                props: {
                                    attrs: {
                                        id: "jian"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "枪",
                                props: {
                                    attrs: {
                                        id: "qiang"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "奇门",
                                props: {
                                    attrs: {
                                        id: "qimeng"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "远程",
                                props: {
                                    attrs: {
                                        id: "yuancheng"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "护具",
                                props: {
                                    attrs: {
                                        id: "huju"
                                    }
                                }
                            })
                        ]
                    ]
                },
                equip_hot: {
                    class: "equip_hot",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "枪械",
                                    props: {
                                        attrs: {
                                            id: "guns"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "舰船载具",
                                props: {
                                    attrs: {
                                        id: "ships"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "空中载具",
                                props: {
                                    attrs: {
                                        id: "flys"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "陆地载具",
                                props: {
                                    attrs: {
                                        id: "cars"
                                    }
                                }
                            }),
                            e("btnPri", {
                                text: "未来向机甲",
                                props: {
                                    attrs: {
                                        id: "mecha"
                                    }
                                }
                            })
                        ]
                    ]
                },
                equip_magic: {
                    class: "equip_magic",
                    list: [
                        [
                            e("title", "东方"),
                            e("select", {
                                id: "fabao-prefix"
                            }),
                            e("btnPri", {
                                text: "生成东方法宝",
                                props: {
                                    attrs: {
                                        id: "eastfabao"
                                    }
                                }
                            })
                        ],
                        [
                            e("title", "西方"),
                            e("select", {
                                id: "equip_magic_en-keep"
                            }),
                            e("btnPri", {
                                text: "生成西方法宝",
                                props: {
                                    attrs: {
                                        id: "westfabao"
                                    }
                                }
                            })
                        ]
                    ]
                },
                other_god: {
                    class: "other_god",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "天材地宝",
                                    props: {
                                        attrs: {
                                            id: "tcdb"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "妖兽",
                                props: {
                                    attrs: {
                                        id: "yaoshou"
                                    }
                                }
                            })
                        ]
                    ]
                },
                other_man: {
                    class: "other_man",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "丹药",
                                    props: {
                                        attrs: {
                                            id: "danyao"
                                        }
                                    }
                                },
                                "mt15"
                            ),
                            e("btnPri", {
                                text: "坐骑",
                                props: {
                                    attrs: {
                                        id: "zuoqi"
                                    }
                                }
                            })
                        ]
                    ]
                },
                other_magic: {
                    class: "other_magic",
                    list: [
                        [
                            e(
                                "btnPri", {
                                    text: "怪物",
                                    props: {
                                        attrs: {
                                            id: "guaiwu"
                                        }
                                    }
                                },
                                "mt15"
                            )
                        ]
                    ]
                }
            };
        return {
            // nameData: JSON.parse(
            //     fs.readFileSync(path.join(__dirname, "./name.json"))
            // ),
            activeName: 'person',
            // activeName: this.list[0].id,
            navs: [{
                    title: '人名',
                    id: 'person',
                    list: [{
                            title: '中国人名',
                            id: 'person_zh'
                        },
                        {
                            title: '西方人名',
                            id: 'person_en'
                        },
                        {
                            title: '日本人名',
                            id: 'person_jp'
                        },
                        {
                            title: '网名',
                            id: 'person_web'
                        }
                    ]
                },
                {
                    title: '地名',
                    id: 'place',
                    list: [{
                            title: '中国地名',
                            id: 'place_zh'
                        },
                        {
                            title: '西方地名',
                            id: 'place_en'
                        },
                        {
                            title: '势力名称',
                            id: 'place_force'
                        },
                        {
                            title: '星球名称',
                            id: 'place_star'
                        }
                    ]
                },
                {
                    title: '秘籍招式',
                    id: 'martial',
                    list: [{
                            title: '仙侠功法',
                            id: 'martial_god'
                        },
                        {
                            title: '功法招式',
                            id: 'martial_move'
                        },
                        {
                            title: '魔法名称',
                            id: 'martial_magic'
                        }
                    ]
                },
                {
                    title: '装备',
                    id: 'equip',
                    list: [{
                            title: '冷兵器',
                            id: 'equip_cool'
                        },
                        {
                            title: '热兵器',
                            id: 'equip_hot'
                        },
                        {
                            title: '法宝',
                            id: 'equip_magic'
                        }
                    ]
                },
                {
                    title: '头衔衣着',
                    id: 'clothing',
                    list: [{
                            title: '头衔',
                            id: 'equip_cool'
                        },
                        {
                            title: '衣着',
                            id: 'equip_hot'
                        }
                    ]
                },
                
                {
                    title: '其他',
                    id: 'other',
                    list: [{
                            title: '仙侠类',
                            id: 'other_god'
                        },
                        {
                            title: '武侠类',
                            id: 'other_man'
                        },
                        {
                            title: '魔法类',
                            id: 'other_magic'
                        }
                    ]
                }
            ],
            names: [],
            selectBox: nameData.selectbox,
            navCur: "person_zh",
            renderObjs: a,
            renderObj: a.person_zh,
            person_zh: {
                xing: "",
                sex: "male",
                word_num: "two"
            },
            person_en: {
                lang: "zh",
                xing: "",
                sex: "male"
            },
            person_jp: {
                lang: "zh",
                xing: "",
                sex: "male"
            },
            person_web: {
                sex: "male",
                sign: "sign"
            },
            place_zh: {
                areas: "",
                maps: "",
                hint: "包含此字的真实地名在中国省/直辖市、市、县中不存在哦，可能在外星球上~"
            },
            place_en: {
                maps: "",
                areas: ""
            },
            place_force: {
                country: ""
            },
            curFold: "person",
            foldRecord: "person",
            curCopy: "",
            tipsWidthOver: !1,
            hint: "无此类数据",
            defaultHint: "无此类数据"
        };
    },
    methods: {
        // newindow() {
        //     // console.log(modalPath)
        //     let popo = {
        //         name: 'newWindow',
        //         path: 'src/renderer/newWin/newWin.html'
        //     }
        //     ipcRenderer.send('newWindow', popo)
        // },
        // newindow2() {
        //     let popo = {
        //         name: 'newWindow',
        //         path: '#/pushImg'
        //     }
        //     ipcRenderer.send('newWindow', popo)
        // },
        handleClick(tab, event) {
            console.log(tab, event)
        },



        foldNav: function (e) {
            this.foldRecord == e.id ?
                ((this.curFold = ""), (this.foldRecord = "")) :
                ((this.foldRecord = e.id), (this.curFold = e.id));
        },
        tips: function (e, t, a) {
            this.curCopy = e;
            let r = $(a.target);
            this.tipsWidthOver = 90 < r.siblings().width();
        },
        copy: function (e) {
            clipboard.writeText(e), (this.curCopy = !1);
        },
        seleNav: function (e) {
            (this.navCur = e),
            (this.renderObj = {}),
            (this.triggleUpdate = !0),
            (this.renderObj = $.extend(!0, {}, this.renderObjs[e])),
            (this[e] = $.extend(!0, {}, this.cloneNav[e])),
            this[e].hint ?
                (this.hint = this[e].hint) :
                (this.hint = this.defaultHint);
        },
        radioChange: function (e) {
            (this[this.navCur][e.target.name] = e.target.id),
            e.target.checked &&
                $(e.target.parentElement)
                .addClass("checked")
                .siblings("span")
                .removeClass("checked");
        },
        textChange: function (e) {
            let t = e.target.value;
            switch (this.navCur) {
                case "person_zh":
                    t && t.length < 11 ?
                        (this[this.navCur][e.target.id] = t) :
                        ((t = t.slice(0, 10)),
                            (document.getElementById("xing").value = t),
                            (this[this.navCur][e.target.id] = t));
                    break;
                case "person_en":
                case "person_jp":
                    this[this.navCur][e.target.id] = t || "";
            }
        },
        search: function (e) {
            function t(e) {
                if (Array.isArray(e)) return Math.floor(Math.random() * e.length);
                console.log("不是数组");
            }
            "string" != typeof e && console.log("获取数据key不是字符");
            let a, r, i, s; -
            1 != e.indexOf("!") &&
                ((r = (i = e.split("!"))[0]), (s = i.slice(1)), (e = i[1]));
            let n = t((a = "selectbox" == r ? nameData[r][e] : nameData[e]));
            if ("double" == r) {
                for (var o = n; n == o;) o = t(a);
                return a[n] + a[o];
            }
            if ("random" == r) {
                let e = t(s),
                    a = t(nameData[s[e]]);
                return nameData[s[e]][a];
            }
            if ("suffix" == r) {
                let e = i[2] || "";
                return a[n] + e;
            }
            if ("filter" == r) {
                return (a = a.filter(function (e) {
                    return -1 != e.indexOf(i[2]);
                }))[t(a)];
            }
            return a[n];
        },
        xing: function () {
            var e = this.search("xing");
            (this.person_zh.xing = e), (document.getElementById("xing").value = e);
        },
        fuxing: function () {
            var e = this.search("fuxing");
            (this.person_zh.xing = e), (document.getElementById("xing").value = e);
        },
        enxing: function () {
            var e = this.search("enxing-" + this.person_en.lang);
            (this.person_en.xing = e), (document.getElementById("xing").value = e);
        },
        jpxing: function () {
            var e = this.search("jpxing-" + this.person_jp.lang);
            (this.person_jp.xing = e), (document.getElementById("xing").value = e);
        },
        createName: function (e) {
            function t(e) {
                let t = $("#" + e)
                    .find("dt")
                    .text();
                if ("单词缀" == t) r[e] = "";
                else if ("双词缀" == t) r["double!" + e] = "";
                else {
                    if ("三词缀" == t) return (r["xxx之"] = ""), (r["xxx的"] = ""), "";
                    "随机" == t && (t = "");
                }
                return console.log(t), t;
            }
            var a,
                r = {};
            switch (e.target.id) {
                case "zhname":
                    (r.xing = this[this.navCur].xing),
                    (r[this.person_zh.sex + "-" + this.person_zh.word_num] = "");
                    break;
                case "zcname":
                    (r[this.person_zh.sex + "-three"] = this[this.navCur].xing),
                    (r["random!zc!zc-" + this.person_zh.sex] = "");
                    break;
                case "enname":
                    (r["enxing-" + this[this.navCur].lang] = this[this.navCur].xing),
                    (r["enname-" + this.person_en.lang + "-" + this.person_en.sex] =
                        ""),
                    (a = " ");
                    break;
                case "jpname":
                    (r["jpxing-" + this[this.navCur].lang] = this[this.navCur].xing),
                    (r["jpname-" + this.person_jp.lang + "-" + this.person_jp.sex] =
                        "");
                    break;
                case "webname":
                    r[this[this.navCur].sign + "-" + this[this.navCur].sex] = "";
                    break;
                case "realzharea":
                    i = t("place_zh_areas");
                    r["filter!place-zh-real!" + i] = "";
                    break;
                case "norealzharea":
                    i = t("place_zh_areas");
                    (r["place-zh-noreal"] = ""), (r["selectbox!place_zh_areas"] = i);
                    break;
                case "norealzhmap":
                    i = t("place_zh_maps");
                    (r["place-zh-noreal"] = ""), (r["selectbox!place_zh_maps"] = i);
                    break;
                case "norealenmap":
                    i = t("place_en_maps");
                    (r["place-en-noreal"] = ""), (r["selectbox!place_en_maps"] = i);
                    break;
                case "realenarea":
                    r["place-en-real"] = "";
                    break;
                case "realjparea":
                    r["place-jp-real"] = "";
                    break;
                case "eastcountry":
                    i = t("place_force_country");
                    (r["place-zh-noreal"] = ""), (r["selectbox!place_force_country"] = i);
                    break;
                case "westcountry":
                    i = t("place_force_country");
                    (r["place-en-noreal"] = ""), (r["selectbox!place_force_country"] = i);
                    break;
                case "eastforce":
                    i = t("place_force_east");
                    (r["force-zh"] = ""), (r["selectbox!place_force_east"] = i);
                    break;
                case "westforce":
                    i = t("place_force_west");
                    (r["place-en-noreal"] = ""), (r["selectbox!place_force_west"] = i);
                    break;
                case "eaststar":
                    (r["random!female-three!male-three"] = ""), (r.star = "");
                    break;
                case "numberstar":
                    (r["star-num-prefix"] = ""),
                    (r["*L{1,3}!d{1,4}"] = ""),
                    (r.star = "");
                    break;
                case "unknownstar":
                    (r["*Z{1,2}"] = ""), (r.star = "");
                    break;
                case "weststar":
                    (r["enxing-zh"] = ""), (r.star = "");
                    break;
                case "zhaoshi":
                    i = t("zhaoshi-prefix");
                    r.zhaoshi = "";
                    break;
                case "miji":
                    i = t("miji-prefix");
                    r.miji = "";
                    break;
                case "eastfabao":
                    i = t("fabao-prefix");
                    r.fabao = "";
                    break;
                case "westfabao":
                    var i;
                    (i = t("equip_magic_en-keep")) && (r[i] = ""), (r["fabao-en"] = "");
                    break;
                case "guns":
                    (r["*L{1,3}!-!d{2,3}![式型]"] = ""), (r.guns = "");
                    break;
                case "ships":
                    (r["ships-name"] = ""), (r.ships = "");
                    break;
                case "flys":
                    (r["*L{1,2}!-!d{1,2}"] = ""), (r.flys = "");
                    break;
                case "cars":
                    (r["*L{1,2}!-!d{1,2}"] = ""), (r.cars = "");
                    break;
                case "mecha":
                    (r["mecha-name"] = ""),
                    (r["suffix!mecha-type!级"] = ""),
                    (r["suffix!mecha-shape!型机甲"] = "");
                    break;
                case "yaoshou":
                    (r["fabao-prefix"] = ""),
                    (r["yaoshou-prefix1"] = ""),
                    (r["yaoshou-prefix2"] = ""),
                    (r.yaoshou = "");
                    break;
                case "tcdb":
                    (r["tcdb-prefix"] = ""), (r.tcdb = "");
                    break;
                case "wgzs":
                case "wgmj":
                case "djgf":
                case "sjmf":
                case "dao":
                case "jian":
                case "qiang":
                case "qimeng":
                case "huju":
                case "yuancheng":
                case "danyao":
                case "zuoqi":
                case "guaiwu":
                    r[e.target.id] = "";
            }
            this.names = this.result(r, a);
        },
        result: function (obj, mark) {
            function times(e, t) {
                return (
                    (e = parseInt(e)),
                    (t = parseInt(t)),
                    e + Math.round(Math.random() * (t - e))
                );
            }

            function getWord(e, t, a) {
                let r = "";
                for (var i = 0; i < t; i++)
                    if ("char" == e) {
                        r += a[Math.floor(Math.random() * a.length)];
                    } else r += that[e](a);
                return r;
            }

            function random(e) {
                var t = "";
                return (
                    e.split("!").forEach(function (e, a) {
                        let r = e.match(/\{(\d*)(,?)(\d*)\}/),
                            i = 1;
                        r && (i = r[3] ? times(r[1], r[3]) : r[1]);
                        let s = e[0];
                        switch (s) {
                            case "L":
                            case "l":
                                t += getWord("letters", i, s);
                                break;
                            case "d":
                                t += getWord("numbers", i);
                                break;
                            case "Z":
                                t += getWord("char_zh", i);
                                break;
                            case "[":
                                let a = e.match(/\[(.+)\]/);
                                (a = a[1].split("")), (t += getWord("char", i, a));
                                break;
                            default:
                                t += e;
                        }
                    }),
                    t
                );
            }

            function once() {
                var e = "",
                    t = "";
                console.log(obj);
                for (var a in obj)
                    (t =
                        "*" == a[0] ?
                        random(a.slice(1)) :
                        obj[a] ? obj[a] : that.search(a)),
                    console.log(t),
                    t ? (e += t + mark) : (e = "null");
                return e.trim();
            }
            if (obj) {
                mark = mark || "";
                var that = this,
                    result = [];
                (this.letters = function (e) {
                    var t = String.fromCharCode(
                        Math.floor(26 * Math.random()) + "a".charCodeAt(0)
                    );
                    return "L" == e && (t = t.toUpperCase()), t;
                }),
                (this.numbers = function (e) {
                    return Math.floor(10 * Math.random()).toString();
                }),
                (this.char_zh = function () {
                    return (
                        eval(
                            'var zh="\\u' +
                            (Math.round(2e3 * Math.random()) + 19968).toString(16) +
                            '"'
                        ),
                        zh
                    );
                });
                for (var i = 0, j = 0; i < 42 && j < 200; j++) {
                    var item = once();
                    console.log(item);
                    var repeat;
                    result.forEach(function (e) {
                            if (e == item) return (repeat = !0), !1;
                        }),
                        repeat ? (repeat = !1) : (i++, result.push(item));
                }
                return result;
            }
        },
        handleOpen(index, indexPath) {
            console.log(index, indexPath);
            console.log("sss");
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        }



    },
    components: {
        Tabs,
        NameSet,
        // userName,
        Menu,
        Row,
        Col,
    },
    mounted: function () {
        var e = this,
            t = [];
        (e.cloneNav = {}),
        e.navs.forEach(function (e) {
                t.push(...e.list);
            }),
            t.forEach(function (t) {
                e.cloneNav[t.id] = $.extend(!0, {}, e[t.id]);
            }),
            document.addEventListener("click", function () {
                e.curCopy = "";
            }),
            $('input[type="radio"]').each(function (e, t) {
                $(t).prop("checked") &&
                    $(t)
                    .parent()
                    .addClass("checked");
            });
    },
    updated: function () {
        var e = this;
        this.triggleUpdate &&
            ($('input[type="radio"]').each(function (e, t) {
                    $(t)
                        .parent()
                        .removeClass("checked"),
                        $(t).prop("checked") &&
                        $(t)
                        .parent()
                        .addClass("checked");
                }),
                $(".select_btn").each(function (t, a) {
                    let r, i;
                    a.id.indexOf("prefix") >= 0 ?
                        ((i = "prefix_num"), (r = [])) :
                        a.id.indexOf("keep") >= 0 ?
                        ((i = a.id.slice(0, -5)), (r = [])) :
                        ((r = [{
                                id: "0",
                                name: "随机"
                            }]),
                            (i = a.id)),
                        e.selectBox[i].forEach(function (e, t) {
                            var a = {};
                            r[t] && r[t].id == t && t++, (a.id = t), (a.name = e), r.push(a);
                        }),
                        $(a).citylist({
                            data: r,
                            id: "id",
                            name: "name",
                            metaTag: "data-sex",
                            selected: "0"
                        });
                }),
                (this.triggleUpdate = !1));
    }
}
</script>

<style >
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
        border-right: 1px solid #e5e5e5;
        flex: none;
        padding: 0 20px;
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

    .name_con ul {
        display: flex;
        flex-flow: row wrap;
        margin-top: 34px;
    }

    .name_con ul li {
        position: relative;
        height: 36px;
    }

    .name_con ul li span {
        display: inline-block;
        width: 130px;
        height: 36px;
        line-height: 36px;
        padding: 0 4px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        cursor: pointer;
    }

    .name_con ul li span.cur {
        background-color: #eee;
    }

    .name_con ul li .tips {
        position: absolute;
        top: -54px;
        left: 50%;
        transform: translate(-50%, 0);
        height: 50px;
        padding: 0 20px;
        line-height: 50px;
        border-radius: 5px;
        background-color: rgb(74, 144, 226);
        white-space: nowrap;
        color: #fff;
        text-align: center;
        cursor: copy;
        z-index: 1000;
    }

    .name_con ul li .tips:after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        border: 4px solid transparent;
        border-top-color: rgb(208, 232, 244);
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
</style>

