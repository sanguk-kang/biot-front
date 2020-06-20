
/**
*
*   <ul>
*       <li>My Profile</li>
*       <li>현재 로그인한 사용자의 정보를 수정 또는 삭제한다.</li>
*       <li>UI는 공용 상세 팝업으로 이루어진다.</li>
*   </ul>
*   @module app/profile
*   @requires config
*   @requires app/core/session
*   @requires app/widget/common-dialog
*
*/
//Main 모듈에서 팝업으로 호출되므로 CoreModule 삭제
define("profile/profile", [], function(){

	"use strict";

	var Session = window.Session;
	var moment = window.moment;
	var MainWindow = window.MAIN_WINDOW;
	var I18N = window.I18N;
	var LoadingPanel = window.CommonLoadingPanel;
	var Loading = new LoadingPanel();

	var MSG_MY_PROFILE_CANEL = I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL");
	var MSG_MY_PROFILE_LEAVE = I18N.prop("COMMON_MY_PROFILE_LEAVE");
	var MSG_SESSION_EXPIRED = I18N.prop("COMMON_SESSION_EXPIRED");
	var REQUIRED_INFORMATION = I18N.prop("COMMON_REQUIRED_INFORMATION");
	var MSG_MY_PROFILE_CHANGE_PW = I18N.prop("COMMON_MY_PROFILE_CHANGE_PW");
	// var INCORRECT_PASSWORD = I18N.prop("COMMON_INCORRECT_PASSWORD");
	// var NOT_MATCHED_PASSWORD = I18N.prop("COMMON_NOT_MATCHED_PASSWORD");
	// var INVALID_EMAIL_ADDRESS = I18N.prop("COMMON_INVALID_EMAIL_ADDRESS");
	// var INVALID_PHONE_NUMBER = I18N.prop("COMMON_INVALID_PHONE_NUMBER");

	var msgDialog, msgDialogElem = $("<div/>"), confirmDialog, confirmDialogElem = $("<div/>"),
		changePwDialogContent = $("#profile-change-password-confirm-content"),
		changePwDialogElem = $("<div/>"), changePwDialog;
	var isEditPwDialog = false, isValidValidators = {};
	var pwDialogOkBtn; /*pwDialogNoBtn*/

	var editableCells = $(".editable");
	var profileImgElem = $("#profile-image"), profileImgInput = $("#profile-image-file");
	var uploadBtn = $("#profile-upload-btn"),
		deleteBtn = $("#profile-delete-btn"),
		leaveBtn = $("#profile-leave-btn");
	// var cancelBtn = $("#profile-cancel-btn"),
	// var editBtn = $("#profile-edit-btn"),
	// var changePwBtn = $("#profile-changepw-btn"),
	// 	   saveBtn = $("#profile-save-btn");
	// var MainContentsElem = $("#main-contents");
	// var profileTab = $("#profile-tab");
	// var rowContents = $(".common-tab-table-content");

	var DEFAULT_PROFILE_IMG_URL = "../../src/main/resources/static-dev/images/user-default.png";
	var SIGNIN_MENU_KEY = "signin";
	var currentUserId;
	// var beforeImgUrl;
	// var mobilePhoneRegExp = /^\d{3}-\d{3,4}-\d{4}$/;
	// var ResponseReason;

	var profileDialog, profileDialogElem = $("#main-user-profile");

	var isChangePw = false, changePw;

	// var managerTypeObj = {
	// 	"Administrator" : I18N.prop("MEMBERSHIP_TYPE_ADMINISTRATOR"),
	// 	"Senior Manager" : I18N.prop("MEMBERSHIP_TYPE_SENIOR_MANAGER"),
	// 	"General Manager" : I18N.prop("MEMBERSHIP_TYPE_GENERAL_MANAGER"),
	// 	"Assistant Manager" : I18N.prop("MEMBERSHIP_TYPE_ASSISTANT_MANAGER")
	// };

	/**
	*
	*   <ul>
	*   <li>공용 Detail Dialog를 초기화한다.</li>
	*   <li>현재 User 정보를 가져온다.</li>
	*   <li>공용 Detail Dialog의 정보를 Set 한다.</li>
	*   </ul>
	*   @function init
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var init = function(){
		initComponent();
		getUserInfo().done(function(data){
			//setAllValue(data);
			var buildingList = MainWindow.getCurrentBuildingList();
			if(buildingList.length == 0) {
				getBuildingsRequest().done(function(buildings){
					//main js의 FNB 초기화시 빌딩 순서대 정렬 해주기 위함.
					buildings.sort(function(a, b) {
						return a.sortOrder - b.sortOrder;
					});
					initProfileDialog(data, buildings);
					attachEvent();
				});
			} else {
				initProfileDialog(data, buildingList);
				attachEvent();
			}
		}).fail(function(xhq){
			if(xhq && xhq.responseJSON){
				var msg, jsonMsg = xhq.responseJSON;
				if(jsonMsg.code && jsonMsg.message){
					msg = "[Error Code : " + xhq.responseJSON.code + "] " + xhq.responseJSON.message;
				}else{
					msg = xhq.responseText;
				}
				if(msg.indexOf("invalid_token") != -1){
					msgDialog.message(MSG_SESSION_EXPIRED);
					msgDialog.setActions(0, {
						action : function(){
							MainWindow.logout();
						}
					});
					msgDialog.setCloseAction(function(){
						MainWindow.logout();
					});
				}else{
					msgDialog.message(msg);
				}
				msgDialog.open();
			}
		});
	};

	/**
	*
	*   <ul>
	*   <li>My Profile Dialog를 Open 한다.</li>
	*   </ul>
	*   @function open
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var open = function(){
		profileDialog.open();
	};

	/**
	*
	*   <ul>
	*   <li>My Profile Dialog를 Close 한다.</li>
	*   </ul>
	*   @function close
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var close = function(){
		profileDialog.close();
	};

	/**
	*
	*   <ul>
	*   <li>My Profile 기능을 위하여 공용 Detail Dialog를 초기화한다.</li>
	*   <li>각 데아터 필드별 Scheme와 편집 가능 여부 등을 설정한다.</li>
	*   </ul>
	*   @function initProfileDialog
	*   @param {Object} data - /ums/users [GET] API를 호출하여 응답된 사용자 정보 객체
	*   @param {ObjectArray} buildingList - /foundation/space/buildings [GET] API를 호출하여 응답된 빌딩 리스트 정보 객체.
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var initProfileDialog = function(data, buildingList){
		profileDialog = profileDialogElem.kendoDetailDialog({
			title : I18N.prop("COMMON_MY_PROFILE"),
			buttonsIndex: {
				CLOSE: 4,
				EDIT: 1,
				SAVE: 0,
				CANCEL: 2
			},
			dataSource : data,
			hasDelete : false,
			height : 620,
			width : 652,
			scheme : {
				id: "id",
				fields : {
					role : {
						type : "select",
						name : I18N.prop("COMMON_MANAGER_TYPE"),
						template : function(dataItem){
							var roleName = "-";
							if(dataItem.role){
								roleName = dataItem.role;
							}
							return roleName;
						}
					},
					name : {
						type : "text",
						name : I18N.prop("COMMON_NAME"),
						editCss : {
							width : "100%"
						},
						hasInputRemoveBtn : true,
						editable : true,
						validator : {type : "name", required : true}
					},
					id : {
						type : "text",
						name : I18N.prop("COMMON_ID"),
						editable : true,
						editTemplate : "<span style='line-height:38px;'>#:id#</span><button class='k-button' style='float:right;' data-bind='events:{click:onclick}'>  " + I18N.prop("COMMON_MY_PROFILE_CHANGE_PW") + "</button>",
						editViewModel : {
							onclick : changePwBtnEvt
						}
					},
					mobilePhoneNumber : {
						type : "text",
						name : I18N.prop("COMMON_PHONE_NUM"),
						editCss : {
							width : "100%"
						},
						editable : true,
						hasInputRemoveBtn : true,
						validator : true
					},
					email : {
						type : "email",
						name : I18N.prop("COMMON_EMAIL"),
						editCss : {
							width : "100%"
						},
						hasInputRemoveBtn : true,
						template : "<a mailto:'#:email#'>#if(email){##:email##}else{#-#}#</a>",
						editable : true,
						validator : true
					},
					joinDate : {
						type : "datetime",
						name : I18N.prop("COMMON_MY_PROFILE_SIGNUP_DATE"),
						format : "LLL"
					},
					lastLogin : {
						type : "text",
						name : I18N.prop("COMMON_MY_PROFILE_LASTEST_SIGN_IN"),
						template : function(dataItem){
							var val = "-";
							if(dataItem.lastLogin){
								var m = moment(dataItem.lastLogin);
								val = m.format("LLL");
							}

							return val;
						}
					},
					managementBuildings : {
						type : "text",
						name : I18N.prop("COMMON_MY_PROFILE_MANAGEMENT_BUILDING"),
						template : function(dataItem) {
							var i, j;
							var managementBuildingIds = typeof dataItem.policy != "undefined" ? dataItem.policy.foundation_space_buildings_ids : [];
							var managementBuildingNames = [];
							var result = "-";
							//게정의 policy 에서 가져온 관리하는 빌딩의 id(foundation_space_buildings_ids)를 가지고 빌딩 리스트에서 빌딩 네임을 가져와 관리 건물 네임 배열을 만듬.
							for(i = 0; i < buildingList.length; i++) {
								for(j = 0; j <  managementBuildingIds.length; j++) {
									if(buildingList[i].id == managementBuildingIds[j]) {
										managementBuildingNames.push(buildingList[i].name);
										break;
									}
								}
							}
							if(managementBuildingNames.length > 0) {
								result = "";
								for(i = 0; i < managementBuildingNames.length; i++) {
									if(i != 0) result += "<br/>";
									result += managementBuildingNames[i];
								}
							}
							return result;
						}
					}
				}
			},
			headerTemplate : "<span class='cell' data-bind='text: id'></span>&nbsp;<span class='cell'>(<span data-bind='text: name'></span>)</span>"
		}).data("kendoDetailDialog");
	};

	/**
	*
	*   <ul>
	*   <li>Confirm 및 Message Dialog를 초기화 한다.</li>
	*   <li>비밀번호 변경 창을 위한 Dialog를 초기화한다.</li>
	*   <li>비밀번호 변경 창 입력 필드들에 대하여 공용 Validator를 초기화한다.</li>
	*   </ul>
	*   @function initComponent
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var initComponent = function(){
		// var userId = Session.getUserId();
		/*
		editableCells.find("input").each(function(){
			var self = $(this);
			var key = self.closest(".common-tab-table-content").data("key");
			if(!key){
				return true;
			}
			var options = validatorOptions[key] ? validatorOptions[key] : {};
			options.type = key;
			validators[key] = self.kendoCommonValidator(options).data("kendoCommonValidator");
		});*/

		changePwDialogContent.find("input").each(function(){
			var self = $(this);
			var key = self.data("key");
			if(!key){
				return true;
			}
			var options = validatorOptions[key] ? validatorOptions[key] : {};
			if(key == "passwordRetype"){
				options.type = key;
				options.mixedPasswordCheck = true;
			}else{
				options.type = "password";
				options.mixedPasswordCheck = true;
			}
			changePwValidators[key] = self.kendoCommonValidator(options).data("kendoCommonValidator");
			isValidValidators[key] = false;
		});

		/*profileImgInput.kendoUpload({
			async : {
				saveUrl :"/ums/"+userId+"/photo",
				autoUpload : false,
				removeUrl: "/ums/"+userId+"/photo",
				removeVerb: "DELETE",
				showFileList : false
			}
		});*/

		msgDialogElem.kendoCommonDialog();
		msgDialog = msgDialogElem.data("kendoCommonDialog");

		confirmDialogElem.kendoCommonDialog({
			type : "confirm"
		});
		confirmDialog = confirmDialogElem.data("kendoCommonDialog");

		changePwDialogElem.kendoCommonDialog({
			type : "confirm",
			title : MSG_MY_PROFILE_CHANGE_PW,
			content : changePwDialogContent,
			height : 380,
			confirmActions : {
				yes : changePasswordEvt,
				no : cancelPasswordEvt
			}
		});

		changePwDialog = changePwDialogElem.data("kendoCommonDialog");
		changePwDialogContent.show();

		changePwDialogContent.on("keyup", ".profile-reset-password-confirm-input", onChangePasswordInput);
		var noTxt = changePwDialog.options.typeActions.confirm[0].text;
		var yesTxt = changePwDialog.options.typeActions.confirm[1].text;
		changePwDialog.wrapper.find("button").each(function(){
			var self = $(this);
			var txt = self.text();

			if(txt == noTxt){
				// pwDialogNoBtn = self;
			}else if(txt == yesTxt){
				self.prop("disabled", true).addClass("disabled");
				pwDialogOkBtn = self;
			}
		});
	};

	/**
	*
	*   <ul>
	*   <li>현재 Login한 User ID 값을 통하여 API(/ums/users/<userId>, [GET])를 호출하여 User 정보를 가져온다.<li>
	*   </ul>
	*   @function getUserInfo
	*   @returns {jQuery.Deferred} - jQuery.Deferred 객체가 promise 상태로 리턴된다.
	*   @alias module:app/profile
	*
	*/
	var getUserInfo = function(){
		//get Session Info
		var dfd = new $.Deferred();
		var userId = Session.getUserId();
		if(!userId){
			msgDialog.setActions(0, {
				action : function(){
					MainWindow.logout();
				}
			});
			msgDialog.setCloseAction(function(){
				MainWindow.logout();
			});
			msgDialog.message(MSG_SESSION_EXPIRED);
			msgDialog.open();
			dfd.reject();
			return dfd;
		}
		currentUserId = userId;

		var userData = {};

		$.ajax({
			url : "/ums/users/" + userId + "?exposePolicy=true"/*,
			data : {
				exposeThumbnailPhoto : true
			}*/
		}).done(function(data){
			userData = data;
		}).fail(function(xhq){
			dfd.reject(xhq);
		}).always(function(){
			dfd.resolve(userData);
			/*썸네일 삭제*/
			/*$.ajax({
				url : "/ums/users/"+userId+"/photo",
				dataType : "base64"
			}).done(function(data){
				profileImgElem.attr("src", "data:image/png;base64,"+data);
				beforeImgUrl = data;
			}).fail(function(xhq){
				profileImgElem.attr("src", DEFAULT_PROFILE_IMG_URL);
				beforeImgUrl = DEFAULT_PROFILE_IMG_URL;
			}).always(function(){
				profileImgElem.show();
				dfd.resolve(userData);
			});*/
		});
		return dfd.promise();
	};

	/**
	*
	*   <ul>
	*   <li>현재 Login한 User ID 값을 통하여 API(/ums/users/<userId>, [DELETE])를 호출하여 User 정보를 삭제한다.<li>
	*   </ul>
	*   @function deleteUserInfo
	*   @returns {jQuery.Deferred} - jQuery.Deferred 객체가 promise 상태로 리턴된다.
	*   @alias module:app/profile
	*
	*/
	var deleteUserInfo = function(){
		var dfd = new $.Deferred();
		var userId = Session.getUserId();
		if(!userId){
			msgDialog.message(MSG_SESSION_EXPIRED);
			msgDialog.open();
			dfd.reject();
			return dfd;
		}

		return $.ajax({
			url : "/ums/users/" + userId,
			method : "DELETE"
		});
	};

	/**
	*
	*   <ul>
	*   <li>현재 Login한 User ID 값을 통하여 API(/ums/users/<userId>, [PUT, PATCH])를 호출하여 User 정보를 수정한다.<li>
	*   </ul>
	*   @function editUserInfo
	*   @param {Object} data - /ums/users [GET] API를 호출하여 응답된 사용자 정보 객체
	*   @returns {jQuery.Deferred} - jQuery.Deferred 객체가 promise 상태로 리턴된다.
	*   @alias module:app/profile
	*
	*/
	var editUserInfo = function(data){
		var dfd = new $.Deferred();
		var userId = Session.getUserId();
		if(!userId){
			msgDialog.message(MSG_SESSION_EXPIRED);
			msgDialog.open();
			dfd.reject();
			return dfd;
		}

		var key;
		var putObj = {};

		//빈 데이터가 존재할 경우 PUT(Overwriting)을 수행한다.
		for( key in data ){
			if(!data[key]){
				putObj[key] = data[key];
				delete data[key];
			}
		}

		if(!$.isEmptyObject(putObj)){
			data.id = userId;
			data.name = data.name || Session.getUserName();
			data.role = Session.getUserRole();
			// data.ums_groups_id = Session.getUserGroupId(); *role 변경사항 적용으로 user 정보 중 "ums_groups_id" 제거.
			return $.ajax({
				url : "/ums/users/" + userId,
				method : "PUT",
				data : data
			});
		}
		return $.ajax({
			url : "/ums/users/" + userId,
			method : "PATCH",
			data : data
		});

	};

	/**
	*
	*   <ul>
	*   <li>패스워드 변경 입력 필드에 값 입력 시 호출되는 Callback 함수. 각 필드의 유효성을 체크하고, 조건에 따른 버튼 활성화/비활성화를 수행한다.<li>
	*   </ul>
	*   @function onChangePasswordInput
	*   @param {Event} e - 비밀번호 변경 시 input 필드의 이벤트 객체
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var onChangePasswordInput = function(e){
		if(!isEditPwDialog){
			isEditPwDialog = true;
		}

		var self = $(this);
		var key = self.data("key");

		isValidValidators[key] = changePwValidators[key].validate();

		var isValid = true;
		for(key in isValidValidators){
			isValid = isValidValidators[key];
			if(!isValid){
				isValid = false;
				break;
			}
		}

		if(isValid){
			pwDialogOkBtn.prop("disabled", false).removeClass("disabled");
		}else if(!pwDialogOkBtn.hasClass("disabled")){
			pwDialogOkBtn.prop("disabled", true).addClass("disabled");
		}
	};

	/**
	*
	*   <ul>
	*   <li>패스워드 변경 취소 버튼 클릭 시, 호출되는 Callback 함수. 만약 수정된 내용이 있을 경우 Confirm Dialog를 팝업한다.<li>
	*   </ul>
	*   @function cancelPasswordEvt
	*   @param {Event} e - 비밀번호 변경 취소 시 callback함수 전달되는 이벤트 객체
	*   @returns {Boolean} - Event Delegate 수행 여부
	*   @alias module:app/profile
	*
	*/
	var cancelPasswordEvt = function(e){
		if(isEditPwDialog){
			confirmDialog.message(MSG_MY_PROFILE_CANEL);
			confirmDialog.setConfirmActions({
				yes : function(evt){
					changePwDialog.close();
				}
			});
			//confirmDialog.setOptions({modal : false});
			confirmDialog.open();
			return false;
		}
	};

	//Deprecated
	var setEditableMode = function(isEnabled){
		if(isEnabled){
			editableCells.addClass("edit-mode");
		}else{
			editableCells.removeClass("edit-mode");
		}
	};

	/**
	*
	*   <ul>
	*   <li>My Profile에서 패스워드 변경 버튼 클릭 시, 호출되는 Callback 함수.<li>
	*   <li>패스워드 변경 팝업 내 각 입력 필드 및 UI 상태를 초기화한다.</li>
	*   <li>패스워드 변경 팝업을 Open 한다<li>
	*   </ul>
	*   @function changePwBtnEvt
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var changePwBtnEvt = function(){
		//check old password?
		isEditPwDialog = false;
		var key;
		for( key in isValidValidators){
			isValidValidators[key] = false;
		}

		for(key in changePwValidators){
			changePwValidators[key].hideMessages();
			changePwValidators[key].element.val("");
			changePwValidators[key].element.removeClass("k-invalid");
		}

		pwDialogOkBtn.addClass("disabled");
		isChangePw = false;
		changePw = null;
		changePwDialog.open();
	};

	/**
	*
	*   <ul>
	*   <li>My Profile에서 Ajax 호출 시, Fail 응답에 되한 Callback 함수<li>
	*   <li>권한 및 Error 응답에 대한 메시지 팝업을 팝업한다.</li>
	*   </ul>
	*   @function failResp
	*   @param {jQueryXHRObject} xhq - jQuery.ajax 호출 시, Fail Callback으로 전달되는 jQueryXHRObject
	*   @returns {void} - Event Delegate 수행 여부
	*   @alias module:app/profile
	*
	*/
	var failResp = function(xhq){
		var msg = "";
		if(xhq && xhq.responseJSON){
			var jsonMsg = xhq.responseJSON;
			if(jsonMsg.code && jsonMsg.message){
				msg = "[Error Code : " + xhq.responseJSON.code + "] " + xhq.responseJSON.message;
			}else if(jsonMsg.error_description){
				var desc = jsonMsg.error_description;
				if(desc && desc.indexOf("Permission is required") != -1){
					msg = I18N.prop("COMMON_NOT_AUTHORIZED");
				}
			}else{
				msg = xhq.responseText;
			}
			msgDialog.message(msg);
			msgDialog.open();
		}
	};

	/**
	*
	*   <ul>
	*   <li>My Profile 공용 Detail Dialog 및 각 버튼들에 대한 이벤트를 바인딩한다.<li>
	*   </ul>
	*   @function attachEvent
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var attachEvent = function(){
		profileDialog.bind("onSaved", function(e){
			var result = e.result;
			Loading.open(profileDialogElem);
			console.info(result);
			editUserInfo(result, e).done(function(){
				/*uploadImage().always(function(){
					setAllValue(data, true);
					setEditableMode(false);
				});*/
				e.sender.success();
				profileDialog.setDataSource([e.sender.dataSource.data()[0]]);
			}).fail(function(xhq){
				failResp(xhq);
				e.sender.fail();
			}).always(function(){
				if(isChangePw && changePw){
					//result.password = changePw;
					editUserInfo({ password : changePw }, e).done(function(){

					}).fail(function(xhq){
						failResp(xhq);
					}).always(function(){
						Loading.close();
					});
				}else{
					Loading.close();
				}
			});
		});

		profileDialog.setCloseAction(function(){
			isChangePw = false;
			changePw = null;
			profileDialog._cancelEvent({ sender : profileDialog }, true);
		});

		profileDialog.bind("onCancel", function(e){
			isChangePw = false;
			changePw = null;
		});

		// editBtn.on("click", function(){
		// 	setEditableMode(true);
		// });

		// cancelBtn.on("click", function(){
		// 	confirmDialog.message(MSG_MY_PROFILE_CANEL);
		// 	confirmDialog.setConfirmActions({
		// 		yes : function(){
		// 			setEditableMode(false);
		// 		}
		// 	});
		// 	confirmDialog.open();
		// });

		/*changePwBtn.on("click", function(){
		});*/

		leaveBtn.on("click", function(){
			confirmDialog.message(MSG_MY_PROFILE_LEAVE);
			confirmDialog.setConfirmActions({
				yes : function(){
					Loading.open();
					deleteUserInfo().done(function(){
						close();
						// MainWindow.logout(); *DELETE 이후 바로 로그인 페이지로 이동.
						MainWindow.goToMenu(SIGNIN_MENU_KEY);
					}).fail(function(xhq){
						if(xhq && xhq.responseJSON){
							var msg, jsonMsg = xhq.responseJSON;
							if(jsonMsg.code && jsonMsg.message){
								msg = "[Error Code : " + xhq.responseJSON.code + "] " + xhq.responseJSON.message;
							}else{
								msg = xhq.responseText;
							}

							msgDialog.message(msg);
							msgDialog.open();
						}
						Loading.close();
					});
				}
			});
			confirmDialog.open();
		});

		uploadBtn.on("click", function(){
			profileImgInput.trigger("click");
			$(this).blur();
		});

		deleteBtn.on("click", function(){
			//profileImgInput.data("kendoUpload").clearFile();
			profileImgElem.attr("src", DEFAULT_PROFILE_IMG_URL);
			$(this).blur();
		});

		profileImgInput.on("change", function(){
			readImgFile(this);
		});
	};

	//deprecated
	// var uploadImage = function(){
	// 	var form = $("<form/>").get(0);
	// 	var data = new FormData(form);
	// 	//profileImgInput.
	// 	var source = profileImgElem.attr("src");
	// 	var BASE64_STRING = "base64,";
	// 	source = source.slice(source.indexOf(BASE64_STRING) + BASE64_STRING.length);
	// 	if(source == beforeImgUrl){
	// 		console.info("image is same.");
	// 		var dfd = new $.Deferred();
	// 		dfd.reject();
	// 		return dfd.promise();
	// 	}
	// 	//data.append("image", source);
	// 	data.append("image", profileImgInput[0].files[0]);
	//
	// 	return $.ajax({
	// 		method : "POST",
	// 		type : "POST",
	// 		url : "/ums/users/" + currentUserId + "/photo",
	// 		data : data,
	// 		isFileUpload : true
	// 	});
	// };

	/**
	*
	*   <ul>
	*   <li>비밀번호 변경을 수행하였을 때, 호출되는 Callback 함수<li>
	*   <li>login API를 호출하고, 다시 Auth Token을 설정하여, 사용자의 현재 비밀번호의 유효성을 체크한다.<li>
	*   </ul>
	*   @function changePasswordEvt
	*   @returns {void} - 리턴 값 없음
	*   @alias module:app/profile
	*
	*/
	var changePasswordEvt = function(){
		var oldPwField = changePwValidators.oldPassword;
		var newPwField = changePwValidators.password;
		var oldPw = oldPwField.element.val();
		var newPw = newPwField.element.val();
		// var retypePwField = changePwValidators.passwordRetype;
		// var retypePw = retypePwField.element.val();

		Loading.open(changePwDialogElem);
		//set data
		/*var data = {
			password : newPw
		};*/

		//check current password
		loginRequest(currentUserId, oldPw).done(function(auth){
			Session.setAuthToken(auth.access_token, auth.expire_in);
			isChangePw = true;
			changePw = newPw;
			changePwDialog.close();
			profileDialog.enableSaveBtn();
		}).fail(function(){
			//old password not incorrect
			isChangePw = false;
			changePw = null;
			changePwValidators.oldPassword.validate("incorrect", true);
		}).always(function(){
			Loading.close();
		});

		return false;
	};

	var loginRequest = function(id, password){
		var str = id + ":" + password;
		var encodedData = window.btoa(str);
		return $.ajax({
			method : "POST",
			url : "/api/login",
			headers : {
				Accept : "application/json",
				Authorization : "Basic " + encodedData
			}
		});
	};

	var getBuildingsRequest = function() {
		return $.ajax({
			method : "GET",
			url : "/foundation/space/buildings"
		});
	};

	//deprecated
	// var changeRequest = function(data){
	// 	return $.ajax({
	// 		url : "/ums/users/" + currentUserId,
	// 		method : "PATCH",
	// 		data : data
	// 	});
	// };

	//deprecated
	var readImgFile = function(elem){
		if(elem.files && elem.files[0]){
			var reader = new FileReader();

			reader.onload = function (e) {
				profileImgElem.attr('src', e.target.result);
			};

			reader.readAsDataURL(elem.files[0]);
		}
	};

	var validatorOptions = {
		oldPassword : {
			messages : {
				required : REQUIRED_INFORMATION
			}
		},
		password : { //new Password
			messages : {
				required : REQUIRED_INFORMATION
			}
		}
	};


	// var validators = {};
	var changePwValidators = {};

	return {
		init : init,
		open : open,
		close : close
	};

});

//For Debug
//# sourceURL=profile.js