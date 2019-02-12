<template>
    <div class='randomContent'>
        <el-container>
            <el-aside class="border-box" width="160px">
                <el-menu class="el-menu-vertical-demo" @select="handleSelect" :default-active="String(0)">
                    <el-menu-item v-for="(item,index) in list" :key="item.id" :index="String(index)" @click="seleNav(item.id,item.category_id)">
                        {{item.title}}
                    </el-menu-item>
                </el-menu>
                <!-- <div @click="GET_CLOUD_NAMES()">初始获取</div> -->
                <!-- <div @click="init_DATA">初始获取</div>  -->
            </el-aside>

            <el-container v-if="selectedSubNav">
              <el-aside class="border-box" width="200px">
                <div class="name_wrap">
                      <div class="name_set">
                          <name-set :renderObj="renderObj"></name-set>
                      </div>
                  </div>
              </el-aside>
              <!-- 生成名字列表 -->
              <el-main width="589px" class="name-aside">
                  <div class="name_con">
                      <div class="name-box" v-for="(item, i) in names[navCur]" :key="item.id">
                          <p class="con-title">
                              <span>{{item.title}}</span>
                              <a class="s-btn" href="javascript:;" @click="delName(i)">移除</a>
                          </p>
                          <ul>
                              <li v-for="name in item.nameList" :key="name.id">
                                  <span class="li-item" v-if="name!='null'" :class="{cur: curCopy==name && namesArryIndex==i}" @click.stop="tips(name, i, $event)" :title="name">
                                      {{name}}
                                  </span>
                                  <div class="tips"  v-show="curCopy == name && namesArryIndex==i">
                                      <span class="btn-collect" @click="collectName(name,navCur,categoryId,item.categoryName)">收藏</span>|<span class="btn-copy" @click.stop="copy(name)">复制</span>
                                  </div>
                                  <p class="nodata" v-if="name=='null'">
                                      {{hint}}
                                  </p>
                              </li>
                          </ul>
                      </div>
                  </div>
              </el-main>
            </el-container>
            <!-- 收藏列表 -->
            <el-container v-else>
              <el-main>
                <div class="name_con collect_con">

                  <div class="name-box" v-for="(val, i) in GET_RANDOM_NAMES.NAME_LIST" :key="i" v-show="val.content.length && val.parent_id == parentId">
                      <p class="con-title">
                          <span>{{val.title.split('-')[1]}}</span>
                      </p>
                      <ul>
                          <li v-for="(name, index) in val.content" :key="index">
                              <span class="li-item" v-if="name!='null'" :class="{cur: curCopy==name && namesArryIndex==i}" @click.stop="tips(name, i, $event)" :title="name">
                                  {{name}}
                              </span>
                              <div class="tips"  v-show="curCopy == name && namesArryIndex==i">
                                  <span class="btn-collect" @click="delCollectName(index,val.category_id)">删除</span>|<span class="btn-copy" @click.stop="copy(name)">复制</span>
                              </div>
                          </li>
                      </ul>
                  </div>

                </div>
              </el-main>

            </el-container>

        </el-container>


    </div>
</template>

<script>
import { Menu, Row, Col, Message } from "element-ui";
import { clipboard } from "electron";
import NameSet from "./nameSet";
// import $ from 'jquery';
import nameData from "./name.json";
import {mapActions, mapGetters} from 'vuex'

