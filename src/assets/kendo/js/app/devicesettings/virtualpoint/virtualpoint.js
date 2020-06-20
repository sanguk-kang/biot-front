define("devicesettings/virtualpoint/virtualpoint",["devicesettings/core"],function(){var l,T,d,m,e,t,a,n,i,E,o,y,I,p,S,b,r,c,x,s,u,v,h,_,N,P,D,f,g;function k(){0==b.length?y.data("kendoButton").enable(!1):y.data("kendoButton").enable(!0)}function C(e){e.sort(function(e,t){return e-t})}function w(){for(var e=!0,t=I.find("[data-role=name]"),a=0;a<t.length;a++){if(!t.eq(a).data("kendoCommonValidator").validate()){e=!1;break}}E.data("kendoButton").enable(e)}l=window.kendo,T=new window.CommonLoadingPanel,d=window.Util,m=window.I18N,e=window.MAIN_WINDOW,t=$("#device-setting-virtualpoint-tab"),a=$(".sac-virtualpoint-container"),n=a.find(".sac-virtualpoint-top"),i=a.find(".virtualpoint-content-box-btn"),E=n.find("[data-event=save]"),o=i.find("[data-event=addpoint]"),y=i.find("[data-event=deletepoint]"),I=a.find(".sac-virtualpoint-grid"),S=p=null,b=[],r=[],c=$("#popup-sac-virtual-point-message"),x=null,s=$("#popup-sac-virtual-point-confirm"),u=null,v={virtualPointGridDeviceType:[{text:"AI",value:"ControlPoint.AI"},{text:"AO",value:"ControlPoint.AO"},{text:"DI",value:"ControlPoint.DI"},{text:"DO",value:"ControlPoint.DO"}],virtualPointGridType:[{text:d.getDisplayType("ControlPoint"),value:"ControlPoint"}]},h={ControlPoint:m.prop("SETTINGS_MENUCONFIGURE_POINT"),Light:m.prop("SETTINGS_MENUCONFIGURE_LIGHT"),"Sensor.Temperature":m.prop("SETTINGS_TEMPERATURE_SENSOR"),"Sensor.Humidity":m.prop("SETTINGS_HUMIDITY_SENSOR"),"Sensor.Motion":m.prop("SETTINGS_MENUCONFIGURE_MOTION"),"Meter.WattHour":m.prop("SETTINGS_ENERGY_METER")},_=[],N=[],P=[],D=function(){T.open(),$.ajax({url:"/dms/devices?types=ControlPoint.AI,ControlPoint.AO,ControlPoint.DI,ControlPoint.DO&registrationStatuses=NotRegistered,Registered&attributes=id,name,type,mappedType,description,controlPoint-origin"}).done(function(e){if(r=[],e)for(var t=0;t<e.length;t++){var a=e[t];a.controlPoint&&$.isPlainObject(a.controlPoint)&&a.controlPoint.origin&&"Virtual"==a.controlPoint.origin&&r.push(a)}S=new l.data.DataSource({data:r}),p.setDataSource(S),S.read()}).fail(function(e){x.message(e.responseText),x.open()}).always(function(){T.close()})},f=function(){I.on("click","input[data-event=devicecheckall]",function(){var e=$(this),t=e.closest(".k-grid").find("input[data-event=devicecheck]");b=[],e.is(":checked")?(t.each(function(e,t){t.checked=!0,b.push(e)}),C(b)):t.each(function(e,t){t.checked=!1,b=[]}),k()}),I.on("click","input[data-event=devicecheck]",function(){var e=$(this),t=e.closest(".k-grid").find("input[data-event=devicecheck]"),a=e.closest(".k-grid").find("input[data-event=devicecheckall]"),n=t.index(this);e.is(":checked")?b.push(n):(t.checked=!1,b=$.grep(b,function(e){return e!=n})),C(b),k(),b.length<S.data().length?a.prop("checked",!1):b.length==S.data().length&&a.prop("checked",!0)}),I.on("change","input.change-check",function(){var e=$(this),t=p,a=e.closest("tr"),n=t.tbody.find("tr").index(a),i=a.find("[data-role=id]"),d=i.attr("data-value"),o=e.attr("data-role"),l=e.val(),r=S.get(d),c=i.attr("isadded");t.dataSource._pristineData[n][o]=l,r[o]=l,"added"==c&&-1==_.indexOf(d)?_.push(d):"added"!==c&&-1==N.indexOf(d)&&N.push(d),w()}),I.on("keyup","input.change-check",function(){w()}),p.bind("dataBound",function(){I.find("input[data-event=devicecheckall]").prop("checked",!1),function(){var e=I.find("[data-role=type]"),t=0;for(e.kendoDropDownList({dataSource:v.virtualPointGridDeviceType,dataTextField:"text",dataValueField:"value"}),t=0;t<e.length;t++){var a=e.eq(t);a.data("kendoDropDownList").value(a.attr("data-value"))}var n=I.find("[data-role=id]");for(t=0;t<=n.length;t++){var i=n.eq(t);i.attr("isadded")||i.val(i.attr("data-value"))}var d=I.find("[data-role=name]");for(t=0;t<=d.length;t++){var o=d.eq(t);o.attr("isadded")?o.val(""):o.val(o.attr("data-value")),o.kendoCommonValidator({type:"name"}).data("kendoCommonValidator")}var l=I.find("[data-role=description]");for(t=0;t<=l.length;t++){var r=l.eq(t);"added"==r.attr("isadded")?r.val(""):r.val(r.attr("data-value"))}}();for(var e=I.find(".sac-virtual-point-grid-cell").find("[data-role=name]"),t=I.find(".sac-virtual-point-grid-cell").find("[data-role=description]"),a=0;a<e.length;a++){var n=e.eq(a),i=t.eq(a),d=n.closest("tr").find("[data-role=id]").attr("data-value"),o=S.get(d);o.name&&n.val(o.name),o.description&&i.val(o.description),n.data("kendoCommonValidator").validate()}})},g=function(){E.on("click",function(){var e,t,a,n,i,d=S,o=I.find("[data-role=name]"),l=[],r=!1;for(e=0;e<o.length;e++)l.push(o.eq(e).val());if(l.filter(function(e,t,a){return a.indexOf(e)===t}).length!=l.length&&(r=!0),r)return x.message(m.prop("SETTINGS_MESSAGE_VIRTUAL_POINT_CANNOT_DUPLICATED_NAME")),void x.open();function c(){this.name=null,this.type=null,this.mappedType=null,this.description=null,this.controlPoint={}}function p(){this.id=null,this.name=null,this.type=null,this.description=null}var s=[],u=[],v=[],h=[];for(e=0;e<_.length;e++)if(a=_[e],t=d.get(a)){var f=new c;for(var g in f.name=t.name,f.type=t.type,f.mappedType=t.mappedType,f.description=t.description,f.controlPoint.origin="Virtual",f)f[g]||delete f[g];v.push(f)}for(e=0;e<N.length;e++){n=N[e],t=d.get(n);var k=new p;k.id=t.id,k.name=t.name,k.type=t.type,k.description=t.description,h.push(k)}if(T.open(),0<P.length)for(e=0;e<P.length;e++)i=P[e],s.push($.ajax({url:"/dms/devices/"+i,method:"DELETE"}));$.when.apply(this,s).done(function(){}).fail(function(e){T.close(),x.message(e.responseText),x.open()}).always(function(){T.close(),P=[],T.open(),0<h.length&&u.push($.ajax({url:"/dms/devices",method:"PATCH",data:h}).fail(function(e){E.data("kendoButton").enable(!0),x.message(e.responseText),x.open()})),0<v.length&&u.push($.ajax({url:"/dms/devices",method:"POST",data:v}).fail(function(e){E.data("kendoButton").enable(!0),x.message(e.responseText),x.open()})),$.when.apply(this,u).done(function(){_=[],N=[],b=[],E.data("kendoButton").enable(!1),y.data("kendoButton").enable(!1),T.close(),D()}).always(function(){})})}),o.on("click",function(){var e={id:l.guid(),name:null,type:"ControlPoint.AI",mappedType:"ControlPoint",description:null,controlPoint:{virtual:!0},isAdded:!0};S.insert(0,e),S._pristineData.unshift(e),_.push(e.id),b=[],E.data("kendoButton").enable(!1)}),y.on("click",function(){var a,n=b,i=I.find("input[data-event=devicecheck]:checked").closest("tr").find("input[data-role=id]"),d=null,o=null;r=S._pristineData,1<n.length?u.message(m.prop("SETTINGS_CONFIRM_VIRTUAL_POINT_DELETE_MULTIPLE_POINT",n.length)):u.message(m.prop("SETTINGS_CONFIRM_VIRTUAL_POINT_DELETE_SINGLE_POINT")),u.setConfirmActions({yes:function(){var e;for(e=i.length-1;0<=e;e--)a=i.eq(e).attr("data-value"),"added"!=i.eq(e).attr("isadded")?(o=N.indexOf(a),P.push(a),-1<o&&N.splice(o,1)):-1<(d=_.indexOf(a))&&_.splice(d,1);for(var t=n.length-1;0<=t;t--)r.splice(n[t],1);S._pristineData=r,S=new l.data.DataSource({data:r}),p.setDataSource(S),S.read(),b=[],E.data("kendoButton").enable(!0),k()},no:function(){}}),u.open()})},t.kendoCommonTabStrip(),e.disableFloorNav(!0),x=c.kendoCommonDialog().data("kendoCommonDialog"),u=s.kendoCommonDialog({type:"confirm"}).data("kendoCommonDialog"),E.kendoButton().data("kendoButton").enable(!1),o.kendoButton(),y.kendoButton().data("kendoButton").enable(!1),(S=new l.data.DataSource({data:[]})).read(),p=I.kendoGrid({dataSource:[],columns:function(){var a=[],e=[{field:"checkbox",title:"",sortable:!1,type:"checkbox",width:"50px"},{field:"type",title:m.prop("SETTINGS_DEVICE_TYPE"),sortable:!1,type:"dropdownlist",width:"150px"},{field:"id",title:m.prop("SETTINGS_DEVICE_ID"),sortable:!1,type:"input",width:"335px"},{field:"name",title:m.prop("SETTINGS_DEVICE_NAME"),sortable:!1,type:"input",width:"250px"},{field:"mappedType",title:m.prop("SETTINGS_TYPE"),sortable:!1,type:"string",width:"250px"},{field:"description",title:m.prop("SETTINGS_DEVICE_DESCRIPTION"),sortable:!1,type:"input",width:"auto"}];$.each(e,function(e,t){"checkbox"==t.field?a.push({headerTemplate:"<input type='checkbox' class='k-checkbox' data-event='devicecheckall' id='virtual-point-grid-check-all'><label class='k-checkbox-label' for='virtual-point-grid-check-all'></label>",template:function(e){return n(e,t)},width:t.width,sortable:t.sortable}):a.push({field:t.field,title:t.title,template:function(e){return n(e,t)},sortable:t.sortable,width:t.width})});var i=0;function n(e,t){var a,n;return"string"==t.type&&(e[t.field]=d.getValueFilteredForXSS(e[t.field])),a=e[t.field]?e[t.field]:"","dropdownlist"==t.type?n="<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"'/></div>":"input"==t.type?n="id"==t.field?e.isAdded?"<div class='sac-virtual-point-grid-cell'><span class='change-check sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' isadded='added'></span></div>":"<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check k-input sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' readonly disabled/></div>":"description"==t.field&&e.isAdded?"<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check k-input sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' isadded='added'/></div>":"name"==t.field?e.isAdded?"<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check k-input sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' isadded='added' required/></div>":"<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check k-input sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' required/></div>":"<div class='sac-virtual-point-grid-cell'><input type='text' class='change-check k-input sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"'/></div>":"checkbox"==t.type?n="<input type='checkbox' data-event='devicecheck' class='k-checkbox' id='virtual-point-grid-check-"+(i+=1)+"'/><label class='k-checkbox-label' for='virtual-point-grid-check-"+i+"'></label>":"string"==t.type&&("mappedType"==t.field&&e.isAdded?n="<div class='sac-virtual-point-grid-cell'><span class='change-check sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"' isadded='added'>"+h[a]+"</span></div>":"mappedType"==t.field&&(n="<div class='sac-virtual-point-grid-cell'><span class='change-check sac-virtual-point-grid-content' data-role='"+t.field+"' data-value='"+a+"' placeholder='"+t.title+"'>"+h[a]+"</span></div>")),n}return a}(),autoBind:!1,height:"100%",editable:!1}).data("kendoGrid"),D(),f(),g()});