// import localQuery from './query.js'
//used to compare local and online data
//用于比较线上线下信息 书卷章
const orderBy = require('lodash.orderby')

function isChanged(aData){
	//is_upload --0 未上传 1已上传 2 上传失败
	//so when is_upload equals 0 or 2 is changed 
	if(Number.isInteger(aData.is_upload)){
		if(aData.is_upload === 1){
			return false
		}else{
			return true
		}
	}else{
		return false;
	}

}

function isBook(aData){
	// if(aData.book_uuid){
	if(aData.type === 1){
		return true;
	}else{
		return false;
	}
}

function isVolume(aData){
	if(aData.type === 2){
		return true;
	}else{
		return false;
	}
}

function isChapter(aData){
	if(aData.type === 3){
		return true;
	}else{
		return false;
	}
}

function getType(aData){
	switch(aData.type){
		case 1: 
			return "book";
		case 2:
			return "volume";
		case 3:
			return "chapter";
		default:
			return "unknown";
	}
}

function careSort(sort){
	if(Array.isArray(sort) && sort.length > 0){
		return true;
	}else{
		return false;
	}
}


function compare(local, online, sort){

	// console.log("local data: ");
	// console.log(local);
	// console.log("online: ");
	// console.log(online);

	console.log("lets rock!")

	online = `[{"book_uuid":"b9636ae2-ec9b-4409-8057-5bcea1dea779","type":1,"title":"daf","summary":"","goal_word_count":0,"word_count":0,"creation_status":0,"book_type":"","sort":0,"version":2,"is_deleted":0,"created_at":1545289021,"updated_at":1545289021},
	{"book_uuid":"33eddf31-d09f-4891-b091-eb94e2e3813b","type":1,"title":"ggggggggg","summary":"","goal_word_count":0,"word_count":100161,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757345,"updated_at":1544775443},
	{"book_uuid":"b4d670e0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"bg","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114},
	{"book_uuid":"onlinee0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"onlineOnlyBook","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114}]`

	online = JSON.parse(online);

	local = `[{"client_uuid":"b9636ae2-ec9b-4409-8057-5bcea1dea779","type":1,"title":"daf","summary":"","goal_word_count":0,"word_count":0,"creation_status":0,"book_type":"","sort":0,"version":1,"is_deleted":0,"created_at":1545289021,"updated_at":1545289021},
	{"client_uuid":"33eddf31-d09f-4891-b091-eb94e2e3813b","type":1,"title":"ggggggggg","summary":"","goal_word_count":0,"word_count":100161,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757345,"updated_at":1544775443, "is_upload": 0},
	{"client_uuid":"b4d670e0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"bg","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114, "is_upload": 1},
	{"client_uuid":"locale0-f09f-42a5-b190-f1b561fddcfe","type":1,"title":"localOnlyBook","summary":"","goal_word_count":0,"word_count":174,"creation_status":0,"book_type":"1","sort":0,"version":23,"is_deleted":0,"created_at":1544757258,"updated_at":1546396114}]`
	local = JSON.parse(local);

	let resArr = null;


	//是否考虑sort参数
	let ifSort = careSort(sort);


	if(ifSort){
		//考虑sort 情况下，新创建长度为sort数组长度的数组，值当前全为undefined
		resArr = new Array(sort.length);
	}else{
		resArr = [];
	}

	let tempConflictArr = [];
	let tempLeftOnlineArr = [];

	for(let onlineIndex = 0; onlineIndex < online.length; onlineIndex++){
		let hitIndex = -1;
		console.log("线上一本书书名为：\r\n");
		console.log(online[onlineIndex].title);
		console.log("\r\n");
		for(let localIndex = 0; localIndex < local.length; localIndex++){
			// console.log(online[onlineIndex].book_uuid);
			// console.log(local[localIndex].book_uuid);
			// console.log(online[onlineIndex].book_uuid);
			// console.log(local[localIndex].client_uuid);


			//get certain type _uuid like chapter/volume/book
			//线上接口数据都是 book_uuid, volumes_uuid, chapter_uuid
			if(online[onlineIndex][`${getType(online[onlineIndex])}_uuid`] === local[localIndex].client_uuid){
				//same book
				//同一本书

				hitIndex = localIndex;
				console.log("当前操作的数据的uuid is: " + online[onlineIndex][`${getType(online[onlineIndex])}_uuid`] + "\r\n");
				console.log("线上的版本是: " + online[onlineIndex].version + "\r\n");
				console.log("本地的版本是: " + local[localIndex].version + "\r\n");
				if(online[onlineIndex].version > local[localIndex].version + "\r\n"){
					//线上版本新,有冲突
					// console.log("online version is larger, go check conflict operation")
					console.log("线上版本更高, 进行比对冲突操作\r\n")

					if(!isChapter(online[onlineIndex])){
						//书和卷的情况下，只是使用最新的线上的名字
						local[localIndex].title = online[onlineIndex].title;
						// local[localIndex].title = online[onlineIndex].title;
						local[localIndex].word_count = online[onlineIndex].word_count;
						if(!ifSort){
							console.log("无排序数组, 生推\r\n");
							resArr.push(local[localIndex]);
						}else{
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								console.log("有点问题：找不到一个相同的本地章，将会在后续操作里处理这种情况\r\n")
								// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
							}
						}

					}else{
						//章需要特殊处理
						if(isChanged(local[localIndex])){
							//本地有修改，产生冲突了
							if(!ifSort){
								console.log("这章本地有修改，产生冲突了\r\n");
								console.log("无排序数组, 生推线下+线上\r\n");
								resArr.push(local[localIndex]);
								online[onlineIndex].client_uuid = online[onlineIndex].client_uuid + "conflict";
								online[onlineIndex].hasConflict = true;
								resArr.push(online[onlineIndex]);
							}else{
								//TODO: add conflict chaps to the right place
								let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
								if(index >= 0){
									console.log("这章本地有修改，产生冲突了\r\n");
									console.log("记录插入位置,循环结束后处理\r\n");
									resArr[index] = local[localIndex]
									online[onlineIndex].client_uuid = online[onlineIndex].client_uuid + "conflict";
									online[onlineIndex].hasConflict = true;
									online[onlineIndex].conflictHelperIndex = index;
									tempConflictArr.push(online[onlineIndex]);
								}else{
									console.log("有点问题：找不到一个相同的本地章，将会在后续操作里处理这种情况\r\n")
									// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")									
								}
							}


						}else{
							//本地未修改线上高，用线上
							console.log("本地未修改线上高，用线上\r\n");
							if(!ifSort){
								resArr.push(online[onlineIndex])
							}else{
								let index = sort.findIndex((value) => { return value === online[onlineIndex].client_uuid})
								if(index >= 0){
									console.log("无排序数组, 生推\r\n");
									resArr[index] = online[onlineIndex];
								}else{
									console.log("有点问题：找不到一个相同的本地章，将会在后续操作里处理这种情况\r\n")
									// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")									
								}
							}						
						}
					}




				}else if(online[onlineIndex].version < local[localIndex].version){
					//线下版本新,用线下版本，这个情况基本不可能发生。。除非掉库
					console.log("线下版本新,用线下版本，这个情况基本不可能发生。。除非掉库\r\n");
					// console.log("local version is larger, impossible case")
				}else{
					//版本号一致,查询是否本地有修改,通过调用isChanged
					// console.log("local and online version match");
					console.log("本地版本线下版本一致,将检查是否需要修改\r\n");
					// console.log("local data's is_upload: " +local[localIndex].is_upload);
					console.log("本地版本upload值: " +local[localIndex].is_upload + "\r\n");
					if(isChanged(local[localIndex])){
						//本地有修改
						console.log("本地有修改\r\n");
						if(!ifSort){
							console.log("无排序数组, 生推\r\n");
							resArr.push(local[localIndex]);
						}else{
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								console.log("有点问题：找不到一个相同的本地章，将会在后续操作里处理这种情况\r\n")
								// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
							}
						}
						//还需要触发同步
						// console.log("local data is changed");
					}else{
						//本地未修改 安全的情况
						console.log("本地未修改\r\n");
						if(!ifSort){
							console.log("无排序数组, 生推\r\n");
							resArr.push(local[localIndex]);
						}else{
							let index = sort.findIndex((value) => { return value === local[localIndex].client_uuid})
							if(index >= 0){
								resArr[index] = local[localIndex];
							}else{
								console.log("有点问题：找不到一个相同的本地章，将会在后续操作里处理这种情况\r\n")
								// console.log("something is wrong: we cannt find an index for this book_uuid, we will push thisin in later steps")
							}
						}
						// console.log("local data not changed");
					}
				}
				break;

			}
		}

		if(hitIndex >= 0){
			//这里会减少local的长度，移除了被发现了有相应的线上数据的本地数据
			local.splice(hitIndex, 1);
			// console.log("after splice local length is: " + local.length);
		}else{
			//本地数据中找不到的线上数据, 直接入DB库, 并且本地插入临时的剩下的线上数组
			// resArr.push(online[onlineIndex])
			tempLeftOnlineArr.push(online[onlineIndex]);
			//ToRao: 这里调用插入库
			// localQuery.insertBookToDB();

		}
	}

	// console.log("res Arr is: ");
	// console.log(resArr);

	console.log("后期操作前的结果： \r\n");
	resArr.forEach((aRes) => {
		console.log(aRes);
		console.log("\r\n");
	})
	// console.log(resArr);

	if(tempConflictArr.length > 0){
		//冲突临时数组有章节，需在对应节点进行插入
		let orderedArr = orderBy(tempConflictArr, 'conflictHelperIndex');
		for(let orderIndex = 0; orderIndex < orderedArr.length; orderIndex++){
			//+1用于在原数据后插入， +orderIndex 是因为经过插入，原有的位置发生了向后推移
			resArr.splice(orderedArr[orderIndex].conflictHelperIndex+ 1 + orderIndex, 0, orderedArr[orderIndex]);
		}

	}

	if(tempLeftOnlineArr.length > 0){
		//循环处理完成，如果临时的线上库里有数据，说明未找到相应本地匹配，直接插入DB库
		for(let leftOnlineIndex = 0; leftOnlineIndex < tempLeftOnlineArr.length; leftOnlineIndex++){
			resArr.push(tempLeftOnlineArr[leftOnlineIndex]);
		}
	}


	if(local.length > 0){
		//线上数据处理完成，如果本地仍残留数据，考虑直接插入
		for(let leftLocalIndex = 0; leftLocalIndex < local.length; leftLocalIndex++){
			resArr.push(local[leftLocalIndex]);
		}
	}

	console.log("后期操作后的结果: \r\n");
	resArr.forEach((aRes) => {
		console.log(aRes);
		console.log("\r\n");
	})



	return resArr;
}

module.exports.compare = compare;

compare();
