define("operation/group/config/group-model", function(){
	"use strict";
	var kendo = window.kendo;
	var MockData = [
		{
			"foundation_space_buildings_id": 1,
			"foundation_space_buildings_name": "A Tower",
			"floors": [
				{
					"foundation_space_floors_id": 23,
					"foundation_space_floors_type": "F",
					"foundation_space_floors_name": "15",
					"groups": [
						{
							"dms_groups_id": 11,
							"dms_groups_name": "Marketing Department",
							"dms_groups_description": "A collection of all devices belonging to the marketing department.",
							"deviceTypes": [
								{
									"dms_devices_type": "AirConditionerOutdoor",
									"numberOfDevices": 1
								},
								{
									"dms_devices_type": "AirConditioner.Indoor",
									"numberOfDevices": 3
								},
								{
									"dms_devices_type": "Beacon",
									"numberOfDevices": 2
								}
							]
						},
						{
							"dms_groups_id": 12,
							"dms_groups_name": "Sales Department",
							"dms_groups_description": "A collection of all devices belonging to the sales department.",
							"deviceTypes": [
								{
									"dms_devices_type": "AirConditioner.Indoor",
									"numberOfDevices": 4
								},
								{
									"dms_devices_type": "Beacon",
									"numberOfDevices": 3
								}
							]
						}
					]
				}
			]
		}];

	var createDataSource = function(list, model, isSelected){
		var i, j, length, max = list.length;
		var group;

		var type, num;
		for( i = 0; i < max; i++ ){
			group = list[i];
			if(group.deviceTypes){
				length = group.deviceTypes.length;
				for( j = 0; j < length; j++ ){
					type = group.deviceTypes[j].dms_devices_type;
					num = group.deviceTypes[j].numberOfDevices;
					group[type] = num;
				}
				//delete group.deviceTypes;
			}
			if(isSelected){
				group.selected = false;
			}
		}
		return list;
	};

	var GroupModel = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			type: {
				name: "Type"
			},
			description : {
				name: "Description"
			},
			dms_devices_ids : {
				name : "Devices",
				type : "object",
				defaultValue : []
			}
		}
	});

	var createModel = function(data){
		var m = new GroupModel(data);
		if(data){
			return m;
		}

		m.set("dms_devices_ids", []);
		return m;
	};

	var createModelByGroupIdData = function(data){
		var i, devices, max, m = new GroupModel();
		m.set("id", data.id);
		m.set("name", data.name);
		m.set("type", data.type);
		devices = data.devices;
		if(devices){
			max = devices.length;
			var id, idList = [];
			for( i = 0; i < max; i++ ){
				id = devices[i].dms_devices_id;
				idList.push(id);
			}
			m.set("dms_devices_ids", idList);
		}
		return m;
	};

	return {
		MockData : MockData,
		createDataSource : createDataSource,
		createModel : createModel,
		createModelByGroupIdData : createModelByGroupIdData
	};
});