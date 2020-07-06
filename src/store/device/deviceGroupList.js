const deviceGroupList = 
{
    state: {
        deviceGroupsRowIdx : 0,
        deviceGroups : [
            {
                "id": 1,
                "name": "test group 01",
                "type": "",
                "description": "",
                "subGroupResources": [],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            },
            {
                "id": 2,
                "name": "test group 02",
                "type": "",
                "description": "",
                "subGroupResources": [
                {
                    "id": 10,
                    "name": "test group 01-3",
                    "dms_devices_ids": ""
                },
                {
                    "id": 4,
                    "name": "test group 02-2",
                    "dms_devices_ids": ""
                },
                {
                    "id": 3,
                    "name": "test group 02-1",
                    "dms_devices_ids": ""
                }
                ],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            },
            {
                "id": 13,
                "name": "test group 06",
                "type": "",
                "description": "",
                "subGroupResources": [],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            },
            {
                "id": 22,
                "name": "그룹1",
                "type": "",
                "description": "",
                "subGroupResources": [
                    {
                    "id": 23,
                    "name": "새그룹1",
                    "dms_devices_ids": ""
                    }
                ],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            },
            {
                "id": 24,
                "name": "그룹2",
                "type": "",
                "description": "",
                "subGroupResources": [
                    {
                    "id": 39,
                    "name": "그룹2-1",
                    "dms_devices_ids": ""
                    },
                    {
                    "id": 41,
                    "name": "그룹2-2",
                    "dms_devices_ids": ""
                    },
                    {
                    "id": 40,
                    "name": "새그룹2",
                    "dms_devices_ids": ""
                    }
                ],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            },
            {
                "id": 42,
                "name": "그룹3",
                "type": "",
                "description": "",
                "subGroupResources": [
                    {
                    "id": 45,
                    "name": "그룹3-1",
                    "dms_devices_ids": ""
                    },
                    {
                    "id": 46,
                    "name": "그룹3-2",
                    "dms_devices_ids": ""
                    }
                ],
                "siteId": "",
                "userId": "",
                "parentDeviceGroupId": "",
                "dms_devices_ids": []
            }
        ],
    },


    getters: {
        getSubGroupDataSource: function()
        {
            return this.state[this.deviceGroupsRowIdx].subGroupResources;
        },
        getDeviceGroupDataSource: function()
        {
            return this.state;
        },
    },

    mutations: {
        selectDeviceGroup: function(state, dataRowIdx)
        {
            state.deviceGroupsRowIdx = dataRowIdx;
        }
    },

    actions: {
        selectDeviceGroup: function(context, dataRowIdx)
        {
            context.commit("selectDeviceGroup", dataRowIdx);
        },
        getDeviceGroupList: function()
        {
            
        }
    }
};

export default deviceGroupList;