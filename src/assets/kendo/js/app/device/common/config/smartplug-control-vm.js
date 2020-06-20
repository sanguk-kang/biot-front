define("device/common/config/smartplug-control-vm", [], function(){
	var LoadingPanel = window.CommonLoadingPanel;
	var kendo = window.kendo;
	var I18N = window.I18N;

	var msgDialogElem = $("<div/>");
	msgDialogElem.kendoCommonDialog().data("kendoCommonDialog");

	// 0831 - add smart plug
	var smartPlugControlTemplate = '<div class="group-control-dialog-control groupControl">' +
	'<div class="controllerList noarr">' +
		'<div class="horzline"></div>' +
		'<div class="typename">' + I18N.prop("FACILITY_DEVICE_TYPE_SMART_PLUG") + '</div>' +
		'<div class="innerBox">' +
			'<div class="innerSet">' +
				'<button type="button" class="controlBtn" data-bind="events:{click:smartPlug.power.click}, css:{selected:smartPlug.power.active}, invisible:smartPlug.power.invisible"><span class="icwrap"><i class="ic power"></i><span data-bind="visible:smartPlug.power.active">ON</span><span data-bind="invisible:smartPlug.power.active">OFF</span></span></button>' +
	/* '<p class="bluetit" data-bind="invisible:light.invisible">Brightness (0 ~ 100 %)</p>'+
				'<div class="tb slider" data-bind="invisible:light.invisible">'+
					'<div class="tbc">'+
						'<div class="customSlider">'+
							'<input style="width:160px;" data-bind="value:light.value,events:{slide:light.slide}" data-role="slider" data-show-buttons="false" data-tooltip="{enabled:false, format:\'{0}\'}" data-tick-placement="none" data-min="0" data-max="100" data-small-step="1" data-large-step="1"/>'+
							'<span class="valTxt"><span data-bind="text:light.value"></span>%</span>'+
						'</div>'+
					'</div>'+
				'</div>'+ */
			'</div>' +
		'</div>' +
	'</div></div>';

	function getSelectedIds(popup){
		var ds = popup.dataSource;
		var selectedData = ds.data();
		var i, max = selectedData.length;
		var ids = [];
		for( i = 0; i < max; i++ ){
			ids.push( { id : selectedData[i].id, type : selectedData[i].type });
		}
		return ids;
	}

	function controlPower(popup, control){
		//ajax
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		var obj = {
			id : "General"
		};
		//Power Check Name 까지 필요.
		obj.power = control.power.get("active") ? "On" : "Off";

		var i, max = ids.length;
		var deviceId, patchObj, patchArr = [];
		for( i = 0; i < max; i++ ){
			deviceId = ids[i].id;
			patchObj = {
				id : deviceId,
				operations : [obj]
			};
			//Control Point는 ControlPoint API를 사용하여 제어
			//08.25 lights 어트리뷰트로 통합
			/*if(type.indexOf("ControlPoint") != -1){
				if(type.indexOf("DI") != -1 || type.indexOf("DO") != -1){
					patchObj.controlPoint = { value : pointValue };
				}
			}*/
			patchArr.push(patchObj);
		}

		// console.log("control smartplug power");
		// console.log(patchArr);
		patchLight(patchArr, popup);
		Loading.close();
	}

	function controlLight(popup, control){
		var Loading = popup.Loading;
		Loading.open();
		var ids = getSelectedIds(popup);
		var value = control.get("value");
		var lights = [];
		lights.push({
			id : 1,
			dimmingLevel : value
		});

		var i, max = ids.length;
		var deviceId, patchObj, patchArr = [];
		for( i = 0; i < max; i++ ){
			deviceId = ids[i].id;
			patchObj = {
				id : deviceId,
				lights : lights
			};
			//Control Point는 ControlPoint API를 사용하여 제어
			//08.25 lights 어트리뷰트로 통합
			/*if(type.indexOf("ControlPoint") != -1){
				patchObj.controlPoint = { value : value };
			}*/
			patchArr.push(patchObj);
		}
		// console.log("control smartplug");
		// console.log(patchArr);
		patchLight(patchArr, popup);
		Loading.close();
	}

	function patchLight(patchArr, popup){
		var ds = popup.dataSource;
		var locations;
		var item, obj, id, i, max = patchArr.length;
		for( i = 0; i < max; i++ ){
			obj = patchArr[i];
			id = obj.id;
			item = ds.get(id);
			if(item){
				if(obj.operations){
					item.set("operations", obj.operations);
				}
				if(obj.lights){
					item.set("lights", obj.lights);
				}
				/*if(obj.controlPoint){
					item.set("controlPoint", obj.controlPoint);
				}*/
				if(item.locations){
					locations = item.locations;
					if(locations instanceof kendo.data.ObservableObject){
						locations = locations.toJSON();
					}
					obj.locations = locations;
				}
			}
		}

		ds.fetch();
		if(patchArr.length <= 1){
			//싱글 팝업일 경우 다이얼로그 헤더를 업데이트한다.
			//멀티일 경우에는 Grid로 생성되므로 불필요.
			popup._renderHeaderTemplate();
		}
		// console.log("patch light arr");
		// console.log(patchArr);
		popup.trigger("onSaved", {
			sender : popup, result : patchArr[0], results : patchArr, hideMessagePopup : true
		});
	}

	// var lightControlViewModel = kendo.observable({
	//     init : function(popup){
	//         this.popup = popup;
	//         this.popup.Loading = new LoadingPanel(this.popup.element);
	//         this.light.init();
	//     },
	//     popup : null,
	//     light : {
	//         init : function(){
	//             var light = this;
	//             light.power.set("active", false);
	//             light.power.set("invisible", false);
	//             light.set("invisible", false);
	//             light.set("value", 50);
	//         },
	//         timeout : null,
	//         invisible : false,
	//         value : 50,
	//         power : {
	//             invisible : false,
	//             active : false,
	//             click : function(e){
	//                 var light = this.light;
	//                 console.log(this);
	//                 var isActive = light.power.get("active");
	//                 light.power.set("active", !isActive);
	//                 controlPower(this.popup, this.light, "light");
	//                 //ajax
	//             }
	//         },
	//         slide : function(e){
	//             var light = this.light;
	//             var popup = this.popup;
	//             console.log(this);
	//             light.set("value", e.value);
	//             if(light.timeout){
	//                 clearTimeout(light.timeout);
	//                 light.timeout = null;
	//             }
	//
	//             //timer ajax
	//             light.timeout = setTimeout(function(){
	//                 controlLight(popup, light);
	//             }, 500);
	//         }
	//     }
	// });

	var smartPlugControlViewModel = kendo.observable({		// 0831 - add smart plug
		init : function(popup){
			this.popup = popup;
			this.popup.Loading = new LoadingPanel(this.popup.element);
			this.smartPlug.init();
		},
		popup : null,
		smartPlug : {
			init : function(){
				var smartPlug = this;
				smartPlug.power.set("active", false);
				smartPlug.power.set("invisible", false);
				smartPlug.set("invisible", false);
				smartPlug.set("value", 50);
			},
			timeout : null,
			invisible : false,
			value : 50,
			power : {
				invisible : false,
				active : false,
				click : function(e){
					var smartPlug = this.smartPlug;
					// console.log(this);
					var isActive = smartPlug.power.get("active");
					smartPlug.power.set("active", !isActive);
					controlPower(this.popup, this.smartPlug, "smartPlug");
					//ajax
				}
			},
			slide : function(e){
				var smartPlug = this.smartPlug;
				var popup = this.popup;
				// console.log(this);
				smartPlug.set("value", e.value);
				if(smartPlug.timeout){
					clearTimeout(smartPlug.timeout);
					smartPlug.timeout = null;
				}

				//timer ajax
				smartPlug.timeout = setTimeout(function(){
					controlLight(popup, smartPlug);
				}, 500);
			}
		}
	});

	return {
		smartPlugControlTemplate : smartPlugControlTemplate, // 0831 - add smart plug
		smartPlugControlViewModel : smartPlugControlViewModel // 0831 - add smart plug
	};
});

//# sourceURL=device/common/config/smartplug-control-vm.js