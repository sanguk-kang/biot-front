/**
*
*   <ul>
*       <li>Group 기능 내 공용 Template</li>
*       <li>Group 제어 팝업 내 제어 패널 HTML Template을 제공한다.</li>
*   </ul>
*   @module app/operation/group/config/group-template
*   @requires config
*
*/
define("operation/group/config/group-template", [], function(){
	var I18N = window.I18N;

	var groupControlTemplate = '<div class="group-control-dialog-control groupControl">' +
			'<div class="controllerList noarr">' +
				/*실내기 제어 패널 테스트*/
				'<div data-bind="invisible:indoorControlPanel.invisible">' +
					'<div class="control-panel"></div>' +
				'</div>' +
				//제어 패널 Widget으로 대체
				'<div data-bind="invisible:light.invisible">' +
				'<div class="horzline"></div>' +
				'<div class="typename">' + I18N.prop("FACILITY_DEVICE_TYPE_LIGHT") + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<button type="button" class="controlBtn" data-bind="events:{click:light.power.click}, css:{selected:light.power.active}, invisible:light.power.invisible"><span class="icwrap"><i class="ic power"></i><span data-bind="visible:light.power.active">ON</span><span data-bind="visible:light.power.mixed">/ OFF</span><span data-bind="invisible:light.power.active">OFF</span></span></button>' +
						'<div data-bind="invisible:light.dimming.invisible">' +
						'<p class="bluetit">' + I18N.prop("FACILITY_DEVICE_LIGHT_BRIGHTNESS") + ' (0 ~ 100 %)</p>' +
						'<div class="tb slider">' +
							'<div class="tbc">' +
								'<div class="customSlider">' +
									'<input style="width:160px;" data-bind="value:light.value,events:{slide:light.slide}" data-role="slider" data-show-buttons="false" data-tooltip="{enabled:false}" data-tick-placement="none" data-min="0" data-max="100" data-small-step="1" data-large-step="1"/>' +
									'<span class="valTxt"><span data-bind="text:light.value"></span>%</span>' +
								'</div>' +
							'</div>' +
						'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'</div>' +
				'<div data-bind="invisible:point.invisible">' +
				'<div class="horzline"></div>' +
				'<div class="typename">' + I18N.prop("FACILITY_POINT_DDC_FACILITY_POINT_CONTROL") + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<div data-bind="invisible:point.aoav.invisible">' +
						'<p class="bluetit lowtop">AO</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<input style="width:145px;margin-right:2px;" id="point-value" data-role="numerictextbox"' +
									'data-min="#=point.aoav.min#"' +
									'data-max="#=point.aoav.max#"' +
									'data-decimals="#=point.aoav.decimals#"' +
									'data-decimals="#=point.aoav.format#"' +
									'data-round="false"' +
									'data-spinners="false"' +
									'data-bind="value: point.aoav.value"/>' +
							'</div>' +
							'<div class="tbc bt">' +
								'<button type="button" class="commonBtn" data-bind="events:{click:point.aoav.send}">' + I18N.prop("COMMON_BTN_SEND") + '</button>' +
							'</div>' +
						'</div>' +
						'</div>' +
						'<div data-bind="invisible:point.dodv.invisible">' +
						'<p class="bluetit">DO</p>' +
						'<button type="button" class="controlBtn" data-bind="events:{click : point.dodv.click}, css:{selected : point.dodv.active}"><span class="icwrap"><i class="ic power"></i><span data-bind="visible:point.dodv.active">ON</span><span data-bind="visible:point.dodv.mixed">/OFF</span><span data-bind="invisible:point.dodv.active">OFF</span></span></button>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'</div>' +
				'<div data-bind="invisible:gateway.invisible">' +
				'<div class="horzline"></div>' +
				'<div class="typename">' + "ZigBee Interface" + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="zigbee-power" id="zigbee-power-on" checked="" value="true" data-bind="checked:gateway.gatewayZigbeePower, click:gateway.clickGatewayZigbeePower"><label class="k-radio-label" for="zigbee-power-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="zigbee-power" id="zigbee-power-off" checked="" value="false" data-bind="checked:gateway.gatewayZigbeePower, click:gateway.clickGatewayZigbeePower"><label class="k-radio-label" for="zigbee-power-off">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_WIFI_CHANNEL") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input data-role="dropdownlist" data-bind="source : gateway.gatewayZigbeeChannelList, value : gateway.gatewayZigbeeChannel, events:{change:gateway.changeGatewayZigbeeChannel}" /></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input data-role="dropdownlist" data-bind="source : gateway.gatewayZigbeeTxPowerList, value : gateway.gatewayZigbeeTxPower, events:{change:gateway.changeGatewayZigbeeTxPower}" /></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_PAIRING_MODE") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="zigbee-pairing" id="zigbee-pairing-on" value="true" data-bind="checked:gateway.gatewayZigbeePairingMode, click:gateway.clickGatewayZigbeePairingMode"><label class="k-radio-label" for="zigbee-pairing-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="zigbee-pairing" id="zigbee-pairing-off" value="false" data-bind="checked:gateway.gatewayZigbeePairingMode, click:gateway.clickGatewayZigbeePairingMode"><label class="k-radio-label" for="zigbee-pairing-off">Off</label></div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="typename">' + "BLE Interface" + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power" id="ble-power-on" checked="" value="true" data-bind="checked:gateway.gatewayBlePower, click:gateway.clickGatewayBlePower"><label class="k-radio-label" for="ble-power-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power" id="ble-power-off" checked="" value="false" data-bind="checked:gateway.gatewayBlePower, click:gateway.clickGatewayBlePower"><label class="k-radio-label" for="ble-power-off">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_REPORT") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-scan-report" id="ble-scan-report-on" checked="" value="true" data-bind="checked:gateway.gatewayBleScanReport, click:gateway.clickGatewayBleScanReport"><label class="k-radio-label" for="ble-scan-report-on" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-scan-report" id="ble-scan-report-off" checked="" value="false" data-bind="checked:gateway.gatewayBleScanReport, click:gateway.clickGatewayBleScanReport"><label class="k-radio-label" for="ble-scan-report-off">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_REPORT_INTERVAL") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="100" data-max="30000" data-spinners="false" data-bind="value : gateway.gatewayBleScanReportInterval, events:{change:gateway.changeGatewayBleScanReportInterval}" /></span><span style="margin-left:10px;">(100 ~ 30,000)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_WINDOW") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="10240" data-spinners="false" data-bind="value : gateway.gatewayBleScanWindow, events:{change:gateway.changeGatewayBleScanWindow}" /></span><span style="margin-left:10px;">(0 ~ 10,240)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_INTERVAL") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="10240" data-spinners="false" data-bind="value : gateway.gatewayBleScanInterval, events:{change:gateway.changeGatewayBleScanInterval}" /></span><span style="margin-left:10px;">(<span class="scan-interval-min">0</span> ~ 10,240)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_SCAN_TYPE") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-scan-type" id="ble-scan-type-on" checked="" value="Passive" data-bind="checked:gateway.gatewayBleScanType, click:gateway.clickGatewayBleScanType"><label class="k-radio-label" for="ble-scan-type-on" style="margin-right:51px;">Passive</label><input type="radio" class="k-radio" name="ble-scan-type" id="ble-scan-type-off" checked="" value="Active" data-bind="checked:gateway.gatewayBleScanType, click:gateway.clickGatewayBleScanType"><label class="k-radio-label" for="ble-scan-type-off">Active</label></div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="typename">' + "Built-in Beacon Setup" + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_INTERVAL") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="100" data-max="5000" data-spinners="false" data-bind="value : gateway.gatewayBleAdvertisementInterval, events:{change:gateway.changeGatewayBleAdvertisementInterval}" /></span><span style="margin-left:10px;">(100 ~ 5,000)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_TX_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-100" data-max="20" data-spinners="false" data-bind="value : gateway.gatewayBleTxPower, events:{change:gateway.changeGatewayBleTxPower}" /></span><span style="margin-left:10px;">(-100 ~ 20)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_CALIBRATION") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-128" data-max="127" data-spinners="false" data-bind="value : gateway.gatewayBleCalibration, events:{change:gateway.changeGatewayBleCalibration}" /></span><span style="margin-left:10px;">(-128 ~ 127)</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="typename">' + 'Built-in Beacon \\#1' + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-1" id="ble-power-on-1" checked="" value="true" data-bind="checked:gateway.gatewayBleFirstPower, click:gateway.clickGatewayBleFirstPower"><label class="k-radio-label" for="ble-power-on-1" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-1" id="ble-power-off-1" checked="" value="false" data-bind="checked:gateway.gatewayBleFirstPower, click:gateway.clickGatewayBleFirstPower"><label class="k-radio-label" for="ble-power-off-1">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form data-role="commonvalidator" data-type="name"><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleFirstAdvertiseName, events:{change:gateway.changeGatewayBleFirstAdvertiseName}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'UUID' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleFirstUUID, events:{change:gateway.changeGatewayBleFirstUUID}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Major' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleFirstMajor, events:{change:gateway.changeGatewayBleFirstMajor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Minor' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleFirstMinor, events:{change:gateway.changeGatewayBleFirstMinor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="typename">' + 'Built-in Beacon \\#2' + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-2" id="ble-power-on-2" checked="" value="true" data-bind="checked:gateway.gatewayBleSecondPower, click:gateway.clickGatewayBleSecondPower"><label class="k-radio-label" for="ble-power-on-2" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-2" id="ble-power-off-2" checked="" value="false" data-bind="checked:gateway.gatewayBleSecondPower, click:gateway.clickGatewayBleSecondPower"><label class="k-radio-label" for="ble-power-off-2">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form data-role="commonvalidator" data-type="name"><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleSecondAdvertiseName, events:{change:gateway.changeGatewayBleSecondAdvertiseName}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'UUID' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleSecondUUID, events:{change:gateway.changeGatewayBleSecondUUID}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Major' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleSecondMajor, events:{change:gateway.changeGatewayBleSecondMajor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Minor' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleSecondMinor, events:{change:gateway.changeGatewayBleSecondMinor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="typename">' + 'Built-in Beacon \\#3' + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_NETWORK_POWER") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div style="line-height:36px; margin-bottom : 10px;"><input type="radio" class="k-radio" name="ble-power-3" id="ble-power-on-3" checked="" value="true" data-bind="checked:gateway.gatewayBleThirdPower, click:gateway.clickGatewayBleThirdPower"><label class="k-radio-label" for="ble-power-on-3" style="margin-right:51px;">On</label><input type="radio" class="k-radio" name="ble-power-3" id="ble-power-off-3" checked="" value="false" data-bind="checked:gateway.gatewayBleThirdPower, click:gateway.clickGatewayBleThirdPower"><label class="k-radio-label" for="ble-power-off-3">Off</label></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form data-role="commonvalidator" data-type="name"><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleThirdAdvertiseName, events:{change:gateway.changeGatewayBleThirdAdvertiseName}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'UUID' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form><input class="k-input" type="text" style="width: 100%;" data-bind="value : gateway.gatewayBleThirdUUID, events:{change:gateway.changeGatewayBleThirdUUID}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Major' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleThirdMajor, events:{change:gateway.changeGatewayBleThirdMajor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + 'Minor' + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : gateway.gatewayBleThirdMinor, events:{change:gateway.changeGatewayBleThirdMinor}" /></span><span style="margin-left:10px;">(0 ~ 65535)</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'</div>' +
				'<div data-bind="invisible:beacon.invisible">' +
				'<div class="horzline"></div>' +
				'<div class="typename">' + "Advertisement" + '</div>' +
				'<div class="innerBox">' +
					'<div class="innerSet">' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_NAME") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form><input class="k-input" type="text" style="width: 100%;" data-bind="value : beacon.advertisingName, events:{change:beacon.changeAdvertisingName}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + I18N.prop("FACILITY_DEVICE_BEACON_ADVERTISEMENT_INTERVAL") + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="100" data-max="10240" data-spinners="false" data-bind="value : beacon.advertisingInterval, events:{change:beacon.changeAdvertisingInterval}" /></span><span style="margin-left:10px;">(100 ~ 10,240)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + "UUID" + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><form><input class="k-input" type="text" style="width: 100%;" data-bind="value : beacon.uuid, events:{change:beacon.changeUuid}" /></form></div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + "Major" + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : beacon.major, events:{change:beacon.changeMajor}" /></span><span style="margin-left:10px;">(0 ~ 65,535)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + "Minor" + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="0" data-max="65535" data-spinners="false" data-bind="value : beacon.minor, events:{change:beacon.changeMinor}" /></span><span style="margin-left:10px;">(0 ~ 65,535)</div>' +
							'</div>' +
						'</div>' +
						'<p class="bluetit lowtop">' + "Tx Power" + '</p>' +
						'<div class="tb frmAddBtn">' +
							'<div class="tbc">' +
								'<div><input  style="width: calc( 100% - 120px );" class="device-point-numeric" data-decimals="1" data-format="n0" data-role="numerictextbox" data-min="-100" data-max="20" data-spinners="false" data-bind="value : beacon.txPower, events:{change:beacon.changeTxPower}" /></span><span style="margin-left:10px;">(-100 ~ 20)</div>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'</div>';
	'</div>' +
		'</div>' +
	'</div>';

	return {
		groupControlTemplate : groupControlTemplate
	};
});
//# sourceURL=operation-group-template.js
