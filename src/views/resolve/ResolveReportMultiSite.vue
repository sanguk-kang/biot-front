
<template>
    <div class="newWin">
        <div class="pop-report">
            <div class="pop-report__head">
                <div class="pop-report__head-title">
                    <h2>b.IoT Cloud Report</h2>
                    <div class="pop-report__head-title-btn">
                        <button class="k-button">Download</button>
                    </div>
                </div>
                <div class="pop-report__head-label">
                    <p>SAMSUNG Cloud</p>
                    <p>
                        <span>기간 : 2020.04.10 ~ 2020.05.10</span>
                        <span>발행일 : 2020.05.11</span>
                    </p>
                </div>
            </div>

            <div class="pop-report__title">
                <h1>월간 리포트</h1>
            </div>

            <table class="pop-report__table view">
                <colgroup>
                    <col style="width: 190px;" />
                    <col />
                </colgroup>
                <tbody>
                    <tr>
                        <th class="text-left">사이트명</th>
                        <td>_Site Name</td>
                    </tr>
                    <tr>
                        <th>소재지</th>
                        <td>서울 노원구 공릉로 232</td>
                    </tr>
                    <tr>
                        <th>유지보수 만료일</th>
                        <td>~2021.12.31</td>
                    </tr>
                    <tr>
                        <th class="etc">목차</th>
                        <td class="etc">
                            <div class="pop-report__contents">
                                <div class="pop-report__contents-inner">
                                    <ol>
                                        <li>
                                            <p>1. 장비 현황</p>
                                        </li>
                                        <li>
                                            <p>2. 운전현황</p>
                                            <ol>
                                                <li>2.1 운전현황</li>
                                                <li>2.2 운전시간</li>
                                                <li>2.3 운전율</li>
                                                <li>2.4 가동율</li>
                                                <li>2.5 가장 낮은 온도로 운전한 실내기와 위치 TOP5</li>
                                                <li>2.6 가장 높은 온도로 운전한 실내기와 위치 TOP5</li>
                                                <li>2.7 누적 운전시간 상위 실내기와 위치 TOP5</li>
                                                <li>2.8 누적 운전시간 하위 실내기와 위치 TOP5</li>
                                            </ol>
                                        </li>
                                        <li>
                                            <p>3. 에너지 소비현황</p>
                                            <ol>
                                                <li>3.1 에너지 소비현황</li>
                                                <li>3.2 에너지 소비량 비교</li>
                                                <li>3.3 누적 에너지 소비량</li>
                                            </ol>
                                        </li>
                                    </ol>
                                </div>
                                <div class="pop-report__contents-inner">
                                    <ol>
                                        <li>
                                            <p>4. 정기점검 현황</p>
                                        </li>
                                        <li>
                                            <p>5. 실내공기질 현황</p>
                                            <ol>
                                                <li>5.1 실내 공기질 종합현황</li>
                                                <li>5.2 세부 청정도 현황</li>
                                                <li>5.3 실내 공기질 현황</li>
                                                <li>5.4 실내 쾌적도 트렌드</li>
                                                <li>5.5 실내 청정도 트렌드</li>
                                            </ol>
                                        </li>
                                        <li>
                                            <p>6. 종합 의견</p>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>1. 장비현황</p>
                    <p>(EA)</p>
                </div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:23%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                        <col style="width:6%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>사이트 이름</th>
                            <th>DMS</th>
                            <th>실외기</th>
                            <th>에너지 미터</th>
                            <th>실내기</th>
                            <th>조명</th>
                            <th>쇼케이스</th>
                            <th>냉동고</th>
                            <th>환경센서</th>
                            <th>PV</th>
                            <th>ESS</th>
                            <th>공기청정기</th>
                            <th>K. weather</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>3</td>
                            <td>20</td>
                            <td>100</td>
                            <td>100</td>
                            <td>100</td>
                            <td>100</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>2. 운전현황</p>
                </div>
                <div class="pop-report__table-subtitle">2.1 운전현황</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:30%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:15%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>사이트 이름</th>
                            <th>운전시간 (시:분)</th>
                            <th>운전율 (%)</th>
                            <th>가동율(%)</th>
                            <th>평균 실내 온도 (℃)</th>
                            <th>평균 설정온도(℃)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>00:00</td>
                            <td>14.0</td>
                            <td>14.0</td>
                            <td>14.0</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>00:00</td>
                            <td>14.0</td>
                            <td>14.0</td>
                            <td>14.0</td>
                            <td>14.0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">2.2 가장 낮은 온도로 운전한 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:35%" />
                        <col style="width:35%" />
                        <col style="width:10%" />
                        <col style="width:15%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트 이름</th>
                            <th>평균 운전시간 (시:분)</th>
                            <th>실내기 (EA)</th>
                            <th>평균실내온도 (℃)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">2.3 가장 높은 온도로 운전한 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:35%" />
                        <col style="width:35%" />
                        <col style="width:10%" />
                        <col style="width:15%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트 이름</th>
                            <th>평균 운전시간 (시:분)</th>
                            <th>실내기 (EA)</th>
                            <th>평균실내온도 (℃)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal">
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 50%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;">
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                            <td>14.0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">2.4 누적 운전시간 상위 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:35%" />
                        <col style="width:35%" />
                        <col style="width:25%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트 이름</th>
                            <th>누적 운전시간 (시:분)</th>
                            <th>실내기 (EA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">2.5 누적 운전시간 하위 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:35%" />
                        <col style="width:35%" />
                        <col style="width:25%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트 이름</th>
                            <th>누적 운전시간 (시:분)</th>
                            <th>실내기 (EA)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <div
                                    id="fastAndFurious"
                                    data-role="progressbar"
                                    class="k-widget k-progressbar k-progressbar-horizontal"
                                >
                                    <span class="k-progress-status-wrap k-progress-end">
                                        <span class="k-progress-status">12:04</span>
                                    </span>
                                    <div class="k-state-selected" style="width: 30%;">
                                        <span
                                            class="k-progress-status-wrap k-progress-end"
                                            style="width: 333.333%;"
                                        >
                                            <span class="k-progress-status">12:04</span>
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td>100</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>3. 에너지 소비현황</p>
                </div>
                <div class="pop-report__table-subtitle">3.1 에너지 소비 현황</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:35%" />
                        <col style="width:15%" />
                        <col style="width:15%" />
                        <col style="width:15%" />
                        <col style="width:15%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowspan="2">순위</th>
                            <th rowspan="2">사이트 이름</th>
                            <th colspan="2">2020-04-01 ~ 2020-04-30</th>
                            <th colspan="2">2020-04-01 ~ 2020-04-30</th>
                        </tr>
                        <tr>
                            <th>소비량</th>
                            <th>평균 설정온도</th>
                            <th>소비량</th>
                            <th>평균 설정온도</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td class="tar">
                                134,550 kWh
                                <br />
                                <span class="highlighted-ing">20% 감소</span>
                            </td>
                            <td>17.0℃</td>
                            <td class="tar">
                                134,550 kWh
                                <br />
                                <span class="highlighted-ing">20% 감소</span>
                            </td>
                            <td>17.0℃</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td class="tar">
                                134,550 kWh
                                <br />
                                <span class="highlighted-ing">20% 감소</span>
                            </td>
                            <td>17.0℃</td>
                            <td class="tar">
                                134,550 kWh
                                <br />
                                <span class="highlighted-ing">20% 감소</span>
                            </td>
                            <td>17.0℃</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>4. 기기 점검 현황</p>
                </div>
                <div class="pop-report__table-subtitle">4.1 기기점검 현황</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:30%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:10%" />
                        <col style="width:15%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>사이트 이름</th>
                            <th>합계</th>
                            <th>정상</th>
                            <th>관찰</th>
                            <th>초지</th>
                            <th>긴급</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>200</td>
                            <td>50</td>
                            <td>50</td>
                            <td>50</td>
                            <td>50</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>200</td>
                            <td>50</td>
                            <td>50</td>
                            <td>50</td>
                            <td>50</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">4.2 기기점검 현황 TOP5</div>
                <div class="pop-report__table-dashboard">
                    <div class="pop-report__table-dashboard-item">
                        <table>
                            <colgroup>
                                <col style="width:10%" />
                                <col style="width:60%" />
                                <col style="width:30%" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>순위</th>
                                    <th>사이트 이름</th>
                                    <th>총건수(EA)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td class="tal">
                                        <span class="eclipse">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                                    </td>
                                    <td>200</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td class="tal">
                                        <span class="eclipse">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                                    </td>
                                    <td>200</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td class="tal">
                                        <span class="eclipse">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                                    </td>
                                    <td>200</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td class="tal">
                                        <span class="eclipse">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                                    </td>
                                    <td>200</td>
                                </tr>
                                <tr>
                                    <td>1</td>
                                    <td class="tal">
                                        <span class="eclipse">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                                    </td>
                                    <td>200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="pop-report__table-dashboard-item">
                        <div class="pop-report__table-dashboard-item-inner">
                            <strong>1 위) _사이트이름</strong>
                            <div class="pop-report__table-dashboard-item-chart">
                            차트 영역
                            </div>
                            <p>(EA)</p>
                            <ul>
                                <li class="blue">
                                    <p>
                                        <span class="eclipse">설치/옵션설정 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="sky">
                                    <p>
                                        <span class="eclipse">실내기 센서류 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="green">
                                    <p>
                                        <span class="eclipse">운전조건/기능설명</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="yellow">
                                    <p>
                                        <span class="eclipse">실내기팬/모터 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="red">
                                    <p>
                                        <span class="eclipse">기타</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="pop-report__table-dashboard-item">
                        <div class="pop-report__table-dashboard-item-inner">
                            <strong>2 위) _사이트이름</strong>
                            <div class="pop-report__table-dashboard-item-chart">

                            </div>
                            <p>(EA)</p>
                            <ul>
                                <li class="blue">
                                    <p>
                                        <span class="eclipse">설치/옵션설정 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="sky">
                                    <p>
                                        <span class="eclipse">실내기 센서류 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="green">
                                    <p>
                                        <span class="eclipse">운전조건/기능설명</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="yellow">
                                    <p>
                                        <span class="eclipse">실내기팬/모터 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="red">
                                    <p>
                                        <span class="eclipse">기타</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="pop-report__table-dashboard-item">
                        <div class="pop-report__table-dashboard-item-inner">
                            <strong>3 위) _사이트이름</strong>
                            <div class="pop-report__table-dashboard-item-chart">


                            </div>
                            <p>(EA)</p>
                            <ul>
                                <li class="blue">
                                    <p>
                                        <span class="eclipse">설치/옵션설정 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="sky">
                                    <p>
                                        <span class="eclipse">실내기 센서류 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="green">
                                    <p>
                                        <span class="eclipse">운전조건/기능설명</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="yellow">
                                    <p>
                                        <span class="eclipse">실내기팬/모터 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="red">
                                    <p>
                                        <span class="eclipse">기타</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="pop-report__table-dashboard-item">
                        <div class="pop-report__table-dashboard-item-inner">
                            <strong>4 위) _사이트이름</strong>
                            <div class="pop-report__table-dashboard-item-chart">

                            </div>
                            <p>(EA)</p>
                            <ul>
                                <li class="blue">
                                    <p>
                                        <span class="eclipse">설치/옵션설정 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="sky">
                                    <p>
                                        <span class="eclipse">실내기 센서류 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="green">
                                    <p>
                                        <span class="eclipse">운전조건/기능설명</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="yellow">
                                    <p>
                                        <span class="eclipse">실내기팬/모터 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="red">
                                    <p>
                                        <span class="eclipse">기타</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="pop-report__table-dashboard-item">
                        <div class="pop-report__table-dashboard-item-inner">
                            <strong>5 위) _사이트이름</strong>
                            <div class="pop-report__table-dashboard-item-chart">

                            </div>
                            <p>(EA)</p>
                            <ul>
                                <li class="blue">
                                    <p>
                                        <span class="eclipse">설치/옵션설정 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="sky">
                                    <p>
                                        <span class="eclipse">실내기 센서류 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="green">
                                    <p>
                                        <span class="eclipse">운전조건/기능설명</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="yellow">
                                    <p>
                                        <span class="eclipse">실내기팬/모터 이상</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                                <li class="red">
                                    <p>
                                        <span class="eclipse">기타</span>
                                    </p>
                                    <strong>32</strong>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>5. 실내 공기질 현황</p>
                </div>
                <div class="pop-report__table-subtitle">5.1 사이트별 공기질 종합현황</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:30%" />
                        <col style="width:9%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                        <col style="width:8%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowspan="2">순위</th>
                            <th rowspan="2">사이트 이름</th>
                            <th rowspan="2">총 일수</th>
                            <th colspan="3">쾌적도</th>
                            <th colspan="4">종합 청정도</th>
                        </tr>
                        <tr>
                            <th>보통</th>
                            <th>불쾌적</th>
                            <th>미제공</th>
                            <th>좋음</th>
                            <th>보통</th>
                            <th>나쁨</th>
                            <th>매우나쁨</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">
                                <span
                                    class="eclipse"
                                >서울시교육청 > 동부교육지원청 > 서울답십리초등학교서울시교육청 > 동부교육지원청 > 서울답십리초등학교서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                            </td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                        </tr>
                        <tr>
                            <td>1</td>
                            <td class="tal">
                                <span
                                    class="eclipse"
                                >서울시교육청 > 동부교육지원청 > 서울답십리초등학교서울시교육청 > 동부교육지원청 > 서울답십리초등학교서울시교육청 > 동부교육지원청 > 서울답십리초등학교</span>
                            </td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                            <td>30일</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">5.2 공기질 낮은 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:29%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트이름</th>
                            <th>실외 공기질</th>
                            <th>실내 종합청정도</th>
                            <th>PM10</th>
                            <th>PM2.5</th>
                            <th>PM1.0</th>
                            <th>가스</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <span class="st_verypoor">매우나쁨</span>
                            </td>
                            <td>
                                <span class="st_poor">나쁨</span>
                            </td>
                            <td>
                                <span class="st_normal">보통</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <span class="st_verypoor">매우나쁨</span>
                            </td>
                            <td>
                                <span class="st_poor">나쁨</span>
                            </td>
                            <td>
                                <span class="st_normal">보통</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">5.3 공기질 높은 사이트 TOP5</div>
                <table>
                    <colgroup>
                        <col style="width:5%" />
                        <col style="width:29%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                        <col style="width:11%" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>사이트이름</th>
                            <th>실외 공기질</th>
                            <th>실내 종합청정도</th>
                            <th>PM10</th>
                            <th>PM2.5</th>
                            <th>PM1.0</th>
                            <th>가스</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <span class="st_verypoor">매우나쁨</span>
                            </td>
                            <td>
                                <span class="st_poor">나쁨</span>
                            </td>
                            <td>
                                <span class="st_normal">보통</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td class="tal">서울시교육청 > 동부교육지원청 > 서울답십리초등학교</td>
                            <td>
                                <span class="st_verypoor">매우나쁨</span>
                            </td>
                            <td>
                                <span class="st_poor">나쁨</span>
                            </td>
                            <td>
                                <span class="st_normal">보통</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                            <td>
                                <span class="st_good">좋음</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
                <div class="pop-report__table-title">
                    <p>6. 종합 의견</p>
                </div>
                <div class="pop-report__table-box">
                    의견이 등록되면 해당내용 출력
                    <br />의견이 등록되면 해당내용 출력
                    <br />의견이 등록되면 해당내용 출력
                    <br />의견이 등록되면 해당내용 출력
                    <br />
                </div>
            </div>
            <!-- e:grid-->
        </div>
    </div>
