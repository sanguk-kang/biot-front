define("asset/monitoring/config/popup-config", ["device/common/device-util", "device/common/device-template",
	"asset/monitoring/model/asset-model", "asset/monitoring/model/asset-type-model", "asset/monitoring/asset-api"],
function(DeviceUtil, Template, assetModel, assetTypeModel, assetApi){
	var I18N = window.I18N;
	var MainWindow = window.MAIN_WINDOW;
	var Util = window.Util;
	// var Settings = window.GlobalSettings;		//[12-04-2018]안쓰는 코드 주석 -jw.lim
	var LoadingPanel = window.CommonLoadingPanel;
	var kendo = window.kendo;
	var moment = window.moment;

	var Loading = new LoadingPanel();
	var detailPopup, detailPopupElem = $("#asset-detail-popup");
	var mapPopup, mapPopupElem = $("#asset-detail-map-popup");
	var assetTypePopup, assetPopupElem = $("#asset-type-popup");
	var assetTypeAddPopup, assetTypeAddPopupElem = $("#asset-type-add-popup");

	var userSearchPopup, userSearchPopupElem = $("#asset-user-search-popup");
	var deviceSearchPopup, deviceSearchPopupElem = $("#asset-device-search-popup");
	var assetTypes = [];

	//Beacon Mock 데이터 활용을 위한 임시 스트링.
	//var beaconMock = ".scanlist[0]";
	// var beaconMock = "";				//[12-04-2018]안쓰는 코드 주석 -jw.lim

	/*Map Popup in Detail Pop-up*/
	mapPopup = mapPopupElem.kendoCommonDialog({
		title : "Map",
		timeout : 0,
		width : 700,
		height : 680,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CANCEL")
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE")
			}
		]
	}).data("kendoCommonDialog");

	userSearchPopup = userSearchPopupElem.kendoCommonDialog({
		title : I18N.prop("SERVICE_ASSET_USER_INFO"),
		timeout : 0,
		width: 652,
		height: 830,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CANCEL")
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE")
			}
		]
	}).data("kendoCommonDialog");


	deviceSearchPopup = deviceSearchPopupElem.kendoCommonDialog({
		title : I18N.prop("SERVICE_ASSET_BEACON_INFO"),
		timeout : 0,
		width: 652,
		height: 830,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CANCEL")
			},
			{
				text : I18N.prop("COMMON_BTN_SAVE")
			}
		]
	}).data("kendoCommonDialog");

	/*Default Grid Options in Detail Popup*/
	var defaultGridOpt = {
		height: "100%",
		scrollable: true,
		sortable: false,
		filterable: false,
		pageable: false
	};
	/*
		New Detail Pop-up Base Configuration
	*/
	function commonCloseBtnEvt(e){
		e.sender.trigger("onClose");
		if(e.sender.isEditable){
			e.sender.setEditable(false);
		}
		//e.sender.close();
		e.sender.trigger("onClosed");
	}

	function commonEditBtnEvt(e){
		e.sender.trigger("onEdit");
		e.sender.setEditable(true);
		e.sender.setActions(e.sender.BTN.REGISTER, { visible : false });
		e.sender.setActions(e.sender.BTN.DEREGISTER, { visible : false });
		e.sender.trigger("onEdited");
		return false;
	}

	function commonCancelBtnEvt(e){
		e.sender.confirmDialog
			.message(I18N.prop("COMMON_CONFIRM_DIALOG_EDIT_CANEL"));

		var cancel = function(){
			e.sender.trigger("onCancel");
			e.sender.cancelDataSource();
			e.sender.setEditable(false);
			e.sender.setDialogType(e.sender.dialogType);
			e.sender.hideInvalidMessage();
			e.sender.hideRemoveBtn();
			e.sender.trigger("onCanceled");
		};

		if(e.sender.hasChanged){
			e.sender.confirmDialog.setConfirmActions({
				yes : function(){
					cancel();
				}
			});
			e.sender.confirmDialog.open();

		}else{
			cancel();
		}

		return false;
	}

	function commonSaveBtnEvt(e){
		e.sender.trigger("onSave");
		var type = e.sender.dialogType;
		//save trigger save with selected data
		var result, results;
		// var data;			//[12-04-2018]안쓰는 코드 주석 -jw.lim
		result = e.sender.save();
		// console.log("result");
		// console.log(result);
		if(!result){
			return false;
		}

		if(e.sender.isBlockEvt){
			delete e.sender.isBlockEvt;
			type = "block";
		}

		if(type == "register"){
			if(e.sender.dataSource.total() > 1){
				results = e.sender.saveAll({registrationStatus : "Registered"});
			}
			result.registrationStatus = "Registered";
			e.sender.trigger("onRegister", {
				sender : e.sender, result : result, results : results
			});
			e.sender.setActions(e.sender.BTN.REGISTER, { visible : true });
			if(typeof e.sender.BTN.BLOCK !== "undefined"){			//[12-04-2018]undefined check -jw.lim
				e.sender.setActions(e.sender.BTN.BLOCK, { visible : true });
			}
		}else if(type == "block"){

			if(e.sender.dataSource.total() > 1){
				results = e.sender.saveAll({registrationStatus : "Blocked"});
			}
			result.registrationStatus = "Blocked";
			e.sender.trigger("onBlock", {
				sender : e.sender, result : result, results : results
			});
			e.sender.setActions(e.sender.BTN.REGISTER, { visible : true });
			e.sender.setActions(e.sender.BTN.BLOCK, { visible : true});
		}else{
			if(e.sender.dataSource.total() > 1){
				results = e.sender.saveAll(null, true);
			}
			e.sender.trigger("onSaved", {
				sender : e.sender, result : result, results : results
			});
			if(type == "deregister"){
				e.sender.setActions(e.sender.BTN.DEREGISTER, { visible : true });
			}else if(type == "delete"){
				e.sender.setActions(e.sender.BTN.DELETE, { visible : true });
			}
		}
		e.sender.setEditable(false);

		if(type != "delete"){
			e.sender.setActions(e.sender.BTN.DELETE, { visible : false});
		}

		if(type == "register" || type == "block"){
			e.sender.setActions(e.sender.BTN.EDIT, { visible : false});
		}

		// console.log("results");
		// console.log(results);

		return false;
	}

	function commonRegisterBtnEvt(e){
		e.sender.setEditable(true);
		e.sender.setActions(e.sender.BTN.REGISTER, { visible : false });
		//Beacon에만 해당하는 버튼제어
		if(typeof e.sender.BTN.BLOCK !== "undefined"){			//[12-04-2018]undefined check -jw.lim
			e.sender.setActions(e.sender.BTN.BLOCK, { visible : false });
		}
		return false;
	}

	//[12-04-2018]안쓰는 코드 주석 -jw.lim
	// function commonBlockBtnEvt(e){
	//   e.sender.setEditable(true);
	//   e.sender.setActions(e.sender.BTN.REGISTER, { visible : false });
	//   e.sender.setActions(e.sender.BTN.BLOCK, { visible : false });
	//   e.sender.isBlockEvt = true;
	//   return false;
	// }

	function commonDeregisterBtnEvt(e){
		var data = e.sender.getSelectedData();
		var result = {};
		result.registrationStatus = "NotRegistered";
		//result.locations = [];

		var results;
		// var data;			//[12-04-2018]중복된 코드 주석 -jw.lim
		if(e.sender.dataSource.total() > 1){
			//saveAll은 변경된 데이터만 가져오므로 선택한 전체 데이터를 가져와야함.
			//results = e.sender.saveAll({registrationStatuses : "NotRegistered"});
			data = e.sender.dataSource.data();
			data = data.toJSON();

			var i, max = data.length;
			var obj;
			results = [];
			for( i = 0; i < max; i++ ){
				obj = {};
				obj.id = data[i].id;
				obj.registrationStatus = "NotRegistered";
				results.push(obj);
			}
		}
		e.sender.trigger("onDeregister",{
			sender : e.sender,
			result : result,
			results : results
		});
		return false;
	}

	function commonDeleteBtnEvt(e){
		var data = e.sender.getSelectedData();
		var result = {};
		//result.locations = [];
		//register 인 경우에는 device의 id를 가져와야한다.
		var isRegister = false;
		if(e.sender.dialogType == "register"){
			isRegister = true;
		}

		if(isRegister){
			if(data.devices && data.devices[0]){
				result.id = data.devices[0].dms_devices_id;
			}else{
				console.error("there is no device in asset.");
			}
		}else{
			result.id = data.id;
		}

		var results;
		// var data;					//[12-04-2018]중복된 코드 주석 -jw.lim
		if(e.sender.dataSource.total() > 1){
			//saveAll은 변경된 데이터만 가져오므로 선택한 전체 데이터를 가져와야함.
			//results = e.sender.saveAll({registrationStatuses : "NotRegistered"});
			data = e.sender.dataSource.data();
			data = data.toJSON();

			var i, max = data.length;
			var obj;
			results = [];
			for( i = 0; i < max; i++ ){
				obj = {};
				if(isRegister){
					if(data[i].devices && data[i].devices[0]){
						obj.id = data[i].devices[0].dms_devices_id;
					}else{
						console.error("there is no device in asset.");
					}
				}else{
					obj.id = data[i].id;
				}
				results.push(obj);
			}
		}
		e.sender.trigger("onDelete",{
			sender : e.sender,
			result : result,
			results : results
		});
		return false;
	}

	function commonOnTypeChangeEvt(e){
		var type = e.type;
		var BTN = e.sender.BTN;

		var dialog = e.sender;
		var ds = dialog.dataSource;
		var datas = ds.data();
		var max = datas.length;

		//Asset은 등록해제가 없음.
		if(type == "register"){
			detailPopup.setActions(BTN.SAVE, { visible : false });
			detailPopup.setActions(BTN.CANCEL, { visible : false });
			detailPopup.setActions(BTN.EDIT, { visible : false });
			detailPopup.setActions(BTN.DEREGISTER, { visible : false });

			detailPopup.setActions(BTN.DELETE, { visible : true });
			detailPopup.setActions(BTN.CLOSE, { visible : true });
			detailPopup.setActions(BTN.REGISTER, { visible : true });
		}else{
			detailPopup.setActions(BTN.SAVE, { visible : false });
			detailPopup.setActions(BTN.CANCEL, { visible : false });
			detailPopup.setActions(BTN.DEREGISTER, { visible : false });
			detailPopup.setActions(BTN.REGISTER, { visible : false });

			detailPopup.setActions(BTN.DELETE, { visible : true });
			detailPopup.setActions(BTN.CLOSE, { visible : true });
			if(max > 1){
				detailPopup.setActions(BTN.EDIT, { visible : true, disabled : true });
			}else {
				detailPopup.setActions(BTN.EDIT, { visible : true, disabled : false });
			}
		}
	}


	/*
		Asset Type Add Popup (자산 유형 추가 팝업)
	*/
	var assetTypeConfig = {
		title : I18N.prop("SERVICE_ASSET_TYPE_MANAGEMENT"),
		width: 788,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			DELETE : 1,
			ADD : 2
		},
		gridOptions : {
			hasSelectedModel : true,
			setSelectedAttribute : true,
			selectable : "row multiple",
			columns : [
				{
					headerTemplate : "",
					template : Template.assetTypeListTemplate
				}
			]
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type"></span></div>' +
								'<div data-bind="source:subAssetTypes" data-template="asset-sub-type-list" class="asset-sub-type-list"></div>' +
								'<div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : Template.assetTypeListTemplate,
		headerTemplate : "<span>" + I18N.prop("SERVICE_ASSET_TYPE") + "</span>",
		isCustomActions : true,
		initialCollapse : false,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		actions : [
			{text : I18N.prop("COMMON_BTN_CLOSE"),visible : true,action : commonCloseBtnEvt},
			{text : I18N.prop("COMMON_BTN_DELETE"),visible : true,action : function(e){
				var results = [];
				var ds = e.sender.dataSource;
				var subAssetType, subAssetTypes, assetType, data = ds.data();
				var i, j, size, assetObj, hasCheckedType = false, max = data.length;
				for( i = 0; i < max; i++ ){
					assetType = data[i];
					subAssetTypes = assetType.subAssetTypes;
					size = subAssetTypes.length;
					assetObj = null;
					assetObj = {};
					assetObj.id = assetType.id;
					assetObj.name = assetType.name;
					assetObj.subAssetTypes = [];
					for( j = 0; j < size; j++ ){
						subAssetType = subAssetTypes[j];
						//체크되지 않은 데이터만 Patch로 보내기 위함이다. (삭제 동작)
						if(!subAssetType.checked){
							assetObj.subAssetTypes.push(subAssetType.name);
						}else if(!hasCheckedType){
							hasCheckedType = true;
						}
					}
					if(assetObj){
						results.push(assetObj);
					}
				}
				if(!hasCheckedType){
					results = [];
				}
				// console.log("asset type popup delete");
				// console.log(results);
				e.sender.trigger("onDelete", { results : results });
				return false;
			}},
			{text : I18N.prop("COMMON_BTN_ADD"),visible : true,action : function(e){
				var ds = e.sender.dataSource;
				//Current Asset Type List.
				var data = ds.data();
				var template = '<div class="asset-type-add-wrapper"><div class="device-detail-header"><span class="device-detail-header-type">' + I18N.prop("SERVICE_ADD_ASSET_TYPE") + '</span></div>' + '<div class="asset-type-dropdown-wrapper"><span class="tbc">' + I18N.prop("SERVICE_ASSET_TYPE") + '</span><span class="tbc"><input data-role="dropdownlist" data-value-field="id" data-text-field="name" data-bind="source:assetTypeList, value:selectedAssetType"/></span></div><div class="asset-name-wrapper"><span class="tbc">' + I18N.prop("SERVICE_ASSET_NAME") + '</span><span class="tbc"><input class="k-input asset-type-name-validator" data-role="commonvalidator" data-required="true"/></span></div></div>';

				assetTypeAddPopup.content(template);
				var content = assetTypeAddPopup.element;
				var viewModel = kendo.observable({
					assetTypeList : data,
					selectedAssetType : data[0].id
				});
				kendo.unbind(content);
				kendo.bind(content, viewModel);
				assetTypeAddPopup.open();

				var validatorElem = content.find(".asset-type-name-validator");
				validatorElem.val("");

				//Add 버튼 이벤트
				assetTypeAddPopup.setActions(1, {
					action : function(){
						var validator = validatorElem.data("kendoCommonValidator");
						if(!validator.validate()){
							return false;
						}
						var assetId = viewModel.get("selectedAssetType");
						// console.log(assetId);
						var assetData = ds.get(assetId);
						// console.log(assetData);
						if(!assetData){
							console.error("no asset.");
						}
						//API 호출을 위한 JSON Data로 변경
						var asset = assetData.toJSON();
						delete asset.selected;
						delete asset.id;
						delete asset.name;
						//서버에 요청하기 위한 Sub Asset Type List
						var reqSubTypes = [],
							//팝업의 체크리스트를 업데이트 하기위한 Sub Asset Type List
							subAssetTypes = asset.subAssetTypes;
						var i, max = subAssetTypes.length;
						for( i = 0; i < max; i++ ){
							reqSubTypes[i] = subAssetTypes[i].name;
						}
						var subAssetName = validatorElem.val();
						// console.log(subAssetName);
						reqSubTypes.push(subAssetName);
						subAssetTypes.push( { name : subAssetName, checked : false });
						asset.subAssetTypes = reqSubTypes;
						Loading.open(assetTypeAddPopup.element);

						assetApi.patchAssetType(assetId, asset).done(function(){
							msgDialog.message(I18N.prop("SERVICE_ADD_ASSET_TYPE_RESULT"));
							msgDialog.open(e.sender.element);
						}).fail(function(xhq){
							var msg = Util.parseFailResponse(xhq);
							msgDialog.message(msg);
							msgDialog.open(e.sender.element);
						}).always(function(){
							//Asset Type Dialog의 데이터 소스와 뷰를 업데이트한다.
							assetData.set("subAssetTypes", subAssetTypes);
							var selData = e.sender.getSelectedData();
							if(selData === assetData){
								e.sender.contentViewModel.set("subAssetTypes", subAssetTypes);
							}
							Loading.close();
						});
					}
				});

				return false;
			}}
		],
		isOnlyMulti : true
	};

	var baseConfig = {
		title : I18N.prop("COMMON_BTN_DETAIL"),
		width: 652,
		height: 830,
		buttonsIndex : {
			CLOSE : 0,
			EDIT : 1,
			CANCEL : 2,
			SAVE : 3,
			REGISTER : 4,
			DEREGISTER : 5,
			DELETE : 6
		},
		contentViewModel : {
			detailType : I18N.prop("COMMON_GENERAL")
		},
		contentTemplate : '<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',
		detailContentTemplate : '<div class="device-detail-header"><span class="device-detail-header-type" data-bind="text: detailType">General</span></div><div class="detail-dialog-detail-content-field-list"></div>',
		listTemplate : function(data){
			var dialogType = detailPopup.dialogType;
			var isRegister = dialogType == "register" ? true : false;
			return Template.multiDetailListDualTemplate(data, isRegister, true);
		},
		headerTemplate : "<span>" + I18N.prop("FACILITY_DEVICE_SELECTED_DEVICE") + ": <span>#:count #</span></span>",
		isCustomActions : true,
		//Open 시, Type에 변경 따라 버튼 제어하는 콜백
		onTypeChange : commonOnTypeChangeEvt,
		actions : [
			{text : I18N.prop("COMMON_BTN_CLOSE"),visible : true,action : commonCloseBtnEvt},
			{text : I18N.prop("COMMON_BTN_EDIT"),visible : true,action : commonEditBtnEvt},
			{text : I18N.prop("COMMON_BTN_CANCEL"),visible : false,action : commonCancelBtnEvt},
			{text : I18N.prop("COMMON_BTN_SAVE"),visible : false,disabled : true,action : commonSaveBtnEvt},
			{text : I18N.prop("COMMON_BTN_REGISTER"),visible : false,action : commonRegisterBtnEvt},
			{text : I18N.prop("COMMON_BTN_DEREGISTER"),visible : false,action : commonDeregisterBtnEvt},
			{text : I18N.prop("COMMON_BTN_DELETE"),visible : true,action : commonDeleteBtnEvt}
		],
		scheme : {
			id: "id",
			groupName : {
				users : {
					template: "<div class='group search'><span class='search-title'>" + I18N.prop("SERVICE_ASSET_USER_INFO") + "</span><span class='search-btn editable'><button class='k-button' data-bind='events:{click:clickUserSearchBtn}'>" + I18N.prop("SERVICE_ASSET_SEARCH_USER") + "</button></span></div>"
				},
				beacons : {
					template: "<div class='group search'><span class='search-title'>" + I18N.prop("SERVICE_ASSET_BEACON_INFO") + "</span><span class='search-btn editable'><button class='k-button' data-bind='events:{click:clickBeaconSearchBtn}'>" + I18N.prop("SERVICE_ASSET_SEARCH_BEACON") + "</button></span></div>"
				}
			},
			fields : {
				number : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_NUMBER"),
					validator : { required : true },
					editCss : { width : "100%"}, hasInputRemoveBtn : true, editable : true, isEditAll: true
				},
				assets_types : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_TYPE"),
					template : function(data){
						var value = "-";
						if(data.assets_types_name){
							value = data.assets_types_name;
						}
						return value;
					},
					editable : true,
					// editTemplate : function(dataItem, editViewModel){			//[12-04-2018]안쓰는 코드 주석 - dataItem, editViewModel -jw.lim
					editTemplate: function() {
						return "<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.assets_types_id, source: assetList, events:{change:changeAssetType, dataBound:boundAsset}' style='width:218px;'/>";
					},
					editFieldName : "assets_types_id",
					editViewModel : {
						fields : {
							assets_types_id : null
						},
						init : function(){
							if(!this.fields.assets_types_id){
								this.fields.assets_types_id = 1;
							}
							this.assetList = assetTypes;
						},
						assetList : assetTypes,
						boundAsset : function(e){
							this.changeAssetType(e, true);
						},
						changeAssetType : function(e, isBoundEvt){
							var self = this;
							var assetTypeId;
							if(isBoundEvt){
								assetTypeId = self.fields.get("assets_types_id");
								e.sender.value(assetTypeId);
								if(!assetTypeId){
									return;
								}
							}else{
								assetTypeId = e.sender.value();
								self.fields.set("assets_types_id", assetTypeId);
							}

							Loading.open(detailPopup.element);
							$.ajax({
								url : "/assets/types/" + assetTypeId
							}).done(function(data){
								var subAssets = data.subAssetTypes;
								detailPopup.editFields.subAssetType.viewModel.set("subAssets", subAssets);
							}).fail(function(xhq){
								var msg = Util.parseFailResponse(xhq);
								detailPopup.msgDialog.message(msg);
								detailPopup.msgDialog.open();
								var i, max = assetTypes.length;
								for( i = 0; i < max; i++ ){
									if(assetTypes[i].id == assetTypeId){
										var subAssets = assetTypes[i].subAssetTypes;
										detailPopup.editFields.subAssetType.viewModel.set("subAssets", subAssets);
										break;
									}
								}

							}).always(function(){
								Loading.close();
								//var isRegister = detailPopup.dialogType == "register" ? true : false;
								//self.checkBtnDisabled(isRegister);
								detailPopup.enableSaveBtn();
							});
						}
					},
					isEditAll : true
				},
				subAssetType : {
					type : "text",
					name : I18N.prop("SERVICE_SUB_ASSET_TYPE"),
					template : function(data){
						var value = "-";
						if(data.subAssetType){
							value = data.subAssetType;
						}
						return value;
					},
					editable : true,
					// editTemplate : function(dataItem, editViewModel){			//[12-04-2018]안쓰는 코드 주석 - dataItem, editViewModel -jw.lim
					editTemplate: function() {
						return "<input data-role='dropdownlist' data-bind='value:fields.subAssetType, source: subAssets, events:{change:changeSubAsset, dataBound:boundSubAsset}' style='width:218px;'/>";
					},
					editFieldName : "subAssetType",
					editViewModel : {
						fields : {
							subAssetType : null
						},
						init : function(){
							if(!this.fields.subAssetType)this.fields.subAssetType = null;
						},
						subAssets : [],
						boundSubAsset : function(e){
							this.changeSubAsset(e, true);
						},
						changeSubAsset : function(e, isBoundEvt){
							var self = this;
							var subAssetType;
							if(isBoundEvt){
								subAssetType = self.fields.get("subAssetType");
								e.sender.value(subAssetType);
								if(!subAssetType){
									return;
								}
							}else{
								subAssetType = e.sender.value();
								self.fields.set("subAssetType", subAssetType);
							}

							detailPopup.enableSaveBtn();
						}
					},
					isEditAll : true
				},
				modelName : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_MODEL_NAME"),
					validator : { required : true },
					editCss : { width : "100%"}, hasInputRemoveBtn : true, editable : true, isEditAll: true
				},
				serialNumber : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_SERIAL_NUMBER"),
					editCss : { width : "100%"}, hasInputRemoveBtn : true, editable : true, isEditAll: true
				},
				purchaseDate : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_PURCHASE_DATE"),
					editable : true,
					editFieldName : "purchaseDate",
					editTemplate : '<input data-role="commondatepicker" data-bind="value: fields.purchaseDates,events:{change:change}" data-format="yyyy-MM-dd" title="datepicker"/>',
					editViewModel : {
						fields : {
							//viewModel 바인딩 에러발생으로 분리
							purchaseDates : new Date(),
							purchaseDate : new Date()
						},
						init : function(){
							if(!this.fields.purchaseDate){
								this.fields.purchaseDates = this.fields.purchaseDate = new Date();
							}else{
								this.fields.purchaseDates = this.fields.purchaseDate;
							}
						},
						change : function(e){
							// console.log(e);
							var val = e.sender.value();
							this.fields.set("purchaseDate", val);
							this.fields.set("purchaseDates", val);
							detailPopup.enableSaveBtn();
						}
					},
					template : function(data){
						var date = data.purchaseDate;
						if(!date){
							return "-";
						}
						date = moment(date).format("L").replace(/\./g, "-");
						return date;
					},
					isEditAll : true
				},
				originalCost : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_PURCHASE_COST"),
					template : function(data){
						var value = "-";
						if(data.originalCost){
							value = kendo.toString(data.originalCost, "n0");
						}
						return value;
					},
					editable : true,
					editFieldName : "originalCost",
					// editTemplate : function(dataItem, editViewModel){			//[12-04-2018]안쓰는 코드 주석 - dataItem, editViewModel -jw.lim
					editTemplate: function() {
						return '<div><input style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-spinners="false" data-bind="value : fields.originalCost, events:{change:change}" /></div>';
					},
					editViewModel : {
						fields : {
							originalCost : 0
						},
						init : function(){
							if(this.fields.originalCost === null){
								this.fields.originalCost = 0;
							}
						},
						change : function(e){
							detailPopup.enableSaveBtn();
						}
					},
					isEditAll : true
					/*getEditableData : function(data){
						var val = DeviceUtil.getBleObject(data, "advertisingInterval");
						if(val == "-"){
							val = 100;
						}
						return val;
					},*/
				},
				managementOrganization : {
					type : "text",
					name : I18N.prop("SERVICE_ASSET_MANAGEMENT_ORGANIZATION"),
					editCss : { width : "100%"}, hasInputRemoveBtn : true, editable : true, isEditAll: true
				},
				//Position Type
				mobilityType : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_BEACON_POSITION_TYPE"),
					template : function(data){
						var val = "-";
						if(data.mobilityType){
							val = data.mobilityType;
							val = val ? val : "-";
						}
						return val;
					},
					editable : true,
					editFieldName : "mobilityType",
					// editTemplate : function(dataItem, editViewModel){			//[12-04-2018]안쓰는 코드 주석 - dataItem, editViewModel -jw.lim
					editTemplate: function() {
						return '<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="positionType" id="position-fixed" checked="" value="Fixed" data-bind="checked:fields.mobilityType, click:clickRadio"><label class="k-radio-label" for="position-fixed" style="margin-right:51px;">Fixed</label><input type="radio" class="k-radio" name="positionType" id="position-movable" checked="" value="Movable" data-bind="checked:fields.mobilityType, click:clickRadio"><label class="k-radio-label" for="position-movable">Movable</label></div>';
					},
					editViewModel : {
						fields : {
							mobilityType : null
						},
						init : function(){
							if(!this.fields.mobilityType){
								this.fields.mobilityType = "Fixed";
							}
							this.positionTypeChecked = this.fields.mobilityType;
						},
						clickRadio : function(e){
							detailPopup.enableSaveBtn();
						}
					}
				},
				location : {
					type : "text",
					name : I18N.prop("COMMON_LOCATION"),
					editable : true,
					template : DeviceUtil.getLocation,
					// editTemplate : function(dataItem, editViewModel){			//[12-04-2018]안쓰는 코드 주석 - dataItem, editViewModel -jw.lim
					editTemplate: function() {
						return "<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_buildings_id, source: buildingList, events:{change:changeBuildingList,  dataBound:dataBoundBuildingList}' style='width:95px;margin-right:10px;'/>" +
						"<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_floors_id, source: floorList, events:{change:changeFloorList, dataBound:dataBoundFloorList}' style='width:95px;margin-right:10px;'/>" +
						"<input data-role='dropdownlist' data-text-field='name' data-value-field='id' data-bind='value:fields.foundation_space_zones_id, source: zoneList, events:{change:changeZoneList, dataBound:dataBoundZoneList}' style='width:95px;margin-right:10px;'/>" +
						"<button type='button' class='ic-bt-map popup-btn k-button k-button-icon' data-bind='events:{click:onMapBtnClick}, disabled:isMapBtnDisabled'></button>";
					},
					editViewModel : {
						initialFieldsOnClose : function(e){
							this.fields.foundation_space_buildings_id = null;
							this.fields.foundation_space_floors_id = null;
							this.fields.foundation_space_zones_id = null;
						},
						initialFieldsOnCloseBinded : null,
						init : function(){
							// var self = this;				//[12-04-2018]안쓰는 코드 주석 -jw.lim
							this.isMapBtnDisabled = true;
							var floorData = MainWindow.getCurrentFloor();
							var building = floorData.building;
							var floor = floorData.floor;
							var type = detailPopup.dialogType;
							this.isSetFloorList = false;
							this.isSetZoneList = false;

							//최초 현재 ViewModel이 this로 바인딩 된 함수를 생성
							if(!this.initialFieldsOnCloseBinded){
								this.initialFieldsOnCloseBinded = this.initialFieldsOnClose.bind(this);
							}

							//언바인딩 후 바인딩하여 팝업창이 닫힐 때, 각 건물/층/존 정보의 id 값을 초기화하도록 한다.
							detailPopup.unbind("onClose", this.initialFieldsOnCloseBinded);
							detailPopup.bind("onClose", this.initialFieldsOnCloseBinded);

							//[17-04-2018]비교연산으로 수정
							if(type === "register"){
								detailPopup.options.enableSaveBtnCondition = function(){
									var locationFields = this.editFields.location;
									if(locationFields && locationFields.viewModel){
										var floorId = locationFields.viewModel.fields.get("foundation_space_floors_id");
										if(typeof floorId !== "undefined" && floorId !== null){			//[12-04-2018]undefined check -jw.lim
											return true;
										}
									}
									return false;
								};
							}else{
								detailPopup.options.enableSaveBtnCondition = null;
							}

							if( (type == "register" || !this.fields.foundation_space_buildings_id)
							 && building.id != MainWindow.FLOOR_NAV_BUILDING_TOTAL_ID){
								this.fields.foundation_space_buildings_id = building.id;
							}

							if( (type == "register" || !this.fields.foundation_space_floors_id) && floor.id != MainWindow.FLOOR_NAV_FLOOR_ALL_ID){
								this.fields.foundation_space_floors_id = floor.id;
								this.fields.foundation_space_zones_id = null;
								if(floor.id !== null && typeof floor.id !== "undefined"){		//[12-04-2018]undefined check -jw.lim
									detailPopup.enableSaveBtn();
								}
							}
						},
						fields : {
							id : "Fixed",
							foundation_space_buildings_id : null,
							foundation_space_floors_id : null,
							foundation_space_zones_id : null,
							description : null,
							geometry : null
						},
						checkBtnDisabled : function(isRegister){
							var buildingId = this.fields.get("foundation_space_buildings_id");
							var floorId = this.fields.get("foundation_space_floors_id");
							if(isRegister){
								if(buildingId === null || floorId === null){
									detailPopup.disableSaveBtn();
								}else{
									detailPopup.enableSaveBtn();
								}
							}

							if(floorId === null){
								this.set("isMapBtnDisabled", true);
							}else{
								this.set("isMapBtnDisabled", false);
							}
						},
						//AJAX로 데이터를 가져와 Set한 Case와 ViewModel 바인딩된 Case 시에 호출되는 DataBound 이벤트를 구분하기위한 Boolean 변수
						isSetFloorList : false,
						isSetZoneList : false,
						isMapBtnDisabled : true,
						buildingList : MainWindow.getCurrentBuildingList(),
						floorList : [],
						zoneList : [],
						centerZoneId : 0,
						centerCoordinate : [],
						setSelectedLocation : function(buildingId, floorId, zoneId, description){
							var index = detailPopup.selectedIndex;
							var ds = detailPopup.dataSource;
							var data, datas = ds.data();
							var i, max = datas.length;
							if(index == 0){
								for( i = 0; i < max; i++ ){
									data = datas[i];
									if(!data){
										continue;
									}
									if(!data.location) data.location = {};

									if(!data.location.id) data.location.id = "Fixed";

									data.location.foundation_space_buildings_id = buildingId;
									data.location.foundation_space_floors_id = floorId;
									data.location.foundation_space_zones_id = zoneId;
									data.location.description = description;
								}
							}
						},
						setLocationDescription : function(buildingName, floorName, zoneName){
							var split, description = this.fields.get("description");
							if(description){
								split = description.split(", ");
								if(buildingName){
									split[0] = buildingName;
								}
								if(floorName){
									split[1] = floorName;
								}else{
									split[1] = "";
								}

								if(zoneName){
									split[2] = zoneName;
								}else{
									split[2] = "";
								}
								var i, max = split.length;
								for( i = max - 1; i >= 0; i-- ){
									if(!split[i]){
										split.splice(i, 1);
									}
								}
								description = split.join(", ");
							}else if(buildingName && floorName && zoneName){
								description = buildingName + ", " + floorName + ", " + zoneName;
							}else if(buildingName && floorName){
								description = buildingName + ", " + floorName;
							}else if(buildingName){
								description = buildingName;
							}

							this.fields.set("description", description);
							return description;
						},
						dataBoundBuildingList : function(e){
							this.changeBuildingList(e, true);
						},
						changeBuildingList : function(e, isBoundEvt){
							var self = this;
							var buildingId;
							if(isBoundEvt){
								buildingId = self.fields.get("foundation_space_buildings_id");
								e.sender.value(buildingId);
								if(!buildingId){
									return;
								}
							}else{
								buildingId = e.sender.value();
								self.fields.set("foundation_space_buildings_id", buildingId);
							}

							var buildingText = e.sender.text();
							this.set("buildingText", buildingText);
							var desc = self.setLocationDescription(buildingText);
							this.setSelectedLocation(buildingId, null, null, desc);

							Loading.open(detailPopup.element);
							$.ajax({
								url : "/foundation/space/floors?foundation_space_buildings_id=" + buildingId
							}).done(function(data){
								var i, max = data.length;
								var type, name;
								data.sort(function(a, b){
									return a.sortOrder - b.sortOrder;
								});
								for( i = 0; i < max; i++ ){
									type = data[i].type;
									name = data[i].name;
									if(type == "F"){
										data[i].name = name + type;
									}else if(type == "B"){
										data[i].name = type + name;
									}else{
										data[i].name = name;
									}
								}
								self.set("isSetFloorList", true);
								self.set("floorList", data);
								if(data.length < 1){
									self.fields.set("foundation_space_floors_id", null);
									self.set("zoneList", []);
								}
							}).fail(function(xhq){
								var msg = Util.parseFailResponse(xhq);
								detailPopup.msgDialog.message(msg);
								detailPopup.msgDialog.open();
							}).always(function(){
								Loading.close();
								var isRegister = detailPopup.dialogType == "register" ? true : false;
								self.checkBtnDisabled(isRegister);
							});
						},
						dataBoundFloorList : function(e){
							// console.log(e);
							this.changeFloorList(e, true);
						},
						changeFloorList : function(e, isBoundEvt){
							var self = this;
							var buildingId = self.fields.get("foundation_space_buildings_id");
							var floorId;
							if(isBoundEvt){
								floorId = self.fields.get("foundation_space_floors_id");
								e.sender.value(floorId);

								var val = e.sender.value();

								var curFloorList = this.get("floorList");
								var isSetFloorList = this.get("isSetFloorList");
								//현재 Device가 갖고 있는 Floor 정보가 콤보박스에 선택된 층에 없는 Floor 일 Case를 처리한다.
								if(floorId && curFloorList && isSetFloorList){
									var findFloor = new kendo.data.Query(curFloorList).filter({
										field : "id", operator : "eq", value : floorId
									}).toArray();
									if(findFloor.length < 1){
										floorId = null;
									}
								}

								// Floor 콤보박스에 Floor List가 바인딩 되기 전에도 호출되므로, 예외처리 추가
								if(!floorId && !val){
									self.fields.set("foundation_space_floors_id", null);
								}
								if(!floorId){
									return;
								}
							}else{
								floorId = e.sender.value();
								self.fields.set("foundation_space_floors_id", floorId);
								detailPopup.hasChanged = true;
							}
							var floorText = e.sender.text();
							this.set("floorText", floorText);
							var desc = self.setLocationDescription(this.get("buildingText"), floorText);
							this.setSelectedLocation(buildingId, floorId, null, desc);

							Loading.open(detailPopup.element);
							//선택한 층의 중앙 좌표를 얻어오기 위하여 Image를 얻어온다.
							//만약 층만 선택했을 경우 해당 층의 가운데 존이 존재하면 해당 존에 속해야하고, 존이 속하지 않으면 중앙 좌표로 설정되어야한다.
							Util.getFloorDataWithImage(floorId).always(function(floor){
								$.ajax({
									url : "/foundation/space/zones?foundation_space_buildings_id=" + buildingId + "&foundation_space_floors_id=" + floorId
								}).done(function(data){
									// var i, max = data.length;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
									// var type, name;						//[13-04-2018]안쓰는 코드 주석 -jw.lim
									data.sort(function(a, b){
										return a.sortOrder - b.sortOrder;
									});
									var centerCoordinate = Util.getCenterMap(floor.imageWidth, floor.imageHeight);
									var centerZoneId = Util.getCenterZoneId(data, centerCoordinate);
									self.set("centerZoneId", centerZoneId);
									self.set("centerCoordinate", centerCoordinate);

									self.set("isSetZoneList", true);
									self.set("zoneList", data);

									if(data.length < 1){
										self.fields.set("foundation_space_zones_id", null);
										//층 선택 시, 해당 층에 Zone이 존재하지 않을 경우 중앙 좌표로 설정
										if(!isBoundEvt){
											self.fields.set("geometry", {
												type : "Point",
												coordinates : centerCoordinate
											});
										}
									}else if(!self.fields.get("geometry") && !self.fields.get("foundation_space_zones_id")){
										//기기 등록이고, 층 선택 시, 현재 기기에 설정된 좌표나 Zone이 없을 경우 해당 층에 Zone이 존재할 경우 중앙에 있는 Zone으로 설정
										self.fields.foundation_space_zones_id = centerZoneId;
									}
								}).fail(function(xhq){
									var msg = Util.parseFailResponse(xhq);
									detailPopup.msgDialog.message(msg);
									detailPopup.msgDialog.open();
								}).always(function(){
									Loading.close();
									if(!isBoundEvt){
										self.checkBtnDisabled(true);
									}
								});
							});
						},
						dataBoundZoneList : function(e){
							// console.log(e);
							this.changeZoneList(e, true);
						},
						changeZoneList : function(e, isBoundEvt){
							var self = this;
							var zoneId = null, buildingId = self.fields.get("foundation_space_buildings_id"),
								floorId = self.fields.get("foundation_space_floors_id");
							if(isBoundEvt){
								var fieldZoneId = self.fields.get("foundation_space_zones_id");
								e.sender.value(fieldZoneId);
								var val = e.sender.value();

								var curZoneList = this.get("zoneList");
								//현재 Device가 갖고 있는 Zone 정보가 콤보박스에 선택된 층에 없는 Zone 일 Case를 처리한다.
								var isSetZoneList = this.get("isSetZoneList");
								if(fieldZoneId && curZoneList && isSetZoneList){
									var findZone = new kendo.data.Query(curZoneList).filter({
										field : "id", operator : "eq", value : fieldZoneId
									}).toArray();
									if(findZone.length < 1){
										fieldZoneId = null;
										zoneId = null;
									}
								}

								//현재 Device가 갖고 있는 Zone 정보가 드롭다운 리스트 내에 없는 Zone 일 경우
								//Zone 콤보박스에 Zone List가 바인딩 되기 전에도 호출되므로, !val 예외처리 추가

								if(!fieldZoneId && !val){
									//기기 위치 정보가 없을 경우
									if(!self.fields.get("geometry")){
										zoneId = self.get("centerZoneId");
										if(zoneId == 0) zoneId = null;
										self.fields.set("foundation_space_zones_id", zoneId);
										//빌딩, 층 선택 후 Zone이 없는 경우는 좌표 값을 중앙 좌표로 설정
										var centerCoordinate = self.get("centerCoordinate");
										self.fields.set("geometry", {
											type : "Point",
											coordinates : centerCoordinate
										});
									}else{	//Zone이 없는 경우 Zone 값 삭제를 위하여 0으로 설정 /dms는 0 동작하나 /asset은 동작안함. 그러므로 null로 변경
										zoneId = null;
										self.fields.set("foundation_space_zones_id", zoneId);
									}
								}
								//self.fields.set("foundation_space_zones_id", val);
							}else{
								zoneId = e.sender.value();
								var geometry = self.fields.get("geometry");
								self.fields.set("foundation_space_zones_id", zoneId);
								detailPopup.hasChanged = true;

								//Zone 선택 시, Zone의 가운데 포인트로 이동되도록 한다.
								var points = {
									coordinates : null,
									type : "Point"
								};
								if(self.fields.location){
									//deviceItem.locations[0].set("foundation_space_zones_id", zoneId);
									self.fields.location.set("foundation_space_zones_id", zoneId);
									self.fields.location.set("geometry", geometry);
								}else{
									self.fields.set("location", [{
										foundation_space_buildings_id : buildingId,
										foundation_space_floors_id : floorId,
										foundation_space_zones_id : zoneId,
										geometry : geometry
									}]);
								}

								//get center zone point
								Loading.open(detailPopup.element);
								$.ajax({
									url : "/foundation/space/zones/" + zoneId
								}).done(function(data){
									if(data.geometry){
										if(data.geometry.coordinates && data.geometry.coordinates[0]){
											var coordinate = data.geometry.coordinates[0];
											var center = Util.getCentroid(coordinate);
											points.coordinates = center;
											self.fields.set("geometry", points);
										}
									}
								}).fail(function(data){
									console.error(data);
								}).always(function(){
									Loading.close();
								});

								self.checkBtnDisabled(true);
							}
							var zoneText = e.sender.text();
							this.set("zoneText", zoneText);
							var desc = self.setLocationDescription(this.get("buildingText"), this.get("floorText"), zoneText);
							this.setSelectedLocation(buildingId, floorId, zoneId, desc);
						},
						onMapBtnClick : function(evt){
							var mapBox = $("<div/>").addClass("device-detail-map-view-box");
							var self = this;
							var buildingId = self.fields.get("foundation_space_buildings_id");
							var floorId = self.fields.get("foundation_space_floors_id");
							var zoneId = self.fields.get("foundation_space_zones_id");
							var geometry = self.fields.get("geometry");
							Loading.open(detailPopup.element);
							Util.getFloorDataWithImage(floorId).always(function(floor){
								$.ajax({ url : "/foundation/space/zones?foundation_space_buildings_id=" + buildingId + "&foundation_space_floors_id=" + floorId }).done(function(zoneList){
									var deviceItem = detailPopup.getSelectedData();
									if(zoneId){
										if(deviceItem.location){
											deviceItem.location.set("foundation_space_zones_id", zoneId);
											deviceItem.location.set("geometry", geometry);
										}else{
											deviceItem.set("location", {
												id : "Fixed",
												foundation_space_buildings_id : buildingId,
												foundation_space_floors_id : floorId,
												foundation_space_zones_id : zoneId,
												geometry : geometry
											});
										}
									}

									var isRegister = detailPopup.dialogType == "register" ? true : false;

									var points = {
										coordinates : null,
										type : "Point"
									};

									var zoneName = "", zoneId = null, nameDisplayCoordinate;
									mapPopup.content(mapBox);
									mapPopup.setActions(1, { action : function(){
										/*해당 위치에 Zone이 있으면 Zone ID 변경*/
										if(points.coordinates){
											self.fields.set("geometry", points);
											deviceItem.location.set("geometry", points);
											detailPopup.hasChanged = true;

											if(zoneId){
												self.fields.set("foundation_space_zones_id", Number(zoneId));
											}else{
												//위치 좌표가 존재하는 경우에는 Zone Id를 0으로 주어 zone 삭제 동작을 수행토록한다.
												//asset patch 0 수행 시 동작안함.
												self.fields.set("foundation_space_zones_id", null);
											}

											if(zoneName){
												self.set("zoneText", zoneName);
												self.setLocationDescription(self.get("buildingText"), self.get("floorText"), zoneName);
											}
										}
										self.checkBtnDisabled(true);
									}});
									mapPopup.element.css("overflow", "auto");
									mapPopup.open();

									var mapView = mapBox.kendoCommonMapView({
										dataSource : [deviceItem],
										zoneDataSource : zoneList,
										floor :floor,
										isForcedShowDevice : true,
										isDetailPopupView : true,
										canDragDeviceIcon : true,
										isRegisterView : isRegister,
										width : 668,
										height : 527
									}).data('kendoCommonMapView');

									mapView.bind("dragend", function(e){
										var devices = e.devices;
										var device = devices[0], locations, zone;
										if(device){
											if(device.nameDisplayCoordinate){
												nameDisplayCoordinate = device.nameDisplayCoordinate;
											}
											if(device.locations){
												locations = device.locations[0];
												points.coordinates = locations.geometry.coordinates;
												zoneId = locations.foundation_space_zones_id;
												if(zoneId){
													zone = evt.sender.zoneDataSource.get(zoneId);
													zoneName = zone.name;
												}
											}
										}else{
											console.error("device is not found when device move end");
										}
									});

								}).fail(function(xhq){
									var msg = Util.parseFailResponse(xhq);
									detailPopup.msgDialog.message(msg);
								}).always(function(){
									Loading.close();
								});
							});
						}
					}
				},
				currentLocations : {
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_BEACON_CURRENT_LOCATION"),
					template : DeviceUtil.getCurrentLocation
				},
				description : {
					type : "text",
					name : I18N.prop("COMMON_DESCRIPTION"),
					editCss : {
						width : "100%"
					},
					editable : true,
					hasInputRemoveBtn : true,
					validator : true,
					isEditAll : true
				},
				//name, id, department, office phone, mobile phone
				ums_users_id : {
					groupName : "users",
					type : "object",
					name : I18N.prop("SERVICE_ASSET_USER_ID"),
					template : DeviceUtil.getAssetUserID,
					editable : true,
					editTemplate : function(){
						return "<span style='line-height:36px;' data-bind='text: fields.ums_users_id'></span>";
					},
					editFieldName : "users[0]",
					editViewModel : {
						fields : {
							ums_users_id : null
						},
						init : function(){
							if(!this.fields.ums_users_id)this.fields.ums_users_id = "-";
						}
					}
				},
				ums_users_name : {
					groupName : "users",
					type : "text",
					name : I18N.prop("SERVICE_ASSET_USER_NAME"),
					template : DeviceUtil.getAssetUserName
				},
				ums_users_organization : {
					groupName : "users",
					type : "text",
					name : I18N.prop("SERVICE_ASSET_USER_DEPARTMENT"),
					template : DeviceUtil.getAssetUserOrganization
				},
				ums_users_email : {
					groupName : "users",
					type : "text",
					name : I18N.prop("COMMON_EMAIL"),
					template : DeviceUtil.getAssetUserEmail
				},
				ums_users_workPhoneNumber : {
					groupName : "users",
					type : "text",
					name : I18N.prop("SERVICE_ASSET_USER_WORK_PHONE_NUMBER"),
					template : DeviceUtil.getAssetUserWorkPhoneNumber
				},
				ums_users_mobilePhoneNumber : {
					groupName : "users",
					type : "text",
					name : I18N.prop("SERVICE_ASSET_USER_PHONE"),
					template : DeviceUtil.getAssetUserMobilePhoneNumber
				},
				//id, name, status, macaddress, last event time, signallevel(rssi), batterylevel, description
				dms_devices_id : {
					groupName : "beacons",
					type : "object",
					name : I18N.prop("SERVICE_ASSET_DEVICE_ID"),
					template : DeviceUtil.getAssetDeviceID,
					editable : true,
					editTemplate : function(){
						return "<span style='line-height:36px;' data-bind='text: fields.dms_devices_id'></span>";
					},
					editFieldName : "devices[0]",
					editViewModel : {
						fields : {
							dms_devices_id : null
						},
						init : function(){
							if(!this.fields.dms_devices_id)this.fields.dms_devices_id = "-";
						}
					}
				},
				dms_devices_name : {
					groupName : "beacons",
					type : "object",
					name : I18N.prop("SERVICE_ASSET_DEVICE_NAME"),
					template : DeviceUtil.getAssetDeviceName,
					editable : true,
					hasInputRemoveBtn : true,
					editTemplate : function(){
						return "<form class='validator' data-role='commonvalidator' data-type='name'><input id='asset-device-name' class='k-input' style='line-height:36px; width:100%;' data-bind='value:fields.dms_devices_name'/><i class='ic ic-bt-input-remove'></i></form>";
					},
					editFieldName : "devices[0]",
					editViewModel : {
						fields : {
							dms_devices_name : null
						},
						init : function(){
							//var elem = detailPopup.element.find(("#asset-device-name"));
							//elem.on("keyup", this.change);
							if(!this.fields.dms_devices_name)this.fields.dms_devices_name = "";
							//elem.val(this.fields.dms_devices_name);
						},
						change : function(e){
							// console.log("name change");
							// console.error(e);
							/*var val = $(this).val();
							var field = detailPopup.editFields.dms_devices_name;
							var editViewModel = field.viewModel;
							editViewModel.fields.set("dms_devices_name", val);*/
						}
					},
					validationRule : function(fieldOpts, fieldElem){
						var elem = fieldElem.find(".validator");
						var validator = elem.data("kendoCommonValidator");
						return validator.validate();
					}
				},
				dms_devices_representativeStatus : {
					groupName : "beacons",
					type : "text",
					name : I18N.prop("COMMON_STATUS"),
					template : function(data){
						var val = "-";
						//type, mappedType, representativeStatus operations, modes, alarms
						if(data.devices && data.devices[0]){
							data = data.devices[0];
							var device = {
								type : data.dms_devices_type,
								mappedType : data.dms_devices_mappedType,
								representativeStatus : data.dms_devices_representativeStatus,
								alarms : data.dms_devices_alarms
							};

							val = Template.detailStatusIconTemplate(device);
						}
						return val;
					}
				},
				dms_devices_macAddress : {
					groupName : "beacons",
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"),
					template : function(data){
						var val = "-";
						if(data.devices && data.devices[0]){
							data = data.devices[0];
							var device = { networks : data.dms_devices_networks };
							val = DeviceUtil.getBleMacAddress(device);
						}
						return val;
					}
				},
				dms_devices_lastEventTime : {
					groupName : "beacons",
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_TEMP_HUM_LAST_EVENT_TIME"),
					template : function(data){
						var val = "-";
						if(data.devices && data.devices[0]){
							data = data.devices[0];
							var info = data.dms_devices_information;
							if(info && info.updatedTime){
								val = moment(info.updatedTime).format("LLL");
							}
						}
						return val;
					}
				},
				dms_devices_signalLevel : {
					groupName : "beacons",
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_BEACON_SIGNAL_LEVEL_RSSI"),
					template : function(data){
						var val = "-";
						if(data.devices && data.devices[0]){
							data = data.devices[0];
							var device = { networks : data.dms_devices_networks };
							val = DeviceUtil.getBleSignalLevel(device);
						}

						return val;
					}
				},
				dms_devices_batteryLevel : {
					groupName : "beacons",
					type : "text",
					name : I18N.prop("FACILITY_DEVICE_BEACON_BATTERY_LEVEL"),
					template : function(data){
						var val = "-";
						if(data.devices && data.devices[0]){
							data = data.devices[0];
							var device = { information : data.dms_devices_information };
							val = DeviceUtil.getBleBatteryLevel(device);
							if(val != "-"){
								val += " %";
							}
						}
						return val;
					}
				},
				dms_devices_description : {
					groupName : "beacons",
					type : "object",
					name : I18N.prop("COMMON_DESCRIPTION"),
					template : function(data){
						var val = "-";
						if(data.devices && data.devices[0]){
							val = data.devices[0].dms_devices_description;
						}
						return val;
					},
					editable : true,
					hasInputRemoveBtn : true,
					editTemplate : function(){
						return "<form class='validator' data-role='commonvalidator' data-type='description'><input id='asset-device-description' class='k-input' style='line-height:36px; width:100%;' data-bind='value:fields.dms_devices_description'/><i class='ic ic-bt-input-remove'></i></form>";
					},
					editFieldName : "devices[0]",
					editViewModel : {
						fields : {
							dms_devices_description : null
						},
						init : function(){
							//var elem = detailPopup.element.find(("#asset-device-description"));
							//elem.on("keyup", this.change);
							if(!this.fields.dms_devices_description)this.fields.dms_devices_description = "";
							//elem.val(this.fields.dms_devices_description);
						},
						change : function(e){
							/*console.log("description change");
							console.error(e);
							var val = $(this).val();
							var field = detailPopup.editFields.dms_devices_description;
							var editViewModel = field.viewModel;
							editViewModel.fields.set("dms_devices_description", val);*/
						}
					},
					validationRule : function(fieldOpts, fieldElem){
						var elem = fieldElem.find(".validator");
						var validator = elem.data("kendoCommonValidator");
						return validator.validate();
					}
				}
			}
		},
		setAdditionalDetailData : function(data){
			console.error("set additional!");
			console.error(this);
			//console.log(data);
			var assetTypesId = data.assets_types_id;
			var devices = data.devices;
			var device = devices[0];
			//자산 상세 조회 시, 연동 비콘이 존재할 때.
			if(assetTypesId != 0 && device && device.dms_devices_id){
				Loading.open(this.element);
				var deviceId = device.dms_devices_id;
				return $.ajax({
					url : "/dms/devices/" + deviceId
				}).then(function(deviceData){
					device.dms_devices_networks = deviceData.networks;
					device.dms_devices_information = deviceData.information;
					Loading.close();
				}).fail(function(){
					Loading.close();
				});
			}
			var dfd = new $.Deferred();
			dfd.resolve();
			//Loading.close();
			return dfd.promise();
		}
	};

	//editFields.viewModel에 접근하고, User 검색 및 Beacon 처리.
	//Asset Model을 만들어서 Beacon, User 등록 및 편집 가능하도록.
	//완료 후 Asset Post 및 뷰 Beacon 정보, Asset 정보 업데이트

	var searchTemplate = '<div class="asset-search-wrapper"><div class="search-box"><input type="text" class="k-textbox search-field" placeholder="#=placeholder#" style="width:100%;"/><button class="search-btn ic ic-bt-input-search" data-bind="events:{ click : searchField.click }">' + I18N.prop("COMMON_SEARCH") + '</button></div><div class="asset-search-results-wrapper"></div><div class="asset-search-grid"></div></div>';

	baseConfig.contentViewModel.clickUserSearchBtn = function(e){
		// console.log("click user search");
		// console.log(detailPopup.getSelectedData());
		var selectedData = detailPopup.getSelectedData();
		//var ds = e.sender.dataSource;
		//var data = ds.data();
		var template = kendo.template(searchTemplate);
		template = template({ placeholder : I18N.prop("SERVICE_ASSET_SEARCH_USER")});

		userSearchPopup.content(template);
		var content = userSearchPopup.element;

		//Grid 초기화
		var gridElem = content.find(".asset-search-grid");
		var gridOpt = $.extend({}, defaultGridOpt, {
			selectable : "row",
			hasSelectedModel : true,
			setSelectedAttrute : true,
			columns : [
				{ field : "name", title : I18N.prop("COMMON_NAME"), width:80, sortable : false },
				{ field : "id", title : "ID", width:106, sortable : false},
				{ field : "email", title : I18N.prop("COMMON_EMAIL"), width:158, sortable : false, template : function(data){
					var val = "-";
					if(data.email){
						val = data.email;
					}
					return val;
				}},
				{ field : "mobilePhoneNumber", title : I18N.prop("SERVICE_ASSET_USER_PHONE"), width:184, sortable : false, template : function(data){
					var val = "-";
					if(data.mobilePhoneNumber){
						val = data.mobilePhoneNumber;
					}
					return val;
				}}
			],
			dataSource : []
		});

		var grid = gridElem.kendoGrid(gridOpt).data("kendoGrid");

		//Search 이벤트
		var searchField = content.find(".search-field");
		var searchBtn = content.find(".search-btn");
		var searchFunc = function(keywords){
			var q = "?";
			if(keywords){
				q += "contains=" + keywords + "&";
			}
			q += "containsAttributes=id,name,organization,workPhoneNumber,mobilePhoneNumber&";
			q += "role=Tenant";

			Loading.open(userSearchPopup.element);
			$.ajax({
				url : "/ums/users" + q
			}).done(function(data){
				var ds = new kendo.data.DataSource({
					data : data
				});
				ds.read();
				grid.setDataSource(ds);
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		};

		searchField.on("keydown", function(evt){
			if(evt.keyCode == 13){
				searchBtn.click();
			}
		});

		searchBtn.on("click", function(){
			searchFunc(searchField.val());
		});

		userSearchPopup.open();

		//선택 User Save 버튼 이벤트
		userSearchPopup.setActions(1, {
			action : function(){
				//Grid로 부터 선택한 데이터 가져오기
				var selectedUsers = grid.getSelectedData();
				if(selectedUsers.length < 1){
					msgDialog.message(I18N.prop("SERVICE_ASSET_NO_SELECTED_USER"));
					msgDialog.open();
					return false;
				}
				var user = selectedUsers[0];
				//현재 Data에 User 정보 Set
				// console.log(selectedData.users);
				if(!selectedData.users[0]){
					selectedData.users.push({});
				}

				//상세팝업 UI 리프레시.
				selectedData.users[0].set("ums_users_name", user.name);
				detailPopup.updateDisplayField("ums_users_name");
				selectedData.users[0].set("ums_users_id", user.id);
				detailPopup.updateDisplayField("ums_users_id");
				//User ID는 Editable Field로 설정되어 PATCH 수행하므로 View Model로 접근하여 업데이트한다.
				detailPopup.editFields["ums_users_id"].viewModel.fields.set("ums_users_id", user.id);
				selectedData.users[0].set("ums_users_organization", user.organization);
				detailPopup.updateDisplayField("ums_users_organization");
				selectedData.users[0].set("ums_users_email", user.email);
				detailPopup.updateDisplayField("ums_users_email");
				selectedData.users[0].set("ums_users_mobilePhoneNumber", user.mobilePhoneNumber);
				detailPopup.updateDisplayField("ums_users_mobilePhoneNumber");

			}
		});

	};

	baseConfig.contentViewModel.clickBeaconSearchBtn = function(){
		// console.log("click user search");
		// console.log(detailPopup.getSelectedData());
		var selectedData = detailPopup.getSelectedData();
		//var ds = e.sender.dataSource;
		//var data = ds.data();
		var template = kendo.template(searchTemplate);
		template = template({ placeholder : I18N.prop("SERVICE_ASSET_SEARCH_BEACON")});

		deviceSearchPopup.content(template);
		var content = deviceSearchPopup.element;

		//Grid 초기화
		var gridElem = content.find(".asset-search-grid");
		var gridOpt = $.extend({}, defaultGridOpt, {
			selectable : "row",
			hasSelectedModel : true,
			setSelectedAttrute : true,
			columns : [
				{ field : "id", title : I18N.prop("FACILITY_DEVICE_DEVICE_ID"), width:106, sortable : false },
				{ field : "name", title : I18N.prop("FACILITY_DEVICE_DEVICE_NAME"), width:122, sortable : false},
				{ field : "macAddress", title : I18N.prop("FACILITY_DEVICE_NETWORK_MAC_ADDRESS"), width:158, sortable : false, template : DeviceUtil.getBleMacAddress},
				{ field : "status", title : I18N.prop("COMMON_STATUS"), width:142, sortable : false, template : Template.detailStatusIconTemplate}
			],
			dataSource : []
		});

		var grid = gridElem.kendoGrid(gridOpt).data("kendoGrid");

		//Search 이벤트
		var searchField = content.find(".search-field");
		var searchBtn = content.find(".search-btn");
		var searchFunc = function(keywords){
			var q = "?";
			if(keywords){
				q += "contains=" + keywords + "&";
				q += "containsAttributes=id,name,networks--ble-macAddress&";
			}

			q += "types=Beacon&";
			q += "registrationStatuses=NotRegistered,Registered&";
			//q += "attributes=id,name,alarms,assets,networks-ble-macAddress&";

			Loading.open(deviceSearchPopup.element);
			$.ajax({
				url : "/dms/devices" + q
			}).done(function(data){
				var ds = new kendo.data.DataSource({
					data : data
				});
				ds.read();
				grid.setDataSource(ds);
			}).fail(function(xhq){
				var msg = Util.parseFailResponse(xhq);
				msgDialog.message(msg);
				msgDialog.open();
			}).always(function(){
				Loading.close();
			});
		};

		searchField.on("keydown", function(e){
			if(e.keyCode == 13){
				searchBtn.click();
			}
		});

		searchBtn.on("click", function(){
			searchFunc(searchField.val());
		});

		deviceSearchPopup.open();

		//선택 User Save 버튼 이벤트
		deviceSearchPopup.setActions(1, {
			action : function(){
				//Grid로 부터 선택한 데이터 가져오기
				var selectedDevice = grid.getSelectedData();
				if(selectedDevice.length < 1){
					msgDialog.message(I18N.prop("SERVICE_ASSET_NO_SELECTED_BEACON"));
					msgDialog.open();
					return false;
				}
				var device = selectedDevice[0];
				//현재 Data에 User 정보 Set
				// console.log(selectedData.devices);
				if(!selectedData.devices[0]){
					selectedData.devices.push({});
				}

				//상세팝업 UI 리프레시.
				selectedData.devices[0].set("dms_devices_id", device.id);
				detailPopup.updateDisplayField("dms_devices_id");
				//Device ID, Name, Description은 Editable Field로 설정되어 PATCH 수행하므로 View Model로 접근하여 업데이트한다.
				detailPopup.editFields["dms_devices_id"].viewModel.fields.set("dms_devices_id", device.id);

				selectedData.devices[0].set("dms_devices_name", device.name);
				detailPopup.updateDisplayField("dms_devices_name");
				detailPopup.editFields["dms_devices_name"].viewModel.fields.set("dms_devices_name", device.name);
				//Validator는 Value가 View Model 바인딩이 되지 않으므로, DOM 접근으로 Set 한다.
				detailPopup.editFields["dms_devices_name"].find("[data-role='commonvalidator']").val(device.name);

				//값들을 표시하기 위한 값을 모두 셋팅한다.
				selectedData.devices[0].set("dms_devices_type", device.type);
				selectedData.devices[0].set("dms_devices_mappedType", device.mappedType);
				selectedData.devices[0].set("dms_devices_representativeStatus", device.representativeStatus);
				selectedData.devices[0].set("dms_devices_alarms", device.alarms);
				selectedData.devices[0].set("dms_devices_networks", device.networks);
				selectedData.devices[0].set("dms_devices_information", device.information);
				selectedData.devices[0].set("dms_devices_locations", device.locations);
				detailPopup.updateDisplayField("dms_devices_representativeStatus");
				detailPopup.updateDisplayField("dms_devices_macAddress");
				detailPopup.updateDisplayField("dms_devices_lastEventTime");
				detailPopup.updateDisplayField("dms_devices_signalLevel");
				detailPopup.updateDisplayField("dms_devices_batteryLevel");

				selectedData.devices[0].set("dms_devices_description", device.description);
				detailPopup.updateDisplayField("dms_devices_description");  detailPopup.editFields["dms_devices_description"].viewModel.fields.set("dms_devices_description", device.description);
				//Validator는 Value가 View Model 바인딩이 되지 않으므로, DOM 접근으로 Set 한다.
				detailPopup.editFields["dms_devices_description"].find("[data-role='commonvalidator']").val(device.description);
			}
		});
	};

	//존재하는 Scheme를 제외하고 baseConfig에서 삭제한다.
	var typeSchemeFields = {
		"Asset" : ["number", "assets_types", "subAssetType", "modelName", "serialNumber", "purchaseDate",
			"originalCost", "bookValue", "managementOrganization", "mobilityType",
			"location", "currentLocations", "description",
			"ums_users_name", "ums_users_id", "ums_users_organization", "ums_users_email", "ums_users_mobilePhoneNumber",
			"dms_devices_id", "dms_devices_name", "dms_devices_representativeStatus", "dms_devices_macAddress", "dms_devices_lastEventTime", "dms_devices_signalLevel", "dms_devices_batteryLevel", "dms_devices_description"]
	};

	//타입 별로 해당 옵션에 대해 baseConfig에 추가한다.
	var additionalOptions = {
		"Asset" : {
			/*parseSaveData : function(datas, results){
				if(!results){
					return results;
				}

				var i, max;
				if($.isArray(results)){
					max = results.length;
					for( i = 0; i < max; i++ ){
						parseBeaconData(datas[i], results[i]);
					}
				}else{
					parseBeaconData(datas, results);
				}

				return results;
			},*/
			buttonsIndex : {
				CLOSE : 0, EDIT : 1, CANCEL : 2, SAVE : 3, REGISTER : 4, DEREGISTER : 5, DELETE : 6
			},
			onTypeChange : function(e){
				var dialog = e.sender;
				var ds = dialog.dataSource;
				var datas = ds.data();
				var max = datas.length;

				var type = e.type;
				var BTN = e.sender.BTN;
				if(type == "register"){
					detailPopup.setActions(BTN.SAVE, { visible : false });
					detailPopup.setActions(BTN.CANCEL, { visible : false });
					detailPopup.setActions(BTN.EDIT, { visible : false });
					detailPopup.setActions(BTN.DEREGISTER, { visible : false });

					detailPopup.setActions(BTN.DELETE, { visible : true });
					detailPopup.setActions(BTN.CLOSE, { visible : true });
					detailPopup.setActions(BTN.REGISTER, { visible : true });
				}else{
					detailPopup.setActions(BTN.SAVE, { visible : false });
					detailPopup.setActions(BTN.CANCEL, { visible : false });
					detailPopup.setActions(BTN.DEREGISTER, { visible : false });
					detailPopup.setActions(BTN.REGISTER, { visible : false });

					detailPopup.setActions(BTN.DELETE, { visible : true });
					detailPopup.setActions(BTN.CLOSE, { visible : true });
					if(max > 1){
						detailPopup.setActions(BTN.EDIT, { visible : true, disabled : true });
					}else {
						detailPopup.setActions(BTN.EDIT, { visible : true, disabled : false });

					}
				}
			},
			actions : [
				{
					text : I18N.prop("COMMON_BTN_CLOSE"),
					visible : true,
					action : commonCloseBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_EDIT"),
					visible : true,
					action : commonEditBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_CANCEL"),
					visible : false,
					action : commonCancelBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_SAVE"),
					visible : false,
					disabled : true,
					action : commonSaveBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_REGISTER"),
					visible : false,
					action : commonRegisterBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_DEREGISTER"),
					visible : false,
					action : commonDeregisterBtnEvt
				},
				{
					text : I18N.prop("COMMON_BTN_DELETE"),
					visible : true,
					action : commonDeleteBtnEvt
				}
			]
		}
	};

	var typePopupConfig = {};

	var config, schemeFields, key, schemeKey;
	// var optKey; 					//[13-04-2018]안쓰는 코드 주석 -jw.lim
	//Scheme Field를 설정
	for( key in typeSchemeFields ){
		schemeFields = typeSchemeFields[key];
		config = $.extend(true, {}, baseConfig);
		for( schemeKey in config.scheme.fields ){
			if(schemeFields.indexOf(schemeKey) == -1){
				delete config.scheme.fields[schemeKey];
			}
		}
		typePopupConfig[key] = config;
	}

	//추가 Option 설정
	for( key in additionalOptions ){
		config = typePopupConfig[key];
		config = $.extend(true, config, additionalOptions[key]);
	}

	var getDetailPopup = function(deviceType){
		detailPopup = detailPopupElem.kendoDetailDialog(typePopupConfig[deviceType]).data("kendoDetailDialog");
		return detailPopup;
	};

	var msgDialog, msgDialogElem = $("<div/>");
	msgDialog = msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");
	var confirmDialog, confirmDialogElem = $("<div/>");
	confirmDialog = confirmDialogElem.kendoCommonDialog({type : "confirm"}).data("kendoCommonDialog");

	assetTypePopup = assetPopupElem.kendoDetailDialog(assetTypeConfig).data("kendoDetailDialog");
	assetTypeAddPopup = assetTypeAddPopupElem.kendoCommonDialog({
		type : "confirm",
		title : I18N.prop("SERVICE_ASSET_TYPE_MANAGEMENT"),
		timeout : 0,
		width: 788,
		height: 830,
		actions : [
			{
				text : I18N.prop("COMMON_BTN_CLOSE")
			},
			{
				text : I18N.prop("COMMON_BTN_ADD")
			}
		]
	}).data("kendoCommonDialog");

	function setAssetTypes(types){
		assetTypes = types;
	}

	return {
		getDetailPopup : getDetailPopup,
		messageDialog : msgDialog,
		confirmDialog : confirmDialog,
		assetTypePopup : assetTypePopup,
		assetTypeAddPopup : assetTypeAddPopup,
		setAssetTypes : setAssetTypes
	};

});

//# sourceURL=asset/monitoring/config/popup-config.js
