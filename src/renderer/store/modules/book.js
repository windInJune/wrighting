import axios from 'axios'
import * as api from '../API'
import * as TYPE from '../storeApi'
import { ipcRenderer, remote } from "electron";
import { hmac256,timestamp } from '../../../../static/js/public.js'
import uuid from 'uuid-random';
import Vue from 'vue'
// import path from 'path';
const path = require('path')
import { sqliteDBStrongDecode, arabiaToSimplifiedChinese, arrayReachJson } from '../../../../static/js/public.js'
import localQuery from '@/helper/query.js'
import compare from '@/helper/compare.js'

const localStorage = require('store/dist/store.modern');

const orderBy = require('lodash.orderby')

// var sqliteDB = new SqliteDB();
function initialState() {
  return {
    INFO_BOOK: [],
    BOOK_MESSAGE: {
      status: '',
      message: ''
    },
    //主窗口的书籍
    ALL_BOOKS_ARRAY: [],
    //编辑窗口打开过的书籍
    EDITOR_OPENED_BOOKS: [],
    CURRENT_BOOK_ID: ''
  }
}
// const state = {
//   initialState: initialState(),
//   INFO_BOOK: initialState().INFO_BOOK,
//   BOOK_MESSAGE: {
//     status: initialState().BOOK_MESSAGE.status,
//     message: initialState().BOOK_MESSAGE.message
//   },
//   ALL_BOOKS_ARRAY: initialState().ALL_BOOKS_ARRAY,
//   EDITOR_OPENED_BOOKS: initialState().EDITOR_OPENED_BOOKS,
//   CURRENT_BOOK: initialState().CURRENT_BOOK
// }
const state = initialState()
console.log("funny state!!!!!!!!!!!!!!!!!: ");
console.log(state);

