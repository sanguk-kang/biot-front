define("energy/samsungsac/sac-algorithm/sac-algorithm-model", function(){
	"use strict";

	var I18N = window.I18N;
	var kendo = window.kendo;

	var i18nLocation = function(val, isCity){
		val = val.replace(/\'/g, "_").replace(/-/g, "_").replace(/ /g, "_").replace(/\./g, "_");
		var i18nVal;
		if(isCity){
			i18nVal = I18N.prop("SETTINGS_ALGORITHM_CITY_" + val.toUpperCase());
		}else{
			i18nVal = I18N.prop("SETTINGS_ALGORITHM_COUNTRY_" + val.toUpperCase());
		}
		val = i18nVal ? i18nVal : val;
		return val;
	};

	var locationDataSource = {"South Korea" : ["Seoul","Busan", "Daejeon", "Incheon", "Daegu", "Gwangju", "Ulsan"],"North Korea" : ["Pyongyang"],"Japan" : ["Fukuoka","Hiroshima","Nagoya","Osaka","Sapporo","Sendai","Tokyo"],"Taiwan" : ["Taipei"],"China" : ["Beijing","Chengdu","Chongqing","Guangzhou","Hangzhou","HongKong","Shanghai","Tianjin","Urumqi","Xian"],"Mongolia" : ["Ulaanbaatar"],"Phillippines" : ["Cebu","Davao","Manila"],"Indonesia" : ["Jakarta","Jayapura","Makassar","Manado","Medan","Merauke"],"Malaysia" : ["Kuala Lumpur"],"Singapore" : ["Singapore"],"Brunei" : ["Brunei"],"Vietnam" : ["Hanoi","Ho Chi Minh City"],"Laos" : ["Vientiane"],"Thailand" : ["Bangkok","Pattaya"],"Cambodia" : ["Phnom Penh"],"Bangladesh" : ["Dhaka"],"Nepal" : ["Kathmandu"],"India" : ["Ahmedabad","Bengaluru","Changdigarh","Chennai","Chhindwara","Hyderabad","Jaipur","Kochi","Kolkata","Lucknow","Mumbai","Mysuru","New Delhi","Pune","Surat"],"Sri Lanka" : ["Colombo"],"Papu New Guinea" : ["Lae","Port Moresby"],"Australia" : ["Adelaide","Alice Springs","Brisbane","Bunbury","Cairns","Canberra","Darwin","Geelong","Geraldton","Gold Coast","Hobart","Mackay","Mandurah","Melbourne","Newcastle","Perth","Sunshine Coast","Sydney","Toowoomba","Townsville"],"New Zealand" : ["Auckland","Christchurch","Dunedin","Hamilton","Invercargill","Nelson","Palmerston North","Queenstown","Rotorua","Tauranga","Welington"],"Pakistan" : ["Islamabad","Karachi","Lahore"],"Afghanistan" : ["Kabul"],"Tajikistan" : ["Dushanbe"],"Uzbekistan" : ["Tashkent"],"Kyrgyzstan" : ["Bishkek"],"Kazakhstan" : ["Almaty","Astana","Karagandy","Pavlodar","Semey","Ust'-Kamenogorsk"],"New Caledonia" : ["Noumea"],"Vanuatu" : ["Port Vila"],"Pitcairn Islands" : ["Adamstown"],"French" : ["Hanga Roa"],"Chilean" : ["Rikitea"],"French Polynesia" : ["Atuona","Taioha'e","Vaitape"],"Kiribati" : ["Napari"],"Nauru" : ["Bairiki","Taburao"],"Marshall Islands" : ["Majuro"],"Russia" : ["Abakan","Achinsk","Aldan","Anadyr","Aykhal","Ayon","Barnaul","Batagay","Belaya Gora","Beringovsky","Biysk","Blagoveshchensk","Bratsk","Chatanga","Chelyabinsk","Chersky","Chita","Chokurdakh","Deputatsky","Dudinka","Irkutsk","Izhevsk","Kazan","Kemerovo","Klyuchi","Krasnodar","Krasnoyarsk","Magadan","Makhachkala","Mirny","Moscow","Murmansk","Neryungri","Nizhnevartovsk","Nizhneyansk","Nizhny Novgorod","Nordvik","Norilsk","Novokuznetsk","Novosibirsk","Novy Urengoy","Nyurba","Ola","Omsk","Orenburg","Ossora","Palana","Petropavlovsk-Kamchatskiy","Pevek","Pokrovsk","Rostov-on-Don","Salekhard","Samara","Saratov","Saskylakh","Seymchan","Sklad","Slautnoye","Srednekolymsk","St Petersburg","Surgut","Syndassko","Tiksi","Tilichiki","Tomsk","Tyumen","Udachny","Ufa","Ulan-Ude","Ust-Ilimsk","Vilyuysk","Vladivostok","Volgograd","Vorkuta","Voronezh","Yakutsk","Yekaterinburg","Yuryung-Khaya","Zyryanka"],"Iran" : ["Tehran"],"Oman" : ["Muscat"],"Yemen" : ["Sana'a"],"United Arab Emirates" : ["Dubai"],"Saudi Arabia" : ["Riyadh","Medina","Mecca"],"Iraq" : ["Baghdad"],"Syria" : ["Damascus"],"Lebanon" : ["Beirut"],"Israel" : ["Jerusalem"],"Turkey" : ["Ankara","Istanbul","Bursa","Izmir","Antalya","Adana"],"Azerbaijan" : ["Baku"],"Georgia" : ["Tbilisi"],"Estonia" : ["Tallinn"],"Latvia" : ["Riga"],"Lithuania" : ["Vilnius"],"Belarus" : ["Minsk"],"Ukraine" : ["Kiev","Kharkiv","Odessa"],"Moldova" : ["Chisinau"],"Romania" : ["Bucharest"],"Bulgaria" : ["Sofia"],"Greece" : ["Athens"],"Albania" : ["Tirana"],"Serbia" : ["Belgrade"],"Montenegro" : ["Podgorica"],"Bosnia and Herzegovina" : ["Sarajevo"],"Hungary" : ["Budapest"],"Croatia" : ["Zagreb"],"Austria" : ["Vienna"],"Czech" : ["Prague"],"Poland" : ["Warsaw"],"Germany" : ["Berlin","Hamburg","Cologne","Frankfurt","Munich"],"Italy" : ["Rome","Milan"],"Belgium" : ["Brussels"],"Netherlands" : ["Amsterdam"],"Denmark" : ["Copenhagen"],"Sweden" : ["Stockholm"],"Finland" : ["Helsinki"],"Norway" : ["Oslo","Tromso","Alta"],"France" : ["Paris"],"Spain" : ["Madrid","Barcelona","Valencia","Granada","Malaga","Seville","Las Palmas de Gran Canaria","Santa Cruz de tenerife"],"Portugal" : ["Lisbon","Porto"],"U.K." : ["London","Manchester","Liverpool","Edinburgh","Glasgow"],"Ireland" : ["Dublin"],"Egypt" : ["Cairo","Alexandria"],"Libya" : ["Tripoli"],"Tunisia" : ["Tunis"],"Algeria" : ["Algiers"],"Morocoo" : ["Rabat","Casablanca","Marrakesh","Agadir"],"Mauritania" : ["Nouakchott"],"Mali" : ["Bamako"],"Niger" : ["Niamey"],"Chad" : ["N'Djamena"],"Nigeria" : ["Abuja","Kano","Lagos","Port Harcourt"],"Togo" : ["Lome"],"Ghana" : ["Accra","Kumasi"],"Cote d'lvoire" : ["Yamoussoukro","Abidjan"],"Liberia" : ["Monrovia"],"Guinea" : ["Conakry"],"Senegal" : ["Dakar"],"South Sudan" : ["Juba"],"Central African Republic" : ["Bangui"],"Cameroon" : ["Yaounde","Douala"],"Somalia" : ["Mogadishu"],"Kenya" : ["Nairobi","Mombasa","Nakuru"],"Uganda" : ["Kampala"],"Congo" : ["Kinshasa"],"Gabon" : ["Libreville"],"Tanzania" : ["Dar es Salaam"],"Zambia" : ["Lusaka"],"Angola" : ["Luanda"],"Zimbabwe" : ["Harare"],"Mozambique" : ["Maputo"],"Botswana" : ["Gaborone"],"South Africa" : ["Pretoria","Johnnesburg","Bloemfontein","Durban","East London","Port Elizaberth","Cape Town"],"Madagascar" : ["Antananarivo"],"Canada" : ["Baker Lake","Calgary","Edmonton","Fort McMurray","Inuvik","Montreal","Ottawa","Quebec","Regina","Saskatoon","St.John's","Toronto","Vancouver","Victoria","Whitehorse","Winnipeg","Yellowknife"],"U.S.A" : ["Austin","Charlotte","Chicago","Dallas","Denver","Detroit","El Paso","Houston","Indianapilis","Jacksonville","Kansas City","Las Vegas","Los Angeles","Miami","Minneapolis","Nashville","New Orleans","Orlando","Phoenix","Portland","San Antonio","San Diego","San Francisco","San Jose","Seattle","Tampa","Tucson"],"Mexico" : ["Cancun","Guadalajara","Heroica Veracruz","Merida","Mexico City"],"Cuba" : ["Havana"],"Haiti" : ["Port au Prince"],"Belize" : ["Belmopan"],"Guatemala" : ["Guatemala"],"Nicaragua" : ["Managua"],"Costa Rica" : ["San Jose"],"Panama" : ["Panama City"],"Colombia" : ["Barranquilla","Bogota","Cali","Cartagena","Bucaramanga","Medellin","Pereira"],"Ecuador" : ["Quito"],"Venezuela" : ["Barquisimeto","Caracas","Maracaibo"],"Guyana" : ["Georgetown"],"Suriname" : ["Paramaribo","Cusco","Lima District"],"Bolivia" : ["Cochabamba","La Paz","Santa Cruz de la Sierra"],"Brazil" : ["Aracaju","Belem","Belo Horizonte","Boa Vista","Brasilia","Curitiba","Fortaleza","Goiania","Joas Pessoa","Macapa","Manaus","Porto Alegre","Recife","Ribeirao Preto","Rio de Janeiro","Salvador","Sao Luis"],"Paraguay" : ["Asuncion"],"Chile" : ["Antofagasta","Concepcion","Punta Arenas","Santiago"],"Argentina" : ["Bahia Blanca","Buenos Aires","Comodoro Rivadavia","Cordoba","El Calafate","Mar del Plata","Mendoza","Neuquen","Rio Callegos","Rio Grande","Rosario","Salta","San Carlos de bariloche","San Miguel de Tucuman","Santa Fe"]};

	var i, max, city, cities, key, weatherDataSource = [];
	//var citySize = 0;
	for( key in locationDataSource ){
		weatherDataSource.push({
			text : i18nLocation(key),
			value : key
		});
		//console.log(i18nLocation(key));
		cities = locationDataSource[key];
		max = cities.length;
		for( i = 0; i < max; i++ ){
			city = cities[i];
			cities[i] = {
				value : city,
				text : i18nLocation(city, true)
			};
			//console.log(cities[i].text);
		}
	//    citySize += locationDataSource[key].length;
	}
	weatherDataSource.sort(function(a, b){
		return a.text.localeCompare(b.text);
	});

	//console.log("country size : "+weatherDataSource.length);
	//console.log("city size : "+citySize);

	var purposeDataSource = [
		{text : I18N.prop("SETTINGS_FACILITY_COMPLEX"), value : "ComplexFacility"},
		{text : I18N.prop("SETTINGS_FACILITY_SALES"), value : "SalesFacility"},
		{text : I18N.prop("SETTINGS_FACILITY_EDUCATIONAL"), value : "EducationalFacility"},
		{text : I18N.prop("SETTINGS_FACILITY_ACCOMMODATION"), value : "Accommodations"},
		{text : I18N.prop("SETTINGS_FACILITY_BUSINESS"), value : "BusinessFacility"},
		{text : I18N.prop("SETTINGS_FACILITY_PUBLIC"), value : "PublicFacility"},
		{text : I18N.prop("SETTINGS_FACILITY_MEDICAL"), value : "MedicalFacility"}
	];

	var optimalDataSource = [60, 70, 80, 90, 100, 110, 120];

	var MockData = {
		device_setting_list : [
			{ device_id : "1", device_name : "Device 1", algorithm_type : "Manual", comfort_option: "Normal"},
			{ device_id : "2", device_name : "Device 2", algorithm_type : "Comfort", comfort_option: "Comfort"},
			{ device_id : "3", device_name : "Device 3", algorithm_type : "Manual", comfort_option: "Normal"},
			{ device_id : "4", device_name : "Device 4", algorithm_type : "PRC", comfort_option: "VeryComfort"}
		]
	};

	var SettingMockData = {
		weather_location : { country : "South Korea", city : "Seoul"},
		facility : "ComplexFacility", except_time : [{ start_time : "12:00", end_time :"14:00"}],
		optimal_start_time : 90
	};

	var powerPricingMockData = [
		{
			"id": 1,
			"name": "General purpose power! || High-voltage current select!",
			"enable": true,
			"list": [
				{
					"dayType": "all",
					"startDate": "01-01",
					"endDate": "12-31",
					"baseRate": 0,
					"level1Rate": 1,
					"level2Rate": 0.5,
					"level3Rate": 0.5,
					"powerDivision": {
						"time00Level": 1,
						"time01Level": 1,
						"time02Level": 1,
						"time03Level": 2,
						"time04Level": 2,
						"time05Level": 1,
						"time06Level": 1,
						"time07Level": 3,
						"time08Level": 3,
						"time09Level": 1,
						"time10Level": 1,
						"time11Level": 1,
						"time12Level": 1,
						"time13Level": 1,
						"time14Level": 1,
						"time15Level": 1,
						"time16Level": 1,
						"time17Level": 1,
						"time18Level": 1,
						"time19Level": 1,
						"time20Level": 1,
						"time21Level": 1,
						"time22Level": 1,
						"time23Level": 1
					}
				}
			]
		},
		{
			"id": 2,
			"name": "General purpose power(B) || High-voltage current select",
			"enable": false,
			"list": [
				{
					"dayType": "all",
					"startDate": "01-01",
					"endDate": "12-31",
					"baseRate": 0,
					"level1Rate": 1,
					"level2Rate": 0.5,
					"level3Rate": 0.5,
					"powerDivision": {
						"time00Level": 1,
						"time01Level": 1,
						"time02Level": 1,
						"time03Level": 1,
						"time04Level": 1,
						"time05Level": 1,
						"time06Level": 1,
						"time07Level": 1,
						"time08Level": 1,
						"time09Level": 1,
						"time10Level": 1,
						"time11Level": 1,
						"time12Level": 1,
						"time13Level": 1,
						"time14Level": 1,
						"time15Level": 1,
						"time16Level": 1,
						"time17Level": 1,
						"time18Level": 1,
						"time19Level": 1,
						"time20Level": 1,
						"time21Level": 1,
						"time22Level": 1,
						"time23Level": 1
					}
				},
				{
					"dayType": "weekday",
					"startDate": "01-01",
					"endDate": "12-31",
					"baseRate": 0,
					"level1Rate": 1,
					"level2Rate": 0.5,
					"level3Rate": 0.5,
					"powerDivision": {
						"time00Level": 1,
						"time01Level": 1,
						"time02Level": 1,
						"time03Level": 1,
						"time04Level": 1,
						"time05Level": 1,
						"time06Level": 1,
						"time07Level": 1,
						"time08Level": 1,
						"time09Level": 1,
						"time10Level": 1,
						"time11Level": 1,
						"time12Level": 1,
						"time13Level": 1,
						"time14Level": 1,
						"time15Level": 1,
						"time16Level": 1,
						"time17Level": 1,
						"time18Level": 1,
						"time19Level": 1,
						"time20Level": 1,
						"time21Level": 1,
						"time22Level": 1,
						"time23Level": 1
					}
				}
			]
		},
		{
			"id": 3,
			"name": "General purpose power(C) || Low-voltage current select",
			"enable": false,
			"list": [
				{
					"dayType": "all",
					"startDate": "01-01",
					"endDate": "12-31",
					"baseRate": 0,
					"level1Rate": 1,
					"level2Rate": 0.5,
					"level3Rate": 0.5,
					"powerDivision": {
						"time00Level": 1,
						"time01Level": 1,
						"time02Level": 1,
						"time03Level": 1,
						"time04Level": 1,
						"time05Level": 1,
						"time06Level": 1,
						"time07Level": 1,
						"time08Level": 1,
						"time09Level": 1,
						"time10Level": 1,
						"time11Level": 1,
						"time12Level": 1,
						"time13Level": 1,
						"time14Level": 1,
						"time15Level": 1,
						"time16Level": 1,
						"time17Level": 1,
						"time18Level": 1,
						"time19Level": 1,
						"time20Level": 1,
						"time21Level": 1,
						"time22Level": 1,
						"time23Level": 1
					}
				}
			]
		},
		{
			"id": 4,
			"name": "General purpose power(D) || High-voltage current select",
			"enable": false,
			"list": [
				{
					"dayType": "all",
					"startDate": "01-01",
					"endDate": "12-31",
					"baseRate": 0,
					"level1Rate": 1,
					"level2Rate": 0.5,
					"level3Rate": 0.5,
					"powerDivision": {
						"time00Level": 1,
						"time01Level": 1,
						"time02Level": 1,
						"time03Level": 1,
						"time04Level": 1,
						"time05Level": 1,
						"time06Level": 1,
						"time07Level": 1,
						"time08Level": 1,
						"time09Level": 1,
						"time10Level": 1,
						"time11Level": 1,
						"time12Level": 1,
						"time13Level": 1,
						"time14Level": 1,
						"time15Level": 1,
						"time16Level": 1,
						"time17Level": 1,
						"time18Level": 1,
						"time19Level": 1,
						"time20Level": 1,
						"time21Level": 1,
						"time22Level": 1,
						"time23Level": 1
					}
				}
			]
		}
	];

	var powerPricingWeekDayDataSource = [
		{ text : I18N.prop("SETTINGS_ALGORITHM_WEEKDAY"), value : "weekday" },
		{ text : I18N.prop("SETTINGS_ALGORITHM_WEEKEND"), value : "weekend" },
		{ text : I18N.prop("SETTINGS_ALGORITHM_ALL"), value : "all" }
	];

	var powerPricingMonthDataSource = [];
	var pwrIdx, pwrMax = 12;
	var val;
	for( pwrIdx = 1; pwrIdx <= pwrMax; pwrIdx++ ){
		val = kendo.toString(pwrIdx, "00");
		powerPricingMonthDataSource.push({
			text : val,
			value : val
		});
	}

	var createDayDataSource = function(days){
		var list = [];
		if(days < 30){
			days = 28;
		}
		for( i = 1; i <= days; i++ ){
			val = kendo.toString(i, "00");
			list.push({
				text : val,
				value : val
			});
		}
		return list;
	};

	var powerPricingDayDataSource = createDayDataSource(31);

	var defaultPowerPricingListData = {
		"isCreated" : true,
		"dayType": "all",
		"startDate": "01-01",
		"endDate": "12-31",
		"baseRate": 0,
		"level1Rate": 0,
		"level2Rate": 0,
		"level3Rate": 0,
		"powerDivision": {
			"time00Level": 1,
			"time01Level": 1,
			"time02Level": 1,
			"time03Level": 1,
			"time04Level": 1,
			"time05Level": 1,
			"time06Level": 1,
			"time07Level": 1,
			"time08Level": 1,
			"time09Level": 1,
			"time10Level": 1,
			"time11Level": 1,
			"time12Level": 1,
			"time13Level": 1,
			"time14Level": 1,
			"time15Level": 1,
			"time16Level": 1,
			"time17Level": 1,
			"time18Level": 1,
			"time19Level": 1,
			"time20Level": 1,
			"time21Level": 1,
			"time22Level": 1,
			"time23Level": 1
		}
	};

	var createDataSource = function(list){
		var datas = list.device_setting_list;
		if(!datas){
			return [];
		}
		var idx, lnth = datas.length;
		for( idx = 0; idx < lnth; idx++ ){
			if(datas[idx].algorithm_type != "Manual"){
				datas[idx].checked = true;
			}else{
				datas[idx].checked = false;
			}
		}
		return datas;
	};

	var DeviceSettingModel = kendo.data.Model.define({
		id: "device_id",
		fields: {
			device_name: {
				name: "Name"
			},
			algorithm_type : {
				name: "Algorithm Type"
			},
			comfort_option : {
				name : "Comfort Option"
			}
		}
	});

	var createModel = function(data){
		var m = new DeviceSettingModel(data);
		if(data){
			return m;
		}

		return m;
	};


	return {
		MockData : MockData,
		SettingMockData : SettingMockData,
		powerPricingMockData : powerPricingMockData,
		createDataSource : createDataSource,
		createModel : createModel,
		weatherDataSource : weatherDataSource,
		locationDataSource : locationDataSource,
		purposeDataSource : purposeDataSource,
		optimalDataSource : optimalDataSource,
		powerPricingWeekDayDataSource : powerPricingWeekDayDataSource,
		powerPricingMonthDataSource : powerPricingMonthDataSource,
		powerPricingDayDataSource : powerPricingDayDataSource,
		defaultPowerPricingListData : defaultPowerPricingListData,
		createDayDataSource : createDayDataSource
	};
});
//# sourceURL=facility-sac/algorithm-model.js