</template>


<script>
    import { Doughnut } from 'vue-chartjs'

    export default {
        extends: Doughnut,
        name: "ReportMutiSiteViwer",
        data() {
            return {
            }
        },
        methods: {

        },
        created () {

        },
        mounted () {
            this.renderChart();
        },
    };
</script>

<style lang="scss" scoped>
    .newWin {
        overflow-x: hidden;
        overflow-y: auto;
        height: 100%;
    }
    .k-widget {
        box-shadow: none;
        background-color: #f7f7f7;
    }
    .k-progressbar {
        display: inline-block;
        position: relative;
        vertical-align: middle;
    }
    .k-progressbar .k-state-selected {
        border-color: #0081c6;
        color: #fff;
        background-color: #0081c6;
    }
    .k-progressbar-horizontal {
        // width: 37em;
        width: 100%;
        height: 1.9em;
    }
    .k-progressbar-horizontal > .k-state-selected, .k-rtl .k-progressbar-horizontal.k-progressbar-reverse > .k-state-selected {
        left: -1px;
        right: auto;
        top: -1px;
        height: 100%;
        border-radius: 4px 0 0 4px;
    }
    .k-progress-status-wrap {
        position: absolute;
        top: -1px;
        border: 1px solid transparent;
        line-height: 2em;
        width: 100%;
        height: 100%;
    }
    .k-progress-status-wrap,
    .k-rtl .k-progressbar-horizontal.k-progressbar-reverse .k-progress-status-wrap {
        left: -1px;
        right: auto;
        text-align: right;
    }
    .k-progressbar-horizontal.k-progressbar-reverse .k-progress-status-wrap,
    .k-rtl .k-progressbar-horizontal .k-progress-status-wrap {
        left: auto;
        right: -1px;
        text-align: left;
    }
    .k-progressbar-vertical .k-progress-status-wrap {
        top: auto;
        bottom: -1px;
    }
    .k-progressbar-vertical.k-progressbar-reverse .k-progress-status-wrap {
        bottom: auto;
        top: -1px;
    }
    .k-progress-status {
        display: inline-block;
        padding: 0 .5em;
        min-width: 10px;
        white-space: nowrap;
    }
</style>