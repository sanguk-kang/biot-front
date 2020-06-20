define("operation/schedule/model", function(){
	"use strict";

	var moment = window.moment;

	var MAX_END_DATE_YEAR = 2099;
	var MAX_END_DATE_MONTH = 12;
	var MAX_END_DATE_DAY = 31;
	var MAX_END_DATE = "2099-12-31";

	var MockGetAllSchedules = [
		{
		  "id": 5,
		  "name": "schedule_1_folder1",
		  "type": "Schedule",
		  "description": "asdada",
		  "level": 1,
		  "schedules_folders_id": 4,
		  "activated": true,
		  "created": {
				"date": "2019-05-27T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "updated": {
				"date": "2019-05-27T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "startDate": "2019-05-27",
		  "endDate": "2019-06-27",
		  "exceptionalDays": [
				{
			  "startDate": "2017-03-10",
			  "endDate": "2017-06-15",
			  "name": "holiday",
			  "description": "holiday week"
				},
				{
			  "startDate": "2017-07-30",
			  "endDate": "2017-08-15",
			  "name": "vacation"
				}
		  ],
		  "devices": [
				{
			  "dms_devices_id": "AHU_0002",
			  "dms_devices_name": "energy_test_AHU_0002",
			  "dms_devices_type": "AirConditioner.AHU",
			  "location": "Building A, B98"
				},
				{
			  "dms_devices_id": "Chiller_0002",
			  "dms_devices_name": "energy_test_Chiller_0002",
			  "dms_devices_type": "AirConditioner.Chiller",
			  "location": "Building A, B98"
				}
		  ],
		  "configurations": [
				{
			  "daysOfWeek": [
						"Mon",
						"Tue",
						"Wed",
						"Thu"
			  ],
			  "executionTimes": [
						"00:03:00",
						"00:04:00",
						"00:05:00"
			  ],
			  "deviceTypes": [
						{
				  "dms_devices_type": "AirConditioner.Indoor",
				  "control": {
								"modes": [
					  {
										"id": "AirConditioner.Indoor.General",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"mode": "Standard"
					  }
								],
								"operations": [
					  {
										"id": "AirConditioner.Indoor.General",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"power": "On"
					  }
								],
								"temperatures": [
					  {
										"id": "AirConditioner.Indoor.Room",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.WaterOutlet",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"desired": 25
					  }
								]
				  }
						}
			  ],
			  "algorithm": {
						"enabled": true,
						"mode": "PreCooling",
						"preCoolingTemperature": 24
			  }
				},
				{
			  "executionTimes": [
						"00:11:00",
						"00:12:00",
						"00:13:00"
			  ],
			  "daysOfWeek": [
						"Mon",
						"Tue",
						"Wed"
			  ],
			  "deviceTypes": [
						{
				  "dms_devices_type": "AirConditioner.Indoor",
				  "control": {
								"modes": [
					  {
										"id": "AirConditioner.Indoor.General",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"mode": "Standard"
					  }
								],
								"operations": [
					  {
										"id": "AirConditioner.Indoor.General",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"power": "On"
					  }
								],
								"temperatures": [
					  {
										"id": "AirConditioner.Indoor.Room",
										"desired": 27
					  },
					  {
										"id": "AirConditioner.Indoor.WaterOutlet",
										"desired": 28
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"desired": 30
					  }
								]
				  }
						}
			  ],
			  "algorithm": {
						"enabled": true,
						"mode": "PreCooling",
						"preCoolingTemperature": 24
			  }
				}
		  ]
		},
		{
		  "id": 7,
		  "name": "schedule_2_folder1",
		  "type": "Schedule",
		  "description": "hjh",
		  "level": 1,
		  "activated": true,
		  "schedules_folders_id": 4,
		  "created": {
				"date": "2019-05-27T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "updated": {
				"date": "2019-05-29T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "devices": [
				{
			  "dms_devices_id": "DuctFresh_0002",
			  "dms_devices_name": "energy_test_DuctFresh_0002",
			  "dms_devices_type": "AirConditioner.DuctFresh",
			  "location": "Building A, B98"
				},
				{
			  "dms_devices_id": "EHS_0002",
			  "dms_devices_name": "energy_test_EHS_0002",
			  "dms_devices_type": "AirConditioner.EHS",
			  "location": "Building A, B98"
				},
				{
			  "dms_devices_id": "ERVPlus_0002",
			  "dms_devices_name": "energy_test_ERVPlus_0002",
			  "dms_devices_type": "AirConditioner.ERVPlus",
			  "location": "Building A, 8F"
				},
				{
			  "dms_devices_id": "FCU_0002",
			  "dms_devices_name": "energy_test_FCU_0002",
			  "dms_devices_type": "AirConditioner.FCU",
			  "location": "Building A, 10F"
				},
				{
			  "dms_devices_id": "d101077",
			  "dms_devices_name": "light_test101077",
			  "dms_devices_type": "Light",
			  "location": "Building A, B98"
				},
				{
			  "dms_devices_id": "indoor_0006",
			  "dms_devices_name": "energy_test_indoor_0006",
			  "dms_devices_type": "AirConditioner.Indoor",
			  "location": "Building A, 10F"
				},
				{
			  "dms_devices_id": "indoor_0007",
			  "dms_devices_name": "energy_test_indoor_0007",
			  "dms_devices_type": "AirConditioner.Indoor",
			  "location": "Building A, 10F"
				}
		  ],
		  "configurations": [
				{
			  "daysOfWeek": [
						"Mon",
						"Tue",
						"Wed",
						"Thu"
			  ],
			  "executionTimes": [
						"01:03:00",
						"02:03:00",
						"03:03:00"
			  ],
			  "deviceTypes": [
						{
				  "dms_devices_type": "AirConditioner.Indoor",
				  "control": {
								"modes": [
					  {
										"id": "AirConditioner.Indoor.General",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"mode": "Standard"
					  }
								],
								"operations": [
					  {
										"id": "AirConditioner.Indoor.General",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"power": "On"
					  }
								],
								"temperatures": [
					  {
										"id": "AirConditioner.Indoor.Room",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.WaterOutlet",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"desired": 25
					  }
								]
				  }
						},
						{
				  "dms_devices_type": "Light",
				  "control": {
								"operations": [
					  {
										"id": "General",
										"power": "On"
					  }
								],
								"lights": [
					  {
										"id": 1,
										"dimmingLevel": 80
					  }
								]
				  }
						},
						{
				  "dms_devices_type": "ControlPoint.AO",
				  "control": {
								"controlPoint": {
					  "value": 3
								}
				  }
						},
						{
				  "dms_devices_type": "ControlPoint.DO",
				  "control": {
								"controlPoint": {
					  "value": 1
								}
				  }
						}
			  ],
			  "algorithm": {
						"enabled": true,
						"mode": "PreCooling",
						"preCoolingTemperature": 24
			  }
				},
				{
			  "executionTimes": [
						"04:03:00",
						"05:03:00",
						"06:03:00"
			  ],
			  "daysOfWeek": [
						"Mon",
						"Tue",
						"Wed"
			  ],
			  "deviceTypes": [
						{
				  "dms_devices_type": "AirConditioner.Indoor",
				  "control": {
								"modes": [
					  {
										"id": "AirConditioner.Indoor.General",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"mode": "Auto"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"mode": "Standard"
					  }
								],
								"operations": [
					  {
										"id": "AirConditioner.Indoor.General",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.Ventilator",
										"power": "On"
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"power": "On"
					  }
								],
								"temperatures": [
					  {
										"id": "AirConditioner.Indoor.Room",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.WaterOutlet",
										"desired": 24
					  },
					  {
										"id": "AirConditioner.Indoor.DHW",
										"desired": 25
					  }
								]
				  }
						},
						{
				  "dms_devices_type": "Light",
				  "control": {
								"operations": [
					  {
										"id": "General",
										"power": "On"
					  }
								],
								"lights": [
					  {
										"id": 1,
										"dimmingLevel": 80
					  }
								]
				  }
						},
						{
				  "dms_devices_type": "ControlPoint.AO",
				  "control": {
								"controlPoint": {
					  "value": 3
								}
				  }
						},
						{
				  "dms_devices_type": "ControlPoint.DO",
				  "control": {
								"controlPoint": {
					  "value": 1
								}
				  }
						}
			  ],
			  "algorithm": {
						"enabled": true,
						"mode": "PreCooling",
						"preCoolingTemperature": 24
			  }
				}
		  ]
		},
		{
			"id": 9,
			"name": "schedule_3_folder1",
			"type": "Schedule",
			"description": "asdada",
			"level": 1,
			"schedules_folders_id": 4,
			"activated": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-06-01T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"startDate": "2019-05-27",
			"endDate": "2019-06-27",
			"exceptionalDays": [
				  {
					"startDate": "2017-03-10",
					"endDate": "2017-06-15",
					"name": "holiday",
					"description": "holiday week"
				  },
				  {
					"startDate": "2017-07-30",
					"endDate": "2017-08-15",
					"name": "vacation"
				  }
			],
			"devices": [
				  {
					"dms_devices_id": "indoor_0008",
					"dms_devices_name": "energy_test_indoor_0008",
					"dms_devices_type": "AirConditioner.Indoor",
					"location": "Building A, B98"
				  },
				  {
					"dms_devices_id": "indoor_0009",
					"dms_devices_name": "energy_test_indoor_0009",
					"dms_devices_type": "AirConditioner.Indoor",
					"location": "Building A, B98"
				  }
			],
			"configurations": [
				  {
					"daysOfWeek": [
						  "Mon",
						  "Tue"
					],
					"executionTimes": [
						  "00:03:00"
					],
					"deviceTypes": [
						  {
							"dms_devices_type": "AirConditioner.Indoor",
							"control": {
								  "modes": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "mode": "Standard"
									}
								  ],
								  "operations": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "power": "On"
									}
								  ],
								  "temperatures": [
									{
										  "id": "AirConditioner.Indoor.Room",
										  "desired": 24
									},
									{
										  "id": "AirConditioner.Indoor.WaterOutlet",
										  "desired": 24
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "desired": 25
									}
								  ]
							}
						  }
					],
					"algorithm": {
						  "enabled": true,
						  "mode": "PreCooling",
						  "preCoolingTemperature": 24
					}
				  }
			]
		  },
		  {
			"id": 13,
			"name": "schedule_4_folder1",
			"type": "Schedule",
			"description": "asdada",
			"level": 1,
			"schedules_folders_id": 7,
			"activated": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-06-11T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"startDate": "2019-05-27",
			"endDate": "2019-06-27",
			"exceptionalDays": [
				  {
					"startDate": "2017-03-10",
					"endDate": "2017-06-15",
					"name": "holiday",
					"description": "holiday week"
				  },
				  {
					"startDate": "2017-07-30",
					"endDate": "2017-08-15",
					"name": "vacation"
				  }
			],
			"devices": [
				  {
					"dms_devices_id": "indoor_0008",
					"dms_devices_name": "energy_test_indoor_0008",
					"dms_devices_type": "AirConditioner.Indoor",
					"location": "Building A, B98"
				  },
				  {
					"dms_devices_id": "indoor_0009",
					"dms_devices_name": "energy_test_indoor_0009",
					"dms_devices_type": "AirConditioner.Indoor",
					"location": "Building A, B98"
				  }
			],
			"configurations": [
				  {
					"daysOfWeek": [
						  "Mon",
						  "Tue"
					],
					"executionTimes": [
						  "00:03:00"
					],
					"deviceTypes": [
						  {
							"dms_devices_type": "AirConditioner.Indoor",
							"control": {
								  "modes": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "mode": "Standard"
									}
								  ],
								  "operations": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "power": "On"
									}
								  ],
								  "temperatures": [
									{
										  "id": "AirConditioner.Indoor.Room",
										  "desired": 24
									},
									{
										  "id": "AirConditioner.Indoor.WaterOutlet",
										  "desired": 24
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "desired": 25
									}
								  ]
							}
						  }
					],
					"algorithm": {
						  "enabled": true,
						  "mode": "PreCooling",
						  "preCoolingTemperature": 24
					}
				  }
			]
		  },
		  {
			"id": 14,
			"name": "schedule_5_folder1",
			"type": "Schedule",
			"description": "asdada",
			"level": 1,
			"schedules_folders_id": 7,
			"activated": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-06-18T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"startDate": "2019-11-27",
			"endDate": "2019-12-27",
			"exceptionalDays": [
				  {
					"startDate": "2017-03-10",
					"endDate": "2017-06-15",
					"name": "holiday",
					"description": "holiday week"
				  },
				  {
					"startDate": "2017-07-30",
					"endDate": "2017-08-15",
					"name": "vacation"
				  }
			],
			"devices": [
				  {
					"dms_devices_id": "AHU_0001",
					"dms_devices_name": "energy_test_AHU_0001",
					"dms_devices_type": "AirConditioner.AHU",
					"location": "Building A, 8F"
				  },
				  {
					"dms_devices_id": "Chiller_0001",
					"dms_devices_name": "energy_test_Chiller_0001",
					"dms_devices_type": "AirConditioner.Chiller",
					"location": "Building A, B98"
				  }
			],
			"configurations": [
				  {
					"daysOfWeek": [
						  "Mon",
						  "Tue"
					],
					"executionTimes": [
						  "00:03:00"
					],
					"deviceTypes": [
						  {
							"dms_devices_type": "AirConditioner.Indoor",
							"control": {
								  "modes": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "mode": "Standard"
									}
								  ],
								  "operations": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "power": "On"
									}
								  ],
								  "temperatures": [
									{
										  "id": "AirConditioner.Indoor.Room",
										  "desired": 33
									},
									{
										  "id": "AirConditioner.Indoor.WaterOutlet",
										  "desired": 30
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "desired": 27
									}
								  ]
							}
						  }
					],
					"algorithm": {
						  "enabled": true,
						  "mode": "PreCooling",
						  "preCoolingTemperature": 24
					}
				  }
			]
		  },
		  {
			"id": 20,
			"name": "schedule_6",
			"type": "Schedule",
			"description": "asdada",
			"level": 1,
			"activated": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-06-07T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"startDate": "2019-11-27",
			"endDate": "2019-12-27",
			"exceptionalDays": [
				  {
					"startDate": "2017-03-10",
					"endDate": "2017-06-15",
					"name": "holiday",
					"description": "holiday week"
				  },
				  {
					"startDate": "2017-07-30",
					"endDate": "2017-08-15",
					"name": "vacation"
				  }
			],
			"devices": [
				  {
					"dms_devices_id": "AHU_0001",
					"dms_devices_name": "energy_test_AHU_0001",
					"dms_devices_type": "AirConditioner.AHU",
					"location": "Building A, 8F"
				  },
				  {
					"dms_devices_id": "Chiller_0001",
					"dms_devices_name": "energy_test_Chiller_0001",
					"dms_devices_type": "AirConditioner.Chiller",
					"location": "Building A, B98"
				  }
			],
			"configurations": [
				  {
					"daysOfWeek": [
						  "Mon",
						  "Tue"
					],
					"executionTimes": [
						  "00:03:00"
					],
					"deviceTypes": [
						  {
							"dms_devices_type": "AirConditioner.Indoor",
							"control": {
								  "modes": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "mode": "Standard"
									}
								  ],
								  "operations": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "power": "On"
									}
								  ],
								  "temperatures": [
									{
										  "id": "AirConditioner.Indoor.Room",
										  "desired": 33
									},
									{
										  "id": "AirConditioner.Indoor.WaterOutlet",
										  "desired": 30
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "desired": 27
									}
								  ]
							}
						  }
					],
					"algorithm": {
						  "enabled": true,
						  "mode": "PreCooling",
						  "preCoolingTemperature": 24
					}
				  }
			]
		  },
		  {
			"id": 21,
			"name": "schedule_7",
			"type": "Schedule",
			"description": "asdada",
			"level": 1,
			"activated": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-11-06T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"startDate": "2019-11-27",
			"endDate": "2019-12-27",
			"exceptionalDays": [
				  {
					"startDate": "2017-03-10",
					"endDate": "2017-06-15",
					"name": "holiday",
					"description": "holiday week"
				  },
				  {
					"startDate": "2017-07-30",
					"endDate": "2017-08-15",
					"name": "vacation"
				  }
			],
			"devices": [
				  {
					"dms_devices_id": "AHU_0001",
					"dms_devices_name": "energy_test_AHU_0001",
					"dms_devices_type": "AirConditioner.AHU",
					"location": "Building A, 8F"
				  },
				  {
					"dms_devices_id": "Chiller_0001",
					"dms_devices_name": "energy_test_Chiller_0001",
					"dms_devices_type": "AirConditioner.Chiller",
					"location": "Building A, B98"
				  }
			],
			"configurations": [
				  {
					"daysOfWeek": [
						  "Mon",
						  "Tue"
					],
					"executionTimes": [
						  "00:03:00"
					],
					"deviceTypes": [
						  {
							"dms_devices_type": "AirConditioner.Indoor",
							"control": {
								  "modes": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "mode": "Auto"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "mode": "Standard"
									}
								  ],
								  "operations": [
									{
										  "id": "AirConditioner.Indoor.General",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.Ventilator",
										  "power": "On"
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "power": "On"
									}
								  ],
								  "temperatures": [
									{
										  "id": "AirConditioner.Indoor.Room",
										  "desired": 33
									},
									{
										  "id": "AirConditioner.Indoor.WaterOutlet",
										  "desired": 30
									},
									{
										  "id": "AirConditioner.Indoor.DHW",
										  "desired": 27
									}
								  ]
							}
						  }
					],
					"algorithm": {
						  "enabled": true,
						  "mode": "PreCooling",
						  "preCoolingTemperature": 24
					}
				  }
			]
		  }
	  ];

	var MockGetAllFoldersSchedules = [
		{
		  "id": 4,
		  "name": "folder1",
		  "type": "Folder",
		  "description": "desc_folder1",
		  "level": 0,
		  "collapsed": true,
		  "created": {
				"date": "2019-05-27T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "updated": {
				"date": "2019-05-27T15:55:51+05:30",
				"ums_users_name": "Web Admin"
		  },
		  "schedules": [
				{
			  "id": 5,
			  "name": "schedule_1_folder1",
			  "type": "Schedule",
			  "description": "asdada",
			  "level": 1,
			  "schedules_folders_id": 4,
			  "activated": true,
			  "created": {
						"date": "2019-05-27T15:55:51+05:30",
						"ums_users_name": "Web Admin"
			  },
			  "updated": {
						"date": "2019-05-27T15:55:51+05:30",
						"ums_users_name": "Web Admin"
			  },
			  "startDate": "2019-05-27",
			  "endDate": "2019-06-27",
			  "exceptionalDays": [
						{
				  "startDate": "2017-03-10",
				  "endDate": "2017-06-15",
				  "name": "holiday",
				  "description": "holiday week"
						},
						{
				  "startDate": "2017-07-30",
				  "endDate": "2017-08-15",
				  "name": "vacation"
						}
			  ],
			  "devices": [
						{
				  "dms_devices_id": "DuctFresh_0001",
				  "dms_devices_name": "energy_test_DuctFresh_0001",
				  "dms_devices_type": "AirConditioner.DuctFresh",
				  "location": "Building A, 8F"
						},
						{
				  "dms_devices_id": "EHS_0001",
				  "dms_devices_name": "energy_test_EHS_0001",
				  "dms_devices_type": "AirConditioner.EHS",
				  "location": "Building A, 9F"
						}
			  ],
			  "configurations": [
						{
				  "daysOfWeek": [
								"Mon",
								"Tue",
								"Wed",
								"Thu"
				  ],
				  "executionTimes": [
								"00:03:00",
								"00:03:00",
								"00:03:00"
				  ],
				  "deviceTypes": [
								{
					  "dms_devices_type": "AirConditioner.Indoor",
					  "control": {
										"modes": [
						  {
												"id": "AirConditioner.Indoor.General",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"mode": "Standard"
						  }
										],
										"operations": [
						  {
												"id": "AirConditioner.Indoor.General",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"power": "On"
						  }
										],
										"temperatures": [
						  {
												"id": "AirConditioner.Indoor.Room",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.WaterOutlet",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"desired": 25
						  }
										]
					  }
								}
				  ],
				  "algorithm": {
								"enabled": true,
								"mode": "PreCooling",
								"preCoolingTemperature": 24
				  }
						},
						{
				  "executionTimes": [
								"00:03:00",
								"00:03:00",
								"00:03:00"
				  ],
				  "daysOfWeek": [
								"Mon",
								"Tue",
								"Wed"
				  ],
				  "deviceTypes": [
								{
					  "dms_devices_type": "AirConditioner.Indoor",
					  "control": {
										"modes": [
						  {
												"id": "AirConditioner.Indoor.General",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"mode": "Standard"
						  }
										],
										"operations": [
						  {
												"id": "AirConditioner.Indoor.General",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"power": "On"
						  }
										],
										"temperatures": [
						  {
												"id": "AirConditioner.Indoor.Room",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.WaterOutlet",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"desired": 25
						  }
										]
					  }
								}
				  ],
				  "algorithm": {
								"enabled": true,
								"mode": "PreCooling",
								"preCoolingTemperature": 24
				  }
						}
			  ]
				},
				{
			  "id": 7,
			  "name": "schedule_2_folder1",
			  "type": "Schedule",
			  "description": "hjh",
			  "level": 1,
			  "schedules_folders_id": 4,
			  "created": {
						"date": "2019-05-27T15:55:51+05:30",
						"ums_users_name": "Web Admin"
			  },
			  "updated": {
						"date": "2019-05-27T15:55:51+05:30",
						"ums_users_name": "Web Admin"
			  },
			  "devices": [
						{
				  "dms_devices_id": "ERV_0001",
				  "dms_devices_name": "energy_test_ERV_0001",
				  "dms_devices_type": "AirConditioner.ERV",
				  "location": "Building A, 8F"
						},
						{
				  "dms_devices_id": "ERVPlus_0001",
				  "dms_devices_name": "energy_test_ERVPlus_0001",
				  "dms_devices_type": "AirConditioner.ERVPlus",
				  "location": "Building A, 9F"
						},
						{
				  "dms_devices_id": "FCU_0001",
				  "dms_devices_name": "energy_test_FCU_0001",
				  "dms_devices_type": "AirConditioner.FCU",
				  "location": "Building A, 8F"
						},
						{
				  "dms_devices_id": "indoor_0001",
				  "dms_devices_name": "energy_test_indoor_0001",
				  "dms_devices_type": "AirConditioner.Indoor",
				  "location": "Building A, 10F"
						},
						{
				  "dms_devices_id": "indoor_0002",
				  "dms_devices_name": "energy_test_indoor_0002",
				  "dms_devices_type": "AirConditioner.Indoor",
				  "location": "Building A, 9F"
						},
						{
				  "dms_devices_id": "indoor_0003",
				  "dms_devices_name": "energy_test_indoor_0003",
				  "dms_devices_type": "AirConditioner.Indoor",
				  "location": "Building A, 10F"
						},
						{
				  "dms_devices_id": "indoor_0004",
				  "dms_devices_name": "energy_test_indoor_0004",
				  "dms_devices_type": "AirConditioner.Indoor",
				  "location": "Building A, 10F"
						}
			  ],
			  "configurations": [
						{
				  "daysOfWeek": [
								"Mon",
								"Tue",
								"Wed",
								"Thu"
				  ],
				  "executionTimes": [
								"00:03:00",
								"00:03:00",
								"00:03:00"
				  ],
				  "deviceTypes": [
								{
					  "dms_devices_type": "AirConditioner.Indoor",
					  "control": {
										"modes": [
						  {
												"id": "AirConditioner.Indoor.General",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"mode": "Standard"
						  }
										],
										"operations": [
						  {
												"id": "AirConditioner.Indoor.General",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"power": "On"
						  }
										],
										"temperatures": [
						  {
												"id": "AirConditioner.Indoor.Room",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.WaterOutlet",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"desired": 25
						  }
										]
					  }
								},
								{
					  "dms_devices_type": "Light",
					  "control": {
										"operations": [
						  {
												"id": "General",
												"power": "On"
						  }
										],
										"lights": [
						  {
												"id": 1,
												"dimmingLevel": 80
						  }
										]
					  }
								},
								{
					  "dms_devices_type": "ControlPoint.AO",
					  "control": {
										"controlPoint": {
						  "value": 3
										}
					  }
								},
								{
					  "dms_devices_type": "ControlPoint.DO",
					  "control": {
										"controlPoint": {
						  "value": 1
										}
					  }
								}
				  ],
				  "algorithm": {
								"enabled": true,
								"mode": "PreCooling",
								"preCoolingTemperature": 24
				  }
						},
						{
				  "executionTimes": [
								"00:03:00",
								"00:03:00",
								"00:03:00"
				  ],
				  "daysOfWeek": [
								"Mon",
								"Tue",
								"Wed"
				  ],
				  "deviceTypes": [
								{
					  "dms_devices_type": "AirConditioner.Indoor",
					  "control": {
										"modes": [
						  {
												"id": "AirConditioner.Indoor.General",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"mode": "Auto"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"mode": "Standard"
						  }
										],
										"operations": [
						  {
												"id": "AirConditioner.Indoor.General",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.Ventilator",
												"power": "On"
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"power": "On"
						  }
										],
										"temperatures": [
						  {
												"id": "AirConditioner.Indoor.Room",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.WaterOutlet",
												"desired": 24
						  },
						  {
												"id": "AirConditioner.Indoor.DHW",
												"desired": 25
						  }
										]
					  }
								},
								{
					  "dms_devices_type": "Light",
					  "control": {
										"operations": [
						  {
												"id": "General",
												"power": "On"
						  }
										],
										"lights": [
						  {
												"id": 1,
												"dimmingLevel": 80
						  }
										]
					  }
								},
								{
					  "dms_devices_type": "ControlPoint.AO",
					  "control": {
										"controlPoint": {
						  "value": 3
										}
					  }
								},
								{
					  "dms_devices_type": "ControlPoint.DO",
					  "control": {
										"controlPoint": {
						  "value": 1
										}
					  }
								}
				  ],
				  "algorithm": {
								"enabled": true,
								"mode": "PreCooling",
								"preCoolingTemperature": 24
				  }
						}
			  ]
				}
		  ]
		},
		{
			"id": 7,
			"name": "folder2",
			"type": "Folder",
			"description": "desc_folder2",
			"level": 0,
			"collapsed": true,
			"created": {
				  "date": "2019-05-27T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"updated": {
				  "date": "2019-10-01T15:55:51+05:30",
				  "ums_users_name": "Web Admin"
			},
			"schedules": [
				{
					"id": 13,
					"name": "schedule_4_folder1",
					"type": "Schedule",
					"description": "asdada",
					"level": 1,
					"schedules_folders_id": 7,
					"activated": true,
					"created": {
						  "date": "2019-05-27T15:55:51+05:30",
						  "ums_users_name": "Web Admin"
					},
					"updated": {
						  "date": "2019-10-01T15:55:51+05:30",
						  "ums_users_name": "Web Admin"
					},
					"startDate": "2019-05-27",
					"endDate": "2019-06-27",
					"exceptionalDays": [
						  {
							"startDate": "2017-03-10",
							"endDate": "2017-06-15",
							"name": "holiday",
							"description": "holiday week"
						  },
						  {
							"startDate": "2017-07-30",
							"endDate": "2017-08-15",
							"name": "vacation"
						  }
					],
					"devices": [
						  {
							"dms_devices_id": "indoor_0008",
							"dms_devices_name": "energy_test_indoor_0008",
							"dms_devices_type": "AirConditioner.Indoor",
							"location": "Building A, B98"
						  },
						  {
							"dms_devices_id": "indoor_0009",
							"dms_devices_name": "energy_test_indoor_0009",
							"dms_devices_type": "AirConditioner.Indoor",
							"location": "Building A, B98"
						  }
					],
					"configurations": [
						  {
							"daysOfWeek": [
								  "Mon",
								  "Tue"
							],
							"executionTimes": [
								  "00:03:00"
							],
							"deviceTypes": [
								  {
									"dms_devices_type": "AirConditioner.Indoor",
									"control": {
										  "modes": [
											{
												  "id": "AirConditioner.Indoor.General",
												  "mode": "Auto"
											},
											{
												  "id": "AirConditioner.Indoor.Ventilator",
												  "mode": "Auto"
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "mode": "Standard"
											}
										  ],
										  "operations": [
											{
												  "id": "AirConditioner.Indoor.General",
												  "power": "On"
											},
											{
												  "id": "AirConditioner.Indoor.Ventilator",
												  "power": "On"
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "power": "On"
											}
										  ],
										  "temperatures": [
											{
												  "id": "AirConditioner.Indoor.Room",
												  "desired": 24
											},
											{
												  "id": "AirConditioner.Indoor.WaterOutlet",
												  "desired": 24
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "desired": 25
											}
										  ]
									}
								  }
							],
							"algorithm": {
								  "enabled": true,
								  "mode": "PreCooling",
								  "preCoolingTemperature": 24
							}
						  }
					]
				  },
				  {
					"id": 14,
					"name": "schedule_5_folder1",
					"type": "Schedule",
					"description": "asdada",
					"level": 1,
					"schedules_folders_id": 7,
					"activated": true,
					"created": {
						  "date": "2019-05-27T15:55:51+05:30",
						  "ums_users_name": "Web Admin"
					},
					"updated": {
						  "date": "2019-05-27T15:55:51+05:30",
						  "ums_users_name": "Web Admin"
					},
					"startDate": "2019-11-27",
					"endDate": "2019-12-27",
					"exceptionalDays": [
						  {
							"startDate": "2017-03-10",
							"endDate": "2017-06-15",
							"name": "holiday",
							"description": "holiday week"
						  },
						  {
							"startDate": "2017-07-30",
							"endDate": "2017-08-15",
							"name": "vacation"
						  }
					],
					"devices": [
						  {
							"dms_devices_id": "AHU_0001",
							"dms_devices_name": "energy_test_AHU_0001",
							"dms_devices_type": "AirConditioner.AHU",
							"location": "Building A, 8F"
						  },
						  {
							"dms_devices_id": "Chiller_0001",
							"dms_devices_name": "energy_test_Chiller_0001",
							"dms_devices_type": "AirConditioner.Chiller",
							"location": "Building A, B98"
						  }
					],
					"configurations": [
						  {
							"daysOfWeek": [
								  "Mon",
								  "Tue"
							],
							"executionTimes": [
								  "00:03:00"
							],
							"deviceTypes": [
								  {
									"dms_devices_type": "AirConditioner.Indoor",
									"control": {
										  "modes": [
											{
												  "id": "AirConditioner.Indoor.General",
												  "mode": "Auto"
											},
											{
												  "id": "AirConditioner.Indoor.Ventilator",
												  "mode": "Auto"
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "mode": "Standard"
											}
										  ],
										  "operations": [
											{
												  "id": "AirConditioner.Indoor.General",
												  "power": "On"
											},
											{
												  "id": "AirConditioner.Indoor.Ventilator",
												  "power": "On"
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "power": "On"
											}
										  ],
										  "temperatures": [
											{
												  "id": "AirConditioner.Indoor.Room",
												  "desired": 33
											},
											{
												  "id": "AirConditioner.Indoor.WaterOutlet",
												  "desired": 30
											},
											{
												  "id": "AirConditioner.Indoor.DHW",
												  "desired": 27
											}
										  ]
									}
								  }
							],
							"algorithm": {
								  "enabled": true,
								  "mode": "PreCooling",
								  "preCoolingTemperature": 24
							}
						  }
					]
				  }
			]
		  },
		{
			"id": 25,
			"name": "Light list no schedule",
			"type": "Folder",
			"level": 0,
			"collapsed": false,
			"created": {
				"date": "2019-09-05T19:22:19+05:30",
				"ums_users_name": "Web Admin"
			},
			"updated": {
				"date": "2019-09-05T19:22:19+05:30",
				"ums_users_name": "Web Admin"
			}
		}
	  ];

	var FolderMockData = [{id:'1', name:'folder_A', updated: {date: '2018-08-16T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'2', name:'folder_B', updated: {date: '2018-08-17T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'3', name:'folder_C', updated: {date: '2018-08-18T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'4', name:'folder_D', updated: {date: '2018-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'5', name:'폴더_가', updated: {date: '2018-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'6', name:'폴더_나', updated: {date: '2018-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'7', name:'새폴더', updated: {date: '2017-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'8', name:'Newfolder', updated: {date: '2017-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'9', name:'Newfolder (1)', updated: {date: '2017-08-19T18:54:04+09:00'}, schedules_ids: [1, 2, 3] },
		{id:'10', name:'Empty folder', updated: {date: '2017-09-19T18:54:04+09:00'}, schedules_ids: [] }
	];

	var kendo = window.kendo;
	var ScheduleModel = kendo.data.Model.define({
		id: "id",
		fields: {
			name: {
				name: "Name"
			},
			description : {
				name: "Description"
			},
			activated : {
				name : "Activation",
				type : "boolean"
			},
			startDate : {
				name : "Start Date",
				type : "date"
			},
			endDate : {
				name : "End Date",
				type : "date"
			},
			exceptionalDays : {
				name : "Execeptional Days",
				type : "object",
				defaultValue : []
			},
			devices : {
				name : "Devices",
				type : "object",
				defaultValue : []
			},
			configurations : {
				name : "Configurations",
				type : "object",
				defaultValue : []
			},
			folder: {
				name: "Folder",
				type: "object",
				defaultValue : {}
			}
		}
	});

	var ScheduleConfigurationModel = kendo.data.Model.define({
		daysOfWeek : {
			name : "Repeat Days",
			type : "object",
			defaultValue : []
		},
		executionTimes : {
			name : "Execution Time",
			type : "object",
			defaultValue : []
		},
		deviceTypes : {
			name : "Operations",
			type : "object",
			defaultValue : {}
		},
		algorithm : {
			name : "Algorithm",
			type : "object",
			defaultValue : {}
		}
	});

	var ExceptionalDaysModel = kendo.data.Model.define({
		id : "id",
		fields : {
			name : { type : "string" },
			description : { type : "string "},
			startDate : { type : "string" },
			endDate : { type : "string" },
			repeatYear: { type: "boolean" }
		}
	});

	//[13-04-2018]안쓰는 코드 주석 : model, exceptionalDays -jw.lim
	// var createDataSource = function(list, model, exceptionalDays){
	var createDataSource = function(list, folderData){
		var i, max = list.length;
		var item, folderItem;

		for( i = 0; i < max; i++ ){
			item = list[i];
			if (item.startDate) {
				item.startDate = setDate(item.startDate);
			} else {
				item.startDate = setDate(item.created.date);
			}

			if(item.endDate){
				item.endDate = setDate(item.endDate, true);
			}else{
				var d = new Date();
				d.setFullYear(MAX_END_DATE_YEAR);
				item.endDate = d;
			}
			if(!item.deviceTypes){
				item.deviceTypes = [];
			}
			// item.executionTimes.sort();
			// setdaysOfWeek(item, item.daysOfWeek);
			// setExceptionalDays(item, item.exceptionalDays);
			setDeviceType(item, item.devices);
			item.checked = false;
			//setException(item, exceptionalDays);

			if (folderData) {
				folderItem = folderData.filter(function(listItem) { return listItem.id === item.schedules_folders_id; });
				item.folder = folderItem[0] || {};
			}
		}
		return list;
	};

	var FolderModel = kendo.data.Model.define({
		id : "id",
		fields : {
			name : { type : "string" },
			collapsed: { type: "object"},
			created: { type: "object"},
			updated: { type: "object"}
		}
	});

	var createFolderDataSource = function(list) {
		var i, max = list.length;
		var item;
		var folders = [];

		for( i = 0; i < max; i++ ){
			item = list[i];
			if(item.type == 'Folder') {
				folders.push(new FolderModel(item));
			}
		}
		return folders;
	};

	var applyModel = function(list){
		var i, max = list.length;
		for( i = 0; i < max; i++ ){
			list[i] = new ScheduleModel(list[i]);
		}
		return list;
	};

	/*var removeDuplicate = function(list){
		var i, item, max = list.length;
		var j, length = list.length;
		for( i = 0; i < max; i++ ){
			item = list[i];
			for( j = length-1; j < length; j++ ){
				if(item[])
			}
		}
	};*/

	var setDate = function(date, isEndDate){
		var d = new Date(date);
		if(isEndDate){
			d.setHours(23);
			d.setSeconds(59);
			d.setMinutes(59);
		}else{
			d.setHours(0);
			d.setSeconds(0);
			d.setMinutes(0);
		}
		return d;
	};

	var applyExecutionTimesDs = function(scheduleDs){
		var data = scheduleDs.data();
		var i, max = data.length;
		for( i = 0; i < max; i++ ){
			applyExecutionTimes(data[i]);
		}
	};

	var applyExecutionTimes = function(event){
		var executionTime = event.executionTimes.sort()[0];
		executionTime = executionTime ? executionTime : "00:00:00";
		var executionStart = new Date(event.start);
		var split = executionTime.split(":");
		executionStart.setHours(split[0]);
		executionStart.setMinutes(split[1]);
		executionStart.setSeconds(split[2]);
		var executionEnd = new Date(executionStart);
		executionEnd.setMinutes(executionEnd.getMinutes() + 30);
		event.start = executionStart;
		event.end = executionEnd;
	};

	var createExceptionalDs = function(list){
		var i, max = list.length;
		var item;
		for( i = 0; i < max; i++ ){
			item = list[i];
			item.startDate = setDate(item.startDate);
			item.endDate = setDate(item.endDate, true);
		}
		return list;
	};

	var createExceptionalDaysByRepeatYear = function(list) {
		var result = {};
		var addExceptionalDaysByRepeatYear = function(exceptionalDay) {
			var startDate = moment(exceptionalDay.startDate);
			var endDate = moment(exceptionalDay.endDate);
			var exceptionalDaysByRepeatYear = [];
			var i, repeatYear = {
				first: startDate.year(),
				last: endDate.year()
			};
			// 매년 반복 프로퍼티가 활성화 상태라면,
			var max = !exceptionalDay.repeatYear ? repeatYear.last - repeatYear.first + 1 : MAX_END_DATE_YEAR;
			for(i = 0; i < max; i++) {
				var exceptionalDayByRepeatYear = $.extend({}, exceptionalDay);
				exceptionalDayByRepeatYear.startDate = moment(exceptionalDayByRepeatYear.startDate).set('year', startDate.year() + i).toDate();
				exceptionalDayByRepeatYear.endDate = moment(exceptionalDayByRepeatYear.endDate).set('year', endDate.year() + i).toDate();

				var currentDate = exceptionalDayByRepeatYear.startDate;
				while(currentDate <= exceptionalDayByRepeatYear.endDate) {
					result[currentDate.toString()] = true;
					currentDate.setDate(currentDate.getDate() + 1);
				}
			}
		};

		list.forEach(function(listItem){
			addExceptionalDaysByRepeatYear(listItem);
		});

		return result;
	};

	var setDeviceType = function(item, devices){
		if(!item.activated){
			item.type = 5;
			return;
		}

		if(!devices || devices.length < 1){
			return;
		}

		var i, max = devices.length;
		// var device, isPause = false;			//[13-04-2018]안쓰는 코드 주석 -jw.lim
		var hasSacIndoor = false, hasLight = false;
		for( i = 0; i < max; i++ ){
			if(devices[i].dms_devices_type.indexOf("AirConditioner") != -1){
				hasSacIndoor = true;
			}

			if(devices[i].dms_devices_type.indexOf("Light") != -1){
				hasLight = true;
			}
		}

		if(hasSacIndoor && hasLight){
			item.type = 3;
		}else if(hasSacIndoor){
			item.type = 1;
		}else if(hasLight){
			item.type = 2;
		}else{
			item.type = 4;
		}
	};

	var setDays = function(list){
		var startM, startDate;
		var i, max = list.length;

		for( i = 0; i < max; i++ ){
			startDate = list[i].startDate;
			startM = moment(startDate);
			list[i].day = startM.date();
			list[i].month = startM.month() + 1;
			list[i].year = startM.year();
			list[i].dateForCompare = startM.valueOf();
			list[i].checked = false;
			// endDate = list[i].endDate;
			// endM = moment(endDate);
			list[i].dateForCompareEnd = startM.valueOf();
		}
	};

	var createModel = function(data){
		var m = new ScheduleModel(data);

		if(data){
			return m;
		}

		var sd = new Date();
		var ed = new Date(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
		// m.set("startDate", moment(sd).format('YYYY-MM-DD'));
		// m.set("endDate", moment(ed).format('YYYY-MM-DD'));

		m.set("control", {});
		m.set("deviceTypes", []);

		// m.control.set("operation", []);
		// m.control.set("temperatures", []);
		// m.control.set("modes", []);
		// m.control.set("configuration", {});
		//m.control.configuration.set("remoteControl", "None");
		m.startDate = moment(sd).format('YYYY-MM-DD');
		m.endDate = moment(ed).format('YYYY-MM-DD');
		return m;
	};
	var _schedulIdFilter = function(a) { return a.type === "Folder"; };
	var _schedulIdMapping = function(a) { return a.id; };
	var parseFolderModel = function(data) {
		if (!data || data.length === 0) return [];
		var item, schedulesIds, result = [];
		data = data.filter(_schedulIdFilter);
		for(var i = 0, max = data.length; i < max; i++) {
			item = data[i];
			schedulesIds = [];
			if (item.schedules) schedulesIds = item.schedules.map(_schedulIdMapping);
			result.push({
				id: item.id,
				name: item.name,
				updated: item.updated,
				schedules_ids: schedulesIds,
				groupName: item.updated.date + ':id:' + item.id + ':name:' + item.name // 초기화시, 그룹핑 및 업데이트 날짜순 정렬에 사용하는 필드.
			});
		}
		return result;
	};

	return {
		Model : ScheduleModel,
		ExceptionalDaysModel : ExceptionalDaysModel,
		createModel : createModel,
		MockGetAllSchedules: MockGetAllSchedules,
		FolderMockData: FolderMockData,
		createDataSource : createDataSource,
		createFolderDataSource: createFolderDataSource,
		setDays : setDays,
		createExceptionalDs : createExceptionalDs,
		createExceptionalDaysByRepeatYear : createExceptionalDaysByRepeatYear,
		applyExecutionTimesDs : applyExecutionTimesDs,
		applyModel : applyModel,
		MAX_END_DATE_YEAR : MAX_END_DATE_YEAR,
		MAX_END_DATE_MONTH : MAX_END_DATE_MONTH,
		MAX_END_DATE_DAY : MAX_END_DATE_DAY,
		MAX_END_DATE : MAX_END_DATE,
		parseFolderModel: parseFolderModel,
		MockGetAllFoldersSchedules: MockGetAllFoldersSchedules
	};
});

//# sourceURL=facility-schedule/model.js
