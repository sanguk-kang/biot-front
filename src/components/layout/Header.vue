<template>
    <header id="main-header">
        <nav class="main-top-nav" data-role="mainnavtooltip">
            <span class="main-top-nav-text">Gangnam-gu, Seoul</span>
            <span class="main-top-nav-weather sunny">3℃ / 8℃</span>
            <span class="main-top-nav-text">Humidity  28%</span>
            <span class="main-top-nav-text">Fine Dust  152</span>
            <span class="main-top-nav-text">Ultrafine Dust  80</span>
            <span class="main-top-nav-clean verybad">Very Bad</span>
            <span class="main-top-nav-alarm error" title="에러" data-type="critical">999+</span>
            <span class="main-top-nav-alarm warning" title="경고" data-type="warning">999+</span>
            <span class="main-top-nav-alarm inefficiency" title="비효율" data-type="inefficiency">999+</span>
            <span class="main-top-nav-alarm maintenance" title="유지보수" data-type="maintenance">999+</span>
            <span class="main-top-nav-alram"><i class="main-top-nav-alram-icon"></i></span>
            <span class="main-top-nav-user"><i class="main-top-nav-user-icon"></i></span>
            <span class="main-top-nav-superuser"><i class="main-top-nav-super-icon"></i></span>
            <div id="main-top-nav-notification" class="main-top-nav-noti"></div>
            <div class="main-top-nav-noti-rule"></div>
            <script class="main-top-nav-alarm-tooltip" type="text/x-kendo-template">
                <div class="main-alarm-tooltip">
                    <i class="main-alarm-tooltip-tail"></i>
                    <div class="main-alarm-tooltip-header">
                        <div class="main-alarm-tooltip-title">
                            #=target.data('title')#
                        </div>
                        <div class="main-alarm-tooltip-title-bar"></div>
                    </div>
                    <div class="main-alarm-tooltip-content">
                        <ul class="main-alarm-tooltip-list #=target.data('type')#" data-template="main-top-nav-alarm-list" data-bind="source:#if(target.data('type')=='critical'){#errorList#}else{#warningList#}#">
                        </ul>
                    </div>
                </div>
            </script>
            <script id="main-top-nav-alarm-list" type="text/x-kendo-template">
                <li class="main-alarm-tooltip-item">
                    <div class="main-alarm-tooltip-item-icon">
                            <span class="main-alarm-icon">
														<i class="ic ic-attention-main-noti"></i>
												</span>
                    </div>
                    <div class="main-alarm-tooltip-item-text">
                        <p class="main-alarm-tooltip-item-message" data-bind="text : name"></p>
                        <p class="main-alarm-tooltip-item-place"><span data-bind="text : location"></span>
                        <p class="main-alarm-tooltip-item-date" data-bind="text : eventTime"></p>
                    </div>
                </li>
            </script>
            <script class="main-top-nav-user-tooltip" type="text/x-kendo-template">
                <div class="main-alarm-tooltip">
                    <i class="main-alarm-tooltip-tail"></i>
                    <div class="main-user-tooltip-content">
                        <ul class="main-user-tooltip-list">
                            <li class="main-user-profile"><button class="k-button">회원정보</button></li>
                            <li class="main-user-signout"><button class="k-button">로그아웃</button></li>
                        </ul>
                    </div>
                </div>
            </script>
            <script class="main-top-nav-noti-toast-template" type="text/x-kendo-template">
                <div class="k-tooltip-button">
                    <a class="ic ic-close" title="Close"></a>
                </div>
                <div class="main-alarm-tooltip main-alarm-toast">
                    <div class="main-alarm-tooltip-header">
                        <div class="main-alarm-tooltip-title">
                            #if(type == "critical"){# 에러 #}else{# 경고 #}#
                        </div>
                        <div class="main-alarm-tooltip-title-bar"></div>
                    </div>
                    <div class="main-alarm-tooltip-content">
                        <ul class="main-alarm-tooltip-list #=type#">
                            <li class="main-alarm-tooltip-item">
                                <div class="main-alarm-tooltip-item-icon">
                                        <span class="main-alarm-icon">
																				<i class="ic ic-attention-main-noti">
																				</i>
																		</span>
                                </div>
                                <div class="main-alarm-tooltip-item-text">
                                    <p class="main-alarm-tooltip-item-message">#=name#</p>
                                    <p class="main-alarm-tooltip-item-place"><span>#=location#</span>
                                    <p class="main-alarm-tooltip-item-date">#=eventTime#</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </script>
            <script class="main-top-nav-noti-rule-toast-template" type="text/x-kendo-template">
                <div class="k-tooltip-button">
                    <a class="ic ic-close" title="Close"></a>
                </div>
                <div class="main-alarm-tooltip main-alarm-toast">
                    <div class="main-alarm-tooltip-header">
                        <div class="main-alarm-tooltip-title">
                            #if(type == "critical"){# 에러 #}else{# 경고 #}#
                        </div>
                        <div class="main-alarm-tooltip-title-bar"></div>
                    </div>
                    <div class="main-alarm-tooltip-content">
                        <ul class="main-alarm-tooltip-list #=type#">
                            <li class="main-alarm-tooltip-item">
                                <div class="main-alarm-tooltip-item-icon">
                                        <span class="main-alarm-icon">
																				<i class="ic ic-attention-main-noti"></i>
																		</span>
                                </div>
                                <div class="main-alarm-tooltip-item-text">
                                    <p class="main-alarm-tooltip-item-message">#=name#</p>
                                    <p class="main-alarm-tooltip-item-date">#=eventTime#</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </script>
            <!-- My Profile -->
            <div id="main-user-profile">
                <div class="detail-dialog-content">
                    <div class="detail-dialog-header"></div>
                    <div class="detail-dialog-detail-content" style="overflow:hidden;"></div>
                    <ul>
                        <li class="detail-dialog-content-field-item">
                            <span class="detail-dialog-content-field-name"></span>
                            <span class="detail-dialog-content-field-value my-profile-leave"></span>
                        </li>
                    </ul>
                </div>
            </div>
            <div id="profile-change-password-confirm-content" class="detail-dialog-detail-content" style="display:none;">
                <ul class="detail-dialog-detail-content-field-list">
                    <li class="detail-dialog-content-field-item">
                        <div class="detail-dialog-content-field-name">현재 비밀번호</div>
                        <div class="detail-dialog-content-field-value">
                                <span class="editable">
																<input type="password" id="profile-oldPassword" name="oldPassword" class="profile-reset-password-confirm-input k-input" data-key="oldPassword" required style="width:100%;">
														</span>
                        </div>
                    </li>
                    <li class="detail-dialog-content-field-item">
                        <div class="detail-dialog-content-field-name">새 비밀번호</div>
                        <div class="detail-dialog-content-field-value">
                                <span class="editable">
																<input type="password" data-old-password="profile-oldPassword" id="profile-password" name="password" class="profile-reset-password-confirm-input k-input" data-key="password" required style="width:100%;">
														</span>
                        </div>
                    </li>
                    <li class="detail-dialog-content-field-item">
                        <div class="detail-dialog-content-field-name">새 비밀번호 재확인</div>
                        <div class="detail-dialog-content-field-value">
                                <span class="editable">
																<input type="password" id="profile-passwordRetype" name="passwordRetype" class="profile-reset-password-confirm-input k-input" data-key="passwordRetype" data-retype-for="profile-password" required style="width:100%;">
														</span>
                        </div>
                    </li>
                </ul>
                <p style="margin-top:20px;">비밀번호 변경 후에는 비밀번호 복구가 불가능합니다.</p>
            </div>
        </nav>
    </header>
    <!-- e:Navigation -->
</template>

<script>
export default {
  name: "Header",
  data: function() {
      return { }
  },
  methods: {
  },
  created() {
  },
  mounted() {
  },
  destroyed() {
  }
}
</script>

<style lang="scss">

</style>