const getters = {
  GET_INFO_BOOK: (store) => {
    // if(store.INFO_BOOK.length){
    //   console.log(store.INFO_BOOK.srot( compare ))
    // }
    return store.INFO_BOOK
  },
  [TYPE.GET_BOOKS_L1]: (store) => {
    //注意不同窗口下的这个数据有差异
    return store.ALL_BOOKS_ARRAY
  },

  [TYPE.GET_OVER_BOOK_L1]: (store) => {
    if(store.ALL_BOOKS_ARRAY)
      return  store.ALL_BOOKS_ARRAY.filter((aBook) => {
        if ((aBook.creation_status == 1)&&(aBook.is_deleted == 0)) return aBook;
      })
  },

  [TYPE.GET_NOT_OVER_BOOK_L1]: (store) => {
    console.log("get not over book l1 called in vuex");
    let notOverBook = null;
    notOverBook = store.ALL_BOOKS_ARRAY.filter((aBook) => {
      // console.log("aBook is: ");
      // console.log(aBook);
      if ((aBook.creation_status === 0)&&(aBook.is_deleted == 0)) return aBook;
    })

    //they want it to be an update-at descending order
    return orderBy(notOverBook, "updated_at", "desc");

  },

  [TYPE.GET_EDITOR_BOOKS_L1]: (store) => {
    console.log("get editor books yyyyyyyyyyyyyyyyyyyy: ");
    return store.EDITOR_OPENED_BOOKS
  },

  [TYPE.GET_CURRENT_BOOK_VOLUMES_L1]: (store) => {
    console.log("current book id!!!!!!!!!!!!!!!: " + store.CURRENT_BOOK_ID)
    // if(!store.CURRENT_BOOK_ID) return;
    // console.log("huh???????? kidding????")
    for(let aBookIndex = 0; aBookIndex < store.EDITOR_OPENED_BOOKS.length; aBookIndex++){
      if(store.EDITOR_OPENED_BOOKS[aBookIndex].client_uuid === store.CURRENT_BOOK_ID){
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS[aBookIndex]))
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS[aBookIndex].volumes))
        // console.log("right one")
        // console.log(aBookIndex);
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS));
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS[aBookIndex].volumes));
        if(store.EDITOR_OPENED_BOOKS[aBookIndex].volumes){
          console.log(store.EDITOR_OPENED_BOOKS[aBookIndex])
          let volumes = store.EDITOR_OPENED_BOOKS[aBookIndex].volumes.filter((item)=>{
            if(item || item.is_deleted != 1) return item
          })
          console.log(volumes)
          return volumes;
        }else{
          return []
        }
      }
    }
  },

  [TYPE.GET_CURRENT_BOOK_ID_L1]: (store) => {
    console.log("get current book id called in vuex:")
    return store.CURRENT_BOOK_ID;
  },

  [TYPE.GET_BOOK_VOLUMES_L1]: (store) => (book_uuid) => {
    console.log("XXXXXXXXXXXXXXXXXX")
    for(let aBookIndex = 0; aBookIndex < store.EDITOR_OPENED_BOOKS.length; aBookIndex++){
      if(store.EDITOR_OPENED_BOOKS[aBookIndex].client_uuid === book_uuid){
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS[aBookIndex]))
        // console.log(JSON.stringify(store.EDITOR_OPENED_BOOKS[aBookIndex].volumes))
        return store.EDITOR_OPENED_BOOKS[aBookIndex].volumes
      }
    }
  },
  [TYPE.GET_VOLUME_CHAPTERS_L1]: (store) => (book_uuid,volume_uuid) => {
    console.log("CHAPTERSCHAPTERSCHAPTERS")
    for(let aBookIndex = 0; aBookIndex < store.EDITOR_OPENED_BOOKS.length; aBookIndex++){
      if(store.EDITOR_OPENED_BOOKS[aBookIndex].client_uuid === book_uuid){
        let volumes = store.EDITOR_OPENED_BOOKS[aBookIndex].volumes
        for (let volumeIndex = 0; volumeIndex < volumes.length; volumeIndex++) {
          if(volumes[volumeIndex].client_uuid === volume_uuid){
            return volumes[volumeIndex].chapters
          }
        }
      }
    }
  },

  [TYPE.GET_OVER_BOOK]: (store) => {
    let bookList = store.INFO_BOOK;
    return bookList.filter((item) => {
      if (item.creation_status == 1) {
        return item
      }
    })
  },
  [TYPE.GET_NOT_OVER_BOOK]: (store) => {
    let bookList = store.INFO_BOOK;
    return bookList.filter((item) => {
      if ((item.creation_status == 0)&&(item.is_deleted === 0)) {
        return item
      }
     })
  },
  [TYPE.GET_BOOK_MESSAGE]: (store) => {
    return store.BOOK_MESSAGE
  }
}
const actions = {

  [TYPE.CREATE_NEW_BOOK_L1]: ({rootState, commit, dispatch}, data) => {
    let aNewBook = localQuery.makeBook(data.formLabelAlign);
    console.log("created new book is: ");
    console.log(aNewBook)
    let aNewVolume = localQuery.makeVolume({bookId: aNewBook.bookId, volumeCount: 0});
    console.log("created new volume is: ");
    console.log(aNewVolume);
    let aNewChapter = localQuery.makeChapter({bookId: aNewBook.bookId, volume_uuid: aNewVolume.volume_uuid,  chapterCount: 0});

    Promise.all([localQuery.insertBookToDB({data: aNewBook, user: data.user}), 
      localQuery.insertVolumeToDB({data: aNewVolume, user: data.user}),
      localQuery.insertChapterToDB({data: aNewChapter, user: data.user})]).then((res) => {
        console.log("insert book+volume+chapter done")
        console.log(res);

        //插入vuex 使其在页面上展示
        let bookForVuex = { ...aNewBook };

        console.log("book for vuex: ");
        console.log(bookForVuex);

        //同步相关
        let tempArr = [aNewBook, aNewVolume, aNewChapter];
        let chaptersSort = [aNewChapter.chapter_uuid];
        let sendData = localQuery.backSendTitleData({changeList: tempArr,token: data.token, book_uuid: aNewBook.book_uuid });

        sendData.view = 'mainWindow'

        sendData.resData.sorts = {
          volumes_sort: {
            volumes: [aNewVolume.volume_uuid]
          },
          chapters_sort: [{
            volume_uuid: aNewVolume.volume_uuid,
            chapters: [aNewChapter.chapter_uuid]
          }]
        }

        sendData.createFlag = true;


        dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {

        // this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
          console.log("sync update book content l1")
          console.log(res)
          let result = res.data.result
          if(result){
            if(result.book_detail.code === 200){
              aNewBook.version = result.book_detail.version;
              aNewBook.is_upload = '1';
              if(result.volumes.length > 0 && result.volumes[0].code === 200){

                aNewVolume.version = result.volumes[0].version;
                aNewVolume.is_upload = '1';

                if(result.chapters.volumes.length > 0){
                  if(result.chapters.volumes[0].chapters.length > 0 && result.chapters.volumes[0].chapters[0].code === 200){
                    aNewChapter.version = result.chapters.volumes[0].chapters[0].version;
                    aNewChapter.is_upload = '1';
                  }
                }
              
              }



              let tempArr = []

              let updatedBook = { ...bookForVuex }
              updatedBook.updated_at = result.update_time;
              // console.log("updated book is: ");
              // console.log(JSON.stringify(updatedBook));

              commit(TYPE.ADD_BOOK_L1, {book: updatedBook, view: data.view});
              // this.ADD_BOOK_L1(bookForVuex, 'main');


              // this.SET_BOOK_CONTENT_L1({book_detail: updatedBook, view: 'mainWindow', book_uuid: updatedBook.book_uuid});
              commit(TYPE.SET_BOOK_CONTENT_L1, {book_detail: updatedBook, view: data.view, book_uuid: updatedBook.book_uuid});
              commit(TYPE.GET_BOOK_MESSAGE, { status: 200, message: '书本创建成功', view: data.view, book: updatedBook });

              localQuery.updateItemInDB({data: aNewBook, changedProps: ['version', 'is_upload'], tableName: 'book_category'})
              localQuery.updateItemInDB({data: aNewVolume, changedProps: ['version', 'is_upload'], tableName: 'book_category'})
              localQuery.updateItemInDB({data: aNewChapter, changedProps: ['version', 'is_upload'], tableName: 'book_category'})

              // this.offSubmit();
            }else{
              console.log("something is wrong during create new book: ")
              //delete book in db, just mark book as deleted is ok
              //只需要标记书为已删除, 这样就不会有入口了
              aNewBook.is_deleted = 1;
              localQuery.updateItemInDB({data: aNewBook, changedProps: ['is_deleted'], tableName: 'book_category'})
              commit(TYPE.GET_BOOK_MESSAGE, res.data);
            }

          }else{
            console.log("sync update book no result case")
            aNewBook.is_deleted = 1;
            localQuery.updateItemInDB({data: aNewBook, changedProps: ['is_deleted'], tableName: 'book_category'})
            commit(TYPE.GET_BOOK_MESSAGE, res.data)
          }


        })


      }).catch((err) => {
        console.log("something error occurs during insert book+volume+chapter");
        console.log(err)
        try {
          aNewBook.is_deleted = 1;
          localQuery.updateItemInDB({data: aNewBook, changedProps: ['is_deleted'], tableName: 'book_category'})
        } catch (e) {
          commit(TYPE.GET_BOOK_MESSAGE, { status: 999, message: '书本创建失败', view: data.view, book: aNewBook })
          console.log("unable to mark a book as deleted, in this case, this book might not been inserted")
        }
      })    
  },

  [TYPE.CREATE_NEW_VOLUME_L1]: ({rootState, commit, dispatch}, data) => {
    console.log("create new volume called: ");
    console.log(data);

    let aNewVolume = localQuery.makeVolume({bookId: data.bookId, volumeCount: data.volumeCount});
    console.log("created new volume is: ");
    console.log(aNewVolume);
    let aNewChapter = localQuery.makeChapter({bookId: data.bookId, volume_uuid: aNewVolume.volume_uuid,  chapterCount: 0});

    Promise.all([localQuery.insertVolumeToDB({data: aNewVolume, user: data.user}),
      localQuery.insertChapterToDB({data: aNewChapter, user: data.user})]).then((res) => {
        let tempArr = [aNewVolume, aNewChapter];
        let chaptersSort = [aNewChapter.chapter_uuid];
        let sendData = localQuery.backSendTitleData({changeList: tempArr,token: data.token, book_uuid: data.bookId });

        sendData.view = 'editorWindow'

        let volumesSort = data.volumesSort
        volumesSort.push(aNewVolume.volume_uuid);

        sendData.resData.sorts = {
          volumes_sort: {
            volumes: volumesSort
          },
          chapters_sort: [{
            volume_uuid: aNewVolume.volume_uuid,
            chapters: [aNewChapter.chapter_uuid]
          }]
        }

        sendData.createFlag = true;

        dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {

        // this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
          console.log("sync update book content l1")
          console.log(res)
          let result = res.data.result

          if(result){
            if(result.volumes.length > 0 && result.volumes[0].code === 200){

              aNewVolume.version = result.volumes[0].version;
              aNewVolume.is_upload = '1';

              if(result.chapters.volumes.length > 0){
                if(result.chapters.volumes[0].chapters.length > 0 && result.chapters.volumes[0].chapters[0].code === 200){
                  aNewChapter.version = result.chapters.volumes[0].chapters[0].version;
                  aNewChapter.is_upload = '1';
                }
              }
            
              let tempArr = []

              let updatedVolume = { ...aNewVolume }
              updatedVolume.updated_at = result.update_time;

              updatedVolume.chapters = aNewChapter;
              // console.log("updated book is: ");
              // console.log(JSON.stringify(updatedBook));

              commit(TYPE.ADD_VOLUME_TO_BOOK_L1, {volume: updatedVolume, view: data.view, book_uuid: data.bookId});
              // this.ADD_BOOK_L1(bookForVuex, 'main');


              // this.SET_BOOK_CONTENT_L1({book_detail: updatedBook, view: 'mainWindow', book_uuid: updatedBook.book_uuid});
              commit(TYPE.SET_BOOK_CONTENT_L1, {volumes: [updatedVolume], view: data.view, book_uuid: data.bookId});

              localQuery.updateItemInDB({data: aNewVolume, changedProps: ['version', 'is_upload'], tableName: 'book_category'})
              localQuery.updateItemInDB({data: aNewChapter, changedProps: ['version', 'is_upload'], tableName: 'book_category'})

              // this.offSubmit();
            }else{
              console.log("something is wrong during create new book: ")
              //delete book in db, just mark book as deleted is ok
              //只需要标记书为已删除, 这样就不会有入口了
              aNewVolume.is_deleted = 1;
              localQuery.updateItemInDB({data: aNewVolume, changedProps: ['is_deleted'], tableName: 'book_category'})
              // commit(TYPE.GET_BOOK_MESSAGE, res.data);
            }

          }else{
            console.log("sync update book no result case")
            aNewVolume.is_deleted = 1;
            localQuery.updateItemInDB({data: aNewVolume, changedProps: ['is_deleted'], tableName: 'book_category'})
            // commit(TYPE.GET_BOOK_MESSAGE, res.data)
          }


        })




      }).catch((err) => {
        console.log("something error occurs during insert volume+chapter");
        console.log(err);
      })

  },

  [TYPE.CREATE_NEW_CHAPTER_L1]: ({rootState, commit, dispatch}, data) => {
    console.log("create new chapter called: ");
    console.log(data);

    let aNewChapter = localQuery.makeChapter({bookId: data.bookId, volume_uuid: data.arg.volume_uuid,  chapterCount: data.chapterCount, chapterName: data.chapterName});
    console.log("created new chapter is: ");
    console.log(aNewChapter);

    localQuery.insertChapterToDB({data: aNewChapter, user: data.user}).then((res) => {
      console.log("insert chapter to db done");
      let tempArr = [aNewChapter];
      let sendData = localQuery.backSendTitleData({changeList: tempArr,token: data.token, book_uuid: data.bookId });

      let chaptersSort = data.chaptersSort
      chaptersSort.push(aNewChapter.chapter_uuid);

      sendData.view = 'editorWindow'

      sendData.resData.sorts = {
        chapters_sort: [{
          volume_uuid: data.arg.volume_uuid,
          chapters: chaptersSort
        }]
      }

      sendData.createFlag = true;

      dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {

      // this.SYNC_UPDATE_BOOK_CONTENT_L1(sendData).then((res) => {
        console.log("sync update book content l1")
        console.log(res)
        let result = res.data.result

        if(result){
          if(result.chapters.volumes[0].chapters.length > 0 && result.chapters.volumes[0].chapters[0].code === 200){
            aNewChapter.version = result.chapters.volumes[0].chapters[0].version;
            aNewChapter.is_upload = '1';

            let tempArr = []

            let updatedChapter = { ...aNewChapter }
            updatedChapter.updated_at = result.update_time;

            // console.log("updated book is: ");
            // console.log(JSON.stringify(updatedBook));

            commit(TYPE.ADD_CHAPTER_TO_VOLUME_L1, {chapter: updatedChapter, view: data.view, book_uuid: data.bookId, volume_uuid: data.arg.volume_uuid});
            // this.ADD_BOOK_L1(bookForVuex, 'main');

            //新加， 插入章节内容
            localQuery.insertChapterContentToDB({data: aNewChapter, needUpload: true, uid: data.user, content: ''}).then(() => {
              commit(TYPE.CREATE_CHAPTER_RESULT_L1, {arg: data.arg, obj: aNewChapter, addEntrance: data.addChapterEntrance})
            })
            // this.SET_BOOK_CONTENT_L1({book_detail: updatedBook, view: 'mainWindow', book_uuid: updatedBook.book_uuid});
            commit(TYPE.SET_BOOK_CONTENT_L1, {chapters: [updatedChapter], view: data.view, book_uuid: data.bookId});

            localQuery.updateItemInDB({data: aNewChapter, changedProps: ['version', 'is_upload'], tableName: 'book_category'})

            // this.offSubmit();
          }else{
            console.log("something is wrong during create new book: ")
            //delete book in db, just mark book as deleted is ok
            //只需要标记书为已删除, 这样就不会有入口了
            aNewChapter.is_deleted = 1;
            commit(TYPE.CREATE_CHAPTER_RESULT_L1, {arg: data.arg, obj: aNewChapter, addEntrance: data.addChapterEntrance, error: res.data})
            localQuery.updateItemInDB({data: aNewChapter, changedProps: ['is_deleted'], tableName: 'book_category'})
            // commit(TYPE.GET_BOOK_MESSAGE, res.data);
          }

        }else{
          console.log("sync update book no result case")
          aNewChapter.is_deleted = 1;
          commit(TYPE.CREATE_CHAPTER_RESULT_L1, {arg: data.arg, obj: aNewChapter, addEntrance: data.addChapterEntrance, error: res.data})
          localQuery.updateItemInDB({data: aNewChapter, changedProps: ['is_deleted'], tableName: 'book_category'})
          // commit(TYPE.GET_BOOK_MESSAGE, res.data)
        }


      })



    }).catch((err) => {
        console.log("something error occurs during insert chapter");
        console.log(err);
        commit(TYPE.CREATE_CHAPTER_RESULT_L1, {arg: data.arg, obj: aNewChapter, addEntrance: data.addChapterEntrance, error: {message: "网络未连接"}})
      })
  },

  //V1版本 列本地与线上书籍数据
  [TYPE.LIST_LOCAL_AND_ONLINE_BOOKS]: ({rootState, commit, dispatch}, data) => {
    console.log("call local and online books in vuex");
    let localBooks = [];
    let onlineBooks = [];

    localQuery.listLocalBooks({uid: data.uid}).then(function(res){
      console.log("local book res is: ");
      console.log(res);
      localBooks = res;
      localBooks.forEach((aLocalBook) => {
        aLocalBook.book_uuid = aLocalBook.client_uuid;
      })
    }, function(err){
      console.log("err is: ");
      console.log(err);
    }).finally(function(){
      dispatch(TYPE.LIST_BOOK_L1, {uid: data.uid, token: data.token}).then((onlineRes) => {
        console.log("pull online data")
      // this.LIST_BOOK_V1({uid: data.uid, token: data.token}).then((onlineRes) => {
        console.log("online res: ");
        console.log(onlineRes);
        if(onlineRes.data.status === 200){
          if(onlineRes.data.result.books) onlineBooks = onlineRes.data.result.books
          onlineBooks.forEach((anOnlineBook) => {
            anOnlineBook.client_uuid = anOnlineBook.book_uuid;
          })
        }
      }, (onlineErr) => {
        console.log("online error: ");
        console.log(onlineErr);
      }).finally(() => {
        //书籍没有父级结构，设置为"0"以通过插库的非空校验
        let resObj = compare(localBooks, onlineBooks, "0", data.uid, data.token, []) //, "bookTest");
        let myBooks = resObj.resArr;
        console.log("res obj has an operArr? ", resObj.operArr);
        //TODO: 小洲, 使用resObj.operArr 进行 同步操作
        console.log("lets compare!!!!!!!!")
        console.log(resObj.operArr )
        if(resObj.operArr&&resObj.operArr.length){
          for(let i = 0; i<resObj.operArr.length; i++){
            console.log('需要更新的书本实力数据~~~~~~~~~~~~~~~~~~~')
            let sendData =localQuery.backSendTitleData({changeList: [resObj.operArr[i]],token: data.token, book_uuid: resObj.operArr[i].book_uuid });
            dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {
              let resData = res.data;
              let book_detail = resData.result.book_detail;
              if(resData.status !== 200){
                console.error(`status 状态异常:${JSON.stringify(resData)}`)
                return false;
              }
              if(book_detail.code === 200){
                localQuery.updateItemInDB({data: {version: book_detail.version, is_upload: '1', client_uuid: resData.result.book_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
              }
            })
            console.log(sendData)
          }
        }
        // dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData)
        commit(TYPE.SET_BOOKS_L1, {books: myBooks, user: rootState.user.user_center});
      })
    });

  },
  INSERT_CONFLICT_CHAPTER_L1: ({ commit,rootState, dispatch }, data) => {
    console.log('datadatadata',data)
    if(data.arry[data.x].hasConflict && data.arry[data.x].hasConflict=='local'){    //处理本地冲突章
      console.log('arry local',data.arry[data.x])
      let oldChapterid = data.arry[data.x].client_uuid;
      let newChapterid = uuid();
      data.arry[data.x]['conflict_uuid'] = oldChapterid;
      data.arry[data.x].client_uuid = newChapterid;
      data.arry[data.x].chapter_uuid = newChapterid;
      console.log('oldChapterid',oldChapterid)
      data.arry[data.x].title += '-本地冲突';
      data.arry[data.x].version = 0;
      console.log('arry localnew',data.arry[data.x])
      //新插入一个本地冲突章    未同步
      localQuery.insertChapterToDB({data: data.arry[data.x], user: data.uid, parentId: data.arry[data.x].volume_uuid}).then(()=>{
        //线上同步操作
        console.log('冲突章节开始同步')
        let sendChapterData = localQuery.backSendTitleData({changeList: [data.arry[data.x]] , book_uuid: data.arry[data.x].bookId, token: data.token});
        dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendChapterData).then((res) => {
          let resData = res.data;
          console.log('resdata',resData)
          let chapters = resData.result.chapters;
          if(resData.status !== 200){
            console.error(`status 状态异常:${JSON.stringify(resData)}`)
            return false;
          }
          if(chapters.volumes&&chapters.volumes.length){
            let chapterList = chapters.volumes[0]
            // 过滤返回状态值为非200的数据
            let newChapterList = chapterList.chapters.filter((item, index) => {
              if(item.code === 200){
                localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                return item;
              }
            })
            resData.result.chapters = newChapterList
            console.log('过滤掉状态值非200的数据后，返回的章节列表',newChapterList)
            console.log('resData.result', resData.result)
            commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
          }
        })


        //新插入的章，插入本地冲突章内容    未同步
        localQuery.queryChapterContent({chapter_uuid: oldChapterid, uid: data.arry[data.x].uid }).then((res)=>{ //读取原始本地冲突章内容
          console.log('localContent',res[0])
          res[0].chapter_uuid = newChapterid
          res[0].version = 0
          localQuery.insertChapterContentToDB({data: res[0], uid: data.uid, needUpload: true, content: res[0].content}).then(()=>{

              //线上同步操作
              console.log('章节内容开始同步')
              let sendData ={
                bodyData: {
                  "book_uuid": data.arry[data.x].bookId,
                  "volume_uuid": data.arry[data.x].volume_uuid,
                  "chapters": [
                      {
                          "chapter_uuid": newChapterid,
                          "content": '',
                          "update_number": 0
                      }
                  ]
                },
                uid: data.uid,
                token: data.token,
                sync_type: data.sync_type||'',
                wordNum: data.arry[data.x].word_count,
                // bookNewCount: this.wholeBookWordCount
              }
              console.log('发送同步',sendData)
              // console.log(sendData)
              ipcRenderer.send('ipc-ansyBook', {data: JSON.stringify(sendData), uuid: newChapterid})
              // dispatch(TYPE.CHAPTER_CONTENT_SYNC,sendData);
              data.arry.forEach((item)=>{
                
                if(item.hasConflict && item.hasConflict =='online' && item.client_uuid == oldChapterid){
                  console.log('aaaaaaaa',item)
                  //把线上冲突章的内容更新到本地冲突章    无需同步
                  dispatch(TYPE.GET_CHAPTER_CONTENT_L1,{chapter_uuids: [item.chapter_uuid], token: data.token}).then((res)=>{
                    if(res.data.status==200){
                      let chapterArry = res.data.result.chapters
                      if(chapterArry){
                        let chapterCont = chapterArry[0].chapter_detail
                        console.log('aaaaaaaaaa',chapterCont)
                        localQuery.updateItemInDB({data: {version: chapterCont.update_number, is_upload: '1', content: chapterCont.content, client_uuid: chapterCont.chapter_uuid }, changedProps: ['is_upload','content','version'], tableName: 'chapter_content'}).then(()=>{
                          //内容更新成功才更改章节版本号，防止章节冲突消失
                          //把线上冲突章的版本号、标题、字数更新到本地冲突章    无需同步
                          console.log('aaaaaaaaa',data)
                          localQuery.updateItemInDB({data: {version: chapterCont.version, is_upload: '1', client_uuid: item.chapter_uuid, title: chapterCont.title, word_count: chapterCont.word_count }, changedProps: ['version','is_upload','title','word_count'], tableName: 'book_category'}).then(()=>{
                            data.x++;
                            if(data.x<data.arry.length){
                              dispatch('INSERT_CONFLICT_CHAPTER_L1',data)
                            }
                          })
                        })
                      }
                      
                    }
                  },(onlineErr)=>{
                    console.log("online error: ");
                    console.log(onlineErr);
                  }).finally(()=>{
                    
                  })
                }
              })

          })
        })
      });
    
    
    }else{
      data.x++;
      if(data.x<data.arry.length){
       dispatch('INSERT_CONFLICT_CHAPTER_L1',data)
      }
    };
  },
  UPDATE_CONFLICT_CHAPTER_L1: ({ commit,rootState, dispatch }, data) => {
    //新插入的章把原始内容复制回来后再更新线上章的内容，防止新插入的章更新到了线上最新内容
    // let curChapter2 = arry[x];
    if(data.arry[data.x].hasConflict && data.arry[data.x].hasConflict=='online'){   //处理线上冲突章
      console.log('arry online',data.arry[data.x])
      //把线上冲突章的内容更新到本地冲突章    无需同步
      dispatch(TYPE.GET_CHAPTER_CONTENT_L1,{chapter_uuids: [data.arry[data.x].chapter_uuid], token: data.data.token}).then((res)=>{
          if(res.data.status==200){
            let chapterArry = res.data.result.chapters
            if(chapterArry){
              let chapterCont = chapterArry[0].chapter_detail
              console.log('aaaaaaaaaa',chapterCont)
              localQuery.updateItemInDB({data: {version: chapterCont.version, is_upload: '1', content: chapterCont.content, client_uuid: chapterCont.chapter_uuid }, changedProps: ['is_upload','content','version'], tableName: 'chapter_content'}).then(()=>{
                //内容更新成功才更改章节版本号，防止章节冲突消失
                //把线上冲突章的版本号、标题、字数更新到本地冲突章    无需同步
                console.log('aaaaaaaaa',data)
                localQuery.updateItemInDB({data: {version: data.arry[data.x].version, is_upload: '1', client_uuid: data.arry[data.x].chapter_uuid, title: data.arry[data.x].title, word_count: data.arry[data.x].word_count }, changedProps: ['version','is_upload','title','word_count'], tableName: 'book_category'}).then(()=>{
                  data.x++;
                  if(data.x<data.arry.length){
                   dispatch('UPDATE_CONFLICT_CHAPTER_L1',data)
                  }
                })
              })
            }
            
          }
      },(onlineErr)=>{
        console.log("online error: ");
        console.log(onlineErr);
      }).finally(()=>{
        
      })
    }else{
      data.x++;
      if(data.x<data.arry.length){
        dispatch('UPDATE_CONFLICT_CHAPTER_L1',data)
      }
    };
  },
  [TYPE.LIST_LOCAL_AND_ONLINE_CHAPTERS]: ({rootState, commit, dispatch}, data) => {
    return new Promise((resolve, reject) => {
      let localChapter = [];
      let onlineChapter = [];
      let sortArr = [];
      
      localQuery.listLocalChapters({client_uuid: data.volume_uuid}).then((res) =>{
        console.log("list chapter local res:")
        localChapter = res;
        localChapter.forEach((anlocalChapter) => {
          anlocalChapter['chapter_uuid'] = anlocalChapter.client_uuid;
          anlocalChapter['volume_uuid'] = anlocalChapter.parent_client_uuid;
        })
        console.log(localChapter);
        console.log(JSON.stringify(localChapter));
      }, (err) => {
        console.log("list chapter err:")
        console.log(err);
      }).finally(() => {
        dispatch(TYPE.LIST_CHAPTER_L1,{volume_uuid: data.volume_uuid, token: data.token}).then((onlineRes)=>{
          if(onlineRes.data.status === 200){
            console.log("list chapter online res: ");
            console.log(onlineRes.data.result);
            if(onlineRes.data.result.chapters) onlineChapter = onlineRes.data.result.chapters;
            sortArr = onlineRes.data.result.sorts
            
            onlineChapter.forEach((anOnlineVols) => {
              anOnlineVols['client_uuid'] = anOnlineVols.chapter_uuid;
              anOnlineVols['parent_client_uuid'] = anOnlineVols.volume_uuid;
            })
          }
        },(onlineErr)=>{
          console.log("online error: ");
          console.log(onlineErr);
        }).finally(()=>{
          let resObj = compare(localChapter, onlineChapter, data.volume_uuid, data.uid, data.token, sortArr)  //, "test")
          let newChapter = resObj.resArr;
          //TODO: 小洲, 使用resObj.operArr 进行 同步操作
          console.log('需要同步的章节列表：',resObj.operArr)
          if(resObj.operArr&&resObj.operArr.length){
            let sendData = localQuery.backSendTitleData({changeList: resObj.operArr , book_uuid: data.book_uuid, token: data.token});
            console.log('111111111111111111111111111111')
            console.log(sendData)
            dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {
              let resData = res.data;
              let chapters = resData.result.chapters;
              if(resData.status !== 200){
                console.error(`status 状态异常:${JSON.stringify(resData)}`)
                return false;
              }
              if(chapters.volumes&&chapters.volumes.length){
                let chapterList = chapters.volumes[0]
                // 过滤返回状态值为非200的数据
                let newChapterList = chapterList.chapters.filter((item, index) => {
                  if(item.code === 200){
                    localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                    return item;
                  }
                })
                resData.result.chapters = newChapterList
                console.log('过滤掉状态值非200的数据后，返回的章节列表',newChapterList)
                console.log('resData.result', resData.result)
                commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
                // for(let i = 0; i < chapterList.chapters.length; i++){
                //   if(chapterList.chapters[i].code === 200){
                //     // this.SET_BOOK_CONTENT_L1(resData.result)
                //     commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
                //     localQuery.updateItemInDB({data: {version: chapterList.chapters[i].version, is_upload: '1', client_uuid: chapterList.chapters[i].chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                //   }else{
                //     console.error(`status 状态异常:${JSON.stringify(chapters.volumes)}`)
                //   }
                // }
              }
            })
          }
          console.log('newchapter',newChapter);

          //冲突章节插库操作
          Promise.all([dispatch('INSERT_CONFLICT_CHAPTER_L1',{x:0, arry:newChapter, uid:data.uid, token: data.token})])
          .then(()=>{
            commit(TYPE.SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1,{book_uuid: data.book_uuid, volume_uuid: data.volume_uuid, chapters: newChapter, partUpdate: false})
            console.log('newchapter after',JSON.stringify(newChapter));
            resolve(newChapter)
          })
          // dispatch('INSERT_CONFLICT_CHAPTER_L1',{x:0, arry:newChapter, data:data})
          // // .then(()=>{
          //   dispatch('UPDATE_CONFLICT_CHAPTER_L1',{x:0, arry:newChapter, data:data})
          //   // .then(()=>{
          //     commit(TYPE.SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1,{book_uuid: data.book_uuid, volume_uuid: data.volume_uuid, chapters: newChapter})
          //     console.log('newchapter after',JSON.stringify(newChapter));
          //     resolve(newChapter)
          //   // })
          // // })

          

          // for (let index = 0; index < newChapter.length; index++) {
          //   let curChapter = newChapter[index]

          //   if(curChapter.hasConflict && curChapter.hasConflict=='local'){    //处理本地冲突章

          //       console.log('newchapter local',curChapter)
          //       let oldChapterid = curChapter.client_uuid;
          //       let newChapterid = uuid();
          //       curChapter['conflict_uuid'] = oldChapterid;
          //       curChapter.client_uuid = newChapterid;
          //       curChapter.chapter_uuid = newChapterid;
          //       console.log('oldChapterid',oldChapterid)
          //       curChapter.title += '-本地冲突';
          //       curChapter.version = 0;
          //       console.log('newchapter localnew',curChapter)
          //       //新插入一个本地冲突章    未同步
          //       localQuery.insertChapterToDB({data: curChapter, user: data.uid, parentId: curChapter.volume_uuid}).then(()=>{
          //         //线上同步操作
          //         // console.log('冲突章节开始同步')
          //         // let sendChapterData = localQuery.backSendTitleData({changeList: [curChapter] , book_uuid: data.book_uuid, token: data.token});
          //         // dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendChapterData).then((res) => {
          //         //   let resData = res.data;
          //         //   console.log('resdata',resData)
          //         //   let chapters = resData.result.chapters;
          //         //   if(resData.status !== 200){
          //         //     console.error(`status 状态异常:${JSON.stringify(resData)}`)
          //         //     return false;
          //         //   }
          //         //   if(chapters.volumes&&chapters.volumes.length){
          //         //     let chapterList = chapters.volumes[0]
          //         //     // 过滤返回状态值为非200的数据
          //         //     let newChapterList = chapterList.chapters.filter((item, index) => {
          //         //       if(item.code === 200){
          //         //         localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.chapter_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
          //         //         return item;
          //         //       }
          //         //     })
          //         //     resData.result.chapters = newChapterList
          //         //     console.log('过滤掉状态值非200的数据后，返回的章节列表',newChapterList)
          //         //     console.log('resData.result', resData.result)
          //         //     commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
          //         //   }
          //         // })


          //         //新插入的章，插入本地冲突章内容    未同步
          //         localQuery.queryChapterContent({chapter_uuid: oldChapterid, uid: curChapter.uid }).then((res)=>{
          //           console.log('localContent',res[0])
          //           res[0].chapter_uuid = newChapterid
          //           res[0].version = 0
          //           localQuery.insertChapterContentToDB({data: res[0], uid: data.uid, needUpload: true, content: res[0].content}).then(()=>{

          //               //线上同步操作
          //               console.log('章节内容开始同步')
          //               let sendData ={
          //                 bodyData: {
          //                   "book_uuid": data.book_uuid,
          //                   "volume_uuid": data.volume_uuid,
          //                   "chapters": [
          //                       {
          //                           "chapter_uuid": newChapterid,
          //                           "content": res[0].content,
          //                           "update_number": 0
          //                       }
          //                   ]
          //                 },
          //                 uid: data.uid,
          //                 token: data.token,
          //                 sync_type: data.sync_type||'',
          //                 wordNum: curChapter.word_count,
          //                 // bookNewCount: this.wholeBookWordCount
          //               }
          //               console.log('发送同步',sendData)
          //               // console.log(sendData)
          //               ipcRenderer.send('ipc-ansyBook', JSON.stringify(sendData))
          //               // dispatch(TYPE.CHAPTER_CONTENT_SYNC,sendData);



          //               //新插入的章把原始内容复制回来后再更新线上章的内容，防止新插入的章更新到了线上最新内容
          //               for (let i = 0; i < newChapter.length; i++) {
          //                 let curChapter2 = newChapter[i];

          //                 if(curChapter2.hasConflict && curChapter2.hasConflict=='online'){   //处理线上冲突章
          //                   console.log('newchapter online',curChapter2)
          //                   //把线上冲突章的内容更新到本地冲突章    无需同步
          //                   dispatch(TYPE.GET_CHAPTER_CONTENT_L1,{chapter_uuids: [curChapter2.chapter_uuid], token: data.token}).then((res)=>{
          //                       if(res.data.status==200){
          //                         let chapterArry = res.data.result.chapters
          //                         if(chapterArry){
          //                           let chapterCont = chapterArry[0].chapter_detail
          //                           localQuery.updateItemInDB({data: {version: chapterCont.version, is_upload: '1', content: chapterCont.content, client_uuid: chapterCont.chapter_uuid }, changedProps: ['is_upload','content','version'], tableName: 'chapter_content'}).then(()=>{
          //                             //内容更新成功才更改章节版本号，防止章节冲突消失
          //                             //把线上冲突章的版本号、标题、字数更新到本地冲突章    无需同步
          //                             localQuery.updateItemInDB({data: {version: curChapter2.version, is_upload: '1', client_uuid: curChapter2.chapter_uuid, title: curChapter2.title, word_count: curChapter2.word_count }, changedProps: ['version','is_upload','title','word_count'], tableName: 'book_category'})
          //                           })
          //                         }
                                  
          //                       }
          //                   },(onlineErr)=>{
          //                     console.log("online error: ");
          //                     console.log(onlineErr);
          //                   }).finally(()=>{
              
          //                   })
          //                 }
                          
          //               }
          //           })
          //         })
          //       });
              
              
          //   };
            
          // }

          // commit(TYPE.SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1,{book_uuid: data.book_uuid, volume_uuid: data.volume_uuid, chapters: newChapter})
          // console.log('newchapter after',JSON.stringify(newChapter));

          // resolve(newChapter)
        })

        

      })

    })

  },

  //V1版本 列线上书籍数据
  [TYPE.LIST_BOOK_L1]: ({ commit,rootState, dispatch }, data) => {
    //ToRao: 用户查询图书列表，不需要进行任何判断插入等操作，这种操作放在更上一层   
    let time = timestamp();

    return axios.get(api.bookListV1 + `?token=${data.token}&timestamp=${time}`,
      {
        headers: {
            'x-sign-id': hmac256(data.token, api.bookList, time )
        }
      })
  },


  [TYPE.LIST_LOCAL_AND_ONLINE_VOLUMES]: ({rootState, commit, dispatch}, data) => {
    console.log("call local and online vols in vuex");
    let localVols = [];
    let onlineVols = [];
    let sortArr = [];

    console.log("cur book uuid is: " + data.book_uuid);
    localQuery.listLocalVolumes({client_uuid: data.book_uuid}).then((res) =>{
      console.log("list vols res:")
      console.log(JSON.stringify(res));
      localVols = res;
      localVols.forEach((aLocalVol) => {
        aLocalVol.volume_uuid = aLocalVol.client_uuid
      })
    }, (err) => {
      console.log("list vols err:")
      console.log(err);
    }).finally(() => {
      dispatch(TYPE.LIST_VOLUMES_L1, {book_uuid: data.book_uuid, token: data.token}).then((onlineRes) => {
        console.log("list vols online res: ");
        console.log(onlineRes);
        if(onlineRes.data.status === 200){
          if(onlineRes.data.result.volumes) onlineVols = onlineRes.data.result.volumes
          sortArr = onlineRes.data.result.sorts
          onlineVols.forEach((anOnlineVol) => {
            anOnlineVol.client_uuid = anOnlineVol.volume_uuid
          })
        }
      }, (onlineErr) => {
        console.log("list vol online error:");
        console.log(onlineErr);
      }).finally(() =>{
        console.log("start to compare vols")
        let resObj = compare(localVols, onlineVols, data.book_uuid, data.uid, data.token, sortArr)//, "volumeTest");
        let myVols = resObj.resArr;

        console.log('resObj',JSON.stringify(resObj))
        console.log('myVols',JSON.stringify(myVols))
        console.log("res obj has an oper arr?")
        console.log(resObj.operArr);
        //TODO: 小洲, 使用resObj.operArr 进行 同步操作
        console.log('需要同步的卷列表：',resObj.operArr)
       if(resObj.operArr&&resObj.operArr.length){
          let sendData = localQuery.backSendTitleData({changeList: resObj.operArr , book_uuid: data.book_uuid, token: data.token});
          console.log(sendData)
          dispatch(TYPE.SYNC_UPDATE_BOOK_CONTENT_L1, sendData).then((res) => {
            // console.log('书本内容同步后返回的数据,res:s-btn')
            // console.log(res)
            let resData = res.data;
            let volumes = resData.result.volumes;
            if(volumes){
              let newvolumeList = volumes.filter((item, index) => {
                if(item.code === 200){
                  localQuery.updateItemInDB({data: {version: item.version, is_upload: '1', client_uuid: item.volume_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
                  return item;
                }
              })
              console.log('过滤掉同步失败章节后数据列表,newvolumeList: ', newvolumeList)
              resData.result.volumes=newvolumeList
              // for(let i = 0; i < volumes.length; i++){
              //   if(volumes[i].code === 200){
                  commit(TYPE.SET_BOOK_CONTENT_L1,resData.result)
              //     localQuery.updateItemInDB({data: {version: volumes[i].version, is_upload: '1', client_uuid: volumes[i].volume_uuid}, changedProps: ['version','is_upload'], tableName: 'book_category'})
              //   }else{
              //     console.error(`status 状态异常:${JSON.stringify(volumes[i])}`)
              //   }
              // }
            }
          })
       }
        commit(TYPE.SET_VOLUMES_TO_BOOK_IN_EDITOR_L1, {volumes: myVols, book_uuid: data.book_uuid});
        // console.log(myVols);
      })
    })  
  },


  [TYPE.LIST_VOLUMES_L1]: ({commit, rootState, dispatch}, data) => {
    //ToRao: 这里加V3版本的获取指定书籍下的卷
    let time = timestamp();
    // console.log(data);
    // console.log("data uuid is: " + data.book_uuid)
    return axios.get(api.volumeList + `?book_uuid=${data.book_uuid}&token=${data.token}&timestamp=${time}`,
      {
        headers: {
            'x-sign-id': hmac256(data.token, api.volumeList, time )
        }        
      })
  },
  [TYPE.LIST_CHAPTER_L1]: ({commit, rootState, dispatch}, data) => {
    let time = timestamp();
    return axios.get(api.chapterList + `?volume_uuid=${data.volume_uuid}&token=${data.token}&timestamp=${time}`,
      {
        headers: {
            'x-sign-id': hmac256(data.token, api.chapterList, time )
        }        
      })
  },
  [TYPE.GET_CHAPTER_CONTENT_L1]: ({commit, rootState, dispatch}, data) => {
    let time = timestamp();
    return axios.get(api.chapterContent + `?chapter_uuids=${data.chapter_uuids}&token=${data.token}&timestamp=${time}`,
      {
        headers: {
            'x-sign-id': hmac256(data.token, api.chapterContent, time )
        }        
      })
  },




  [TYPE.LIST_BOOK]: ({ commit,rootState, dispatch }, data) => {
    let time = timestamp();
    axios.get(
      api.bookList + `?token=${data.token}&timestamp=${time}`,
      {
        headers: {
            'x-sign-id': hmac256(data.token, api.bookList, time )
        }
      }
      ).then((res) => {
      let msg = res.data;
      if (msg.status == 200) {
        let datas = msg.result.books || [];
        // 遍历所以接口返回的书本
        if(datas.length){
          for (let i = 0; i < datas.length; i++) {
            // 查询表中是否含有返回数据的书本，没有则插入
            sqliteDB.queryData(`select * from book_category where client_uuid = '${datas[i].book_uuid}'`).then((rows) => {
              if (!rows.length) {
                let intoBook = [datas[i].book_uuid, '0', datas[i].type, datas[i].title, datas[i].summary, 0, datas[i].goal_word_count, datas[i].word_count, datas[i].book_type, datas[i].creation_status, data.uid, '', datas[i].is_deleted, 1, datas[i].version]
                sqliteDB.insertData(
                  `insert into book_category(${api.book_category}) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [intoBook]
                ).then(() => {
                  // 校验是否是最后一本书插入完成
                  if (i == datas.length - 1) {
                    dispatch(TYPE.INFO_BOOK, { sql: `select * from book_category where is_deleted = 0 AND uid='${data.uid}' AND type = `, type: 1 })
                  }
                })
              } else {
                if (i == datas.length - 1) {
                  dispatch(TYPE.INFO_BOOK, { sql: `select * from book_category where is_deleted = 0 AND uid='${data.uid}' AND type = `, type: 1 })
                }
              }
            })
          }
        }else{
          // 当用户目录下没有书籍时。直接初始化用户缓存路径
          ipcRenderer.send('ipc-info-book-file', {user: rootState.user.user_center, bookList: []})
        }
      } else {
        console.log(msg.status)
      }
    })
  },

  [TYPE.TESTER_RACE]: ({dispatch}, data) => {
    let p = Promise.all([dispatch(TYPE.CLIENT_LIST_BOOK_L1, data), dispatch(TYPE.LIST_BOOK_L1, data)]);

    p.then((result) => {
      console.log("race result:")
      console.log(result)}
    ).catch((err) => {
      console.log(err);
    })
  },

  [TYPE.CLIENT_LIST_BOOK_L1]: ({commit, rootState}, data) => {
    //ToRao
    //查询本地库书本信息
    return new Promise((resolve, reject) => {
            sqliteDB.queryData(`select * from book_category WHERE type = 1 AND is_deleted = 0 AND uid='${data.uid}'`)
            .then((res) => {
              console.log("client list book v1: ");
              console.log(res);
              resolve(res);
              // commit(TYPE.INFO_BOOK, {list:res, type: 'info'})
            }, (err) => {
              console.log("client list book v1: failed due to: ");
              console.log(err);
              reject(err);
            })
          });
  },

  [TYPE.CLIENT_LIST_BOOK]: ({commit},data) => {
    // console.log(window);
    // console.log(this);
    // console.log(Vue);

    // console.log("sqliteDB: ")
    // console.log(sqliteDB);

    // console.log(window.$sqliteDB)
    // console.log(this.sqliteDB);
    // console.log(Vue.prototype.$sqliteDB);
    return sqliteDB.queryData(`select * from book_category WHERE type = 1 AND is_deleted = 0 AND uid='${data.uid}'`).then((res) => {
      commit(TYPE.INFO_BOOK, {list:res, type: 'info'})
    })
  },
  [TYPE.INFO_BOOK]: ({ commit, rootState }, data) => {
    sqliteDB.queryData(`${data.sql}'${data.type}'`).then((res) => {
      commit(TYPE.INFO_BOOK, { list: res, type: 'info' })
      console.log("real interesting info book: ");
      console.log(res)
      ipcRenderer.send('ipc-info-book-file', {user: rootState.user.user_center, bookList: res})
    })
    // new Promise(function(resolve) {
    //     info(data.sql, data.id)
    //     function info (sql, id){
    //       var arr = []
    //     //   sqliteDB.queryData(sql+id).then((res) => {
    //     //     for(var key in res){
    //     //       if(typeof res[key] == 'object'){
    //     //         arr[key] = res[key];
    //     //         if(arr[key]['book_type'] != 3){
    //     //           arr[key]['children'] = info (sql, arr[key]['id']);
    //     //         }
    //     //       }
    //     //       // 临界值，当状态为书本，且为最后一条数据时resolve返回数据
    //     //       if((arr[key]['book_type'] == 1)&&(key == (res.length-1))){
    //     //           /**
    //     //            * 递归回调异步操作，无法监听异步内是否完成
    //     //            * 导致只返回外层数据，内层数据为空
    //     //            * 暂时加一个200毫秒时间等待内层函数返回值
    //     //            * 后期需要修改该方案，否者数据过过200毫秒不一定能执行完
    //     //            */
    //     //          setTimeout(()=>  {resolve(arr)}, 200)
    //     //       }
    //     //     }

    //     // })
    //       sqliteDB.queryData(`${sql}'${id}'`).then((res) => {
    //         // let obj = res[0]
    //         console.log(res)
    //           for(var key in res){
    //             // console.log(res[key])
    //             if(typeof res[key] == 'object'){
    //               arr[key] = res[key];
    //               if(res[key]['type'] != 3){
    //                 arr[key]['children'] = info ('select * from book_category where parent_client_uuid = ', arr[key]['client_uuid']);
    //               }
    //             }
    //             // 临界值，当状态为书本，且为最后一条数据时resolve返回数据
    //             if((arr[key]['type'] == 1)&&(key == (res.length-1))){
    //                 /**
    //                  * 递归回调异步操作，无法监听异步内是否完成
    //                  * 导致只返回外层数据，内层数据为空
    //                  * 暂时加一个200毫秒时间等待内层函数返回值
    //                  * 后期需要修改该方案，否者数据过过200毫秒不一定能执行完
    //                  */
    //                setTimeout(()=>  {resolve(arr)}, 200)
    //             }
    //           }

    //       })
    //       return arr
    //     }
    // }).then((res) => {
    //     commit('INFO_BOOK', res)
    // })
  },
  [TYPE.USER_CHANGE_BOOK]: ({commit, dispatch}, data) => {
    let time = timestamp()
      let book = (typeof data.book === 'object' ? data.book : JSON.parse(data.book))
      book.goal_word_count = parseInt(book.goal_word_count*10000)
      let parameters = {
        "book_uuid": data.book_uuid,
        "book_detail": book,
        "volumes": [],
        "chapters": {},
        "sorts": {
          "volumes_sort": {
          },
          "chapters_sort": []
        },
      }
      axios.post(
        api.catalogueSync + `?token=${data.token}&timestamp=${time}`, 
        parameters,
        {
          headers: {
            'x-sign-id': hmac256(data.token,api.catalogueSync,time,parameters)
          }
        }
        ).then((res) => {
          let msg = res.data;
          if(msg.status === 200){
            let book_detail = msg.result.book_detail
            if(book_detail.code == 200){
              sqliteDB.executeSql(
                `update book_category SET version = '${book_detail.version}',avatar = '${book.avatar}',title='${sqliteDBStrongDecode(book.title,"'")}',goal_word_count='${sqliteDBStrongDecode(book.goal_word_count,"'")}',summary='${sqliteDBStrongDecode(book.summary, "'")}', book_type='${sqliteDBStrongDecode(book.book_type, "'")}' where client_uuid = '${data.book_uuid}'`
              ).then(() => {
                book.version = book_detail.version
                book.book_uuid = msg.result.book_uuid
                book.status = 200
                console.log('-------------------------')
                console.log(book)
                commit(TYPE.USER_CHANGE_BOOK, book)
              })
            }else if(book_detail.code === 409){
              book.version = book_detail.current_data.version;
              data.book = JSON.stringify(book)
              dispatch(TYPE.USER_CHANGE_BOOK, data)
            }
          }else{
            commit(TYPE.USER_CHANGE_BOOK, msg)
          }
        })
  },
  [TYPE.SYNC_USER_CHANGE_BOOK]: ({commit}, data) => {
    console.log(data)
    sqliteDB.queryData(`select * from book_category WHERE type = 1 AND client_uuid = '${data.book_uuid}' AND uid=${data.uid}`).then((res) => {
      if(res[0]){
        commit(TYPE.SYNC_USER_CHANGE_BOOK, res[0])
      }
    })
  },
  [TYPE.ADD_BOOK]: ({ commit }, data) => {
    let client_uuid = uuid();
    let record_uuid = uuid();
    let volume_uuid = uuid();
    let chapter_uuid = uuid();
    let time = timestamp()
      let book = (typeof data.book === 'object' ? data.book : JSON.parse(data.book))
      book.goal_word_count = parseInt(book.goal_word_count*10000)
      let parameters = {
        "book_uuid": client_uuid,
        "book_detail": book,
        "volumes": [
          {
            SubCategories: [],
            bookId: client_uuid,
            volume_uuid: volume_uuid,
            "client_uuid": volume_uuid,
            is_deleted: 0,
            title: "第一卷",
            sort: (Number(data.chapter) + Number(1))*100,
            type: 2,
            version: 0,
          }
        ],
        "chapters": {
          "volumes": [{
            "volume_uuid": volume_uuid,
            "chapters":[{
              bookId: client_uuid,
              "chapter_uuid": chapter_uuid,
              "client_uuid": chapter_uuid,
              "title": "第一章",
              "is_deleted": 0,
              "version": 0,
              "chapter_unit_price": 0,
              "type": 3,
              "volume_uuid":volume_uuid,
              "word_count": 0
            }]
          }]
        },
        "sorts": {
          "volumes_sort": {
            "volumes": [volume_uuid]  //卷UUID数组
          },
          "chapters_sort": [{
            "volume_uuid": volume_uuid,
            "chapters": [ //章节UUID数组
              chapter_uuid
            ]
          }]
        },
      }
      axios.post(
        api.catalogueSync + `?token=${data.token}&timestamp=${time}`, 
        parameters,
        {
          headers: {
            'x-sign-id': hmac256(data.token,api.catalogueSync,time,parameters)
          }
        }
        ).then((res) => {
          let msg = res.data;
          if (msg.status == 200) {
            if ((msg.result.book_detail) && (msg.result.book_detail.code == 200)) {
              let intoBook = [client_uuid, '0', 1, book.title, book.summary, 0, book.goal_word_count,0,book.book_type, book.creation_status, data.uid, '', 0, 1, msg.result.book_detail.version]
               sqliteDB.insertData(
                `insert into book_category(${api.book_category}) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [intoBook]
                ).then(() => {
                  commit(TYPE.INFO_BOOK, { list: [arrayReachJson(api.book_category, intoBook)], type: 'add' })
                  commit(TYPE.GET_BOOK_MESSAGE, { status: 200, message: '书本创建成功' })                  
                })
                sqliteDB.insertData(
                 `insert into module_record(${api.module_record}) values(?,?,?,?)`,
                 [[record_uuid, client_uuid, api.category[0], msg.result.update_time]]
               )
            }else if ((msg.book_detail) && (msg.book_detail.code != 200)) {
              console.error('书本信息同步有误:' + msg.book_detail.code)
              commit(TYPE.GET_BOOK_MESSAGE, msg)
            }
          }else{
            commit(TYPE.GET_BOOK_MESSAGE, msg)
          }
        })
  },
  [TYPE.QUERY_UPDATE_TIME]: ({ commit }, data) => {
    return sqliteDB.queryData(`select * from module_record where client_uuid='${data.uuid}' and category = ${api.category[0]}`)
  },
  [TYPE.VOLUME_ADD_BOOK]: ({ dispatch, commit, state }, data) => {
    let client_uuid = uuid();
    let volume = new Object();
    let chapter = new Object();
    let chapter_uuid = uuid();
    let bookInfo = state.INFO_BOOK
    let volumeTitle = "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "卷";
    // console.log(data)
    // return
    volume = {
      SubCategories: [],
      bookId: data.arg.bookId,
      volume_uuid: client_uuid,
      "client_uuid": client_uuid,
      is_deleted: 0,
      "created_at": +new Date(),
      title: volumeTitle,
      sort: (Number(data.chapter) + Number(1))*100,
      type: 2,
      version: 0,
    }
    chapter = {
      bookId: data.arg.bookId,
      "chapter_uuid": chapter_uuid,
      "client_uuid": chapter_uuid,
      "title": "第一章",
      "sort": 100,
      "is_deleted": 0,
      "version": 0,
      "chapter_unit_price": 0,
      "type": 3,
      "volume_uuid":client_uuid,
      "word_count": 0
    }
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.arg.bookId) {
        let book_json = JSON.parse(bookInfo[i].book_json);
        let volumeFile = path.join(`${bookInfo[i].title}-${bookInfo[i].client_uuid}`, `${volumeTitle}-${client_uuid}`);
        volume.version = 1;
        chapter.version = 1;
        volume.SubCategories.push(chapter)
        book_json.SubCategories.push(volume);
        sqliteDB.executeSql(
          `update book_category SET book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.arg.bookId}'`
        ).then(() => {
          ipcRenderer.send('ipc-add-volumes-file',{volumeFile: volumeFile})
          commit(TYPE.VOLUME_ADD_BOOK, {bookId: data.arg.bookId,obj: volume});
          dispatch(TYPE.QUERY_UPDATE_TIME, {uuid: data.arg.bookId}).then((res) => {
            let volumes_sort = bookInfo[i].SubCategories.map((item) => {
              return item.volume_uuid
            })
            let chapters_sort = bookInfo[i].SubCategories.map((item) => {
              let chapters = item.SubCategories.map((chaptersID) => {
                return chaptersID.chapter_uuid
              })
              return {volume_uuid: item.volume_uuid,chapters: chapters}
            })
            let sendData = {
              book_uuid: data.arg.bookId,
                uid: data.arg.uid,
                token: data.arg.token,
                book_detail: {},
                volumes: [
                {
                  "volume_uuid": client_uuid,
                  "title": "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "卷",
                  "sort": (Number(data.chapter) + Number(1))*100,
                  "is_deleted": 0,
                  "version": 0
                }
                ],
                chapters: {
                  "volumes": [
                  {
                    "volume_uuid": client_uuid,
                    "chapters": [{
                      "title": "第一章",
                      "chapter_uuid": chapter_uuid,
                      "sort": 100,
                      "version":0,
                      "is_deleted":0,
                      "chapter_unit_price":0
                    }]
                  }
                  ]
              },
              "sorts": {
              "volumes_sort": {
                  "volumes": volumes_sort  //卷UUID数组
                },
                "chapters_sort": chapters_sort
              }
            }
            // dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData, intoBook: tileData})
            dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData}).then((res) => {
              if(res.data.status === 200){
                let resData = res.data.result;
                let volumeList = book_json.SubCategories;
                let volumeVer = resData.volumes[0].version;
                let chapterVer = resData.chapters.volumes[0].chapters[0].version;
                volumeList[volumeList.length -1].version = volumeVer;
                volumeList[volumeList.length -1].is_update = 1;
                volumeList[volumeList.length -1].version = chapterVer;
                volumeList[volumeList.length -1].is_update = 1;
                sqliteDB.executeSql(
                  `UPDATE book_category SET book_json='${JSON.stringify(book_json)}', is_upload='1' WHERE client_uuid = '${data.arg.bookId}'`
                ).then(() => {})
                // commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance, chapterVer: chapterVer });
              }else{
                console.error(`error state a: ${res.data.status}`)
              }
            })
          });
        })
      }
    }
  },
  [TYPE.CHAPTER_ADD_BOOK]: ({ commit, dispatch, state }, data) => {
    console.log("Dong");
    console.log(data);
    let parent_client_uuid = data.arg.volume_uuid;
    // let parent_client_uuid = (data.arg.type == 2 ? data.arg.volume_uuid : data.arg.client_uuid);
    let client_uuid = uuid();
    let bookInfo = state.INFO_BOOK,book_json;
    let obj = {
      bookId: data.arg.bookId,
      "chapter_uuid": client_uuid,
      "client_uuid": client_uuid,
      "title": data.chapterName ? data.chapterName : "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "章",
      // "title": data.chapterName ? data.chapterName : "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "章",
      "sort": (Number(data.chapter) + Number(1))*100,
      "is_deleted": 0,
      "created_at": +new Date(),
      "version": 0,
      "chapter_unit_price": 0,
      "type": 3,
      "volume_uuid":parent_client_uuid,
      "word_count": 0
    }
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.arg.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        book_json.SubCategories[data.arg.index].SubCategories.push(obj);
        console.log('updata book_json response:')
        console.log(book_json)
        sqliteDB.executeSql(
          `update book_category SET book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.arg.bookId}'`
        ).then(() => {
          // commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance });

          dispatch(TYPE.QUERY_UPDATE_TIME, {uuid: data.arg.bookId}).then((res) => {
            console.log("in mutation chap add book dispatch");
            let volumes_sort = book_json.SubCategories.map((item) => {
              return item.volume_uuid
            })
            let chapters_sort = book_json.SubCategories.map((item) => {
              let chapters = item.SubCategories.map((chaptersID) => {
                return chaptersID.chapter_uuid
              })
              return {volume_uuid: item.volume_uuid,chapters: chapters}
            })
            console.log(chapters_sort)
            let sendData = {
              book_uuid: data.arg.bookId,
               uid: data.arg.uid,
               token: data.arg.token,
               book_detail: {},
               volumes: [

               ],
               chapters: {
                 "volumes": [{
                  "volume_uuid": parent_client_uuid,
                  "chapters": [{
                    "chapter_uuid": client_uuid,
                    "title": data.chapterName ? data.chapterName : "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "章",
                    // "title": data.chapterName ? data.chapterName : "第" + (arabiaToSimplifiedChinese(Number(data.chapter) + Number(1))) + "章",
                    "sort": (Number(data.chapter) + Number(1))*100,
                    "is_deleted": 0,
                    "version": 0,
                    "chapter_unit_price": 0,
                  }]
                 }]
             },
             "sorts": {
              "volumes_sort": {
                  "volumes": volumes_sort  //卷UUID数组
                },
                "chapters_sort": chapters_sort
              }
            }
            dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData}).then((res) => {
              if(res.data.status === 200){
                let resData = res.data.result;
                let chapterVer = resData.chapters.volumes[0].chapters[0].version;
                let chapterList = book_json.SubCategories[data.arg.index].SubCategories;
                chapterList[chapterList.length -1].version = chapterVer;
                console.log('dispatch book_json response:')
                console.log(book_json)
                sqliteDB.executeSql(
                  `UPDATE book_category SET book_json='${JSON.stringify(book_json)}', is_upload='1' WHERE client_uuid = '${data.arg.bookId}'`
                ).then(() => {})
                commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance, chapterVer: chapterVer });
              }else{
                console.error(`error state a: ${res.data.status}`)
                console.error(res.data)
                commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance, error: res.data})
              }
            },(error) => {
              console.log(error)
              commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance, error: {message: "网络未连接"}})
              // commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance });
            })
          });
        })
      }
    }

    // let tileData = [
    //   ,
    //   parent_client_uuid,
    //   '3',
    //   ,
    //   null,
    //   0,
    //   0,
    //   '',
    //   0,
    //   '101304569',
    //   "",
    //   0,
    //   0,
    //   0,
    //   data.chapter
    // ];
    // sqliteDB.insertData(
    //   `insert into book_category(${api.book_category}) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    //   [tileData]
    // )
    //   .then((res) => {
    //     let sendData = {
    //       book_uuid: data.bookId,
    //       uid: data.uid,
    //       book_detail: {},
    //       volumes: [],
    //       chapters: {
    //         "volumes": [
    //           {
    //             "volume_uuid": parent_client_uuid,
    //             "chapters": [
    //               {
    //                 "title": tileData[3],
    //                 "chapter_uuid": client_uuid,
    //                 "sort": Number(data.chapter),
    //                 "version": 0,
    //                 "is_deleted": 0,
    //                 "chapter_unit_price": 1.3
    //               }
    //             ]
    //           }
    //         ]
    //       }
    //     }
    //     dispatch(TYPE.UPDATE_ACTION_BOOK, { sendData, tileData })
    //   });
  },
  [TYPE.DELETE_BOOK]:({commit, dispatch}, data) => {
    sqliteDB.queryData(`select * from book_category where client_uuid = '${data.book_uuid}'`).then((row) => {
      if(row.length){
        let time = timestamp()
        let bookItem = row[0];
        let sendData = {
          book_uuid: bookItem.client_uuid,
          book_detail: {
            title: bookItem.title,
            summary: bookItem.summary,
            goal_word_count: bookItem.goal_word_count,
            word_count: bookItem.word_count,
            creation_status: bookItem.creation_status,
            is_deleted: 1,
            book_type: bookItem.book_type,
            version: data.version||bookItem.version
          },
          volumes: [],
          chapters: {
            "volumes": [
            ]
          }
        }
        axios.post(
          api.catalogueSync + `?token=${data.token}&timestamp=${time}`, 
          sendData,
          {
            headers: {
              'x-sign-id': hmac256(data.token,api.catalogueSync,time,sendData)
            }
          }).then((res) => {
            let msg = res.data;
            if(msg.status === 200){
              let book_detail = msg.result.book_detail
              if(book_detail.code == 200){
                sqliteDB.executeSql(
                  `update book_category SET version = '${book_detail.version}', is_deleted=1  where client_uuid = '${data.book_uuid}'`
                ).then(() => {
                  commit(TYPE.DELETE_BOOK_L1, {book_uuid: bookItem.client_uuid, version: book_detail.version, status: 200})
                })

              }else if(book_detail.code === 409){
                let current_data = book_detail.current_data
                data.version = current_data.version;
                dispatch(TYPE.DELETE_BOOK, data)
              }
            }else{
              commit(TYPE.DELETE_BOOK_L1, msg)
            }
          })
      }
    })
  },
  [TYPE.CHAPTER_DEL_BOOK]: ({ commit, dispatch, state }, data) => {
    let bookInfo = state.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] === data.bookId) {
        let bookItem = bookInfo[i];
        book_json = JSON.parse(bookItem.book_json);
        let delChapter = book_json.SubCategories[data.index].SubCategories.splice(data.CIndex,1)
        let bookNewCount = (Number(bookItem.word_count) - Number(data.word_count))<0 ? 0 : (Number(bookItem.word_count) - Number(data.word_count))
        let deletePath = path.join(`${bookItem.title}-${bookItem.client_uuid}`,`${book_json.SubCategories[data.index].title}-${book_json.SubCategories[data.index].client_uuid}`,`${data.title}-${data.chapter_uuid}.txt`)
        console.log('change bookNewCount is a: '+bookNewCount)
        // return false;
        data.bookNewCount = bookNewCount;
        ipcRenderer.send('ipc-book-subset-delete',{deletePath})
        sqliteDB.executeSql(
          `update book_category SET book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.bookId}'`
        ).then(() => {
          let volumes_sort = bookInfo[i].SubCategories.map((item) => {
            return item.volume_uuid
          })
          let chapters_sort = bookInfo[i].SubCategories.map((item) => {
            let chapterDel;
            let chapters = item.SubCategories.map((chaptersID, index) => {
              if(chaptersID.chapter_uuid == data.chapter_uuid) chapterDel = index;
              return chaptersID.chapter_uuid
            })
            if(chapterDel) {chapters.splice(chapterDel, 1)}
            return {volume_uuid: item.volume_uuid,chapters: chapters}
          })
          commit(TYPE.CHAPTER_DEL_BOOK, data)          
          let sendData = {
            book_uuid: data.bookId,
            uid: data.uid,
            token: data.token,
            book_detail: {
              "title": bookItem.title,
              "summary": bookItem.summary,
              "goal_word_count": bookItem.goal_word_count,
              "word_count": bookNewCount,
              "creation_status": bookItem.creation_status,
              "is_deleted": bookItem.is_deleted,
              "book_type": bookItem.book_type,
              "version": bookItem.version
            },
            volumes: [
             
            ],
            chapters: {
              "volumes": [{
                "volume_uuid": data.volume_uuid,
                "chapters": [{
                  "title": data.title,
                  "chapter_uuid": data.chapter_uuid,
                  "sort": data.sort,
                  "version":data.version,
                  "is_deleted":1,
                  "chapter_unit_price":data.chapter_unit_price
                }]
              }]
            },
            "sorts": {
              "volumes_sort": {
                "volumes": volumes_sort  //卷UUID数组
              },
              "chapters_sort": chapters_sort
            }
          }
          dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData}).then((res) => {
            let resData = res.data.result;
            let bookVer = resData.book_detail.version;
            // let chapterVer = resData.chapters.volumes[0].chapters[0].version
            // chapterItem.version = resData.chapters.volumes[0].chapters[0].version
            sqliteDB.executeSql(
              `UPDATE book_category SET word_count='${bookNewCount}', version = '${bookVer}', is_upload='1' WHERE client_uuid = '${data.bookId}'`
            ).then(() => {
              commit(TYPE.CHAPTER_DEL_UPLOAD_VERSION,{ bookVer: bookVer, bookId: data.bookId})
            })
          })
        })
        break;
      }
    }
  },
  [TYPE.VOLUME_DEL_BOOK]: ({ commit, dispatch }, data) => {
    let bookInfo = state.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.bookId) {
        let bookItem = bookInfo[i];
        book_json = JSON.parse(bookItem.book_json);
        let volumeItem = book_json.SubCategories.splice(data.index, 1);
        let delWorde = 0;
        let deletePath = path.join(`${bookItem.title}-${bookItem.client_uuid}`,`${data.title}-${data.volume_uuid}`)
        ipcRenderer.send('ipc-book-subset-delete',{deletePath})
        for(let k = 0; k<data.SubCategories.length; k++){
          delWorde += Number(data.SubCategories[k].word_count)
        }
        let bookNewCount = (Number(bookItem.word_count) - Number(delWorde))<0 ? 0 : (Number(bookItem.word_count) - Number(delWorde))
        // console.log(data)
        // console.log(bookNewCount)
        // return false
        data.bookNewCount = bookNewCount
        sqliteDB.executeSql(
          `update book_category SET word_count = '${bookNewCount}', book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.bookId}'`
        ).then(() => {
          let volumes_sort = bookInfo[i].SubCategories.map((item) => {
            return item.volume_uuid
          })
          volumes_sort.splice(data.index, 1)
          let chapters_sort = bookInfo[i].SubCategories.map((item) => {
            let chapters = item.SubCategories.map((chaptersID) => {
              return chaptersID.chapter_uuid
            })
            return {volume_uuid: item.volume_uuid,chapters: chapters}
          })
          chapters_sort.splice(data.index, 1)
          commit(TYPE.VOLUME_DEL_BOOK, data)
          let sendData = {
            book_uuid: data.bookId,
            uid: data.uid,
            token: data.token,
            book_detail: {
              "title": bookItem.title,
              "summary": bookItem.summary,
              "goal_word_count": bookItem.goal_word_count,
              "word_count": bookNewCount,
              "creation_status": bookItem.creation_status,
              "is_deleted": bookItem.is_deleted,
              "book_type": bookItem.book_type,
              "version": bookItem.version
            },
            volumes: [
              {
                "volume_uuid": data.volume_uuid,
                "title": data.title,
                "sort": data.sort,
                "is_deleted":1,
                "version":data.version
              }
            ],
            chapters: {
              "volumes": []
            },
            "sorts": {
              "volumes_sort": {
                "volumes": volumes_sort  //卷UUID数组
              },
              "chapters_sort": chapters_sort
            }
          }
          dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData}).then((res) => {
            if(res.data.status === 200){
              let resData = res.data.result;
              let bookVer = resData.book_detail.version;
              sqliteDB.executeSql(
                `update book_category SET version = '${bookVer}' where client_uuid = '${data.bookId}'`
              )
              commit(TYPE.VOLUME_DEL_BOOK_VERSION, {book_uuid: data.bookId, version: bookVer})
              // commit(TYPE.CHAPTER_ADD_BOOK, {arg: data.arg, obj, addEntrance: data.addChapterEntrance, chapterVer: chapterVer });
            }else{
              console.error(`error state a: ${res.data.status}`)
            }
          })
      })
    }
  }
    // sqliteDB.executeSql(`DELETE FROM bookList WHERE id = ${data.id} or parent_id = ${data.id}`).then((res) => {
    //   commit(TYPE.VOLUME_DEL_BOOK, data)
    // })
  },
  [TYPE.CHANGE_TITLE_BOOK]: ({commit, state, dispatch}, data) => {
    let bookInfo = state.INFO_BOOK,volumes = [],chapters = {"volumes": []},book_json, index, CIndex;
    let ipcData = {
      oldPath:'',
      newPath: '',
      type: data.type
    };
    let volumePath = '';
    sqliteDB.queryData(`select * from book_category where client_uuid = '${data.data.bookId}' AND is_deleted = 0`).then((rows) => {
      if(rows.length>0){
        book_json = JSON.parse(rows[0].book_json);
        for(let i = 0; i<book_json.SubCategories.length; i++){
          if(data.data.volume_uuid === book_json.SubCategories[i].client_uuid){
            let volumeItem = book_json.SubCategories[i];
            volumePath = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${volumeItem.title}-${volumeItem.client_uuid}`);
            data.data.index = i
            if(data.type === 'volume'){
              volumeItem.title = data.title;
              volumes.push({
                "volume_uuid": data.data.volume_uuid,
                "title": data.title,
                "sort": data.data.sort,
                "is_deleted":0,
                "version":volumeItem.version
              })
              ipcData.oldPath = volumePath
              ipcData.newPath = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${data.title}-${volumeItem.client_uuid}`);

            }else if(data.type === 'chapter'){
              for(let k = 0; k<volumeItem.SubCategories.length; k++){
                if(volumeItem.SubCategories[k].client_uuid === data.data.chapter_uuid){
                  let chapterItem = volumeItem.SubCategories[k];
                  ipcData.oldPath = path.join(volumePath, `${chapterItem.title}-${chapterItem.client_uuid}`)
                  ipcData.newPath = path.join(volumePath, `${data.title}-${chapterItem.client_uuid}`)
                  data.data.CIndex = k
                  chapterItem.title = data.title;
                  chapters.volumes.push({
                    "volume_uuid": data.data.volume_uuid,
                    "chapters": [{
                      "title": data.title,
                      "chapter_uuid": data.data.chapter_uuid,
                      "word_count": chapterItem.word_count,
                      "sort": data.data.sort,
                      "version": chapterItem.version,
                      "is_deleted":0,
                      "chapter_unit_price": data.data.chapter_unit_price
                    }]
                  })
                  break;
                }
              }
            }else{
              console.error('修改有误')
              return false
            }
            console.log(ipcData)
            ipcRenderer.send('ipc-book-subset-change-name', ipcData)
            commit(TYPE.CHANGE_TITLE_BOOK, data)
            let volumes_sort = book_json.SubCategories.map((item) => {
              return item.volume_uuid
            })
            let chapters_sort = book_json.SubCategories.map((item) => {
              let chapters = item.SubCategories.map((chaptersID) => {
                return chaptersID.chapter_uuid
              })
              return {volume_uuid: item.volume_uuid,chapters: chapters}
            })
            // commit(TYPE.CHANGE_TITLE_BOOK, data)
            let sendData = {
              book_uuid: data.data.bookId,
              uid: data.uid,
              token: data.token,
              book_detail: {},
              volumes: volumes,
              chapters: chapters,
              title: data.title,
              type: data.type,
              index: data.data.index,
              CIndex: data.type == "chapter"?data.data.CIndex:'',
              commit: 'TYPE.CHANGE_TITLE_BOOK',
              tryNum: 1,
              book_json: book_json,
              "sorts": {
                "volumes_sort": {
                  "volumes": volumes_sort  //卷UUID数组
                },
                "chapters_sort": chapters_sort
              }
            }
            dispatch(TYPE.UPDATE_ACTION_BOOK,{sendData: sendData})
            // .then((res) => {
            //   let msg = res.data.result;
            //   if(msg.chapters.volumes&&(msg.chapters.volumes[0].chapters[0].code === 200)){
            //     commit(TYPE.CHANGE_TITLE_BOOK, {version: msg.chapters.volumes[0].chapters[0].version, title: data.title, index: index, CIndex: CIndex})
            //     sqliteDB.executeSql(
            //       `update book_category SET book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.data.bookId}'`
            //     )
            //   }else if(msg.chapters.volumes&&(msg.chapters.volumes[0].chapters[0].code !== 200)){
            //     console.error('修改章节名称出现错误！code: '+msg.chapters.volumes[0].chapters[0].code)
            //   }else if(msg.volumes&&(msg.volumes[0].code === 200)){
            //     commit(TYPE.CHANGE_TITLE_BOOK, {version: msg.volumes[0].version, title: data.title, index: index, CIndex: CIndex})
            //     sqliteDB.executeSql(
            //       `update book_category SET book_json='${JSON.stringify(book_json)}'  where client_uuid = '${data.data.bookId}'`
            //     )
            //   }else if(msg.volumes&&(msg.volumes[0].code === 409)){
            //     volumes.version = msg.volumes[0].version;
            //   }else if(msg.volumes&&(msg.volumes[0].code !== 200)){
            //     console.error('修改章节名称出现错误！code: '+msg.chapters.volumes[0].chapters[0].code)
            //   }
            // })
            break;
          }
        }
      }
    })
  },
  [TYPE.OPEN_BOOK]: ({ commit, state, rootState }, data) => {
    sqliteDB.queryData(`select * from book_category where client_uuid = '${data.book.client_uuid}'`).then((bookItem) => {
      // console.log("oh???????case；")
      // console.log(data);
      let time = timestamp()
      // if(!res[0].book_json){
        // axios.get( api.catalogueList+`?book_uuid=${data.book_uuid}&update_time=${res[0].book_json?data.update_time:0}&token=${data.token}`)
        axios.get(api.catalogueList+`?book_uuid=${data.book.client_uuid}&update_time=0&token=${data.token}&timestamp=${time}`,
          {
            headers: {
                'x-sign-id': hmac256(data.token, api.catalogueList, time )
            }
          })
        .then((res) => {
          let msg = res.data;
          if (msg.status == 200) {
            let bookDetail = msg.result.book_detail;
            let volumes = msg.result.volumes || [];
            let chapters = msg.result.chapters || [];
            let bookMulist = [];
            let volumes_sort = msg.result.sorts?msg.result.sorts.volumes_sort:[],chapters_sortort = msg.result.sorts.chapters_sort?msg.result.sorts.chapters_sort:[],bookVolumes = {SubCategories:[]},volumesList = [];
            if (msg.result.is_book_update == 1) {
              // let intoBook = [bookDetail.book_uuid, '0', bookDetail.type, bookDetail.title, bookDetail.summary, 0, bookDetail.goal_word_count, bookDetail.book_type, bookDetail.creation_status, data.uid, '', bookDetail.is_deleted, 1, bookDetail.version, bookDetail.sort]
              sqliteDB.executeSql(
                `update book_category SET summary='${sqliteDBStrongDecode(bookDetail.summary, "'")}', word_count='${bookDetail.word_count}', title='${sqliteDBStrongDecode(bookDetail.title, "'")}', goal_word_count='${bookDetail.goal_word_count}', book_type='${sqliteDBStrongDecode(bookDetail.book_type, "'")}', version=${bookDetail.version} where client_uuid = '${bookDetail.book_uuid}'`
              )
            }
            if(chapters_sortort.length){
              // 初始化卷列表数据，排序章的列表数据
              chapters_sortort.forEach((volume) => {
                for(let i = 0;i<volumes.length;i++){
                  if((volume.volume_uuid == volumes[i].volume_uuid)&&(volumes[i].is_deleted != 1)){
                    let volumeItem = volumes.splice(i,1)[0];
                    volumeItem['SubCategories'] = [];
                    if(volume.chapters.length){
                      let itemWive = [];
                       volume.chapters.forEach((item) => {
                        for(let i = 0;i<chapters.length;i++){
                          if((item == chapters[i].chapter_uuid)&&(chapters[i].is_deleted != 1)){
                            chapters[i].client_uuid = item
                            itemWive.push(chapters[i])
                          }
                        }
                      })
                      volumeItem['SubCategories'] = itemWive
                    }
                    bookMulist.push(volumeItem)
                  }
                }
              })
              volumes_sort.volumes.map((item) => {
                for(let i = 0;i<bookMulist.length;i++){
                  if(item == bookMulist[i].volume_uuid){
                    bookMulist[i].client_uuid = item
                    volumesList.push(bookMulist.splice(i,1)[0])
                  }
                }
              })
              bookVolumes.SubCategories = volumesList;
            }
            console.log(bookItem)
            ipcRenderer.send('ipc-info-volumes-file', {volumes: bookVolumes.SubCategories, bookDetail: bookItem[0]})
            sqliteDB.executeSql(
              `UPDATE book_category set book_json = '${JSON.stringify(bookVolumes)}' where client_uuid = '${data.book.client_uuid}'`
            ).then(() => {
              commit(TYPE.OPEN_BOOK, {SubCategories: JSON.stringify(bookVolumes), data:{book: data.book}});
              // commit(TYPE.ADD_OPEN_BOOK_TO_EDITOR_L1, {SubCategories: JSON.stringify(bookVolumes), data:{book: data.book}});
            })

            // if(!bookMulist.length){
            //   sqliteDB.executeSql(
            //     `UPDATE book_category set book_json = '${JSON.stringify(bookVolumes)}' where client_uuid = '${data.book_uuid}'`
            //   ).then(() => {
            //     commit(TYPE.OPEN_BOOK, {SubCategories: JSON.stringify(bookVolumes), data:{book_uuid: data.book_uuid}});
            //   })
            // }else{
            //    volumes_sort.volumes.map((item) => {
            //     for(let i = 0;i<bookMulist.length;i++){
            //       if(item == bookMulist[i].volume_uuid){
            //         volumesList.push(bookMulist.splice(i,1)[0])
            //       }
            //     }
            //   })
            //   bookVolumes.SubCategories = volumesList;
            //   sqliteDB.executeSql(
            //     `UPDATE book_category set book_json = '${JSON.stringify(bookVolumes)}' where client_uuid = '${data.book_uuid}'`
            //   ).then(() => {
            //     commit(TYPE.OPEN_BOOK, {SubCategories: JSON.stringify(bookVolumes), data:{book_uuid: data.book_uuid}});
            //   })
            // }
          }else{
            commit(TYPE.GET_BOOK_MESSAGE, msg)
          }
        })
      // }else{

      // }
    })
/*
    axios.get( api.catalogueList+`?book_uuid=${data.book_uuid}&update_time=0&token=${data.token}`)
      .then((res) => {
        let msg = res.data;
        if (msg.status == 200) {
          let bookDetail = msg.result.book_detail;
          let volumes = msg.result.volumes || [];
          let chapters = msg.result.chapters || [];
          let itemList = volumes.concat(chapters);
          if (msg.result.is_book_update == 1) {
            // let intoBook = [bookDetail.book_uuid, '0', bookDetail.type, bookDetail.title, bookDetail.summary, 0, bookDetail.goal_word_count, bookDetail.book_type, bookDetail.creation_status, data.uid, '', bookDetail.is_deleted, 1, bookDetail.version, bookDetail.sort]
            sqliteDB.executeSql(
              `update book_category SET summary='${bookDetail.summary}', title='${bookDetail.title}', goal_word_count='${bookDetail.goal_word_count}', book_type='${bookDetail.type}', version=${bookDetail.version} where client_uuid = '${bookDetail.book_uuid}'`
            )
          }
          if (itemList.length) {
            for (let i = 0; i < itemList.length; i++) {
              let item = itemList[i];
              let uuid = item.chapter_uuid ? item.chapter_uuid : item.volume_uuid;
              let chaptersData = item.chapter_uuid ? [item.chapter_uuid, item.volume_uuid, item.type, item.title, '', item.chapter_unit_price || 0, 0, '', 0, data.uid, '', item.is_deleted, 1, item.version, item.sort] :
                [item.volume_uuid, data.book_uuid, item.type, item.title, '', 0, 0, '', 0, data.uid, '', item.is_deleted, 1, bookDetail.version, item.sort];
              sqliteDB.queryData(`select * from book_category where client_uuid = '${uuid}'`).then((rows) => {
                if (!rows.length) {
                  return sqliteDB.insertData(
                    `insert into book_category(${api.book_category}) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [chaptersData]
                  )
                }
              }).then((res) => {
                if (i == itemList.length - 1) {
                  let children = [];
                  sqliteDB.queryData(`select * from book_category where parent_client_uuid = '${data.book_uuid}'`).then((rows) => {
                    children = rows.map((item, index) => {
                      item['children'] = [];
                      return item
                    })
                  }).then((res) => {
                    for (let i = 0; i < children.length; i++) {
                      sqliteDB.queryData(`select * from book_category where parent_client_uuid = '${children[i].client_uuid}'`).then((rows) => {
                        children[i]['children'] = rows
                        if (i == children.length - 1) {
                          commit(TYPE.OPEN_BOOK, { data, children })
                        }
                      })
                    }
                  })
                }
              })
            }
          } else {
            commit(TYPE.OPEN_BOOK, { data, children: [] })
          }
          // if(msg.result.chapters.length){
          //   for(let i = 0; i < msg.result.chapters.length ; i++){
          //     let chaptersData = [];
          //     let item = msg.result.chapters[i];
          //     sqliteDB.queryData(`select * from book_category where client_uuid = '${item.chapter_uuid}'`).then((chaptersList) => {
          //       if(!chaptersList.length){
          //         chaptersData = [item.chapter_uuid, item.volume_uuid, item.type, item.title, '', item.chapter_unit_price, 0, '', 0, data.uid, '', item.is_deleted, 1, item.version, 0, item.sort]
          //         sqliteDB.insertData(
          //           "insert into book_category(client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version,update_time,sort) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          //           [chaptersData]
          //         ).then((res) => {
          //           console.log('chapters'+i)
          //         })
          //       }
          //     }).catch((ErrorInfo) => {
          //       if(ErrorInfo == 'Content is empty!!'){
          //         chaptersData = [item.chapter_uuid, item.volume_uuid, item.type, item.title, '', item.chapter_unit_price, 0, '', 0, data.uid, '', item.is_deleted, 1, item.version, 0, item.sort]
          //         sqliteDB.insertData(
          //           "insert into book_category(client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version,update_time,sort) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          //           [chaptersData]
          //         ).then((res) => {
          //           console.log('chapters'+i)
          //         })
          //       }
          //     })
          //   }
          // }
          // if(msg.result.volumes.length){
          //   for(let i = 0; i < msg.result.volumes.length ; i++){
          //     let volumesData = [];
          //     let item = msg.result.volumes[i];
          //     sqliteDB.queryData(`select * from book_category where client_uuid = '${item.volume_uuid}'`).then((chaptersList) => {
          //       if(!chaptersList.length){
          //         volumesData = [item.volume_uuid, data.book_uuid, item.type, item.title, '', 0, 0, '', 0, data.uid, '', item.is_deleted, 1, bookDetail.version, 0, item.sort]
          //         sqliteDB.insertData(
          //           "insert into book_category(client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version,update_time,sort) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          //           [volumesData]
          //         ).then((res) => {
          //           console.log('volumes'+i)
          //         })
          //       }
          //     }).catch((ErrorInfo) => {
          //       if(ErrorInfo == 'Content is empty!!'){
          //         volumesData = [item.volume_uuid, data.book_uuid, item.type, item.title, '', 0, 0, '', 0, data.uid, '', item.is_deleted, 1, bookDetail.version, 0, item.sort]
          //         sqliteDB.insertData(
          //           "insert into book_category(client_uuid,parent_client_uuid,type,title,summary,chapter_unit_price,goal_word_count,book_type,creation_status,uid,book_json,is_deleted,is_upload,version,update_time,sort) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          //           [volumesData]
          //         ).then((res) => {
          //           console.log('volumes'+i)
          //         })
          //       }
          //     })
          //   }
          // }
        }
      })**/
    // sqliteDB.executeSql(`update bookList SET act_type = 2 WHERE act_type = 1`).then((res) => {
    //     sqliteDB.executeSql(`update bookList SET act_type = 1 WHERE id = ${data}`).then((res) => {
    //         commit(TYPE.OPEN_BOOK, data)
    //     })
    // })
  },
  /**
   * data
   * sendData = {
   *    book_uuid: book_uuid,
   *     uid: data.uid,
   *     book_detail: data.book,
   *     volumes: [],
   *     chapters: {
   *       "volumes": [
   *       ]
   *   }
   *  }
   * intoBook:[]  插表的数据表结构
   */
  [TYPE.UPDATE_ACTION_BOOK]: ({ commit, state, dispatch }, data) => {
    console.log(data)
    let parameters = {
      "book_uuid": data.sendData.book_uuid,
      "book_detail": data.sendData.book_detail,
      "volumes": data.sendData.volumes,
      "chapters": data.sendData.chapters,
      "sorts": data.sendData.sorts,
    }
    let time = timestamp()
    return axios.post(
      api.catalogueSync + `?token=${data.sendData.token}&timestamp=${time}`, 
      parameters,
      {
        headers: {
          'x-sign-id': hmac256(data.sendData.token,api.catalogueSync,time,parameters)
        }
      }
      ).then((res) => {
      let msg = res.data;
      if (msg.status == 200) {
        let bookInfo = state.INFO_BOOK,book_json;
        if ((msg.result.book_detail) && (msg.result.book_detail.code == 200)) {
          sqliteDB.queryData(`select * from book_category where client_uuid = '${msg.result.book_uuid}' AND is_deleted = 0`).then((rows) => {
            if(rows[0].version == 0){
              sqliteDB.executeSql(
                `UPDATE book_category SET version = ${msg.result.book_detail.version},is_upload=1 WHERE client_uuid = '${msg.result.book_uuid}'`
              ).then((res) => {
                data.intoBook[13] = 1;
                commit(TYPE.INFO_BOOK, { list: [arrayReachJson(api.book_category, data.intoBook)], type: 'add' })
                // commit(TYPE.OPEN_BOOK, { data: { book_uuid: data.sendData.client_uuid }, children: [] })
                commit(TYPE.GET_BOOK_MESSAGE, { status: 200, message: '书本创建成功' })
                sqliteDB.executeSql(
                  `UPDATE module_record SET update_time = ${msg.result.update_time} WHERE client_uuid = '${msg.result.book_uuid}' AND category = ${api.category[0]}`
                )
              })
            }
          })
        }else if ((msg.book_detail) && (msg.book_detail.code != 200)) {
          console.error('书本信息同步有误:' + msg.book_detail.code)
        }
        // error volumes is not defined
        if ((msg.result.chapters.volumes)&&(msg.result.chapters.volumes.length)) {
          let chapter = msg.result.chapters.volumes;
          for(let i = 0;i<chapter.length; i++){
            if(chapter[i].chapters[0].code == 200){
              if(chapter[i].chapters[0].version == 1){
                let client_uuid = uuid();
                console.log([chapter[i].chapters[0].chapter_uuid,client_uuid,data.sendData.uid,'',0,0,0])
                sqliteDB.insertData(
                  `insert into chapter_content(${api.chapter_content}) values(?,?,?,?,?,?,?)`,
                  [[chapter[i].chapters[0].chapter_uuid,client_uuid,data.sendData.uid,'',0,0,0]]
                )
              }
              else if((data.sendData.commit)&&(data.sendData.commit == 'TYPE.CHANGE_TITLE_BOOK')){
                let book_json = data.sendData.book_json
                book_json.SubCategories[data.sendData.index].SubCategories[data.sendData.CIndex].version = chapter[i].chapters[0].version ;
                data.sendData.version = chapter[i].chapters[0].version;
                data.sendData.bookJSON = book_json
                commit(TYPE.CHANGE_TITLE_BOOK_VERSION, data.sendData)
                sqliteDB.executeSql(
                  `UPDATE book_category SET book_json = '${JSON.stringify(book_json)}' WHERE client_uuid = '${data.sendData.book_uuid}'`
                )
              }else if((data.sendData.commit)&&(data.sendData.commit == 'TYPE.BOOK_CHANGR_WORD_VERSION')){
                let bookDetail = msg.result.book_detail;
                if((bookDetail) && (bookDetail.code == 409)){
                  if(data.sendData.tryNum >= 3){
                    console.error('书本信息异常重试值已过抛出~~');
                    return false
                  }
                  data.sendData.tryNum+=1;
                  data.sendData.book_detail.version = bookDetail.current_data.version;
                  data.sendData.chapters.volumes[0].chapters[0].version = chapter[i].chapters[0].version;
                  console.log('章节同步字数时书本version发生冲突， ~~~~')
                  dispatch(TYPE.UPDATE_ACTION_BOOK, data)
                  return false
                }
                let bookVer = bookDetail.version;
                let chapterVer = chapter[i].chapters[0].version
                let commitData = data.sendData.commitData;
                commitData.categoryLis.SubCategories[commitData.i].SubCategories[commitData.k].version = chapterVer
                console.log('dispath 回调函数中的 chapter')
                console.log(commitData.categoryLis.SubCategories[commitData.i].SubCategories[commitData.k]);
                sqliteDB.executeSql(
                  `UPDATE book_category SET version = '${bookVer}',  book_json = '${JSON.stringify(commitData.categoryLis)}', is_upload='1' WHERE client_uuid = '${data.sendData.book_uuid}'`
                ).then(() => {
                  commit(TYPE.BOOK_CHANGR_WORD_VERSION,{i:commitData.i, k: commitData.k,bookJson: JSON.stringify(commitData.categoryLis),bookVer: bookVer, chapterVer: chapterVer, book_uuid: data.sendData.book_uuid, chapter_uuid: chapter[i].chapters[0].chapter_uuid})
                })
              }
              // sqliteDB.executeSql(
              //   `UPDATE book_category SET version = ${volumes[0].version}, is_upload = 1 WHERE client_uuid = '${volumes[0].volume_uuid}'`
              // ).then(() => {
              //   console.log('章节同步成功')
              // })
            }
            else if((chapter[i].chapters[0].code == 409)){
              if(data.sendData.tryNum >= 3){
                console.error('章节息异常重试值已过抛出~~');
                return false
              }
              data.sendData.tryNum+=1;
              data.sendData.chapters.volumes[0].chapters[0].version = chapter[i].chapters[0].current_data.version
              dispatch(TYPE.UPDATE_ACTION_BOOK, data)
            }
          }
        }
        if ((msg.result.volumes)&&(msg.result.volumes.length)) {
          let volumes = msg.result.volumes;
          for(let i = 0;i<volumes.length; i++){
            if(volumes[i].code == 200){
              if(volumes[i].version == 1){
                console.log('新建卷成功')
              }
              else if((data.sendData.commit)&&(data.sendData.commit === 'TYPE.CHANGE_TITLE_BOOK')){
                // let book_json = JSON.parse(bookInfo[data.sendData.i].book_json);
                let book_json = data.sendData.book_json
                book_json.SubCategories[data.sendData.index].title = data.sendData.title;
                book_json.SubCategories[data.sendData.index].version = volumes[i].version;
                data.sendData.version = volumes[i].version;
                data.sendData.bookJSON = book_json
                commit(TYPE.CHANGE_TITLE_BOOK_VERSION, data.sendData)
                sqliteDB.executeSql(
                  `UPDATE book_category SET book_json = '${JSON.stringify(book_json)}' WHERE client_uuid = '${data.sendData.book_uuid}'`
                )
              }
              // sqliteDB.executeSql(
              //   `UPDATE book_category SET version = ${volumes[0].version}, is_upload = 1 WHERE client_uuid = '${volumes[0].volume_uuid}'`
              // ).then(() => {
                console.log('卷同步成功')
              // })
            }
            else if((volumes[i].code == 409)){
              if(data.sendData.tryNum >= 3){
                console.error('卷信息异常重试值已过抛出~~');
                return false
              }
              data.sendData.tryNum+=1;
              data.sendData.volumes.volumes[0].version = volumes[0].version
              dispatch(TYPE.UPDATE_ACTION_BOOK, data)
            }
          }
        }
        sqliteDB.executeSql(`UPDATE module_record set update_time = ${msg.result.update_time} where client_uuid = '${msg.result.book_uuid}' and category = ${api.category[0]}`)
      } else {
        console.log('出现了异常')
        // sqliteDB.executeSql(
        //   `DELETE FROM book_category WHERE client_uuid = '${parameters.book_uuid}'`
        // ).then(() => {
          commit(TYPE.GET_BOOK_MESSAGE, msg)
        // })
      }
      return res
    })
  },
  [TYPE.SYNC_UPDATE_BOOK_CONTENT_L1]:({commit, state}, data) => {
    console.log(data)
    let commitContent = {};
    //createFlag 为true时指新建
    //新建状态下不需要走设置章节信息
    if(!data.createFlag){

      // commitContent.type = data.type
      // if(data.type ==  'volume'){
        commitContent.book_detail = data.resData.book_detail;
        commitContent.volumes = data.resData.volumes;
      // }else if(data.type ==  'chapter'){
        commitContent.chapters = data.resData.chapters;
        commitContent.book_uuid = data.resData.book_uuid;
      // }
      (data.view)&&(commitContent.view = data.view)
      commit(TYPE.SET_BOOK_CONTENT_L1, commitContent)
    }
    let time = timestamp()
    return axios.post(
      api.catalogueSync + `?token=${data.token}&timestamp=${time}`, 
      data.resData,
      {
        headers: {
          'x-sign-id': hmac256(data.token,api.catalogueSync,time,data.resData)
        }
      }
      )
  },
  [TYPE.CHAPTER_UP_BOOK]: ({ commit, state }, data) => {
    if (data.book_type != 3) return false;
    commit(TYPE.CHAPTER_UP_BOOK, { data: data, commit: commit })
  },
  [TYPE.BOOK_CHANGE_WORD_COUNT]: ({commit, dispatch, state}, data) => {
    sqliteDB.queryData(`select * from book_category where client_uuid = '${data.bodyData.book_uuid}' AND is_deleted = 0`).then((rows) => {
      if(rows.length>0){
        console.log(rows)
        console.log(data)
        let categoryLis = JSON.parse(rows[0].book_json);
        for(let i = 0;i<categoryLis.SubCategories.length; i++){
          if(categoryLis.SubCategories[i].client_uuid === data.bodyData.volume_uuid){
            console.log('卷列表循环结束，开始章节循环')
            let volumeItem = categoryLis.SubCategories[i];
            for(let k = 0;k<volumeItem.SubCategories.length; k++){
              console.log('校验章节ID')
              if(volumeItem.SubCategories[k].client_uuid === data.bodyData.chapters[0].chapter_uuid){
                console.log('卷循环结束，开始处理任务逻辑')
                console.log('sqlite push , on ipc-ansyBook')
                data.bodyData.chapters[0].content = '';
                // console.log(path)
                let chapterPath = {}
                let chapterItem = volumeItem.SubCategories[k];
                let changeNum = data.wordNum - chapterItem.word_count;
                let bookNewCount = (Number(rows[0].word_count) + Number(changeNum)) > 0 ? (Number(rows[0].word_count) + Number(changeNum)) : 0;
                chapterItem.word_count = data.wordNum;
                chapterPath.paths = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${volumeItem.title}-${volumeItem.client_uuid}`)
                chapterPath.fileName = `${chapterItem.title}-${chapterItem.client_uuid}`
                data.chapterPath = chapterPath
                console.log(`BOOK_CHANGE_WORD_COUNT send ipc ipc-ansyBook log data:`)
                let dataString = JSON.stringify(data);
                let uuid = chapterItem.client_uuid
                console.log({data: dataString, uuid})
                ipcRenderer.send('ipc-ansyBook', {data: dataString, uuid})
                // return false;
                sqliteDB.executeSql(
                  `UPDATE book_category SET word_count = '${bookNewCount}',  book_json = '${JSON.stringify(categoryLis)}', is_upload='0' WHERE client_uuid = '${data.bodyData.book_uuid}'`
                ).then(() => {
                  // let bookInfo = state.INFO_BOOK
                  commit(TYPE.BOOK_CHANGE_WORD_COUNT,{k: k, i: i, bookNewCount: bookNewCount, wordNum: data.wordNum, book_uuid: data.bodyData.book_uuid, chapter_uuid: data.bodyData.chapters[0].chapter_uuid})
                  console.log(rows)
                  let sendData = {
                    book_uuid: data.bodyData.book_uuid,
                    uid: data.uid,
                    token: data.token,
                    commit: 'null',
                    book_detail: {
                      "title": rows[0].title,
                      "summary": rows[0].summary,
                      "goal_word_count": rows[0].goal_word_count,
                      "word_count": bookNewCount,
                      "creation_status": rows[0].creation_status,
                      "is_deleted":rows[0].is_deleted,
                      "book_type": rows[0].book_type,
                      "version": rows[0].version
                    },
                    volumes: [],
                    chapters: {
                      "volumes": [{
                        "volume_uuid": data.bodyData.volume_uuid,
                        "chapters": [{
                          "title": chapterItem.title,
                          "chapter_uuid": chapterItem.client_uuid,
                          "word_count": data.wordNum,
                          "version": chapterItem.version,
                          "is_deleted": chapterItem.is_deleted,
                          "chapter_unit_price": chapterItem.chapter_unit_price
                        }]
                      }]
                    },
                    "sorts": {},
                    "commit": 'TYPE.BOOK_CHANGR_WORD_VERSION',
                    'tryNum': 1,
                    "commitData": {
                      k: k, 
                      i: i, 
                      categoryLis: categoryLis
                    }
                  }
                  dispatch(TYPE.UPDATE_ACTION_BOOK, {sendData})
                  // .then((res) => {
                  //   let resData = res.data.result;
                  //   chapterItem.version = resData.chapters.volumes[0].chapters[0].version
                  //   sqliteDB.executeSql(
                  //     `UPDATE book_category SET version = '${bookVer}',  book_json = '${JSON.stringify(categoryLis)}', is_upload='1' WHERE client_uuid = '${data.bodyData.book_uuid}'`
                  //   ).then(() => {
                  //     commit(TYPE.BOOK_CHANGR_WORD_VERSION,{bookVer: bookVer, chapterVer: chapterItem.version, book_uuid: data.bodyData.book_uuid, chapter_uuid: data.bodyData.chapters[0].chapter_uuid})
                  //   })
                  // })
                })
                break;
              }else{
                console.log('em。没有相同的章节~')
              }
            }
            console.log('即将结束')
            break;
          }else{
            console.log('没有相同的卷内容')
          }
        }
      }else{
        console.log('库中没有此数据')
      }
    })
  },
  [TYPE.CHAPTER_CONTENT_SYNC]: ({commit,dispatch}, data) => {
    console.log("in action: data: ");
    console.log(data)
    console.log(data.bodyData.chapters[0].content)
    console.log(data.bodyData.chapters[0].chapter_uuid);

    //导入卷的时候由于新建卷已经入库, 携带noInsertDB属性跳过入库
    // if(data.insertDB){
    //   let useChapter = {...data.bodyData.chapters[0]}
    //   useChapter.bookId = data.bodyData.book_uuid
    //   localQuery.insertChapterContentToDB({data: useChapter, uid: data.uid, needUpload: true, content: data.bodyData.chapters[0].content}).then((res) => {

    //       // data.bodyData.chapters[0].content = '';
    //       // let chapterPath = {}
    //       // chapterPath.paths = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${volumeItem.title}-${volumeItem.client_uuid}`)
    //       // chapterPath.fileName = `${chapterItem.title}-${chapterItem.client_uuid}`
    //       // data.chapterPath = chapterPath
    //       ipcRenderer.send('ipc-ansyBook', JSON.stringify(data))
    //       // commit(TYPE.CHAPTER_CONTENT_SYNC, {book_uuid: data.bodyData.book_uuid, chapter_uuid: data.bodyData.chapters[0].chapter_uuid, volume_uuid: data.bodyData.volume_uuid})

    //     }).catch((err) => {
    //       console.log(err);
    //       commit(TYPE.CHAPTER_CONTENT_SYNC, err)
    //     })
    //     return;      
    // }



    // return false;
    // dispatch(TYPE.BOOK_CHANGE_WORD_COUNT, data)

      // let chapterPath = {}
      // chapterPath.paths = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${volumeItem.title}-${volumeItem.client_uuid}`)
      // chapterPath.fileName = `${chapterItem.title}-${chapterItem.client_uuid}`
      // data.chapterPath = chapterPath
      // commit(TYPE.CHAPTER_CONTENT_SYNC, {book_uuid: data.bodyData.book_uuid, chapter_uuid: data.bodyData.chapters[0].chapter_uuid, volume_uuid: data.bodyData.volume_uuid})
    setTimeout(() => {
      sqliteDB.executeSql(
        `update chapter_content SET content='${sqliteDBStrongDecode(data.bodyData.chapters[0].content,"'")}', is_upload='0' where chapter_uuid = '${data.bodyData.chapters[0].chapter_uuid}'`
      ).then((res) => {

        let tempContent = sqliteDBStrongDecode(data.bodyData.chapters[0].content,"'")
        console.log("tempContent !!!!!!!!!!")
        console.log(tempContent);

        console.log("update chapter content !!!!!! okay!!!!!!")
        console.log(res);

        data.bodyData.chapters[0].content = '';
        // let chapterPath = {}
        // chapterPath.paths = path.join(`${rows[0].title}-${rows[0].client_uuid}`,`${volumeItem.title}-${volumeItem.client_uuid}`)
        // chapterPath.fileName = `${chapterItem.title}-${chapterItem.client_uuid}`
        // data.chapterPath = chapterPath
        ipcRenderer.send('ipc-ansyBook', {data: JSON.stringify(data), uuid: data.bodyData.chapters[0].chapter_uuid})
        // commit(TYPE.CHAPTER_CONTENT_SYNC, {book_uuid: data.bodyData.book_uuid, chapter_uuid: data.bodyData.chapters[0].chapter_uuid, volume_uuid: data.bodyData.volume_uuid})

      }).catch((err) => {
        console.log("update chapter content failed!!!!!!!!!")
        console.log(err);
        commit(TYPE.CHAPTER_CONTENT_SYNC, err)
      })
    , 500})
    /***  
    axios.post(api.chapterContentSync+`?token=${data.token}`, data.bodyData).then((res) => {
      let msg = res.data;
      if(msg.status == 200){
        let wordNum = '',message = ''
        if(msg.result.datas[0].code == 200){
          wordNum = fnGetCpmisWords(data.bodyData.chapters[0].content)
          message = '同步成功'
          sqliteDB.executeSql(
            `update chapter_content SET content='${data.bodyData.chapters[0].content}', version='${msg.result.datas[0].update_number}', is_upload='1' where chapter_uuid = '${data.bodyData.chapters[0].chapter_uuid}'`
          )
          commit(TYPE.CHAPTER_CONTENT_SYNC, {chapter_uuid: data.bodyData.chapters[0].chapter_uuid ,wordNum: wordNum, status: msg.result.datas[0].code, message: message, sync_type: data.sync_type||''})
        }else if(msg.result.datas[0].code == 409){
          // message = '发生冲突开始回滚'
          console.log('发生冲突开始更新version')
          data.bodyData.chapters[0].update_number = msg.result.datas[0].current_data.update_number;
          dispatch(TYPE.CHAPTER_CONTENT_SYNC,data)
        }
      }else{
        commit(TYPE.GET_BOOK_MESSAGE, msg)          
      }
    })*/
  }
}
const mutations = {
  [TYPE.SET_BOOKS_L1]: (store, data) => {
    console.log("in set books data is: ");
    console.log(data);
    store.ALL_BOOKS_ARRAY = data.books;
    console.log("after set all books");
    console.log(store.ALL_BOOKS_ARRAY);
    ipcRenderer.send('ipc-info-book-file', {user: data.user, bookList: data.books});
    localStorage.set('book-list', data.books);
  },

  [TYPE.SET_CURRENT_BOOK_ID_L1]: (store, data) => {
    store.CURRENT_BOOK_ID = data
  },

  //vuex 添加书籍用口子, data里需要传一个view 属性, 用于判定是从哪里产生的调用
  //用于防止同步类情况被两边调用两次
  [TYPE.ADD_BOOK_L1]: (store, data) => {
    console.log("add book l1 called: ");
    console.log(data);
    if(data.view === "mainWindow"){
      store.ALL_BOOKS_ARRAY.push(data.book);
      localStorage.set('book-list', store.ALL_BOOKS_ARRAY);
      console.log(store.ALL_BOOKS_ARRAY);
    }else{
      //in this case editorWindow
      //编辑窗口新建书后不给自动打开，不需要推进去
      // store.EDITOR_OPENED_BOOKS.push(data.book);
      // console.log(store.EDITOR_OPENED_BOOKS);
      console.log("in this version, we dont need to push a new created window into editor opended books");
    }

  },

  [TYPE.ADD_VOLUME_TO_BOOK_L1]: (store, data) => {
    console.log("add volume l1 called: ");
    for(let bookIndex = 0; bookIndex < store.EDITOR_OPENED_BOOKS.length; bookIndex++){
      if(data.book_uuid === store.EDITOR_OPENED_BOOKS[bookIndex].client_uuid){
        store.EDITOR_OPENED_BOOKS[bookIndex].volumes.push(data.volume);
        console.log("after add volume data?: ");
        console.log(store.EDITOR_OPENED_BOOKS);
        break;
      }
    }    
  },

  [TYPE.ADD_CHAPTER_TO_VOLUME_L1]: (store, data) => {
    let hit = false;
    for(let bookIndex = 0; bookIndex < store.EDITOR_OPENED_BOOKS.length; bookIndex++){
      if(hit){
        break;
      }
      if(data.book_uuid === store.EDITOR_OPENED_BOOKS[bookIndex].client_uuid){
        for(let volumeIndex = 0; volumeIndex < store.EDITOR_OPENED_BOOKS[bookIndex].volumes.length; volumeIndex++){
          if(store.EDITOR_OPENED_BOOKS[bookIndex].volumes[volumeIndex].client_uuid === data.volume_uuid){
            store.EDITOR_OPENED_BOOKS[bookIndex].volumes[volumeIndex].chapters.push(data.chapter);
            hit = true;
            break;
          }
        }
      }
    }

  },

  [TYPE.CREATE_CHAPTER_RESULT_L1]: (store, data) => {
    console.log("create chapter result called in vuex: ");
    console.log(data);
  },

  [TYPE.ADD_OPEN_BOOK_TO_EDITOR_L1]: (store, data) => {
    console.log("call add open book to editor l1")
    let hit = false;
    store.EDITOR_OPENED_BOOKS.forEach((aBook) => {
      console.log(aBook.client_uuid === data.book.client_uuid)
      if(aBook.client_uuid === data.book.client_uuid){
        aBook.act_type = 1
        hit = true;
      }else{
        aBook.act_type = 2
      }
    })
    if(!hit){
      data.book.act_type = 1
      //potential risk: 还是由于 JavaScript 的限制，Vue 不能检测对象属性的添加或删除：
      //https://cn.vuejs.org/v2/guide/list.html#%E5%AF%B9%E8%B1%A1%E6%9B%B4%E6%94%B9%E6%A3%80%E6%B5%8B%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
      //注意注意，这里需要设定一个空数组，不然vue 监听不到变化
      data.book.volumes = [];
      console.log('打开书籍，追加到打开书籍列表内！！！！！！！')
      store.EDITOR_OPENED_BOOKS.unshift(data.book);
    }
    console.log("after add an open book to editor")
    console.log(store.EDITOR_OPENED_BOOKS);


  },

  [TYPE.SET_VOLUMES_TO_BOOK_IN_EDITOR_L1]: (store, data) => {
    console.log("in set volumes to book in editor")
    console.log(store.EDITOR_OPENED_BOOKS);
    console.log("data is: ");
    console.log(data);
    if(store.EDITOR_OPENED_BOOKS.length === 0){
      console.log("something is wrong, cant find the responding book in editor")
    }
    let index = store.EDITOR_OPENED_BOOKS.findIndex((value) => {
      console.log("wow"); 
      console.log(value);
      console.log(data);
      //这个要改一下open_book那面 怎么没有 book_uuid, 有个 bookId
      return value.client_uuid === data.book_uuid});
    console.log("index is:" + index);    
    if(index >= 0){
      let newVolumes = []
      data.volumes.forEach((aVol) => {
        //potential risk: 还是由于 JavaScript 的限制，Vue 不能检测对象属性的添加或删除：
        //https://cn.vuejs.org/v2/guide/list.html#%E5%AF%B9%E8%B1%A1%E6%9B%B4%E6%94%B9%E6%A3%80%E6%B5%8B%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9
        //注意注意，这里需要设定一个空数组，不然vue 监听不到变化
        aVol.chapters = [];
        if(aVol.is_deleted == 0) newVolumes.push(aVol)
      })
      store.EDITOR_OPENED_BOOKS[index].volumes = newVolumes;
      // store.EDITOR_OPENED_BOOKS[index].volumes = [...data.volumes];
      // store.EDITOR_OPENED_BOOKS[index].volumes.forEach((item)=>{
      //   item['chapters'] = '';
      // })
      console.log("set volumes to :");
      console.log(store.EDITOR_OPENED_BOOKS[index].volumes);
    }
  },
  [TYPE.SET_CHAPTERS_TO_VOLUME_IN_EDITOR_L1]: (store, data) => {
    let index = store.EDITOR_OPENED_BOOKS.findIndex((value) => {
      return value.client_uuid === data.book_uuid
    });
    if(index >= 0){
      let volumeIndex = store.EDITOR_OPENED_BOOKS[index].volumes.findIndex((value) => {
        return value.client_uuid === data.volume_uuid
      });
      
      if(data.partUpdate){
        // let vueChapters = (store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters
        for (let i = 0; i < data.chapters.length; i++) {
          let newChapter = data.chapters[i];
          
          if(newChapter.hasConflict == 'online'){
            for (let j = 0; j < (store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters.length; j++) {
              if((store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters[j].client_uuid == newChapter.client_uuid){
                (store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters[j] = {...(store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters[j], ...newChapter}
              }
            }
          }else{
            (store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex].chapters.push(newChapter)
          }
          
        }
      }else{
        (store.EDITOR_OPENED_BOOKS[index].volumes)[volumeIndex]['chapters'] = data.chapters;
      }
    }
  },
  [TYPE.SET_BOOK_CONTENT_L1]: (store, data) => {
    var bookList;
    if(data.view === 'mainWindow'){
      bookList = store.ALL_BOOKS_ARRAY
    }else{
       bookList = store.EDITOR_OPENED_BOOKS;
    }
    console.log(data)
    let volumes= data.volumes;
    let chapters = data.chapters
    let book_detail = data.book_detail
    // console.log("！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！")
    console.log(bookList)
    console.log(data)
    console.log(book_detail)
    for(let b = 0; b < bookList.length; b++){
      if(bookList[b].client_uuid === data.book_uuid){
        console.log('开始修改书本信息了',JSON.stringify(data))
        if(book_detail&&book_detail.hasOwnProperty('version')){
          console.log('修改书本基本信息11111111111111111111111111', book_detail)
          if(book_detail.is_deleted === 1){

          }else{
            Object.keys(book_detail).forEach((key, index) => {
              if(bookList[b].hasOwnProperty(key)){
                bookList[b][key] = book_detail[key]
              }
            })
          }
        }
        let volumeList = bookList[b].volumes;
        if(volumeList&&volumeList.length){
          for(let v = 0; v<volumeList.length; v++){
            if(volumes&&volumes.length){
              volumes.filter((item) => {
                if(item.volume_uuid === volumeList[v].client_uuid){
                  console.log('匹配到了当前卷');
                  if(item.is_deleted === 1){
                    volumeList.splice(v, 1)
                  }else{
                    Object.keys(item).forEach((key, index) => {
                      if(volumeList[v].hasOwnProperty(key)){
                        volumeList[v][key] = item[key]
                      }
                    })
                  }
                }else{
                  console.log('没有匹配到，返回当前卷')
                  return item
                }
              })

            }
            if(chapters&&chapters.volumes&&chapters.volumes.length){
              if(volumeList[v].client_uuid === chapters.volumes[0].volume_uuid){
                let chapterList = volumeList[v].chapters;
                chapters.volumes[0].chapters.filter((item, i) => {
                  for(let c = 0; c<chapterList.length; c++){
                    if(chapterList[c].client_uuid === item.chapter_uuid){
                      if(item.is_deleted === 1){
                        chapterList.splice(c, 1)
                      }else{
                        Object.keys(item).forEach((key, index) => {
                          if(chapterList[c].hasOwnProperty(key) ){
                            chapterList[c][key] = item[key]
                          }else{
                            console.log('当前章节没有该字段；'+key)
                            return item
                          }
                        })
                      }
                    }
                  }
                })
              }
              // chapters.volumes.filter((item, i) => {
              //   if(volumeList[v].client_uuid === item.volume_uuid){
              //     let chapterList = volumeList[v].chapters;
              //     for(let c = 0; c<chapterList.length; c++){
              //       if(chapterList[c].client_uuid === item.chapters[0].chapter_uuid){
              //         console.log('匹配到了当前章')
              //         Object.keys(item.chapters[0]).forEach((key, index) => {
              //           if(chapterList[c][key] ){
              //             chapterList[c][key] = item.chapters[0][key]
              //           }else{
              //             console.log('没有匹，配到返回当前章')
              //             return item
              //           }
              //         })
              //       }
              //     }
              //   }
              // })
            }
          }
        }
      }
    }
  },
  [TYPE.ADD_BOOK]: (store, data, context) => {
    console.log('mutations')
    console.log('store', store)
    console.log('data', data)
    console.log('context', context)
  },
  [TYPE.DELETE_BOOK]: (store, data) => {
    if(data.status === 200){
      let bookInfo = store.INFO_BOOK;
      for (let i = 0; i < bookInfo.length; i++) {
        if (bookInfo[i]['client_uuid'] == data.book_uuid) {
          bookInfo[i].is_deleted = 1;
          bookInfo[i].version = data.version;
        }
      }
    }
  },
  [TYPE.DELETE_BOOK_L1]:(store,data) => {
    console.log(data);
    if(data.status === 200){
      let allBooks = store.ALL_BOOKS_ARRAY
      for (let i = 0; i < allBooks.length; i++) {
        if (allBooks[i]['client_uuid'] == data.book_uuid) {
          allBooks[i].is_deleted = 1;
          allBooks[i].version = data.version;
        }
      }
    }
  },
  [TYPE.USER_CHANGE_BOOK]: (store, data) => {
    console.log(data)
    if(data.status === 200){
      let bookInfo = store.ALL_BOOKS_ARRAY;
      for (let i = 0; i < bookInfo.length; i++) {
        if (bookInfo[i]['client_uuid'] == data.book_uuid) {
          bookInfo[i].version = data.version;
          bookInfo[i].title = data.title;
          bookInfo[i].avatar = data.avatar;
          bookInfo[i].goal_word_count = data.goal_word_count;
          bookInfo[i].book_type = data.book_type;
          bookInfo[i].summary = data.summary;
        }
      }
    }
  },
  [TYPE.SYNC_USER_CHANGE_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.client_uuid) {
        let bookItem = bookInfo[i]
        Object.keys(data).forEach((key) => {
          // if(data[key]){
            bookItem[key] = data[key]
          // }
        })
      }
    }
    
    console.log(data)
  },
  [TYPE.VOLUME_ADD_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    // let book_category = api.book_category.split(',');
    // let obj = {children: []}
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        book_json['SubCategories'].push(data.obj)
        bookInfo[i].book_json = JSON.stringify(book_json)
        bookInfo[i]['SubCategories'].push(data.obj)
      }
        // store.INFO_BOOK[i]['children'].push({
        //   title: data[3],
        //   bookId: data[1],
        //   id: data[0],
        //   sort: data[8],
        //   goal_word_count: null,
        //   summary: null,
        //   act_type: 0,
        //   creation_status: 0,
        //   index: 1,
        //   parent_id: data[1],
        //   book_type: "2",
        //   children: []
        // })
    }
  },
  [TYPE.CHAPTER_ADD_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    // let book_category = api.book_category.split(',');
    // let obj = {}
    console.log(data)
    //add book failed, just skip
    if(data.error) return;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.arg.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        data.obj.version = data.chapterVer
        book_json['SubCategories'][data.arg.index].SubCategories.push(data.obj)
        bookInfo[i].book_json = JSON.stringify(book_json)
        bookInfo[i]['SubCategories'][data.arg.index].SubCategories.push(data.obj)
        // for (let k = 0; k < bookInfo[i]['SubCategories'].length; k++) {
        //   if (bookInfo[i]['SubCategories'][k]['client_uuid'] == data.parent_client_uuid) {
        //     book_category.forEach((item, index) => {
        //       obj[item] = data.tileData[index]
        //     })
        //     bookInfo[i]['SubCategories'][k]['SubCategories'].push(obj)
        //   }
        // }
      }
    }
  },
  [TYPE.CHAPTER_DEL_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] === data.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        book_json['SubCategories'][data.index].SubCategories.splice(data.CIndex, 1)
        bookInfo[i].book_json = JSON.stringify(book_json)
        bookInfo[i]['SubCategories'][data.index].SubCategories.splice(data.CIndex, 1)
        // bookNewCount
        bookInfo[i].word_count = data.bookNewCount
      }
    }
  },
  [TYPE.CHAPTER_DEL_UPLOAD_VERSION]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.bookId) {
        bookInfo[i].version = data.bookVer
      }
    }
  },
  [TYPE.VOLUME_DEL_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] == data.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        book_json['SubCategories'].splice(data.index, 1)
        bookInfo[i].book_json = JSON.stringify(book_json)
        bookInfo[i]['SubCategories'].splice(data.index, 1)
        bookInfo[i].word_count = data.bookNewCount
      }
    }
  },
  [TYPE.CHANGE_TITLE_BOOK]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i]['client_uuid'] === data.data.bookId) {
        book_json = JSON.parse(bookInfo[i].book_json);
        if(data.type === 'volume'){
          bookInfo[i]['SubCategories'][data.data.index].title = data.title;
        }else if(data.type === 'chapter'){
          bookInfo[i]['SubCategories'][data.data.index].SubCategories[data.data.CIndex].title = data.title;
        }else{
          console.log('修改有误')
          return false
        }
      break;
    }
  }
  },
  [TYPE.CHANGE_TITLE_BOOK_VERSION]: (store, data) => {
    let bookInfo = store.INFO_BOOK,book_json;
      for (let i = 0; i < bookInfo.length; i++) {
        if (bookInfo[i]['client_uuid'] == data.book_uuid) {
          bookInfo[i].book_json = JSON.stringify(data.bookJSON)
          if(data.type === 'volume'){
            bookInfo[i]['SubCategories'][data.index].version = data.version;
          }else if(data.type === 'chapter'){
            bookInfo[i]['SubCategories'][data.index].SubCategories[data.CIndex].version = data.version;
          }else{
            console.log('修改有误')
            return false
          }
        break;
      }
    }
  },
  /**
   * list:书本列表数组
   * type: add： 添加书本
   *     : info：初始化书本列表
   */
  [TYPE.INFO_BOOK]: (store, data) => {
    // for(let i = 0; i<data.length; i++){
    //   if(!data[i]['children'].length) continue;
    //   data[i]['children'].sort(compare)
    //   for(let k = 0; k<data.length; k++){
    //     if(!data[i]['children'][k]['children'].length) continue;
    //     data[i]['children'][k]['children'].sort(compare)
    //   }
    // }
    let bookList = data.list.map((item) => {
      if(!item['act_type']){
        item['act_type'] = 0
      }
      return item
    })
    console.log(data)
    let storeBook = store.INFO_BOOK;
    // console.log(bookList)
    if (data.type == 'info') {
      if(!storeBook.length){
        store.INFO_BOOK = bookList
      }else{
        // 防止在info更新书本时会对已经存储的book_json数据
        function MergeArray(arr1, arr2) {
          var _arr = new Array();
          for (var i = 0; i < arr1.length; i++) {
              if (arr1[i] != "") {
                  _arr.push(arr1[i]);
              }
          }
          for (var i = 0; i < arr2.length; i++) {
              var flag = true;
              for (var j = 0; j < arr1.length; j++) {
                  if (arr2[i].client_uuid == arr1[j].client_uuid) {
                      flag = false;
                      break;
                  }
              }
              if (flag && arr2[i].client_uuid != "") {
                  _arr.push(arr2[i]);
              }
          }
          return _arr;
        }
        store.INFO_BOOK =  MergeArray(storeBook, data.list)
        console.log(store.INFO_BOOK)
          // if(!item['act_type']){
          //   item['act_type'] = 0
          // }
          // return item
        // })
      }
    } else if (data.type == 'add') {
      // storeBook.push(bookList)
      store.INFO_BOOK = storeBook.concat(bookList)
      console.log(store.INFO_BOOK)
    }
  },
  /**
   * data:{
   *  children: 当前书籍卷/章结构列表
   *  data:{
   *  book_uuid:"book-a002"
   *  }
   * }
   */
  [TYPE.OPEN_BOOK]: (store, data) => {
    console.log("halo");
    console.log(data)
    let bookList = store.INFO_BOOK;
    for (let i = 0; i < bookList.length; i++) {
      if ((bookList[i]['act_type'] == 1) && (bookList[i]['client_uuid'] != data.data.book_uuid)) {
        console.log(bookList[i])
        bookList[i]['act_type'] = 2
      } else if ((bookList[i]['act_type'] != 1) && (bookList[i]['client_uuid'] == data.data.book_uuid)) {
        console.log(bookList[i])
        bookList[i]['children'] = []
        let book_json = data.SubCategories
        bookList[i]['SubCategories'] = book_json?JSON.parse(book_json)['SubCategories']:[]
        // if(!book_json){store.INFO_BOOK[i]['book_json'] = JSON.stringify({SubCategories:[]})}
        bookList[i]['book_json'] = book_json?book_json:"{}"
        bookList[i]['act_type'] = 1
      }
    }
  },
  [TYPE.SELECT_BOOK]:(store, data) => {
    let editorBookList = store.EDITOR_OPENED_BOOKS;
    for (let i = 0; i < editorBookList.length; i++) {
      if (editorBookList[i]['act_type'] == 1) {
        editorBookList[i]['act_type'] = 2
      } else if ((editorBookList[i]['act_type'] != 1) && (editorBookList[i]['client_uuid'] == data.id)) {
        editorBookList[i]['act_type'] = 1
      }
    }
  },
  [TYPE.CHAPTER_UP_BOOK]: (store, data, context) => {
    let bookInfo = store.INFO_BOOK;
    for (let i = 0; i < bookInfo.length; i++) {
      if (bookInfo[i].id == data.data.bookId) {
        let last = bookInfo[i]['children'][data.data.index]['children'][data.data.CIndex - 1]
        let the = bookInfo[i]['children'][data.data.index]['children'][data.data.CIndex]
        let sort = last.sort;
        last.sort = the.sort
        the.sort = sort;
        // bookInfo[i]['children'][data.data.index]['children'][data.data.CIndex] = last
        // bookInfo[i]['children'][data.data.index]['children'][data.data.CIndex-1] = the
        // data.commit(TYPE.INFO_BOOK, bookInfo)
        bookInfo[i]['children'][data.data.index]['children'].splice(data.data.CIndex - 1, 2, the, last)
        // vue.set(bookInfo[i]['children'][data.index]['children'], data.CIndex, last)
        // vue.set(bookInfo[i]['children'][data.index]['children'], (data.CIndex-1), the).Store.commit(TYPE.INFO_BOOK, bookInfo)
      }
    }
  },
  [TYPE.CLOSE_BOOK]:(store, data) => {
    let editorBookList = store.EDITOR_OPENED_BOOKS;
    for (let i = 0; i < editorBookList.length; i++) {
      if(data.close == editorBookList[i].client_uuid){
        // store.INFO_BOOK[i].act_type = 0;
        editorBookList.splice(i, 1)
        data.close = '';
      }else if(data.open == editorBookList[i].client_uuid){
        editorBookList.splice(i, 1)
        store.CURRENT_BOOK_ID = editorBookList[0].client_uuid
        editorBookList[0].act_type = 1;
        data.open = '';
      }else if((!data.open)&&(!data.close)){
        break;
      }
    }

    // for (let i = 0; i < bookList.length; i++) {
    //   if(bookList[i].client_uuid == data){
    //     let item = store.INFO_BOOK[i];
    //     if(item.act_type == 2){
    //       store.INFO_BOOK[i].type == 0
    //     }else if(item.act_type == 1){
    //       store.INFO_BOOK[i].type == 0
    //       for(let k =0;k<bookList.length;k++){
    //         if(bookList[k].type == 2){
    //           store.INFO_BOOK[k].type == 1
    //           break ;
    //         }
    //       }
    //       break ;
    //     }
    //   }
    // }
  },
  [TYPE.GET_BOOK_MESSAGE]: (store, data) => {
    console.log('mutations')
    store.GET_BOOK_MESSAGE = data;
  },
  [TYPE.CHAPTER_CONTENT_SYNC]: (store, data) => {
  //   let bookList = store.INFO_BOOK;
  //   for (let i = 0; i < bookList.length; i++) {
  //     if(data.book_uuid == bookList[i].client_uuid){
  //       let bookItem = bookList[i]
  //       for(let k = 0;i < bookItem.SubCategories.length; k++){
  //         if(data.volume_uuid == bookItem.SubCategories[k].client_uuid){
  //           let volumeItme = bookItem.SubCategories[k]
  //           for(let g = 0;i < volumeItme.SubCategories.length; k++){
  //             if(data.chapter_uuid == volumeItme.SubCategories[g].client_uuid){
  //               let chapter = volumeItme.SubCategories[g]
  //               break;
  //             }
  //           }
  //           break;
  //         }
  //       }
  //       break;
  //     }
  //   }
  },
  [TYPE.RESET_BOOK_MODULE]: (state, data) => {
    state[data.key] = data.value
  },
  [TYPE.BOOK_CHANGE_WORD_COUNT]:( state, data) => {
    let bookList = state.INFO_BOOK;
    for(let i = 0; i<bookList.length; i++){
      if((bookList[i].client_uuid === data.book_uuid)&&(bookList[i].SubCategories[data.i].SubCategories[data.k].client_uuid === data.chapter_uuid)){
        bookList[i].SubCategories[data.i].SubCategories[data.k].word_count = data.wordNum;
        bookList[i].word_count = data.bookNewCount;
        break;
      }
    }
  },
  [TYPE.BOOK_CHANGR_WORD_VERSION]: (state, data) => {
    let bookList = state.INFO_BOOK;
    for(let i = 0; i<bookList.length; i++){
      if((bookList[i].client_uuid === data.book_uuid)&&(bookList[i].SubCategories[data.i].SubCategories[data.k].client_uuid === data.chapter_uuid)){
        console.log(data)
        bookList[i].SubCategories[data.i].SubCategories[data.k].version = data.chapterVer;
        bookList[i].version = data.bookVer;
        bookList[i].book_json = data.bookJson
        break;
      }
    }
  },
  [TYPE.VOLUME_DEL_BOOK_VERSION]: (state, data) => {
    let bookList = state.INFO_BOOK;
    for(let i = 0; i<bookList.length; i++){
      if(bookList[i].client_uuid === data.book_uuid){
        bookList[i].version = data.version;
        break;
      }
    }
  }
}


export default {
  state,
  getters,
  mutations,
  actions
}