define("history/systemlog/systemlog",[],function(){var i=window.kendo,r=window.moment,l=window.Util,e=window.I18N,t=new window.CommonLoadingPanel,a=window.MAIN_WINDOW,s=i.data.Model.define({fields:{eventTime:{name:e.prop("ALARM_LOG_DATE"),type:"string"},ums_users_name:{name:e.prop("ALARM_LOG_USER_ID"),type:"string"},type:{name:e.prop("ALARM_LOG_TYPE"),type:"string"},description:{name:e.prop("ALARM_LOG_DESCRIPTION"),type:"string"},id:{name:"ID",type:"string"}}}),n=$(".systemLog-confirm-dialog"),o=$(".systemlog-message-dialog");n.kendoCommonDialog({type:"confirm"}),o.kendoCommonDialog();var d,g,m=$("#alarmlog-systemlog").find(".common-tab-strip"),u=$(".alarmlog-systemlog-top"),p=u.find(".timeselector-start"),c=u.find(".timeselector-end"),f=p.find("input"),v=c.find("input"),y=new Date,w=new Date(y.getFullYear(),y.getMonth(),1,0,0,0),D=new Date(y.getFullYear(),y.getMonth(),y.getDate(),23,59,59),h=$("button[data-event=systemlogview]"),k=[],L=$("#systemlog-grid"),S=["eventTime","ums_users_name","type","description"],_=$("#popup-systemlog-single"),M=$("#popup-systemlog-multiple");function T(e){return r(e).format("YYYY-MM-DD")}function b(e){e.data("kendoGrid").dataSource.sort([{field:"eventTime",dir:"desc"}])}function C(e){o.data("kendoCommonDialog").message("<p class='pop-confirm-message'>"+e.responseText+"</p>"),o.data("kendoCommonDialog").open()}a.disableFloorNav(!0),m.kendoCommonTabStrip(),d=f.kendoCommonDatePicker({value:w,isStart:!0,change:function(){var e=d.value(),t=g.value(),a=new Date(r().year(),r().month(),r().date(),0,0,0);return a-e<0?(e=a,d.value(e),void d.trigger("change")):((t=new Date(t.getFullYear(),t.getMonth(),t.getDate(),0,0,0))-e<0&&(t=e,g.value(t),g.trigger("change")),t-e>r(t).add(1,"years")-r(t)?(e=new Date(t.getFullYear()-1,t.getMonth(),t.getDate(),0,0,0),d.value(e),void d.trigger("change")):void 0)}}).data("kendoCommonDatePicker"),g=v.kendoCommonDatePicker({value:D,isEnd:!0,change:function(){var e=d.value(),t=g.value(),a=new Date(r().year(),r().month(),r().date(),23,59,59);if(a-t<0)return t=a,g.value(t),void g.trigger("change");t-(e=new Date(e.getFullYear(),e.getMonth(),e.getDate(),23,59,59))<0&&(e=t,d.value(e),d.trigger("change")),t-e>r(t).add(1,"years")-r(t)&&(e=new Date(t.getFullYear()-1,t.getMonth(),t.getDate(),0,0,0),d.value(e),d.trigger("change"))}}).data("kendoCommonDatePicker"),h.kendoButton(),L.kendoGrid({columns:function(e,t){function a(){this.fields=null,this.title=null,this.template=null}for(var n=[],o=0;o<e.length;o++)for(var i in s.fields)if(i===e[o]){var r=new a;"eventTime"===i?(r.sortable=!0,r.width="300px"):"ums_users_name"===i?(r.sortable=!0,r.width="280px"):"type"===i?(r.sortable=!1,r.width="300px"):"description"===i&&(r.sortable=!1),r.field=i,r.title="<span class='alarmlog-systemlog-"+t+"grid-title' data-title='"+i+"'>"+s.fields[i].name+"</span>",r.template="<div class='alarmlog-systemlog-gridcell-"+i+"'><span class='alarmlog-systemlog-"+t+"grid-value' data-value='"+i+"'>#: "+i+" #</span></div>",n.push(r)}return n}(S,"systemlog"),dataSource:[],scrollable:{virtual:!0},sortable:!0}),_.kendoPopupSingleWindow({model:s}),M.kendoPopupMultipleWindow({model:s}),h.on("click",function(){w=d.value(),D=g.value(),t.open(),$.ajax({url:"/foundation/systemLogs?startDate="+T(w)+"&endDate="+T(D)}).done(function(e){k=[];for(var t=0;t<e.length;t++){var a=e[t];for(var n in s.fields)!1===a.hasOwnProperty(n)?a[n]="-":"eventTime"===n?a[n]=r(a[n]).format("LLL").replace(/\./g,"/"):"type"===n&&(a[n]=l.getSystemLogOperationType(a[n]));k.push(new s(a))}var o=new i.data.DataSource({data:k,pageSize:30});o.read(),L.data("kendoGrid").setDataSource(o),b(L)}).fail(function(e){C(e)}).always(function(){t.close()})}),t.open(),$.ajax({url:"/foundation/systemLogs?startDate="+T(w)+"&endDate="+T(D)}).done(function(e){k=[];for(var t=0;t<e.length;t++){var a=e[t];for(var n in s.fields)!1===a.hasOwnProperty(n)?a[n]="-":"eventTime"===n?a[n]=r(a[n]).format("LLL").replace(/\./g,"/"):"type"===n&&(a[n]=l.getSystemLogOperationType(a[n]));k.push(new s(a))}var o=new i.data.DataSource({data:k,pageSize:30});o.read(),L.data("kendoGrid").setDataSource(o),b(L)}).fail(function(e){C(e)}).always(function(){t.close()}),L.data("kendoGrid").dataSource.bind("change",function(e){})});