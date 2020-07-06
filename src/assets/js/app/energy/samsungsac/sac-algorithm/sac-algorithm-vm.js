define("energy/samsungsac/sac-algorithm/sac-algorithm-vm", ["energy/core", "energy/samsungsac/sac-algorithm/sac-algorithm-model"], function(CoreModule, Model){

	var I18N = window.I18N;
	var kendo = window.kendo;

	var MainViewModel = kendo.observable({
		category : {
			comfort : {
				active : false,
				disabled : false,
				invisible : false,
				click : function(){}
			},
			prc : {
				active : false,
				disabled : false,
				invisible : false,
				click : function(){}
			},
			optimal : {
				active : false,
				disabled : false,
				invisible : false,
				click : function(){}
			}
		},
		saveBtn : {
			click : function(){}
		},
		showDeviceList : true
	});

	var weatherDs = Model.weatherDataSource,
		locationDs = Model.locationDataSource,
		purposeDs = Model.purposeDataSource;

	var defaultStartDate = new Date();
	defaultStartDate.setHours(0);
	defaultStartDate.setMinutes(0);
	defaultStartDate.setSeconds(0);

	var defaultEndDate = new Date();
	defaultEndDate.setHours(1);
	defaultEndDate.setMinutes(0);
	defaultEndDate.setSeconds(0);

	var ComfortViewModel = kendo.observable({
		weather : {
			disabled : false,
			invisible : false,
			value : "South Korea",
			dataSource: weatherDs,
			select : function(e){
				// console.log(e);
				var value = e.dataItem.value;
				var ds = locationDs[value];
				if(!ds){
					ds = [];
				}
				this.location.set("dataSource", ds);
				this.location.set("value", ds[0]);
			}
		},
		location : {
			disabled : false,
			invisible : false,
			value : locationDs["South Korea"][0],
			dataSource: locationDs["South Korea"],
			select : function(e){}
		},
		purpose : {
			disabled : false,
			invisible : false,
			dataValueField : "value",
			dataTextField : "text",
			value : purposeDs[0],
			dataSource: purposeDs,
			select : function(e){
				var value = e.dataItem.value;
				this.purpose.set("value", value);
			}
		},
		isExceptionTime : false,
		showTimeAddBtn : true,
		checkExceptionTime : function(){},
		except_times : [{
			start_time : defaultStartDate,
			end_time : defaultEndDate
		}]
	});

	function activeBtns(index){
		var btns = this.savingLevelBtns;
		var i, max = btns.length;
		for( i = 0; i < max; i++ ){
			btns[i].set("active", false);
		}
		btns[index].set("active", true);
	}

	var PrcViewModel = kendo.observable({
		powerPricingBtn : {
			disabled : true,
			click : function(){}
		},
		powerPricingText : I18N.prop("SETTINGS_ALGORITHM_NO_POWER_PRICING"),
		savingLevelBtns : [
			{
				active : false,
				click : function(e){
					activeBtns.call(this, 0);
				}
			},
			{
				active : true,
				click : function(e){
					activeBtns.call(this, 1);
				}
			},
			{
				active : false,
				click : function(e){
					activeBtns.call(this, 2);
				}
			}
		],
		enabled : true
	});

	var optimalDs = Model.optimalDataSource;

	var OptimalViewModel = kendo.observable({
		optimalTime : {
			disabled : false,
			invisible : false,
			dataSource: optimalDs,
			value : optimalDs[0],
			select : function(){}
		}
	});

	var Views = {
		comfort : {
			view : null,
			routeUrl : "/comfort"
		},
		prc : {
			view : null,
			routeUrl : "/prc"
		},
		optimal : {
			view : null,
			routeUrl : "/optimal"
		}
	};

	var powerPricingViewModel = kendo.observable({
		isEdit : false,
		isEmpty : false,
		isDisableDeleteBtn: true,
		isAdd : false,
		isChangedDropDownList : false,
		dropDownList : {
			dataSource : [],
			value : null,
			change : function(){}
		},
		editName : "",
		selectedNum : 0,
		clickEditBtn : function(){},
		clickCreateBtn : function(){},
		clickAddBtn : function(){},
		clickDeleteBtn : function(){},
		disabledDelete : true,
		clickTopDeleteBtn : function(){}
	});

	return {
		MainViewModel : MainViewModel,
		ComfortViewModel : ComfortViewModel,
		PrcViewModel : PrcViewModel,
		OptimalViewModel : OptimalViewModel,
		powerPricingViewModel : powerPricingViewModel,
		Views : Views
	};
});


//For Debug
//# sourceURL=facility-sac/algorithm-vm.js
