/**
*
*   <ul>
*       <li>공용 Validator</li>
*       <li>Kendo UI의 Validator Widget을 상속받아 추가 구현되었다.</li>
*       <li>각 단위기능 내 입력필드에서 옵션에 따라 정규식, MIN/MAX 등의 유효성 체크가 가능하게 한다.</li>
*   </ul>
*   @module app/widget/common-validator
*   @requires lib/kendo.all
*
*/
(function(window, $){
	"use strict";

	//ID 허용되는 문자
	var IDValidRegExp = /^[A-Za-z0-9_.]+$/;
	//패스워드 문자, 숫자, 특수 문자 조합 체크
	//var PwMixRegExp = /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,20}$/;
	var PwMixRegExp = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[`~!@#$%^&*()_\-=+])[a-zA-Z\d`~!@#$%^&*()_\-=+]{8,20}$/;
	//패스워드 허용되는 문자
	var PwValidRegExp = /^[A-Za-z0-9`~!@#$%^&*()_\-=+]+$/;

	//var PhoneRegExp = /^\d{3}-\d{3,4}-\d{4}$/;
	//var PhoneRegExp = /^[0-9()\[\]-]+$/;
	var PhoneRegExp = /^(?=.{4,25}$)(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?[\-\.\ \\\/]?(\d+))?$/;
	var PhoneCharRegExp =  /^[0-9-(+)\s]+$/;
	/*\"^(?=.{4,25}$)(?:(?:\\(?(?:00|\\+)([1-4]\\d\\d|[1-9]\\d?)\\)?)?[\\-\\.\\ \\\\/]?)?((?:\\(?\\d{1,}\\)?[\\-\\.\\ \\\\/]?){0,})(?:[\\-\\.\\ \\\\/]?[\\-\\.\\ \\\\/]?(\\d+))?$\"*/

	//var EmailRegExp = /^[A-Za-z0-9_.@-]+$/;
	var EmailRegExp = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
	// var EmailRegExp = /^(?=.{5,253}$)[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
	var EmailCharRegExp = /^[A-Za-z0-9_.@+-]+$/;
	// IP address 정규식
	var IpAddressRegExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	// Network ID 허용되는 문자
	var NetworkIdRegExp = /^[A-Za-z0-9.-]+$/;

	var OnlyNumberRegExp = /^(0|[1-9][0-9]*)$/;
	var DecimalRegExp = /^[-+]?[0-9]+(\.[0-9]{1,2})?$/;

	var LicenseFileNameRegExp = /^(?=.{4,255}$)([\p{L}_\-\s0-9\.]+)\.key$/;

	var NetUUIDRegExp = /^(E2C56DB5\-DFFB\-).*$/;
	var NetUUIDRegExp_hex = /^[A-Fa-f0-9-]+$/;

	var hmiGraphicNameRegExp = /^(?=.{1,255}$)([\._\-\s0-9a-zA-Z\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]+)$/;

	var hexColorRegExp = /^#([A-Fa-f0-9]{6}$)/;


	var INPUTSELECTOR = ':input:not(:button,[type=submit],[type=reset],[disabled],[readonly])',
		VALIDATE_INPUT = 'validateInput', INVALIDINPUT = 'k-invalid', VALIDINPUT = 'k-valid';
	var VALIDATE = 'validate', CHANGE = 'change', INVALIDMSG = 'k-invalid-msg',
		NAME = 'name';

	function decode(value) {
		return value.replace(/&amp/g, '&amp;').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	}

	function parseHtml(text) {
		if ($.parseHTML) {
			return $($.parseHTML(text));
		}
		return $(text);
	}

	function getValidator(input){
		var validator = input.data("kendoCommonValidator");
		//<form>을 validator로 초기화 했을 Case에 대한 예외처리
		if(!validator){
			validator = input.closest("[data-role='commonvalidator']").data("kendoCommonValidator");
		}
		return validator;
	}

	var kendo = window.kendo;
	var Validator = kendo.ui.Validator;

	var widget = Validator.extend({
		//디폴트 옵션
		options: {
			name : "CommonValidator",
			required : false,
			type : null,
			minLength : null,
			maxLength : null,
			min : null,	//numeric type 일 경우 값 크기 비교
			max : null,	//numeric type 일 경우 값 크기 비교
			passwordRetypeFor : null,
			oldPassword : null,
			mixedPasswordCheck : true,
			isKeyUpValidation : true,
			scrollWrapperClass : null,
			builtInMinMax :{
				id : {
					min : 5,
					max : 16
				},
				password : {
					min : 8,
					max : 20
				},
				passwordRetype : {
					min: 8,
					max: 20
				},
				name : {
					min : 1,
					max : 30
				},
				hmiGraphicName : {
					min : 1,
					max : 50
				},
				hmiLibraryName : {
					min : 1,
					max : 30
				},
				mobilePhoneNumber : {
					min : 4,
					max : 25
				},
				email : {
					min : 5,
					max : 253
				},
				networkId : {
					min: 1,
					max: 32
				},
				description : {
					max : 300
				},
				organization: {
					min : 1,
					max : 30
				}
			},
			builtInRules : {
				minLength : function(input){
					var validator = getValidator(input);
					var min = validator.options.minLength;
					if(min){
						var val = input.val();
						if(val !== '' && val.length < min){
							return false;
						}
					}
					return true;
				},
				maxLength : function(input){
					var validator = getValidator(input);
					var max = validator.options.maxLength;
					if(max){
						var val = input.val();
						if(val !== '' && val.length > max){
							return false;
						}
					}
					return true;
				}
			},
			builtInMessages : {
				minLength : function(){
					var minLength = this.options.minLength;
					var I18N = window.I18N;
					return I18N.prop("COMMON_CANNOT_INPUT_LESS", minLength);
				},
				maxLength : function(){
					var maxLength = this.options.maxLength;
					var I18N = window.I18N;
					return I18N.prop("COMMON_CANNOT_INPUT_MORE", maxLength);
				}
			},
			builtInOptions : {
				id : {
					messages: {
						capslock: "COMMON_CAPS_LOCK_ON",
						invalidCharacter : "COMMON_INVALID_CHARACTER",
						required: "COMMON_REQUIRED_ID",
						// incorrect : "COMMON_INCORRECT_USERNAME",
						alreadyUse : "COMMON_EXIST_ID"
					},
					rules : {
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(IDValidRegExp);
						}
					}
				},
				password : {
					messages: {
						capslock: "COMMON_CAPS_LOCK_ON",
						invalidCharacter : "COMMON_INVALID_CHARACTER",
						required: "COMMON_REQUIRED_PASSWORD",
						incorrect : "COMMON_INCORRECT_PASSWORD",
						incorrectBoth : "COMMON_INCORRECT_USERNAME_AND_PASSWORD",
						pwMixedCharacter : "COMMON_MUST_MIXED_PASSWORD",
						sameOldPassword : "COMMON_SAME_OLD_PASSWORD"
					},
					rules : {
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PwValidRegExp);
						},
						pwMixedCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PwMixRegExp);
						},
						sameOldPassword : function(input){
							var val = input.val();
							var validator = getValidator(input);
							var target = validator.options.oldPassword;
							if(target){
								return !(target.val() == val);
							}
							return true;
						}
					}
				},
				name : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION"
					}
				},
				name_16 : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION",
						under16: "COMMON_NOT_LENGTH_16"
					},
					rules : {

						under16: function(input){
							var val = input.val();
							if(val.length > 16){
								return false;
							}
							return true;
						}
					}
				},
				hmiGraphicName : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION",
						invalidCharacter : "COMMON_INVALID_CHARACTER"
					},
					rules : {
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(hmiGraphicNameRegExp);
						}
					}
				},
				hmiLibraryName : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION",
						invalidCharacter : "COMMON_INVALID_CHARACTER"
					},
					rules : {
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(hmiGraphicNameRegExp);
						}
					}
				},
				hexColor : {
					messages : {
						invalidColor : "COMMON_INVALID_COLOR"
					},
					rules : {
						invalidColor : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(hexColorRegExp);
						}
					}
				},
				description : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION"
					}
				},
				mobilePhoneNumber : {
					messages : {
						invalidCharacter : "COMMON_INVALID_CHARACTER",
						invalidPhone : "COMMON_INVALID_PHONE_NUMBER"
					},
					rules : {
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PhoneCharRegExp);
						},
						invalidPhone : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PhoneRegExp);
						}
					}
				},
				email : {
					messages : {
						email : "COMMON_INVALID_EMAIL_ADDRESS",
						invalidCharacter : "COMMON_INVALID_CHARACTER"
					},
					rules : {
						email : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(EmailRegExp);
						},
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(EmailCharRegExp);
						}
					}
				},
				passwordRetype : {
					messages : {
						required: "COMMON_REQUIRED_INFORMATION",
						notMatched : "COMMON_NOT_MATCHED_PASSWORD",
						invalidCharacter : "COMMON_INVALID_CHARACTER",
						pwMixedCharacter : "COMMON_MUST_MIXED_PASSWORD"
					},
					rules : {
						notMatched : function(input){
							var retypeVal = input.val();
							var validator = getValidator(input);
							var target = validator.options.passwordRetypeFor;
							var val = target.val();
							if(retypeVal != val){
								return false;
							}
							return true;
						},
						invalidCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PwValidRegExp);
						},
						pwMixedCharacter : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(PwMixRegExp);
						}
					}
				},
				ipAddress: { //IP 형식에 맞는 값이 입력되어야한다. 맞지 않으면 메시지 팝업
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						invalidIpAddress : "COMMON_INVALID_CHARACTER"
					},
					rules: {
						invalidIpAddress: function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(IpAddressRegExp);
						}
					}
				},
				networkId: { // 최소1~32입력, 32초과시 메시지 팝업, 'A~Z', '0~9', -, .만 허용
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						invalidNetworkId : "COMMON_INVALID_CHARACTER"
					},
					rules: {
						invalidNetworkId: function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(NetworkIdRegExp);
						}
					}
				},
				onlyNumber: { // 숫자만 입력
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						invalidNumber: "COMMON_INVALID_VALUE"
					},
					rules: {
						invalidNumber: function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(OnlyNumberRegExp);
						}
					}
				},
				numeric : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						numeric: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						}
					},
					rules: {
						numeric: function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(OnlyNumberRegExp);
						},
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						}
					}
				},
				hmiValueMinMax : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						decimal: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						},
						minField : function(input){
							var I18N = window.I18N;
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var wrapper = input.closest(".hmi-binding-property-inner-wrapper");
							var categoryEl = wrapper.find(".hmi-binding-property-category[data-key='minMax']");
							var categoryItemsEl = categoryEl.find("ul.category-items");
							var propertyEl = categoryItemsEl.find("li.property[data-key='minValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var minField = propertyEl.find(selector);
							var min = minField.val();
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						maxField : function(input){
							var I18N = window.I18N;
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var wrapper = input.closest(".hmi-binding-property-inner-wrapper");
							var categoryEl = wrapper.find(".hmi-binding-property-category[data-key='minMax']");
							var categoryItemsEl = categoryEl.find("ul.category-items");
							var propertyEl = categoryItemsEl.find("li.property[data-key='maxValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var maxField = propertyEl.find(selector);
							var max = maxField.val();
							return I18N.prop("COMMON_INVALID_MAX", max);
						}
					},
					rules: {
						decimal : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var min = this.options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var max = this.options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						},
						minField : function(input){
							var val = input.val();
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var wrapper = input.closest(".hmi-binding-property-inner-wrapper");
							var categoryEl = wrapper.find(".hmi-binding-property-category[data-key='minMax']");
							var categoryItemsEl = categoryEl.find("ul.category-items");
							//최소 값 필드의 값보다 커야함
							var propertyEl = categoryItemsEl.find("li.property[data-key='minValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var otherField = propertyEl.find(selector);
							if(otherField.prop("disabled")) return true;
							var min = otherField.val();
							if(typeof min === "undefined" || min === null) return true;
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							//if(val < min) console.error("minField invalid -> max : " + val + ", min : " + min);
							if(val < min) return false;
							return true;
						},
						maxField : function(input){
							var val = input.val();
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var wrapper = input.closest(".hmi-binding-property-inner-wrapper");
							var categoryEl = wrapper.find(".hmi-binding-property-category[data-key='minMax']");
							var categoryItemsEl = categoryEl.find("ul.category-items");
							//최대 값 필드의 값보다 작아야함
							var propertyEl = categoryItemsEl.find("li.property[data-key='maxValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var otherField = propertyEl.find(selector);
							if(otherField.prop("disabled")) return true;
							var max = otherField.val();
							if(typeof max === "undefined" || max === null) return true;
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							//if(val > max) console.error("maxField invalid -> min : " + val + ", max : " + max);
							if(val > max) return false;
							return true;
						}
					}
				},
				hmiMinMax : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						decimal: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						},
						minField : function(input){
							var I18N = window.I18N;
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var categoryEl = input.closest("li.property");
							var categoryItemsEl = categoryEl.closest("ul.category-items");
							var propertyEl = categoryItemsEl.find("li.property[data-key='minValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var minField = propertyEl.find(selector);
							var min = minField.val();
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						maxField : function(input){
							var I18N = window.I18N;
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var categoryEl = input.closest("li.property");
							var categoryItemsEl = categoryEl.closest("ul.category-items");
							var propertyEl = categoryItemsEl.find("li.property[data-key='maxValue']");
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var maxField = propertyEl.find(selector);
							var max = maxField.val();
							return I18N.prop("COMMON_INVALID_MAX", max);
						},
						sameMinMax : "HMI_EQUAL_MIN_MAX_MSG"
					},
					rules: {
						decimal: function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var min = this.options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var max = this.options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						},
						minField : function(input){
							var val = input.val();
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var categoryEl = input.closest("li.property");
							var categoryItemsEl = categoryEl.closest("ul.category-items");
							var field = categoryEl.data("key");
							var otherField, isMin = (field == "minValue");
							if(!isMin){	//최대 값 필드의 값이 최소 값 필드의 값보다 커야함
								var propertyEl = categoryItemsEl.find("li.property[data-key='minValue']");
								var selector = ".value .k-input";
								if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
								otherField = propertyEl.find(selector);
								var min = otherField.val();
								if(typeof min === "undefined" || min === null) return true;
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								//if(val < min) console.error("minField invalid -> max : " + val + ", min : " + min);
								if(val < min) return false;
							}
							return true;
						},
						maxField : function(input){
							var val = input.val();
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var categoryEl = input.closest("li.property");
							var categoryItemsEl = categoryEl.closest("ul.category-items");
							var field = categoryEl.data("key");
							var otherField, isMin = (field == "minValue");
							if(isMin){	//최소 값 필드의 값이 최대 값 필드의 값보다 작아야함
								var propertyEl = categoryItemsEl.find("li.property[data-key='maxValue']");
								var selector = ".value .k-input";
								if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
								otherField = propertyEl.find(selector);
								var max = otherField.val();
								if(typeof max === "undefined" || max === null) return true;
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								//if(val > max) console.error("maxField invalid -> min : " + val + ", max : " + max);
								if(val > max) return false;
							}
							return true;
						},
						sameMinMax : function(input){
							var val = input.val(), otherVal;
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var categoryEl = input.closest("li.property");
							var categoryItemsEl = categoryEl.closest("ul.category-items");
							var field = categoryEl.data("key");
							var otherField, isMin = (field == "minValue");
							var propertyEl;
							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							if(isMin) propertyEl = categoryItemsEl.find("li.property[data-key='maxValue']");
							else propertyEl = categoryItemsEl.find("li.property[data-key='minValue']");
							otherField = propertyEl.find(selector);
							otherVal = otherField.val();
							//if(val == otherVal) console.error("sameminmax invalid -> curVal : " + val + ", otherVal : " + otherVal);
							return val != otherVal;
						}
					}
				},
				hmiTotalMinMax : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						decimal: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						},
						rowMin : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMinElem = libraryPopupElem.find(".k-input.min.total");
							var min = totalMinElem.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MIN", min);
						},
						rowMax : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMaxElem = libraryPopupElem.find(".k-input.max.total");
							var max = totalMaxElem.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MAX", max);
						}
					},
					rules: {
						decimal : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var min = this.options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var max = this.options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						},
						rowMin : function(input){
							var isMax = input.hasClass("max");
							if(isMax){
								var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
								var totalMinElem = libraryPopupElem.find(".k-input.min.total");
								var min = totalMinElem.val();
								if(typeof min === "undefined" || min === null) return true;
								var val = input.val();
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								if(val < min) return false;
							}

							return true;
						},
						rowMax : function(input){
							var isMin = input.hasClass("min");
							if(isMin){
								var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
								var totalMaxElem = libraryPopupElem.find(".k-input.max.total");
								var max = totalMaxElem.val();
								if(typeof max === "undefined" || max === null) return true;
								var val = input.val();
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								if(val > max) return false;
							}
							return true;
						}
					}
				},
				hmiImageListMinMax : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						numeric: "COMMON_INVALID_VALUE",
						min : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMinElem = libraryPopupElem.find(".k-input.min.total");
							var min = totalMinElem.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MIN", min);
						},
						max : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMaxElem = libraryPopupElem.find(".k-input.max.total");
							var max = totalMaxElem.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MAX", max);
						},
						//sameMinMax : "HMI_EQUAL_MIN_MAX_MSG",
						rowMin : function(input){
							var cell = input.closest("td");
							var minField = cell.find(".k-input.min");
							var min = minField.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MIN", min);
						},
						rowMax : function(input){
							var cell = input.closest("td");
							var minField = cell.find(".k-input.max");
							var max = minField.val();
							var I18N = window.I18N;
							return I18N.prop("HMI_LIBRARY_MULTI_MAX", max);
						},
						range : "HMI_LIBRARY_MULTI_OVERLAP"
					},
					rules: {
						decimal : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMinElem = libraryPopupElem.find(".k-input.min.total");
							var min = totalMinElem.val();
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var libraryPopupElem = input.closest(".hmi-library-palette-dialog");
							var totalMaxElem = libraryPopupElem.find(".k-input.max.total");
							var max = totalMaxElem.val();
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						},
						/*sameMinMax : function(input){
							var val = input.val(), isMin = input.hasClass("min"), otherField, otherVal;
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);

							var cell = input.closest("td");
							if(isMin) otherField = cell.find(".k-input.max");
							else otherField = cell.find(".k-input.min");
							otherVal = otherField.val();
							return val != otherVal;
						},*/
						rowMin : function(input){
							var val, isMax = input.hasClass("max");
							if(isMax){
								val = input.val();
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								var cell = input.closest("td");
								var minField = cell.find(".k-input.min");
								var min = minField.val();
								if(min > val) return false;
							}
							return true;
						},
						rowMax : function(input){
							var val, isMin = input.hasClass("min");
							if(isMin){
								val = input.val();
								if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
								val = Number(val);
								var cell = input.closest("td");
								var maxField = cell.find(".k-input.max");
								var max = maxField.val();
								if(max < val) return false;
							}
							return true;
						},
						range : function(input){
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							var id = input.data("id");
							var gridEl = input.closest(".image-list"), rows = gridEl.find("tbody > tr");
							var isValid = true;
							rows.each(function(i, elem){
								var row = $(elem);
								var minField = row.find(".list-range-validator.min .k-input");
								var rowId = minField.data("id");
								if(rowId == id) return true;
								var maxField = row.find(".list-range-validator.max .k-input");
								var min = minField.val();
								var max = maxField.val();
								if(val >= min && val <= max){
									isValid = false;
									return false;
								}
							});
							return isValid;
						}
					}
				},
				hmiOptionValues : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						decimal: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						},
						sameValue : "HMI_OPTION_VALUES_DUPLICATE"
					},
					rules: {
						decimal : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var min = this.options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var max = this.options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						},
						sameValue : function(input){
							var isNumericTextBox = input.attr("data-role") == "numerictextbox";
							var isNumericFormattedVal = input.hasClass("k-formatted-value");
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);

							var optionValuesEl = input.closest(".hmi-binding-option-values");
							var optionItemEl = input.closest(".hmi-binding-option-value-item").get(0);

							var selector = ".value .k-input";
							if(isNumericTextBox || isNumericFormattedVal) selector = ".value .k-input[data-role='numerictextbox']";
							var optionItemEls = optionValuesEl.find(".hmi-binding-option-value-item");
							var hasSameValue = false;
							optionItemEls.each(function(i, el){
								//현재 필드는 Pass
								if(optionItemEl === el) return true;
								var otherField = $(el).find(".hmi-binding-option-value-item-value " + selector);
								var otherVal = otherField.val();
								if(val == otherVal){
									hasSameValue = true;
									return false;
								}
							});
							return !hasSameValue;
						}
					}
				},
				decimal : {
					messages: {
						required: "COMMON_REQUIRED_INFORMATION",
						decimal: "COMMON_INVALID_VALUE",
						min : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var min = options.min;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MIN", min);
						},
						max : function(input){
							var validator = getValidator(input);
							var options = validator.options;
							var max = options.max;
							var I18N = window.I18N;
							return I18N.prop("COMMON_INVALID_MAX", max);
						}
					},
					rules: {
						decimal : function(input){
							var val = input.val();
							if(!val){
								return true;
							}
							return val.match(DecimalRegExp);
						},
						min : function(input){
							var min = this.options.min;
							if(typeof min === "undefined" || min === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val < min) return false;
							return true;
						},
						max : function(input){
							var max = this.options.max;
							if(typeof max === "undefined" || max === null) return true;
							var val = input.val();
							if(typeof val === "undefined" || val === null || val.indexOf(" ") != -1) return true;
							val = Number(val);
							if(val > max) return false;
							return true;
						}
					}
				},
				licenseFileName: {
					messages: {
						invalidName: "LICENSE_MESSAGE_SELECTED_FILE_NAME_INVALID"
					},
					rules: {
						invalidName: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							return val.match(LicenseFileNameRegExp);
						}
					}
				},
				uuid: {
					messages: {
						invalidName: "COMMON_INVALID_UUID",
						notMatched: "COMMON_NOT_HEX_UUID",
						notLength36: "COMMON_NOT_LENGTH_36"
					},
					rules: {

						invalidName: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							return val.match(NetUUIDRegExp);
						},
						notMatched: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							return val.match(NetUUIDRegExp_hex);
						},
						notLength36: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							if(val.length != 36) {
								return false;
							}
							return true;
						}

					}

				},
				uuid_min: {
					messages: {
						notMatched: "COMMON_NOT_HEX_UUID",
						notLength36: "COMMON_NOT_LENGTH_36"
					},
					rules: {

						notMatched: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							return val.match(NetUUIDRegExp_hex);
						},
						notLength36: function(input) {
							var val = input.val();
							if(!val) {
								return true;
							}
							if(val.length != 36) {
								return false;
							}
							return true;
						}

					}

				}
			}
		},
		init : function(element, options){
			//부모 함수 호출
			var builtInOptions, type;
			var self = this;
			var elem = $(element);
			var id;
			if(!options){
				options = {};
			}

			if(!options.minLength){
				options.minLength = elem.data("min-length");
			}

			if(!options.maxLength){
				options.maxLength = elem.data("max-length");
			}

			self._setDefaultMinMaxLength(options);

			//apply I18N default messages and exten rules
			var I18N = window.I18N;
			//default messages for min/max
			if(!options.messages){
				options.messages = {};
			}

			if(!options.rules){
				options.rules = {};
			}

			if(options.minLength){
				options.messages.minLength = self.options.builtInMessages.minLength.bind(this);
			}

			if(options.maxLength){
				options.messages.maxLength = self.options.builtInMessages.maxLength.bind(this);
			}

			//default rules for min/max
			if(!options.rules.minLength){
				options.rules.minLength = self.options.builtInRules.minLength;
			}

			if(!options.rules.maxLength){
				options.rules.maxLength = self.options.builtInRules.maxLength;
			}

			//specific type messages and rules
			builtInOptions = self.options.builtInOptions;
			type = options.type;
			if(type == "passwordRetype"){
				if(options.passwordRetypeFor){
					options.passwordRetypeFor = $(options.passwordRetypeFor);
				}
				id = "#" + elem.data("retype-for");
				if(!options.passwordRetypeFor){
					options.passwordRetypeFor = $(id);
				}
				if(!options.passwordRetypeFor || options.passwordRetypeFor.length == 0){
					console.error("there is no target password field for this password retype field.");
				}
			}

			if(type == "password"){
				var oldPassword = elem.data("oldPassword");
				if(oldPassword){
					id = "#" + oldPassword;
					options.oldPassword = $(id);
				}
			}
			//if have type
			self._attachEvt(elem, type);
			if(type && builtInOptions[type]){
				//apply i18n built-in meesages
				var key, message, rule;
				var builtInMessages = builtInOptions[type].messages;
				var builtInRules = builtInOptions[type].rules;
				for( key in builtInMessages ){
					message = builtInMessages[key];
					if(message && !options.messages[key]){
						if(typeof message === "string") options.messages[key] = I18N.prop(message);
						else if($.isFunction(message)) options.messages[key] = message.bind(this);
					}
					if(builtInRules){
						rule = builtInRules[key];
						if(key == "pwMixedCharacter" && options.mixedPasswordCheck == false){
							continue;
						}
						if(rule && !options.rules[key]){
							options.rules[key] = rule;
						}
					}
				}
			}

			if(options.required){
				if(!options.messages.required){
					options.messages.required = I18N.prop("COMMON_REQUIRED_INFORMATION");
				}
				elem.prop("required", true);
			}

			options = $.extend({}, self.options, options);
			Validator.fn.init.call(this, element, options);

			elem.addClass("common-validator");
		},
		/**
		*   <ul>
		*   <li>값 변경 시, 좌우 공백을 삭제하는 이벤트를 바인딩한다.</li>
		*   </ul>
		*   @function _attachEvt
		*   @param {jQueryElement} input - 입력 필드
		*   @param {String} type - Validator Type
		*   @returns {void}
		*   @alias module:app/widget/common-validator
		*
		*/
		_attachEvt : function(input, type){
			if(type == "id" || type == "password"
			   || type == "email"
			   || type == "passwordRetype"){
				input.on("keydown", this._blockSpaceEvt);
			}else if(type == "name" || type == "description" || type == "mobilePhoneNumber"){
				//input.on("keydown", this._blockSpaceEvtFirstAndLast);
				input.on("change", this._trimOnChange);
			}

			if(this.options.isKeyUpValidation){
				input.on("keyup", this._keyupEvt);
			}
		},
		_trimOnChange : function(e){
			var val = $(this).val();
			$(this).val($.trim(val));
		},
		_keyupEvt : function(e){
			var validator = $(this).data("kendoCommonValidator");
			if(validator){
				validator.validate();
			}
		},
		_blockSpaceEvtFirstAndLast : function(e){
			if(e.keyCode == 32){
				if(this.selectionEnd == 0 && this.selectionStart == 0){
					return false;
				}
				var txt = $(this).val();
				if(txt.length == this.selectionEnd && txt.length == this.selectionStart){
					return false;
				}
			}
		},
		_blockSpaceEvt : function(e){
			if (e.keyCode == 32) {
				return false;
			}
		},
		_setDefaultMinMaxLength : function(options){
			var self = this, builtInMinMax;
			builtInMinMax = self.options.builtInMinMax[options.type];

			if(!options.minLength && builtInMinMax){
				options.minLength = builtInMinMax.min;
			}

			if(!options.maxLength && builtInMinMax){
				options.maxLength = builtInMinMax.max;
			}
		},
		//특정 Rule만 Validate 또는 특정 Rule 만 강제로 Invalid 하는 메소드 추가
		/**
		*   <ul>
		*   <li>특정 Rule 또는 Option에 해당하는 전체 Rule로 Validate (유효성 체크)한다.</li>
		*   </ul>
		*   @function validate
		*   @param {String} ruleKey - Validation 할 특정 Rule의 키 값
		*   @param {Boolean} isForceInvalid - 강제 유효성 체크 여부
		*   @returns {void}
		*   @alias module:app/widget/common-validator
		*
		*/
		validate: function (ruleKey, isForceInvalid, doNotTrigger) {
			var inputs;
			var idx;
			var result = false;
			var length;
			var isValid = this.value();
			this._errors = {};
			if (!this.element.is(INPUTSELECTOR)) {
				var invalid = false;
				inputs = this.element.find(this._inputSelector);
				for (idx = 0, length = inputs.length; idx < length; idx++) {
					if (!this.validateInput(inputs.eq(idx), ruleKey, isForceInvalid)) {
						invalid = true;
					}
				}
				result = !invalid;
			} else {
				result = this.validateInput(this.element, ruleKey, isForceInvalid);
			}

			/*if(result){
				var value = this.element.val();
				value = $.trim(value);
				this.element(value);
			}*/
			if(!doNotTrigger) this.trigger(VALIDATE, { valid: result });
			if (isValid !== result) {
				this.trigger(CHANGE);
			}
			return result;
		},
		validateInput: function (input, ruleKey, isForceInvalid) {
			input = $(input);
			this._isValidated = true;
			var that = this, options = that.options, template = that._errorTemplate, result = that._checkValidity(input, ruleKey, isForceInvalid), valid = result.valid, className = '.' + INVALIDMSG, fieldName = input.attr(NAME) || '', lbl = that._findMessageContainer(fieldName).add(input.next(className).filter(function () {
					var element = $(this);
					if (element.filter('[' + kendo.attr('for') + ']').length) {
						return element.attr(kendo.attr('for')) === fieldName;
					}
					return true;
				})).hide(), messageText, wasValid = !input.attr('aria-invalid');
			input.removeAttr('aria-invalid');
			if (!valid) {
				messageText = that._extractMessage(input, result.key);
				that._errors[fieldName] = messageText;
				var messageLabel = parseHtml(template({ message: decode(messageText) }));
				var lblId = lbl.attr('id');
				that._decorateMessageContainer(messageLabel, fieldName);
				if (lblId) {
					messageLabel.attr('id', lblId);
				}
				if (!lbl.replaceWith(messageLabel).length) {
					//Spinner에 대한 예외처리. Spinner는 Input이 2개 생기므로 가장 마지막 Input 뒤에 메시지를 Insert 한다.
					if(input.hasClass("k-formatted-value")){
						messageLabel.insertAfter(input.siblings("[data-role='numerictextbox']"));
					}else{
						messageLabel.insertAfter(input);
					}
				}

				messageLabel.show();
				input.attr('aria-invalid', true);
				var isFocus = input.is(":focus");
				//현재 Input 필드가 Focusing 되어있을 때만 스크롤 이동
				//에러메시지가 이미 표시된 상태에서 다른 곳을 포커싱하였을 때도 blur 시 validate 되므로 스크롤이 이동되는 현상 발생하므로
				if(isFocus && options.scrollWrapperClass){
					var offset = messageLabel.offset();
					var scrollWrapper = $("." + options.scrollWrapperClass);
					var scrollTop = scrollWrapper.scrollTop();
					if(scrollTop < offset.top) scrollWrapper.scrollTop(offset.top);
				}
			} else {
				delete that._errors[fieldName];
			}
			if (wasValid !== valid) {
				this.trigger(VALIDATE_INPUT, {
					valid: valid,
					input: input
				});
			}
			input.toggleClass(INVALIDINPUT, !valid);
			input.toggleClass(VALIDINPUT, valid);
			return valid;
		},
		_checkValidity: function (input, ruleKey, isForceInvalid) {
			var rules = this.options.rules, rule;
			if(ruleKey){
				if(isForceInvalid){
					return {
						valid : false,
						key : ruleKey
					};
				}

				rule = rules[ruleKey];

				if(!rule){
					return {valid : true};
				}

				if(!rule.call(this, input)){
					return {
						valid: false,
						key: ruleKey
					};
				}
			}else{
				for (rule in rules) {
					if (!rules[rule].call(this, input)) {
						return {
							valid: false,
							key: rule
						};
					}
				}
			}

			return { valid: true };
		},
		/**
		*   <ul>
		*   <li>Validator의 에러 문구 표시를 숨기고, UI를 초기 상태로 돌린다.</li>
		*   </ul>
		*   @function hideMessages
		*   @param {Boolean} isOnlyMessage - 메시지만 숨기는 지에 대한 여부
		*   @returns {void}
		*   @alias module:app/widget/common-validator
		*
		*/
		hideMessages: function (isOnlyMessage) {
			var that = this, className = '.' + INVALIDMSG, element = that.element;
			if(!isOnlyMessage){
				if (!element.is(INPUTSELECTOR)) {
					element.find(".k-invalid").removeClass("k-invalid");
				} else {
					element.removeClass("k-invalid");
				}
			}

			if (!element.is(INPUTSELECTOR)) {
				element.find(className).hide();
			} else {
				element.next(className).hide();
			}
		},
		/*//특정 Rule의 Key 값으로 메시지를 임의로 표시할 수 있도록 메소드 추가
		showInvalidMesage : function(ruleKey){
			var isValid = this.value();
			var inputs, idx, length;
			if (!this.element.is(INPUTSELECTOR)) {
				var invalid = false;
				inputs = this.element.find(this._inputSelector);
				for (idx = 0, length = inputs.length; idx < length; idx++) {
					this._extractMessage(inputs.eq(idx), ruleKey);
				}
			} else {
				this._extractMessage(this.element, ruleKey);
			}
		},*/
		_extractMessage: function (input, ruleKey) {
			var that = this, customMessage = that.options.messages[ruleKey], fieldName = input.attr(NAME);
			customMessage = kendo.isFunction(customMessage) ? customMessage(input) : customMessage;
			return kendo.format(input.attr(kendo.attr(ruleKey + '-msg')) || input.attr('validationMessage') || customMessage || input.attr('title') || '', fieldName, input.attr(ruleKey) || input.attr(kendo.attr(ruleKey)));
		}
	});

	//jQuery를 통해 요소에서 호출할 수 있도록 플러그인 등록
	kendo.ui.plugin(widget);

})(window, jQuery);
