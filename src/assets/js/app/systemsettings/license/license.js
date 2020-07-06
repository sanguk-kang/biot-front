define("systemsettings/license/license",["systemsettings/core"],function(){var m=window.I18N,_=new window.CommonLoadingPanel,g=window.MAIN_WINDOW,C=$("#setting-common-tab");$.when.apply(this,[]).always(function(){if(_.close(),C.kendoCommonTabStrip(),null!==localStorage.getItem("reloadFromMenuConfig")){var e=C.find("[aria-controls=settings-common-menuconfig]"),t=C.find(".k-item").index(e);C.data("kendoCommonTabStrip").select(t),localStorage.removeItem("reloadFromMenuConfig")}else C.data("kendoCommonTabStrip").select(0);var n,i,l,a,s,d,r,u,c,p,f,o,E,S;0<C.find("[aria-controls=license-container]").length&&(n=$("#license-container").find("> .top"),i=$("#license-license-grid"),l=n.find(".btn-box").find(".k-button[data-event=licenseadd]"),a=$("#popup-message-license"),s=null,d=$("#popup-select-license-file"),r=null,u=d.find(".k-button[data-event=uploadlicense]"),c=d.find(".k-button[data-event=cancel]"),p=$("#popup-license-find-file"),f=d.find(".popup-license-file-name"),o=function(){function l(){this.id=null,this.dms_devices_type=null,this.registeredDate=null,this.gateWayCount=null,this.pointCount=null}var a=i.data("kendoGrid").dataSource;_.open(),$.ajax({url:"/dms/licenses"}).done(function(e){_.close();for(var t=[],n=0;n<e.length;n++){var o=e[n],i=new l;i.id=o.id?o.id:null,i.registeredDate=o.registeredDate?o.registeredDate:null,i.dms_devices_type=o.dms_devices_type?o.dms_devices_type:null,"BIoTController"==o.dms_devices_type?i.pointCount=o.numberOfDevices:"BIoTGateway"==o.dms_devices_type&&(i.gateWayCount=o.numberOfDevices),t.push(i)}a.data(t),a.sort([{field:"id",dir:"desc"},{field:"registeredDate",dir:"desc"}])}).fail(function(e){_.close(),s.message(e.status),s.open()}).always(function(){})},E=function(){l.on("click",function(){var e=f.val();""!=e&&null!=e||u.data("kendoButton").enable(!1),r.openWindowPopup()})},S=function(){d.on("click",".k-button[data-event=uploadlicense]",function(){p=$("#popup-license-find-file");var e=new FormData;e.append("file",p[0].files[0]),_.open(),$.ajax({url:"/dms/licenses",method:"POST",data:e,isFileUpload:!0}).done(function(){_.close();var e;e=m.prop("LICENSE_MESSAGE_REGISTRATION_SUCCESS"),s.message(e),s.open(),r.close(),o()}).fail(function(e){var t="";if(_.close(),e.responseJSON){var n=e.responseJSON.code;t=41312==n?m.prop("LICENSE_MESSAGE_SAME_NAME_EXIST"):41313==n?m.prop("LICENSE_MESSAGE_SAME_FILE_EXIST"):41316==n?m.prop("LICENSE_MESSAGE_NOT_MATCH_MAC_ADDRESS"):41319==n?m.prop("LICENSE_MESSAGE_EXCEEDED_LICENSE"):201==n?m.prop("LICENSE_MESSAGE_REGISTRATION_SUCCESS"):m.prop("LICENSE_MESSAGE_INVALID_LICENSE_FILE")}else t=""+e.status;s.message(t),s.open()}).always(function(){})}),d.on("click",".k-button[data-event=cancel]",function(){f.val(""),r.close()})},function(){var o,e;g.disableFloorNav(!0),i.kendoGrid({dataSource:{data:[],aggregate:[{field:"gateWayCount",aggregate:"sum"},{field:"pointCount",aggregate:"sum"}]},columns:(o=[],e=[{field:"id",title:m.prop("LICENSE_INDEX"),sortable:!0,editable:!1},{field:"registeredDate",title:m.prop("LICENSE_ISSUE_DATE"),sortable:!0,editable:!1},{field:"pointCount",title:m.prop("LICENSE_POINT_COUNT"),sortable:!1,editable:!1}],$.each(e,function(e,t){var n={field:t.field,title:t.title,sortable:t.sortable,editable:t.editable};"id"==t.field?(n.footerTemplate=m.prop("LICENSE_TOTAL"),n.footerAttributes={class:"table-footer-cell"}):"registeredDate"==t.field?(n.footerTemplate="",n.footerAttributes={class:"table-footer-cell"}):"gateWayCount"==t.field?(n.footerTemplate=function(e){return e.gateWayCount.sum?e.gateWayCount.sum:"-"},n.footerAttributes={class:"table-footer-cell"}):"pointCount"==t.field&&(n.footerTemplate=function(e){return e.pointCount.sum?e.pointCount.sum:"-"},n.footerAttributes={class:"table-footer-cell"}),o.push(n)}),o),scrollable:!0,sortable:!0}),l.kendoButton(),s=a.kendoCommonDialog().data("kendoCommonDialog"),r=d.kendoPopupSingleWindow({title:m.prop("LICENSE_LICENSE_FILE_SELECT"),width:900,height:200}).data("kendoPopupSingleWindow"),u.kendoButton().data("kendoButton").enable(!1),c.kendoButton(),p.on("change",function(){var e=null;e=window.FileReader?$(this)[0].files[0].name:$(this).val().split("/").pop().split("\\").pop(),$(this).siblings(".popup-license-file-name").val(e),f.focus(),f.blur(),""==e||null==e?u.data("kendoButton").enable(!1):u.data("kendoButton").enable(!0)})}(),o(),E(),S())})});