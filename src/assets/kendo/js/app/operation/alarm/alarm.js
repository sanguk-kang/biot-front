define("operation/alarm/alarm",["operation/core"],function(e){var r=window.kendo,l=window.moment,d=window.I18N,a=window.MAIN_WINDOW,p=d.prop("ALARM_LOG_ALARM_TYPE"),s=d.prop("ALARM_LOG_ALARM_CODE"),c=d.prop("ALARM_LOG_OCCURRENCE_TIME"),m=d.prop("ALARM_LOG_RESOLUTION_TIME"),_=d.prop("ALARM_LOG_DEVICE_TYPE"),v=d.prop("ALARM_LOG_DEVICE_NAME"),u=d.prop("ALARM_LOG_LOCATION"),g=d.prop("ALARM_LOG_BTN_DETAIL"),T=d.prop("ALARM_LOG_DESCRIPTION"),t=d.prop("ALARM_LOG_MESSAGE_NOTI_NON_SELCTED_MULTI_ALARM_LOG"),i=d.prop("ALARM_LOG_MESSAGE_NOTI_SELCTED_MULTI_ALARM_LOG"),D=d.prop("ALARM_LOG_ALL_ALARM_TYPE"),y=d.prop("ALARM_LOG_ALL_DEVICE_TYPE"),f=r.data.Model.define({id:"id",fields:{type:{name:p,type:"text",editable:!1},eventTime:{name:c,type:"text",editable:!1},resolutionTime:{name:m,type:"text",editable:!1},dms_devices_type:{name:_,type:"text",editable:!1},dms_devices_name:{name:v,type:"text",editable:!1},location:{name:u,type:"text",editable:!1},name:{name:s,type:"text",editable:!1,editCss:{width:"100%"}},description:{name:T,type:"text",editable:!1}}}),A={"SAC Indoor":d.prop("FACILITY_DEVICE_TYPE_SAC_INDOOR"),"SAC Outdoor":d.prop("FACILITY_DEVICE_TYPE_SAC_OUTDOOR"),Point:d.prop("FACILITY_DEVICE_TYPE_POINT"),"Energy Meter":d.prop("FACILITY_DEVICE_TYPE_ENERGY_METER"),"Temperature Sensor":d.prop("FACILITY_DEVICE_TYPE_TEMPERATURE_SENSOR"),"Humidity Sensor":d.prop("FACILITY_DEVICE_TYPE_HUMIDITY_SENSOR"),"Temp. & Humi. Sensor":d.prop("FACILITY_DEVICE_TYPE_TEMP_AND_HUMIDITY_SENSOR"),"Motion Sensor":d.prop("FACILITY_DEVICE_TYPE_MOTION_SENSOR"),Beacon:d.prop("FACILITY_DEVICE_TYPE_BLE_BEACON"),CCTV:d.prop("FACILITY_DEVICE_TYPE_CCTV"),"IoT AP":d.prop("FACILITY_DEVICE_TYPE_IOT_GATEWAY"),Light:d.prop("FACILITY_DEVICE_TYPE_LIGHT"),Printer:d.prop("FACILITY_DEVICE_TYPE_PRINTER")},E={Warning:d.prop("ALARM_LOG_WARNING"),Critical:d.prop("ALARM_LOG_CRITICAL")},L=window.Util,h=new window.CommonLoadingPanel,n=$(".alarm-confirm-dialog"),o=$(".alarm-message-dialog");n.kendoCommonDialog({type:"confirm"}),o.kendoCommonDialog();var C,I,O,k=$("#alarmlog-alarm-tab"),F=$(".alarmlog-alarm-top"),Y=F.find(".timeselector-start"),M=F.find(".timeselector-end"),S=Y.find("input"),R=M.find("input"),w=new Date,b=new Date(w.getFullYear(),w.getMonth()-1,w.getDate(),0,0,0),G=new Date(w.getFullYear(),w.getMonth(),w.getDate(),23,59,59),x=$("button[data-event=alarmview]"),P=$("input[data-event=alarmtype]"),N=$("input[data-event=devicetype]"),H=$("button[data-event=alarmexport]").kendoButton({}).data("kendoButton"),V=[],U=[],B={},W=$("[data-event=alarmdetail]").kendoButton({enable:!1}),j=[],z=$("#alarm-grid"),q=["type","eventTime","resolutionTime","dms_devices_type","dms_devices_name","location","name"],Q=null,Z=$("[data-role=alarmcount]"),J=$("#popup-alarm"),K=window.GlobalSettings.getTimeDisplay(),X="YYYY/MM/DD HH:mm";"12Hour"==K&&(X="YYYY/MM/DD A hh:mm");function ee(e,a){var t=e.eventTime,i=a.eventTime,n=l(t,X),o=l(i,X);return n.isAfter(o)?-1:1}function ae(e,a){var t=e.resolutionTime,i=a.resolutionTime;if("-"==t||"-"==i)return t.localeCompare(i);var n=l(t,X),o=l(i,X);return n.isAfter(o)?-1:1}function te(){a.disableFloorNav(!0),k.kendoCommonTabStrip(),C=S.kendoCommonDatePicker({value:b,isStart:!0,change:function(){var e=C.value(),a=I.value(),t=new Date(l().year(),l().month(),l().date(),0,0,0);if(t-e<0)return e=t,C.value(e),void C.trigger("change");(a=new Date(a.getFullYear(),a.getMonth(),a.getDate(),0,0,0))-e<0&&(a=e,I.value(a),I.trigger("change"))}}).data("kendoCommonDatePicker"),I=R.kendoCommonDatePicker({value:G,isEnd:!0,change:function(){var e=C.value(),a=I.value(),t=new Date(l().year(),l().month(),l().date(),23,59,59);if(t-a<0)return a=t,I.value(a),void I.trigger("change");a-(e=new Date(e.getFullYear(),e.getMonth(),e.getDate(),23,59,59))<0&&(e=a,C.value(e),C.trigger("change"))}}).data("kendoCommonDatePicker"),P.kendoDropDownList({dataSource:[],dataTextField:"text",dataValueField:"value",change:function(){O=this.text(),B.type=O,de("alarm",z,B)}}),N.kendoDropDownList({dataSource:[],dataTextField:"text",dataValueField:"value",change:function(){O=this.text(),B.dms_devices_type=O,de("device",z,B)}}),z.data("kendoGrid")&&(z.data("kendoGrid").destroy(),z.empty()),z.kendoGrid({columns:function(e,a){function t(){this.fields=null,this.title=null,this.template=null}for(var i=[],n=0;n<e.length;n++)for(var o in f.fields)if(o===e[n]){var d=new t;"dms_devices_type"===o||"dms_devices_name"===o||"location"===o||"name"===o?d.sortable=!1:"type"==o?(d.headerTemplate="<div data-dir='desc'>"+f.fields[o].name+"</div>",d.sortable=!0):"eventTime"==o?(d.headerTemplate="<div data-dir='desc'>"+f.fields[o].name+"</div>",d.sortable=!0):"resolutionTime"==o&&(d.headerTemplate="<div data-dir='asc'>"+f.fields[o].name+"</div>",d.sortable=!0),d.field=o,d.title="<span class='alarmlog-alarm-"+a+"grid-title' data-title='"+o+"'>"+f.fields[o].name+"</span>",d.template="<span class='alarmlog-alarm-"+a+"grid-value' data-value='"+o+"'>#: "+o+" #</span>",i.push(d)}return i.push({field:"detail",title:g,template:function(e){return"<span class='ic ic-info' data-event='alarmdetail' data-id='"+e.id+"' alarm-name='"+e.name+"'></span>"},sortable:!1}),i}(q,"alarm"),dataSource:[],scrollable:{virtual:!0},sortable:{allowUnsort:!1},hasCheckedModel:!0,setCheckedAttribute:!0}),z.data("kendoGrid").dataSource.sort([{field:"resolutionTime",dir:"asc",compare:ae},{field:"eventTime",dir:"desc",compare:ee}]),J.kendoDetailDialog(oe),le()}function ie(){x.on("click",function(){b=C.value(),G=I.value(),h.open(),$.ajax({url:"/alarms?startTime="+pe(b)+"&endTime="+pe(G)}).done(function(e){Q=null,j=[];for(var a=0;a<e.length;a++){var t=e[a];for(var i in f.fields)"description"==i?t.serviceOrigin&&"Rule"==t.serviceOrigin?t[i]=t.description?t.description:"-":t[i]=L.getAlarmDescription(t.name):0!=t.hasOwnProperty(i)&&""!=t[i]&&t[i]?"eventTime"===i||"resolutionTime"===i?t[i]=l(t[i]).format("LLL").replace(/\./g,"/"):"dms_devices_type"===i&&-1===t[i].indexOf("ControlPoint")?A[L.getDetailDisplayType(t[i])]?t[i]=A[L.getDetailDisplayType(t[i])]:t[i]=L.getDetailDisplayType(t[i]):"type"===i&&(t[i]=E[t[i]]):t[i]="-";t.dms_devices_mappedType&&A[L.getDetailDisplayType(t.dms_devices_mappedType)]?t.dms_devices_type=A[L.getDetailDisplayType(t.dms_devices_mappedType)]:t.dms_devices_mappedType&&(t.dms_devices_type=L.getDetailDisplayType(t.dms_devices_mappedType)),j.push(new f(t))}var n=new r.data.DataSource({data:j,pageSize:30});n.read(),z.data("kendoGrid").setDataSource(n),0===j.length?H.enable(!1):H.enable(!0),z.data("kendoGrid").dataSource.sort([{field:"resolutionTime",dir:"asc",compare:ae},{field:"eventTime",dir:"desc",compare:ee}]),P.data("kendoDropDownList").trigger("change"),N.data("kendoDropDownList").trigger("change"),W.data("kendoButton").enable(!1),le()}).fail(function(e){o.data("kendoCommonDialog").message("<p class='pop-confirm-message'>"+e.responseText+"</p>"),o.data("kendoCommonDialog").open()}).always(function(){h.close()})}),W.on("click",function(e){!function(e){if(1===e.length)h.open(),$.ajax({url:"/alarms/"+e[0].id}).done(function(e){h.close();var a=e;for(var t in f.fields)"description"==t?a.serviceOrigin&&"Rule"==a.serviceOrigin?a[t]=a.description?a.description:"-":a[t]=L.getAlarmDescription(a.name):0!=a.hasOwnProperty(t)&&""!=a[t]&&a[t]?"eventTime"===t||"resolutionTime"===t?a[t]=l(a[t]).format("LLL").replace(/\./g,"/"):"dms_devices_type"===t&&-1===a[t].indexOf("ControlPoint")?A[L.getDetailDisplayType(a[t])]?a[t]=A[L.getDetailDisplayType(a[t])]:a[t]=L.getDetailDisplayType(a[t]):"type"===t&&(a[t]=E[a[t]]):a[t]="-";a.dms_devices_mappedType&&A[L.getDetailDisplayType(a.dms_devices_mappedType)]?a.dms_devices_type=A[L.getDetailDisplayType(a.dms_devices_mappedType)]:a.dms_devices_mappedType&&(a.dms_devices_type=L.getDetailDisplayType(a.dms_devices_mappedType)),J.data("kendoDetailDialog").setDataSource(a),J.data("kendoDetailDialog").open()}).fail(function(e){h.close(),re(e)}).always(function(){h.close()});else{h.open();var d,a="/alarms?ids=";for(d=0;d<e.length;d++)d<e.length-1?a+=e[d].id+",":a+=e[d].id;$.ajax({url:a}).done(function(e){var a,t=[];for(a=e,d=0;d<a.length;d++){var i=a[d];for(var n in i.popupIndex=d+1,f.fields)"description"==n?i.serviceOrigin&&"Rule"==i.serviceOrigin?i[n]=i.description?i.description:"-":i[n]=L.getAlarmDescription(i.name):0!=i.hasOwnProperty(n)&&""!=i[n]&&i[n]?"eventTime"===n||"resolutionTime"===n?i[n]=l(i[n]).format("LLL").replace(/\./g,"/"):"dms_devices_type"===n&&-1===i[n].indexOf("ControlPoint")?A[L.getDetailDisplayType(i[n])]?i[n]=A[L.getDetailDisplayType(i[n])]:i[n]=L.getDetailDisplayType(i[n]):"type"===n&&(i[n]=E[i[n]]):i[n]="-";i.dms_devices_mappedType&&A[L.getDetailDisplayType(i.dms_devices_mappedType)]?i.dms_devices_type=A[L.getDetailDisplayType(i.dms_devices_mappedType)]:i.dms_devices_mappedType&&(i.dms_devices_type=L.getDetailDisplayType(i.dms_devices_mappedType)),t.push(i)}var o=new r.data.DataSource({data:t,pageSize:30});o.read(),J.data("kendoDetailDialog").setDataSource(o),J.data("kendoDetailDialog").open(),h.close()}).fail(function(e){re(e)}).always(function(){h.close()})}}(z.data("kendoGrid").getCheckedData())}),z.find(".k-grid-header-wrap").on("click","th",function(e){var a=$(this),t=a.text(),i=a.find("[data-dir]"),n=i.attr("data-dir");for(var o in f.fields)if(f.fields[o].name==t){Q=t,Q=o;break}t&&("desc"==n?n="asc":"asc"==n&&(n="desc"),i.attr("data-dir",n),z.data("kendoGrid").dataSource.sort([{field:Q,dir:n}]))}),H.bind("click",function(e){var a=[{cells:[{value:d.prop("ENERGY_INQUIRED_PERIOD"),background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:l(b).format("YYYY-MM-DD HH:mm")+" ~ "+l(G).format("YYYY-MM-DD HH:mm"),colSpan:3,hAlign:"center"}]}];a.push({}),a.push({cells:[{value:p,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:c,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:m,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:_,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:v,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:u,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:s,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"},{value:T,background:"#4E4E4E",color:"#FFFFFF",vAlign:"center",hAlign:"center"}]});for(var t=0;t<j.length;t++)a.push({cells:[{value:j[t].type,hAlign:"center"},{value:"-"!=j[t].eventTime?l(j[t].eventTime).format("YYYY-MM-DD HH:mm"):j[t].eventTime,hAlign:"center"},{value:"-"!=j[t].resolutionTime?l(j[t].resolutionTime).format("YYYY-MM-DD HH:mm"):j[t].resolutionTime,hAlign:"center"},{value:j[t].dms_devices_type,hAlign:"center"},{value:j[t].dms_devices_name,hAlign:"center"},{value:j[t].location,hAlign:"center"},{value:j[t].name,hAlign:"center"},{value:j[t].description,hAlign:"center"}]});for(var i=[],n=0;n<a[2].cells.length;n++)i.push({width:180});var o=new r.ooxml.Workbook({sheets:[{title:d.prop("ALARM_LOG_HISTORY"),rows:a,columns:i}]});r.saveAs({dataURI:o.toDataURL(),fileName:d.prop("ALARM_LOG_HISTORY")+"_"+l().format("L")+".xlsx"})})}function ne(){z.data("kendoGrid").bind("checked",function(e){le()}),z.on("click","[data-event=alarmdetail]",function(e){!function(e){for(var a=e,t=0;t<j.length;t++){if(j[t].id==a)break}h.open(),$.ajax({url:"/alarms/"+a}).done(function(e){h.close();var a=e;for(var t in f.fields)"description"==t?a.serviceOrigin&&"Rule"==a.serviceOrigin?a[t]=a.description?a.description:"-":a[t]=L.getAlarmDescription(a.name):0!=a.hasOwnProperty(t)&&""!=a[t]&&a[t]?"eventTime"===t||"resolutionTime"===t?a[t]=l(a[t]).format("LLL").replace(/\./g,"/"):"dms_devices_type"===t&&-1===a[t].indexOf("ControlPoint")?A[L.getDetailDisplayType(a[t])]?a[t]=A[L.getDetailDisplayType(a[t])]:a[t]=L.getDetailDisplayType(a[t]):"type"===t&&(a[t]=E[a[t]]):a[t]="-";a.dms_devices_mappedType&&A[L.getDetailDisplayType(a.dms_devices_mappedType)]?a.dms_devices_type=A[L.getDetailDisplayType(a.dms_devices_mappedType)]:a.dms_devices_mappedType&&(a.dms_devices_type=L.getDetailDisplayType(a.dms_devices_mappedType)),J.data("kendoDetailDialog").setDataSource(a),J.data("kendoDetailDialog").open()}).fail(function(e){h.close(),re(e)}).always(function(){h.close()})}($(e.target).attr("data-id"))})}var oe={title:g,width:780,height:600,contentTemplate:'<div class="detail-dialog-content device-dialog-content"><div class="detail-dialog-header device-dialog-header"></div><div class="detail-dialog-detail-content"></div></div>',detailContentTemplate:'<div class="device-detail-header"><span class="device-detail-header-type"></span></div><div class="detail-dialog-detail-content-field-list"></div>',listTemplate:function(e){return e.popupIndex?"<div class='popup-header-name'>"+e.popupIndex+" "+e.name+"</div>":"<div class='popup-header-name'>"+e.name+"</div>"},headerTemplate:"<span>"+d.prop("COMMON_SELECTED")+": <span>#:count #</span></span>",gridOptions:{scrollable:{virtual:!0}},buttonsIndex:{CLOSE:0},isCustomActions:!0,actions:[{text:d.prop("COMMON_BTN_CLOSE"),visible:!0,disabled:!1,action:function(e){e.sender.trigger("onClose"),e.sender.trigger("onClosed")}}],onTypeChange:function(){},close:function(e){var a=e.sender.BTN;e.sender.setActions(a.EDIT,{disabled:!0})},scheme:f};function de(e,a,t){var i,n=a.data("kendoGrid"),o=[];for(var d in t)t[d]==A["SAC Indoor"]||"Indoor"==t[d]?(i=r("AirConditioner",d),o.push({logic:"or",filters:i})):t[d]==A.Point?(i=r("ControlPoint",d),o.push({logic:"or",filters:i})):t[d]!==D&&t[d]!==y&&""!==t[d]&&o.push({field:d,operator:"eq",value:t[d]});function r(e,a){for(var t=L.getDeviceTypeList(e),i=[],n=0;n<t.length;n++){var o=t[n].displayType;"Indoor"==o&&(o=A["SAC Indoor"]),i.push({field:a,operator:"eq",value:o})}return i}n.dataSource.filter({logic:"and",filters:o})}function re(e){o.data("kendoCommonDialog").message("<p class='pop-confirm-message'>"+e.responseText+"</p>"),o.data("kendoCommonDialog").open(),setTimeout(function(){o.data("kendoCommonDialog").closeBtnEvt()},3e3)}function le(){var e=z.data("kendoGrid").getCheckedData().length;i=d.prop("ALARM_LOG_MESSAGE_NOTI_SELCTED_MULTI_ALARM_LOG",e),0===e?(Z.text(t),W.data("kendoButton").enable(!1)):(Z.text(i),W.data("kendoButton").enable(!0))}function pe(e){var a=l(e).format("YYYY-MM-DDTHH:mm:ssZ");return a=a.replace("+","%2b")}e.on("onfloorchange",function(){te(),ie(),function(){V=[{text:D,value:D},{text:d.prop("ALARM_LOG_CRITICAL"),value:"Critical"},{text:d.prop("ALARM_LOG_WARNING"),value:"Warning"}],(U=L.getTotalDeviceTypeDataSource()).unshift({text:y,value:y}),P.data("kendoDropDownList").dataSource.data(V),N.data("kendoDropDownList").dataSource.data(U);h.open(),$.ajax({url:"/alarms?startTime="+pe(b)+"&endTime="+pe(G)}).done(function(e){j=[];for(var a=0;a<e.length;a++){var t=e[a];for(var i in f.fields)"description"==i?t.serviceOrigin&&"Rule"==t.serviceOrigin?t[i]=t.description?t.description:"-":t[i]=L.getAlarmDescription(t.name):0!=t.hasOwnProperty(i)&&""!=t[i]&&t[i]?"eventTime"===i||"resolutionTime"===i?t[i]=l(t[i]).format("LLL").replace(/\./g,"/"):"dms_devices_type"===i&&-1===t[i].indexOf("ControlPoint")?A[L.getDetailDisplayType(t[i])]?t[i]=A[L.getDetailDisplayType(t[i])]:t[i]=L.getDetailDisplayType(t[i]):"type"===i&&(t[i]=E[t[i]]):t[i]="-";t.dms_devices_mappedType&&A[L.getDetailDisplayType(t.dms_devices_mappedType)]?t.dms_devices_type=A[L.getDetailDisplayType(t.dms_devices_mappedType)]:t.dms_devices_mappedType&&(t.dms_devices_type=L.getDetailDisplayType(t.dms_devices_mappedType)),j.push(new f(t))}var n=new r.data.DataSource({data:j,pageSize:30});n.read(),z.data("kendoGrid").setDataSource(n),0===j.length?H.enable(!1):H.enable(!0),z.data("kendoGrid").dataSource.sort([{field:"resolutionTime",dir:"asc",compare:ae},{field:"eventTime",dir:"desc",compare:ee}])}).fail(function(e){o.data("kendoCommonDialog").message("<p class='pop-confirm-message'>"+e.responseText+"</p>"),o.data("kendoCommonDialog").open()}).always(function(){h.close()})}(),ne(),z.data("kendoGrid").dataSource.bind("change",function(e){var a,t,i,n;t=O,i=(a=z).data("kendoGrid").dataSource,n=i.sort(),j=((void 0===n||void 0===n&&void 0!==t)&&(n=[{compare:void 0,dir:"asc",field:t}]),i.view()),le(),a.find("[data-event=alarmcheckall]").prop("checked",!1),ne()})})});