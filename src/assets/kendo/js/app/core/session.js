/**
*
*   <ul>
*       <li>인증 토큰 및 사용자 정보를 관리한다.</li>
*       <li>Session Storage 및 Cookie를 통하여 관리한다.</li>
*   </ul>
*
*   @module app/core/session
*   @requires lib/js.cookie
*
*
*/
(function(window){
	/*Local Storage 및 Cookie를 통하여 관리한다.*/

	var Cookie = window.Cookies;
	// var localStorage = window.localStorage;

	/**
	*
	*   새로운 Session 관리 인스턴스를 생성한다. 생성자에 인자가 전달되지 않을 경우. Cookie에서 값을 얻어 인스턴스를 생성한다.
	*   @class Session
	*   @memberof module:app/core/session
	*   @param {String} id - 로그인 한 User의 ID
	*   @param {String} role - 로그인 한 User의 Role
	*   @param {String} token - 로그인 한 User의 인증 토큰
	*/
	var Session = function(id, role, token){
		this.KEYS = {
			USER_ID : "userId",
			USER_ROLE : "userRole",
			USER_NAME : "userName",
			USER_GROUP_ID : "userGroupId",
			USER_GROUP_NAME : "userGroupName",
			USER_PRIORITY : "userPriority",
			AUTH_TOKEN : "authToken",
			AUTH_TOKEN_EXPIRED : "tokenExpired",
			HMI_FILE_LIST_INFO : "hmiFileListExpanded",
			HMI_CONTROL_PANEL_INFO : "hmiControlPanelExpanded",
			HIDE_MAIN_SIDEBAR: "hideMainSidebar"
		};

		if(!id){
			Cookie.get(this.KEYS.USER_ID);
		}
		this.id = id;

		if(!role){
			Cookie.get(this.KEYS.USER_ROLE);
		}
		this.role = role;
		if(!token){
			Cookie.get(this.KEYS.AUTH_TOKEN);
		}
		this.token = token;
		this.tokenExpired = null;
	};

	/**
	*
	*   Cookie와 Session Storage에 로그인 한 사용자의 인증 토큰을 저장한다.
	*
	*   @method setAuthToken
	*   @param {String} token - 발급된 인증 토큰
	*   @param {String} expired - 인증 토큰의 유효기간
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/

	Session.prototype.setAuthToken = function(token, expired){
		expired = Math.floor(expired / 60 / 60);
		Cookie.set(this.KEYS.AUTH_TOKEN, token, {expired : expired});
		window.sessionStorage.setItem(this.KEYS.AUTH_TOKEN, token);
		window.sessionStorage.setItem(this.KEYS.AUTH_TOKEN_EXPIRED, expired);
		this.token = token;
	};

	/**
	*
	*   <ul>
	*   <li>저장된 인증 토큰을 얻어온다.</li>
	*   <li>만약, Cookie에 저장된 인증 토큰과 Session Storage의 인증 토큰이 다를 경우, 토큰이 만료되거나 다른 계정으로 로그인 한 것으로 예외처리한다.</li>
	*
	*   @method getAuthToken
	*   @returns {String} - 로그인 한 사용자의 인증 토큰
	*   @memberof module:app/core/session.Session
	*
	*/

	Session.prototype.getAuthToken = function(){
		var token = Cookie.get(this.KEYS.AUTH_TOKEN);
		var sessionToken = window.sessionStorage.getItem(this.KEYS.AUTH_TOKEN);
		//console.log("[SESSION] Cookie Token : "+token);
		//console.log("[SESSION] Session Token : "+sessionToken);
		//Cookie에 저장된 Session 정합성 체크
		if(sessionToken != token){
			console.error("[SESSION] Session Expired");
			return null;
		}
		if(this.token != token){
			this.token = token;
		}
		return this.token;
	};

	/**
	*
	*   <ul>
	*   <li>인증 토큰의 유효 기한을 설정한다.</li>
	*
	*   @method setAuthTokenExpired
	*   @param {String} expired - 인증 토큰의 유효 기간
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setAuthTokenExpired = function(expired){
		Cookie.set(this.KEYS.AUTH_TOKEN_EXPIRED, expired);
		window.sessionStorage.setItem(this.KEYS.AUTH_TOKEN_EXPIRED, expired);
		//expired = expired / 60 / 60;
		//Cookie.set(this.KEYS.AUTH_TOKEN, { expired : expired });
		this.tokenExpired = expired;
	};

	/**
	*
	*   <ul>
	*   <li>인증 토큰의 유효 기한을 얻어온다.</li>
	*
	*   @method getAuthTokenExpired
	*   @returns {Number} - 인증 토큰의 유효 기간
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getAuthTokenExpired = function(){
		var expired = Cookie.get(this.KEYS.AUTH_TOKEN_EXPIRED);
		if(this.tokenExpired != expired){
			this.tokenExipred = expired;
		}
		return this.tokenExipred;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자의 ID를 설정한다.</li>
	*
	*   @method setUserId
	*   @param {String} id - 사용자 ID
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserId = function(id){
		Cookie.set(this.KEYS.USER_ID, id);
		this.id = id;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자의 ID를 얻어온다.</li>
	*
	*   @method getUserId
	*   @returns {String} - 사용자 ID
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserId = function(){
		var id = Cookie.get(this.KEYS.USER_ID);
		if(this.id != id){
			this.id = id;
		}
		return this.id;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자의 Role을 설정한다.</li>
	*
	*   @method setUserRole
	*   @param {String} role - 사용자 Role
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserRole = function(role){
		Cookie.set(this.KEYS.USER_ROLE, role);
		this.role = role;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자의 Role을 얻어온다.</li>
	*
	*   @method getUserRole
	*   @returns {String} - 사용자 Role
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserRole = function(){
		var role = Cookie.get(this.KEYS.USER_ROLE);
		if(this.role != role){
			this.role = role;
		}
		return this.role;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자의 Name을 설정한다.</li>
	*
	*   @method setUserName
	*   @param {String} name - 사용자 이름
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserName = function(name){
		Cookie.set(this.KEYS.USER_NAME, name);
		this.name = name;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자의 이름을 얻어온다.</li>
	*
	*   @method getUserName
	*   @returns {String} - 사용자 이름
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserName = function(){
		var name = Cookie.get(this.KEYS.USER_NAME);
		if(this.name != name){
			this.name = name;
		}
		return this.name;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자의 Priority를 설정한다.</li>
	*
	*   @method setUserPriority
	*   @param {Number} priority - 사용자의 Priority
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserPriority = function(priority){
		Cookie.set(this.KEYS.USER_PRIORITY, priority);
		this.priority = priority;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자의 Priority를 얻어온다.</li>
	*
	*   @method getUserPriority
	*   @returns {Number} - 사용자의 Priority
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserPriority = function(){
		var priority = Cookie.get(this.KEYS.USER_PRIORITY);
		if(this.priority != priority){
			this.priority = priority;
		}
		var p = this.priority;
		p = Number(p);
		if(isNaN(p)){
			return this.priority;
		}
		return p;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자가 속한 Group ID를 설정한다.</li>
	*
	*   @method setUserGroupId
	*   @param {Number} groupId - 사용자가 속한 Group의 ID
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserGroupId = function(groupId){
		Cookie.set(this.KEYS.USER_GROUP_ID, groupId);
		this.groupId = groupId;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자가 속한 Group의 ID를 얻어온다.</li>
	*
	*   @method getUserGroupId
	*   @returns {Number} - 사용자가 속한 Group의 ID
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserGroupId = function(){
		var groupId = Cookie.get(this.KEYS.USER_GROUP_ID);
		if(this.groupId != groupId){
			this.groupId = groupId;
		}
		return this.groupId;
	};

	/**
	*
	*   <ul>
	*   <li>로그인 한 사용자가 속한 Group Name을 설정한다.</li>
	*
	*   @method setUserGroupName
	*   @param {Number} groupName - 사용자가 속한 Group의 Name
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.setUserGroupName = function(groupName){
		Cookie.set(this.KEYS.USER_GROUP_NAME, groupName);
		this.groupName = groupName;
	};

	/**
	*
	*   <ul>
	*   <li>현재 로그인 한 사용자가 속한 Group의 Name을 얻어온다.</li>
	*
	*   @method getUserGroupName
	*   @returns {Number} - 사용자가 속한 Group의 Name
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.getUserGroupName = function(){
		var groupName = Cookie.get(this.KEYS.USER_GROUP_NAME);
		if(this.groupName != groupName){
			this.groupName = groupName;
		}
		return this.groupName;
	};

	/**
	*
	*   <ul>
	*   <li>현재 Cookie에 저장된 Session 정보를 삭제한다.</li>
	*
	*   @method clearSession
	*   @returns {void} - 리턴 값 없음
	*   @memberof module:app/core/session.Session
	*
	*/
	Session.prototype.clearSession = function(){
		var key;
		var obj = this.KEYS;
		for(key in obj){
			if(key == "locale"){    //locale 정보는 유지한다. 로그인 화면에서의 설정 유지를 위함.
				continue;
			}
			Cookie.remove(obj[key]);
		}
		//localStorage.clear();
	};

	window.Session = new Session();

})(window, jQuery);