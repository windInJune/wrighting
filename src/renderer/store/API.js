// const host = window.location.host;
// const LOCA = /(127\.0\.)|(192\.168\.)|(localhost)/.test(host);
// const loginHost = 'http://doc.chenggua.com';
var hostAPI;
const urlVersion = '/v2';
const newUrlVersion = '/v3';
if(process.env.NODE_ENV == 'development'){
    hostAPI = 'http://doc.chenggua.com';
  //  hostAPI = 'http://212.64.81.177:8104'
}else{
   hostAPI = 'https://mazi.chenggua.com'
}

export const bookListV1 = hostAPI + '/mazimodule' + urlVersion + '/book/list'
export const volumeList = hostAPI + '/mazimodule' + newUrlVersion + '/book/catalogue/list'
//用户查询图书列表
export const bookList = hostAPI + '/mazimodule' + urlVersion +'/book/list'
//用户同步图书目录
export const catalogueSync = hostAPI + '/mazimodule' + urlVersion +'/book/catalogue/sync'
// 查询图书目录列表
export const catalogueList = hostAPI + '/mazimodule' + urlVersion +'/book/catalogue/list'
// 用户同步卷下图书内容列表
export const chapterContentSync = hostAPI + '/mazimodule' + urlVersion +'/book/volume/chapter/content/list/sync'
//查询卷下的章节列表
export const chapterList = hostAPI + '/mazimodule' + newUrlVersion +'/book/volume/catalogue/list'
//查询章节内容
export const chapterContent = hostAPI + '/mazimodule' + newUrlVersion +'/book/volume/chapter/content/list'


//user.js
//账号密码登录
export const USER_SIGNIN = hostAPI + '/maziuser/login'
//快捷登录（验证码登录）
export const USER_CODE_SIGNIN = hostAPI + '/maziuser/quick-login'
//验证手机是否注册
export const getIsPhone = hostAPI + '/maziuser/verify/phone'
// 获取验证码
export const getCode = hostAPI  + '/maziuser/sms/login'
//用户普通注册
export const USER_REGISTER = hostAPI  + '/maziuser/register'
//下载用户sql
export const USER_DOWNLOAD_SQL = hostAPI  + '/mazimodule' + urlVersion +'/sql/download'
//修改个人资料
export const USER_CHANGE_DATA= hostAPI  + '/maziuser/edit/profile'
//验证token是否失效
export const verifyToken = hostAPI + '/maziuser/verify/token'
// 修改密码
export const editPassword = hostAPI + '/maziuser/edit/password'




//灵感随笔
export const noteSync = hostAPI + '/mazimodule' + urlVersion +'/book/notes/list/sync' //post
export const noteList = hostAPI + '/mazimodule' + urlVersion +'/book/notes/list' //get
//随机取名
export const randomNameSync = hostAPI + '/mazimodule' + urlVersion +'/randomname/collection/list/sync' //post
export const randomNameList = hostAPI + '/mazimodule' + urlVersion +'/randomname/collection/list' //get
//敏感词
export const sensitiveWordSync = hostAPI + '/mazimodule' + urlVersion +'/custom/sensitivewords/sync' //post
export const sensitiveWordGet = hostAPI + '/mazimodule' + urlVersion +'/common/sensitivewords' //get  获取公共部分及版本号  &types=version
export const sensitiveWordSearch = hostAPI + '/mazimodule' + urlVersion +'/custom/sensitivewords' //get  查询版本是否冲突

//插件设置
export const settingSync = hostAPI + '/mazimodule'+ urlVersion +'/global/setting/sync'  //post  同步设置，插件与基本设置
export const settingGet = hostAPI + '/mazimodule'+ urlVersion +'/global/setting'  //get  查询设置


// 书本结构目录
export const book_category = 'client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version'
// 书籍用的结构
export const book_category_for_lodash_pick_string = 'client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,word_count,book_type,creation_status,uid,is_deleted,is_upload,version,conflict_uuid, sorts'
export const book_category_for_lodash_pick = ['client_uuid', 'parent_client_uuid', 'type', 'title', 'summary', 'chapter_unit_price', 'goal_word_count', 'word_count', 'book_type', 'creation_status', 'uid', 'is_deleted', 'is_upload', 'version', 'conflict_uuid', 'sorts']

// 卷级+章级用的结构
export const book_category_volume_and_chapter_for_lodash_pick_string = 'client_uuid,parent_client_uuid,type,title,chapter_unit_price,word_count,uid,is_deleted,is_upload,version,conflict_uuid, sorts'
export const book_category_volume_and_chapter_for_lodash_pick = ['client_uuid', 'parent_client_uuid', 'type', 'title', 'chapter_unit_price', 'word_count', 'uid', 'is_deleted', 'is_upload', 'version', 'conflict_uuid', 'sorts']

export const module_record = 'id, client_uuid, category, update_time'
export const chapter_content = 'chapter_uuid,category_id,uid,content,version,is_deleted,is_upload' 
export const chapter_content_for_lodash_pick_string = 'chapter_uuid,category_id,version,is_deleted,is_upload,uid,content' 
export const chapter_content_for_lodash_pick = ['chapter_uuid', 'category_id', 'version', 'is_deleted', 'is_upload']
export const category = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]

//软件版本号
export const appVersion = "0.8.3"
//排行榜
export const rankList = hostAPI + '/mazimodule'+ urlVersion +'/rank/list'     //get  type=1字数排行榜，type=2时长排行榜
export const rankSync = hostAPI + '/mazimodule'+ urlVersion +'/user/statistics/add'    //post

//大纲文本大纲 /mazimodule/v3/book/syllabus/list/sync
export const OUTLINE_TEXT = hostAPI + '/mazimodule/v3/book/syllabus/list/sync'  
export const outline_get = hostAPI + '/mazimodule/v3/book/syllabus/list'  

export const rankDataList = hostAPI + '/mazimodule'+ urlVersion +'/user/statistics'     //get  type=1 字数 2 时间 3 速度