export default {
  props: ["list","navIndex","parentId"],
  data() {
    //选择条件dom生成函数
    function createDom(domType, domCont, domClass) {
      let dom = {};
      if (($.extend(!0, dom, _domAttribute[domType]), domCont))
        switch (domType) {
          case "title":
            dom.text = domCont;
            break;
          case "inputT":
            domCont.attrs || domCont.props || domCont.domProps
              ? Object.assign(dom.props, domCont)
              : Object.assign(dom.props.attrs, domCont);
            break;
          case "inputR":
            $.extend(!0, dom.child[0].props, domCont);
            break;
          case "label":
            (dom.text = domCont.text), (dom.props.attrs.for = domCont.for);
            break;
          case "btnMin":
          case "btnPri":
            (dom.text = "string" == typeof domCont ? domCont : domCont.text),
              Object.assign(dom.props, domCont.props);
            break;
          case "row":
            Object.assign(dom.child, domCont.child);
            break;
          case "select":
            Object.assign(dom.child[0].props.attrs, domCont);
        }
      return domClass && (dom.props.class += " " + domClass), dom;
    }
    //选择条件区域，根据标签类型定义属性及方法
    let _domAttribute = {
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
        child: [
          {
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
          }
        ]
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
        child: [
          {
            tag: "div",
            props: {
              class: "select_btn",
              attrs: {
                id: ""
              }
            }
          }
        ]
      }
    };
    //所有二级分类对应的选择条件区域dom结构
    let _allDom = {
      person_zh: {
        class: "person_zh",
        list: [
          [
            createDom("title", "姓氏"),
            createDom("inputT", {
              placeholder: "请输入或选择(最多10字)",
              id: "xing"
            }),
            createDom(
              "row",
              {
                child: [
                  createDom("btnMin", {
                    text: "随机单姓",
                    props: {
                      on: {
                        click: this.xing
                      }
                    }
                  }),
                  createDom("btnMin", {
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
            createDom("title", "性别"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "male"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "男",
                  for: "male"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "female"
                  }
                }),
                createDom("label", {
                  text: "女",
                  for: "female"
                })
              ]
            })
          ],
          [
            createDom("title", "字数"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "word_num",
                    id: "two"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "二字名",
                  for: "two"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "word_num",
                    id: "three"
                  }
                }),
                createDom("label", {
                  text: "三字名",
                  for: "three"
                })
              ]
            })
          ],
          [
            createDom("btnPri", {
              text: "生成人名",
              props: {
                attrs: {
                  id: "zhname"
                }
              }
            }),
            createDom("btnPri", {
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
            createDom("title", "语言"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "lang",
                    id: "zh"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "中文",
                  for: "zh"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "lang",
                    id: "en"
                  }
                }),
                createDom("label", {
                  text: "英文",
                  for: "en"
                })
              ]
            })
          ],
          [
            createDom("title", "姓氏"),
            createDom("inputT", {
              placeholder: "请输入或选择",
              id: "xing"
            }),
            createDom(
              "btnMin",
              {
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
            createDom("title", "性别"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "male"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "男",
                  for: "male"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "female"
                  }
                }),
                createDom("label", {
                  text: "女",
                  for: "female"
                })
              ]
            })
          ],
          [
            createDom("btnPri", {
              text: "生成人名",
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
            createDom("title", "语言"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "lang",
                    id: "zh"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "中文",
                  for: "zh"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "lang",
                    id: "jp"
                  }
                }),
                createDom("label", {
                  text: "日文",
                  for: "jp"
                })
              ]
            })
          ],
          [
            createDom("title", "姓氏"),
            createDom("inputT", {
              placeholder: "请输入或选择",
              id: "xing"
            }),
            createDom(
              "btnMin",
              {
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
            createDom("title", "性别"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "male"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "男",
                  for: "male"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "female"
                  }
                }),
                createDom("label", {
                  text: "女",
                  for: "female"
                })
              ]
            })
          ],
          [
            createDom("btnPri", {
              text: "生成人名",
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
            createDom("title", "性别"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "male"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "男",
                  for: "male"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "sex",
                    id: "female"
                  }
                }),
                createDom("label", {
                  text: "女",
                  for: "female"
                })
              ]
            })
          ],
          [
            createDom("title", "符号"),
            createDom("row", {
              child: [
                createDom("inputR", {
                  attrs: {
                    name: "sign",
                    id: "sign"
                  },
                  domProps: {
                    checked: !0
                  }
                }),
                createDom("label", {
                  text: "有",
                  for: "sign"
                }),
                createDom("inputR", {
                  attrs: {
                    name: "sign",
                    id: "unsign"
                  }
                }),
                createDom("label", {
                  text: "无",
                  for: "unsign"
                })
              ]
            })
          ],
          [
            createDom("btnPri", {
              text: "生成网名",
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
            createDom("title", "行政区划"),
            createDom("select", {
              id: "place_zh_areas"
            }),
            createDom("btnPri", {
              text: "生成虚拟地区",
              props: {
                attrs: {
                  id: "norealzharea"
                }
              }
            }),
            createDom("btnPri", {
              text: "生成真实地区",
              props: {
                attrs: {
                  id: "realzharea"
                }
              }
            })
          ],
          [
            createDom("title", "地点单位"),
            createDom("select", {
              id: "place_zh_maps"
            }),
            createDom("btnPri", {
              text: "生成虚拟地点",
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
            createDom("title", "地点单位"),
            createDom("select", {
              id: "place_en_maps"
            }),
            createDom("btnPri", {
              text: "生成虚拟地名",
              props: {
                attrs: {
                  id: "norealenmap"
                }
              }
            })
          ],
          [
            createDom("title", "真实地名"),
            createDom("btnPri", {
              text: "生成西方地名",
              props: {
                attrs: {
                  id: "realenarea"
                }
              }
            }),
            createDom("btnPri", {
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
            createDom("title", "国家"),
            createDom("select", {
              id: "place_force_country"
            }),
            createDom("btnPri", {
              text: "生成东方国名",
              props: {
                attrs: {
                  id: "eastcountry"
                }
              }
            }),
            createDom("btnPri", {
              text: "生成西方国名",
              props: {
                attrs: {
                  id: "westcountry"
                }
              }
            })
          ],
          [
            createDom("title", "势力单位"),
            createDom("select", {
              id: "place_force_east"
            }),
            createDom("btnPri", {
              text: "生成东方势力",
              props: {
                attrs: {
                  id: "eastforce"
                }
              }
            })
          ],
          [
            createDom("title", "势力单位"),
            createDom("select", {
              id: "place_force_west"
            }),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
                text: "东方星球",
                props: {
                  attrs: {
                    id: "eaststar"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "西方星球",
              props: {
                attrs: {
                  id: "weststar"
                }
              }
            }),
            createDom("btnPri", {
              text: "编号星球",
              props: {
                attrs: {
                  id: "numberstar"
                }
              }
            }),
            // createDom("btnPri", {
            //   text: "未知星球",
            //   props: {
            //     attrs: {
            //       id: "unknownstar"
            //     }
            //   }
            // })
          ]
        ]
      },
      martial_god: {
        class: "martial_god",
        list: [
          [
            createDom("title", "招式"),
            createDom("select", {
              id: "zhaoshi-prefix"
            }),
            createDom("btnPri", {
              text: "生成招式",
              props: {
                attrs: {
                  id: "zhaoshi"
                }
              }
            })
          ],
          [
            createDom("title", "秘籍"),
            createDom("select", {
              id: "miji-prefix"
            }),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
                text: "武功招式",
                props: {
                  attrs: {
                    id: "wgzs"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "武功秘籍",
              props: {
                attrs: {
                  id: "wgmj"
                }
              }
            }),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
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
            createDom(
              "btnPri",
              {
                text: "刀",
                props: {
                  attrs: {
                    id: "dao"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "剑",
              props: {
                attrs: {
                  id: "jian"
                }
              }
            }),
            createDom("btnPri", {
              text: "枪",
              props: {
                attrs: {
                  id: "qiang"
                }
              }
            }),
            createDom("btnPri", {
              text: "奇门",
              props: {
                attrs: {
                  id: "qimeng"
                }
              }
            }),
            createDom("btnPri", {
              text: "远程",
              props: {
                attrs: {
                  id: "yuancheng"
                }
              }
            }),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
                text: "枪械",
                props: {
                  attrs: {
                    id: "guns"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "舰船载具",
              props: {
                attrs: {
                  id: "ships"
                }
              }
            }),
            createDom("btnPri", {
              text: "空中载具",
              props: {
                attrs: {
                  id: "flys"
                }
              }
            }),
            createDom("btnPri", {
              text: "陆地载具",
              props: {
                attrs: {
                  id: "cars"
                }
              }
            }),
            createDom("btnPri", {
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
            createDom("title", "东方"),
            createDom("select", {
              id: "fabao-prefix"
            }),
            createDom("btnPri", {
              text: "生成东方法宝",
              props: {
                attrs: {
                  id: "eastfabao"
                }
              }
            })
          ],
          [
            createDom("title", "西方"),
            createDom("select", {
              id: "equip_magic_en-keep"
            }),
            createDom("btnPri", {
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
      other: {
        class: "other",
        list: [
          [
            createDom(
              "btnPri",
              {
                text: "天材地宝",
                props: {
                  attrs: {
                    id: "tcdb"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "妖兽",
              props: {
                attrs: {
                  id: "yaoshou"
                }
              }
            }),
            createDom(
              "btnPri",
              {
                text: "丹药",
                props: {
                  attrs: {
                    id: "danyao"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
              text: "坐骑",
              props: {
                attrs: {
                  id: "zuoqi"
                }
              }
            }),
            createDom(
              "btnPri",
              {
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
      },
      other_god: {
        class: "other_god",
        list: [
          [
            createDom(
              "btnPri",
              {
                text: "天材地宝",
                props: {
                  attrs: {
                    id: "tcdb"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
                text: "丹药",
                props: {
                  attrs: {
                    id: "danyao"
                  }
                }
              },
              "mt15"
            ),
            createDom("btnPri", {
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
            createDom(
              "btnPri",
              {
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
      activeName: this.list[0].id,
      selectedSubNav: true,
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
      subNavs: [],
      //生成的名称数组
      // names: [],
      names: {},
      //地名下拉选项数据
      selectBox: nameData.selectbox,
      //选中的二级导航id，默认第一个
      categoryId: this.list[0].category_id,
      navCur: this.list[0].id,
      renderObjs: _allDom,
      //当前选择条件的dom结构，默认第一个
      // renderObj: _allDom.person_zh,
      renderObj: _allDom[this.list[0].id],

      //部分二级分类默认选中条件
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
      curCopy: "",
      namesArryIndex: '',
      // tipsWidthOver: !1,
      hint: "无此类数据",
      defaultHint: "无此类数据",
      namesTitle: ''
    };
  },
  methods: {
    ...mapActions({
      UPDATE_RANDOM_NAME_CONTENT: 'UPDATE_RANDOM_NAME_CONTENT',
      GET_CLOUD_NAMES: 'GET_CLOUD_NAMES'
    }),
    tips: function(name, index, event) {
      this.curCopy = name;
      this.namesArryIndex = index;
      // let r = $(event.target);
      // this.tipsWidthOver = 90 < r.siblings().width();
    },
    copy: function(name) {
      clipboard.writeText(name), (this.curCopy = !1);
    },
    
    //选中二级导航
    seleNav: function(subNavId,categoryId) {
      if(subNavId == 'collect_list'){
        this.selectedSubNav = false;
      }else{
        this.selectedSubNav = true;
        (this.navCur = subNavId),
        (this.categoryId = categoryId),
        (this.renderObj = {}),
        (this.triggleUpdate = !0),
        (this.renderObj = $.extend(!0, {}, this.renderObjs[subNavId])),
        (this[subNavId] = $.extend(!0, {}, this.cloneNav[subNavId])),    //初始化默认选择条件
        this[subNavId].hint ? (this.hint = this[subNavId].hint) : (this.hint = this.defaultHint);
      }
      console.log('navCur',this.navCur)
      console.log('categoryId',this.categoryId)
      console.log('curSubNavCont',this.cloneNav[subNavId])
      console.log('cloneNav',this.cloneNav)
    },
    radioChange: function(e) {
      (this[this.navCur][e.target.name] = e.target.id),
      console.log(this[this.navCur]),
      e.target.checked && $(e.target.parentElement).addClass("checked").siblings("span").removeClass("checked");
    },
    textChange: function(e) {
      let t = e.target.value;
      switch (this.navCur) {
        case "person_zh":
          t && t.length < 11
            ? (this[this.navCur][e.target.id] = t)
            : ((t = t.slice(0, 10)),
              (document.getElementById("xing").value = t),
              (this[this.navCur][e.target.id] = t));
          break;
        case "person_en":
        case "person_jp":
          this[this.navCur][e.target.id] = t || "";
      }
      console.log(this[this.navCur])
    },
    //随机返回一个名字
    search: function(nameKey) {
      function t(obj) {    //随机返回一个数组下标
        if (Array.isArray(obj)) return Math.floor(Math.random() * obj.length);
        console.log("不是数组");
      }
      "string" != typeof nameKey && console.log("获取数据key不是字符");
      let namesArry, r, i, s;

      if (-1 != nameKey.indexOf("!")) {  //有 ！分割数据
        // r = (i = nameKey.split("!"))[0];
        i = nameKey.split("!");     // ! 分割数组
        r = i[0];         //选中类型
        s = i.slice(1);   //选中数据
        nameKey = i[1];    //筛选出的选中数据
      }
      // -1 != nameKey.indexOf("!") &&
      //   ( (r = (i = nameKey.split("!"))[0]), (s = i.slice(1)), (nameKey = i[1]) );
      let n = t( (namesArry = "selectbox" == r ? nameData[r][nameKey] : nameData[nameKey]) );  //n一个随机数 ，a名字数组

      if ("double" == r) {   //双词缀
        for (var o = n; n == o; ) o = t(namesArry);
        return namesArry[n] + namesArry[o];
      }
      if ("random" == r) {   //中国人名尊称、东方星球
        let e = t(s),
          f = t(nameData[s[e]]);
        return nameData[s[e]][f];
      }
      if ("suffix" == r) {   //后缀 ，（未来机甲）
        let e = i[2] || "";
        return namesArry[n] + e;
      }
      if ("filter" == r) {   //中国真实地名
        return (namesArry = namesArry.filter(function(e) {
          return -1 != e.indexOf(i[2]);
        }))[t(namesArry)];
      }
      return namesArry[n];
    },
    //生成随机姓氏
    xing: function() {
      var e = this.search("xing");
      (this.person_zh.xing = e), (document.getElementById("xing").value = e);
    },
    fuxing: function() {
      var e = this.search("fuxing");
      (this.person_zh.xing = e), (document.getElementById("xing").value = e);
    },
    enxing: function() {
      var e = this.search("enxing-" + this.person_en.lang);
      (this.person_en.xing = e), (document.getElementById("xing").value = e);
    },
    jpxing: function() {
      var e = this.search("jpxing-" + this.person_jp.lang);
      (this.person_jp.xing = e), (document.getElementById("xing").value = e);
    },
    //radio识别
    radioVal(str){
      switch(str){
        case 'male':
          return '男';
          break;
        case 'female':
          return '女';
          break;
        case 'two':
          return '二字';
          break;
        case 'three':
          return '三字';
        case 'zh':
          return '中文';
          break;
        case 'en':
          return '英文';
          break;   
        case 'jp':
          return '日文';
          break;    
        case 'unsign':
          return '无';
          break;
        case 'sign':
          return '有';
          break;       
        default:
          return str        
      }
    },
    //根据选择条件生成名字列表
    createName: function(event) {
      this.namesTitle = event.target.innerText.replace('生成','');
      //获取下拉选框的值
      function selectVal(domId) {
        let val = $("#" + domId).find("dt").text();
        if ("单词缀" == val) selectInfo[domId] = "";
        else if ("双词缀" == val) selectInfo["double!" + domId] = "";
        else {
          if ("三词缀" == val) return (selectInfo["xxx之"] = ""), (selectInfo["xxx的"] = ""), "";
          "随机" == val && (val = "");
        }
        return console.log(val), val;
      }
      console.log('二级分类',this.navCur)
      console.log('生成条件',this[this.navCur])
      var a;   //英文名间隔
      var selectInfo = {};  //选中的生成条件
      switch (event.target.id) {
        case "zhname":
          (selectInfo.xing = this[this.navCur].xing),
            (selectInfo[this.person_zh.sex + "-" + this.person_zh.word_num] = "");
            this.namesTitle += ': '+this.radioVal(this.person_zh.sex) + '/' + this.radioVal(this.person_zh.word_num) + (this[this.navCur].xing ? '/'+this[this.navCur].xing : this[this.navCur].xing)
          break;
        case "zcname":
          (selectInfo[this.person_zh.sex + "-three"] = this[this.navCur].xing),
            (selectInfo["random!zc!zc-" + this.person_zh.sex] = "");
            this.namesTitle += ': '+this.radioVal(this.person_zh.sex) + '/' + this.radioVal(this.person_zh.word_num) + (this[this.navCur].xing ? '/'+this[this.navCur].xing : this[this.navCur].xing)
          break;
        case "enname":
          (selectInfo["enxing-" + this[this.navCur].lang] = this[this.navCur].xing),
            (selectInfo["enname-" + this.person_en.lang + "-" + this.person_en.sex] =
              ""),
            (a = " ");
            this.namesTitle = this.radioVal(this.person_en.sex) + '/' + this.radioVal(this.person_en.lang) + (this[this.navCur].xing ? '/'+this[this.navCur].xing : this[this.navCur].xing)

          break;
        case "jpname":
          (selectInfo["jpxing-" + this[this.navCur].lang] = this[this.navCur].xing),
            (selectInfo["jpname-" + this.person_jp.lang + "-" + this.person_jp.sex] =
              "");
            this.namesTitle = this.radioVal(this.person_jp.sex) + '/' + this.radioVal(this.person_jp.lang) + (this[this.navCur].xing ? '/'+this[this.navCur].xing : this[this.navCur].xing)

          break;
        case "webname":
          selectInfo[this[this.navCur].sign + "-" + this[this.navCur].sex] = "";
            this.namesTitle = this.radioVal(this.person_web.sex) + '/' + this.radioVal(this.person_web.sign) 

          break;
        case "realzharea":
          i = selectVal("place_zh_areas");
          selectInfo["filter!place-zh-real!" + i] = "";
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "norealzharea":
          i = selectVal("place_zh_areas");
          (selectInfo["place-zh-noreal"] = ""), (selectInfo["selectbox!place_zh_areas"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "norealzhmap":
          i = selectVal("place_zh_maps");
          (selectInfo["place-zh-noreal"] = ""), (selectInfo["selectbox!place_zh_maps"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "norealenmap":
          i = selectVal("place_en_maps");
          (selectInfo["place-en-noreal"] = ""), (selectInfo["selectbox!place_en_maps"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "realenarea":
          selectInfo["place-en-real"] = "";
          break;
        case "realjparea":
          selectInfo["place-jp-real"] = "";
          break;
        case "eastcountry":
          i = selectVal("place_force_country");
          (selectInfo["place-zh-noreal"] = ""), (selectInfo["selectbox!place_force_country"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "westcountry":
          i = selectVal("place_force_country");
          (selectInfo["place-en-noreal"] = ""), (selectInfo["selectbox!place_force_country"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "eastforce":
          i = selectVal("place_force_east");
          (selectInfo["force-zh"] = ""), (selectInfo["selectbox!place_force_east"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "westforce":
          i = selectVal("place_force_west");
          (selectInfo["place-en-noreal"] = ""), (selectInfo["selectbox!place_force_west"] = i);
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "eaststar":
          (selectInfo["random!female-three!male-three"] = ""), (selectInfo.star = "");
          break;
        case "numberstar":
          (selectInfo["star-num-prefix"] = ""),
            (selectInfo["*L{1,3}!d{1,4}"] = ""),
            (selectInfo.star = "");
          break;
        case "unknownstar":
          (selectInfo["*Z{1,2}"] = ""), (selectInfo.star = "");
          break;
        case "weststar":
          (selectInfo["enxing-zh"] = ""), (selectInfo.star = "");
          break;
        case "zhaoshi":
          i = selectVal("zhaoshi-prefix");
          selectInfo.zhaoshi = "";
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "miji":
          i = selectVal("miji-prefix");
          selectInfo.miji = "";
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "eastfabao":
          i = selectVal("fabao-prefix");
          selectInfo.fabao = "";
            this.namesTitle += i ? ': '+ i : i; 

          break;
        case "westfabao":
          var i;
          (i = selectVal("equip_magic_en-keep")) && (selectInfo[i] = ""), (selectInfo["fabao-en"] = "");
            this.namesTitle += i ? ': '+ i : ': '+'xxx的&xxx之'; 

          break;
        case "guns":
          (selectInfo["*L{1,3}!-!d{2,3}![式型]"] = ""), (selectInfo.guns = "");
          break;
        case "ships":
          (selectInfo["ships-name"] = ""), (selectInfo.ships = "");
          break;
        case "flys":
          (selectInfo["*L{1,2}!-!d{1,2}"] = ""), (selectInfo.flys = "");
          break;
        case "cars":
          (selectInfo["*L{1,2}!-!d{1,2}"] = ""), (selectInfo.cars = "");
          break;
        case "mecha":
          (selectInfo["mecha-name"] = ""),
            (selectInfo["suffix!mecha-type!级"] = ""),
            (selectInfo["suffix!mecha-shape!型机甲"] = "");
          break;
        case "yaoshou":
          (selectInfo["fabao-prefix"] = ""),
            (selectInfo["yaoshou-prefix1"] = ""),
            (selectInfo["yaoshou-prefix2"] = ""),
            (selectInfo.yaoshou = "");
          break;
        case "tcdb":
          (selectInfo["tcdb-prefix"] = ""), (selectInfo.tcdb = "");
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
          selectInfo[event.target.id] = "";
      }
      // this.names = this.result(selectInfo, a);
      // console.log('selectInfo',selectInfo)

      if(this.names[this.navCur].length < 20){
        this.names[this.navCur].push(
          {
            title: this.namesTitle,
            nameList: this.result(selectInfo, a),
            categoryName: event.target.id
          }
        )
      }else{
        Message({
            showClose: true,
            message: '不能超过20条',
        })
        // alert('不能超过20条')
      }
      
      console.log("names",this.names);
      console.log("curnames",this.names[this.navCur]);
      
      this.$nextTick(function(){  //每次生成都滚动到页面底部
        var div = document.getElementsByClassName('name-aside')[this.navIndex];
        // console.log(div)
        div.scrollTop = div.scrollHeight;
      })


    },
    //收藏名字
    collectName(name,subNav,categoryId,categoryName){
      var newCategoryId;
      let token = this.GET_USET_DATA.token
      //其他分类的category_id重新分配
      switch (categoryName) {
        case 'tcdb':
          newCategoryId = '601'
          break;
        case 'yaoshou':
          newCategoryId = '602'
          break;
        case 'danyao':
          newCategoryId = '603'
          break;
        case 'zuoqi':
          newCategoryId = '604'
          break;
        case 'guaiwu':
          newCategoryId = '605'
          break;
        default:
          newCategoryId = categoryId
      }

      var selectName
      for(let i = 0; i<this.GET_RANDOM_NAMES.NAME_LIST.length;i++){
        if(this.GET_RANDOM_NAMES.NAME_LIST[i]['category_id'] == newCategoryId){
          selectName = this.GET_RANDOM_NAMES.NAME_LIST[i];
        }
      }
      this.UPDATE_RANDOM_NAME_CONTENT({
        category_id: newCategoryId,
        content: name,
        random_name_uuid: selectName.client_uuid,
        version: selectName.version,
        type: 'add',
        token: token
      })

    },
    delCollectName(index,categoryId){
      var selectName
      let token = this.GET_USET_DATA.token
      for(let i = 0; i<this.GET_RANDOM_NAMES.NAME_LIST.length;i++){
        if(this.GET_RANDOM_NAMES.NAME_LIST[i]['category_id'] == categoryId){
          selectName = this.GET_RANDOM_NAMES.NAME_LIST[i];
        }
      }
      this.UPDATE_RANDOM_NAME_CONTENT({
        category_id: categoryId,
        content: '',
        random_name_uuid: selectName.client_uuid,
        version: selectName.version,
        type: 'delete',
        index: index,
        token: token
      })
      console.log(index,categoryId)

    },
    delName(index){
      this.names[this.navCur].splice(index,1)
    },

    //生成名称列表函数
    result: function(obj, mark) {     //obj选择条件 {star-num-prefix: "", *L{1,3}!d{1,4}: "", star: ""}
      if (obj) {
        mark = mark || "";
        var that = this,
          result = [];
        this.letters = function(e) {     //随机返回小写字母 a-z，如果传入L，则返回大写字母
            var t = String.fromCharCode(
              Math.floor(26 * Math.random()) + "a".charCodeAt(0)
            );
            return "L" == e && (t = t.toUpperCase()), t;
        };
        this.numbers = function(e) {    //随机返回 0-9 的字符串
            return Math.floor(10 * Math.random()).toString();
        };
        this.char_zh = function() {  //随机生成一个汉字
            // var zh = unescape( ('\\u' + ( Math.round(2e3 * Math.random()) + 19968 ).toString(16)).replace(/\\u/g, '%u') )
            var zh = ''
            eval('zh="\\u' + (Math.round(2e3 * Math.random()) + 19968).toString(16) + '"')
            return zh
            // return 
            //   eval('var zh="\\u' + (Math.round(2e3 * Math.random()) + 19968).toString(16) + '"'), zh
        };
        for (var i = 0, j = 0; i < 15 && j < 200; j++) {
          var name = once();
          var repeat;
          result.forEach(function(e) {
            if (e == name) return (repeat = !0), !1;
          }),
            repeat ? (repeat = !1) : (i++, result.push(name));
        }
        return result;
      }


      function times(e, t) {
        return (
          (e = parseInt(e)),
          (t = parseInt(t)),
          e + Math.round(Math.random() * (t - e))
        );
      }

      //随机生成一个单词
      function getWord(type, t, a) {   //生成名字类型  letters，numbers，char_zh，char
        let r = "";
        for (var i = 0; i < t; i++){
            if ("char" == type) {
              r += a[Math.floor(Math.random() * a.length)];
            } else {
              r += that[type](a);
            }
        }
        console.log('r',r)  
        return r;
      }

      function random(objKey) {
        var t = "";
        return (
          objKey.split("!").forEach(function(val, index) {
            let r = val.match(/\{(\d*)(,?)(\d*)\}/);
            console.log('objkey',objKey)
            console.log('objkeymatch',r)
            let i = 1;
            r && ( i = r[3] ? times(r[1], r[3]) : r[1] );
            let s = val[0];
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
                let a = val.match(/\[(.+)\]/);
                (a = a[1].split("")), (t += getWord("char", i, a));
                break;
              default:
                t += val;
            }
          }),
          console.log('t',t),
          t
        );
      }

      function once() {    //单次生成一个名字
        var e = "",t = "";
        for (var a in obj){   //选择条件的key值进行处理
            (t = "*" == a[0] ? random(a.slice(1)) : obj[a] ? obj[a] : that.search(a)),
            t ? (e += t + mark) : (e = "null");
            // console.log(t)
        }
        return e.trim();
      }

      

    },

    handleClick(tab,enent){
      this.seleNav(tab.name)
    },
    handleSelect(key, keyPath) {
      // console.log(key, keyPath)
    },
    init_DATA(){
      let token = this.GET_USET_DATA.token
      this.GET_CLOUD_NAMES({token})
    }
  },
 computed: {
    ...mapGetters({
      GET_RANDOM_NAMES: 'GET_RANDOM_NAMES',
      GET_USET_DATA: 'user/GET_USET_DATA'
    }),
    
  },
  mounted: function() {
    var _this = this;
      // t = [];
    (_this.cloneNav = {}),
      _this.navs.forEach(function(val) {
        _this.subNavs.push(...val.list);
      }),
      _this.subNavs.forEach(function(val) {
        _this.cloneNav[val.id] = $.extend(!0, {}, _this[val.id]);     //所有二级分类的默认选择条件
        // _this.names[val.id] = [];     //所有二级分类对应的名字列表
        _this.$set( _this.names,val.id,[])
      }),
      // console.log(_this.cloneNav)
      // console.log(_this.names)
      document.addEventListener("click", function() {
        _this.curCopy = "";
      }),
      $('input[type="radio"]').each(function(index, dom) {
        $(dom).prop("checked") && $(dom).parent().addClass("checked");
      });

      //初始化选择条件的下拉列表
      $(".select_btn").each(function(i, dom) {
        let oppArr, keyname;
        dom.id.indexOf("prefix") >= 0 ? ((keyname = "prefix_num"), (oppArr = [])) : dom.id.indexOf("keep") >= 0 ? ((keyname = dom.id.slice(0, -5)), (oppArr = [])) : ((oppArr = [{id: "0", name: "随机"}]), (keyname = dom.id)),
        _this.selectBox[keyname].forEach(function(val, index) {
            var a = {};
            oppArr[index] && oppArr[index].id == index && index++, (a.id = index), (a.name = val), oppArr.push(a);
        }),
        $(dom).citylist({
            data: oppArr,
            id: "id",
            name: "name",
            metaTag: "data-sex",
            selected: "0"
        });
      })

  },
  updated: function() {
    var _this = this;
    this.triggleUpdate &&
      ($('input[type="radio"]').each(function(i, dom) {
        $(dom).parent().removeClass("checked");
        $(dom).prop("checked") && $(dom).parent().addClass("checked");
      }),
      //下拉列表
      $(".select_btn").each(function(i, dom) {
        let oppArr, keyname;
        dom.id.indexOf("prefix") >= 0 ? ((keyname = "prefix_num"), (oppArr = [])) : dom.id.indexOf("keep") >= 0 ? ((keyname = dom.id.slice(0, -5)), (oppArr = [])) : ((oppArr = [{id: "0", name: "随机"}]), (keyname = dom.id)),
        _this.selectBox[keyname].forEach(function(val, index) {
            var a = {};
            oppArr[index] && oppArr[index].id == index && index++, (a.id = index), (a.name = val), oppArr.push(a);
        }),
        $(dom).citylist({
            data: oppArr,
            id: "id",
            name: "name",
            metaTag: "data-sex",
            selected: "0"
        });
      }),
      (this.triggleUpdate = !1));
  },
   components: {
    Menu,
    Row,
    Col,
    NameSet
  }
  

};
</script>

<style scoped >
.randomContent,
.el-container {
  /* height: 590px; */
  height: 100%;
}
.border-box {
  border-right: 1px solid #edeff3;
}
.el-aside {
  padding-top: 15px;
}
.con-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.con-title span {
  color: #666666;
  font-size: 12px;
}
.s-btn {
  display: inline-block;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  background-color: #e9ebed;
  color: #666666;
}
.btn-collect {
  cursor: pointer;
}
.btn-copy {
  cursor: copy;
}
.name-box{
  margin-bottom: 15px;
}
.collect_con{
  width: 710px;
}
.collect_con ul{
  width: 710px;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.08);
  padding: 10px 0;
}
</style>
