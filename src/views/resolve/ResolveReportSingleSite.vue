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
            <h1>
                월간 리포트
            </h1>
            </div>

            <table class="pop-report__table view">
            <colgroup>
                <col style="width: 190px;">
                <col>
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
                            <li>2.2 운전시간 </li>
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
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                <col style="width:8.5%">
                </colgroup>
                <thead>
                <tr>
                    <th>DMS</th>
                    <th>실외기</th>
                    <th>실내기</th>
                    <th>에너지 미터</th>
                    <th>쇼케이스</th>
                    <th>냉동고</th>
                    <th>조명</th>
                    <th>공기실센서</th>
                    <th>PV</th>
                    <th>ESS</th>
                    <th>공기청정기</th>
                    <th>K. weather</th>
                </tr>
                </thead>
                <tbody>
                <tr>
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
            <div class="pop-report__table-subtitle">
                2.1 운전현황
            </div>
            <table>
                <colgroup>
                <col style="width:5%">
                <col style="width:16%">
                <col style="width:16%">
                <col style="width:16%">
                <col style="width:16%">
                <col style="width:21%">
                </colgroup>
                <thead>
                <tr>
                    <th>번호</th>
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
                    <td>00:00</td>
                    <td>14.0</td>
                    <td>14.0</td>
                    <td>14.0</td>
                    <td>14.0</td>
                </tr>
                <tr>
                    <td>1</td>
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
            <div class="pop-report__table-subtitle">
                2.2 운전시간
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                2.3 운전율
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                2.4 가동율
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table-area">
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">
                2.5 가장 낮은 온도로 운전한 실내기와 위치 TOP5
                </div>
                <table>
                <colgroup>
                    <col style="width:5%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:20%">
                </colgroup>
                <thead>
                    <tr>
                    <th>순위</th>
                    <th>실내기 이름</th>
                    <th>그룹</th>
                    <th>평균 운전시간(시:분)</th>
                    <th>평균실내온도(℃)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>4</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>5</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">
                2.6 가장 높은 온도로 운전한 실내기와 위치 TOP5
                </div>
                <table>
                <colgroup>
                    <col style="width:5%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:20%">
                </colgroup>
                <thead>
                    <tr>
                    <th>순위</th>
                    <th>실내기 이름</th>
                    <th>그룹</th>
                    <th>평균 운전시간(시:분)</th>
                    <th>평균실내온도(℃)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>4</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>5</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table-area">
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">
                2.7 누적 운전시간 상위 실내기와 위치 TOP5
                </div>
                <table>
                <colgroup>
                    <col style="width:5%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:20%">
                </colgroup>
                <thead>
                    <tr>
                    <th>순위</th>
                    <th>실내기 이름</th>
                    <th>그룹</th>
                    <th>평균 운전시간(시:분)</th>
                    <th>평균실내온도(℃)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>4</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>5</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div class="pop-report__table">
                <div class="pop-report__table-subtitle">
                2.8 누적 운전시간 하위 실내기와 위치 TOP5
                </div>
                <table>
                <colgroup>
                    <col style="width:5%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:25%">
                    <col style="width:20%">
                </colgroup>
                <thead>
                    <tr>
                    <th>순위</th>
                    <th>실내기 이름</th>
                    <th>그룹</th>
                    <th>평균 운전시간(시:분)</th>
                    <th>평균실내온도(℃)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>1</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>2</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>3</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>4</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                    <tr>
                    <td>5</td>
                    <td class="tal">Device Name1</td>
                    <td class="tal">Group name1</td>
                    <td>
                        <div id="fastAndFurious" data-role="progressbar" class="k-widget k-progressbar k-progressbar-horizontal"><span class="k-progress-status-wrap k-progress-end"><span class="k-progress-status">12:04</span></span>
                        <div class="k-state-selected" style="width: 30%;"><span class="k-progress-status-wrap k-progress-end" style="width: 333.333%;"><span class="k-progress-status">12:04</span></span></div>
                        </div>
                    </td>
                    <td>17.0</td>
                    </tr>
                </tbody>
                </table>
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-title">
                <p>3. 에너지 소비현황</p>
            </div>
            <div class="pop-report__table-subtitle">
                3.1 에너지 소비 현황
            </div>
            <table>
                <colgroup>
                <col style="width:10%">
                <col style="width:70%">
                <col style="width:20%">
                </colgroup>
                <thead>
                <tr>
                    <th>날짜</th>
                    <th>전체 사용소비량(kWh)</th>
                    <th>평균 실외 온도 (℃)</th>
                </tr>
                </thead>
                <tbody>
                <tr class="total_area">
                    <td>합계</td>
                    <td>1,000</td>
                    <td>17.0℃</td>
                </tr>
                <tr>
                    <td>2020-04-10</td>
                    <td>100</td>
                    <td>17.0℃</td>
                </tr>
                <tr>
                    <td>2020-04-10</td>
                    <td>100</td>
                    <td>17.0℃</td>
                </tr>
                <tr>
                    <td>2020-04-10</td>
                    <td>100</td>
                    <td>17.0℃</td>
                </tr>
                <tr>
                    <td>2020-04-10</td>
                    <td>100</td>
                    <td>17.0℃</td>
                </tr>
                <tr>
                    <td>2020-04-10</td>
                    <td>100</td>
                    <td>17.0℃</td>
                </tr>
                </tbody>
            </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                3.2 에너지 소비량 비교
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                3.3 누적 에너지 소비량
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-title">
                <p>4. 기기 점검 현황</p>
            </div>
            <div class="pop-report__table-subtitle">
                4.1 기기점검 현황
            </div>
            <table>
                <colgroup>
                <col style="width:5%">
                <col style="width:30%">
                <col style="width:10%">
                <col style="width:10%">
                <col style="width:10%">
                <col style="width:10%">
                <col style="width:15%">
                </colgroup>
                <thead>
                <tr>
                    <th>번호</th>
                    <th>항목 (점검 구분)</th>
                    <th>정상</th>
                    <th>관찰</th>
                    <th>초지</th>
                    <th>긴급</th>
                    <th>비고</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1</td>
                    <td>필터 청소(공기청정판넬)</td>
                    <td>200</td>
                    <td>50</td>
                    <td>50</td>
                    <td>50</td>
                    <td>50</td>
                </tr>
                <tr>
                    <td>1</td>
                    <td>필터 청소(공기청정판넬)</td>
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
            <div class="pop-report__table-title">
                <p>5. 실내 공기질 현황</p>
            </div>
            <div class="pop-report__table-subtitle">
                5.1 실내 공기질 종합현황
            </div>
            <table>
                <colgroup>
                <col style="width:26%">
                <col style="width:10%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                <col style="width:8%">
                </colgroup>
                <thead>
                <tr>
                    <th rowspan="2">기간</th>
                    <th rowspan="2">총 일수</th>
                    <th colspan="4">쾌적도</th>
                    <th colspan="4">종합 청정도</th>
                </tr>
                <tr>
                    <th>쾌적</th>
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
                    <td>2020-04-10 ~ 2020-05-10</td>
                    <td>30일</td>
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
            <div class="pop-report__table-subtitle">
                5.2 세부 청정도 현황
            </div>
            <table>
                <colgroup>
                <col style="width:20%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                <col style="width:5%">
                </colgroup>
                <thead>
                <tr>
                    <th rowspan="2">총 일수</th>
                    <th colspan="4">PM10</th>
                    <th colspan="4">PM2.5</th>
                    <th colspan="4">PM1.0</th>
                    <th colspan="4">가스</th>
                </tr>
                <tr>
                    <th>좋음</th>
                    <th>보통</th>
                    <th>나쁨</th>
                    <th>매우나쁨</th>
                    <th>좋음</th>
                    <th>보통</th>
                    <th>나쁨</th>
                    <th>매우나쁨</th>
                    <th>좋음</th>
                    <th>보통</th>
                    <th>나쁨</th>
                    <th>매우나쁨</th>
                    <th>좋음</th>
                    <th>보통</th>
                    <th>나쁨</th>
                    <th>매우나쁨</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>30일</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                    <td>1</td>
                </tr>
                </tbody>
            </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                5.3 공기질 높은 사이트 TOP5
            </div>
            <table>
                <colgroup>
                <col style="width:10%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                <col style="width:9%">
                </colgroup>
                <thead>
                <tr>
                    <th rowspan="2">날짜</th>
                    <th colspan="4">쾌적도</th>
                    <th colspan="6">청정도</th>
                </tr>
                <tr>
                    <th>실내 쾌적도</th>
                    <th>평균 실외 온도</th>
                    <th>평균 실내온도</th>
                    <th>평균 실내습도</th>
                    <th>실외 청정도</th>
                    <th>실내 청정도</th>
                    <th>PM10</th>
                    <th>PM2.5</th>
                    <th>PM1.0</th>
                    <th>가스</th>
                </tr>
                </thead>
                <tbody>
                <tr class="total_area">
                    <td>평균</td>
                    <td><span class="st_normal">보통</span></td>
                    <td>18.2 ℃</td>
                    <td>18.2 ℃</td>
                    <td>18.2 ℃</td>
                    <td><span class="st_verypoor">매우나쁨</span></td>
                    <td><span class="st_poor">나쁨</span></td>
                    <td><span class="st_normal">보통</span></td>
                    <td><span class="st_good">좋음</span></td>
                    <td><span class="st_good">좋음</span></td>
                    <td><span class="st_good">좋음</span></td>
                </tr>
                <tr>
                    <td>2020-04-01</td>
                    <td><span class="st_normal">보통</span></td>
                    <td>18.2 ℃</td>
                    <td>18.2 ℃</td>
                    <td>18.2 ℃</td>
                    <td><span class="st_verypoor">매우나쁨</span></td>
                    <td><span class="st_poor">나쁨</span></td>
                    <td><span class="st_normal">보통</span></td>
                    <td><span class="st_good">좋음</span></td>
                    <td><span class="st_good">좋음</span></td>
                    <td><span class="st_good">좋음</span></td>
                </tr>
                </tbody>
            </table>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                5.4 실내 쾌적도 트렌드
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->

            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-subtitle">
                5.5 실내 청정도 트렌드
            </div>
            <div class="pop-report__table-chart">
                차트영역
            </div>
            </div>
            <!-- e:grid-->


            <!-- s:grid-->
            <div class="pop-report__table">
            <div class="pop-report__table-title">
                <p>6. 종합 의견</p>
            </div>
            <div class="pop-report__table-box">
                의견이 등록되면 해당내용 출력<br />
                의견이 등록되면 해당내용 출력<br />
                의견이 등록되면 해당내용 출력<br />
                의견이 등록되면 해당내용 출력<br />
            </div>
            </div>
            <!-- e:grid-->
        </div>
    </div>
</template>

<script>
    export default {
        name: "ReportSingleSiteViwer",
        data() {
            return {

            }
        },
        created () {

        }
    }
</script>

<style lang="scss" scoped>
    .newWin {
        overflow-x: hidden;
        overflow-y: auto;
        height: 100%;
    }
    /* Progressbar */
    .k-progressbar {
        display: inline-block;
        position: relative;
        vertical-align: middle;
    }
    .k-progressbar {
        border-radius: 4px;
    }
    .k-progressbar-horizontal {
        width: 27em;
        height: 1.9em;
    }
    .k-progressbar-vertical {
        width: 1.9em;
        height: 27em;
    }
    .k-progressbar > .k-state-selected {
        position: absolute;
        border-style: solid;
        border-width: 1px;
        overflow: hidden;
    }
    .k-progressbar-horizontal > .k-state-selected,
    .k-rtl .k-progressbar-horizontal.k-progressbar-reverse > .k-state-selected {
        left: -1px;
        right: auto;
        top: -1px;
        height: 100%;
        border-radius: 4px 0 0 4px;
    }
    .k-progressbar-horizontal.k-progressbar-reverse > .k-state-selected,
    .k-rtl .k-progressbar-horizontal > .k-state-selected {
        left: auto;
        right: -1px;
        border-radius: 0 4px 4px 0;
    }
    .k-progressbar-vertical > .k-state-selected {
        left: -1px;
        bottom: -1px;
        width: 100%;
        border-radius: 0 0 4px 4px;
    }
    .k-progressbar-vertical.k-progressbar-reverse > .k-state-selected {
        bottom: auto;
        top: -1px;
        border-radius: 4px 4px 0 0;
    }
    .k-progressbar > .k-state-selected.k-complete,
    .k-rtl .k-progressbar > .k-state-selected.k-complete {
        border-radius: 4px;
    }
    .k-progressbar > .k-reset {
        list-style: none;
        margin: 0;
        padding: 0;
        position: absolute;
        left: -1px;
        top: -1px;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        white-space: nowrap;
    }
    .k-progressbar-horizontal .k-item {
        display: inline-block;
        height: 100%;
        border-style: solid;
        margin-left: -1px;
    }
    .k-progressbar-horizontal .k-item.k-first {
        margin-left: 0;
    }
    .k-progressbar-horizontal .k-item.k-last {
        border-right-width: 0;
    }
    .k-progressbar-horizontal .k-item,
    .k-rtl .k-progressbar-horizontal.k-progressbar-reverse .k-item {
        border-width: 1px 0 1px 1px;
    }
    .k-progressbar-horizontal.k-progressbar-reverse .k-item,
    .k-rtl .k-progressbar-horizontal .k-item {
        border-width: 1px 0 1px 1px;
    }
    .k-progressbar-horizontal .k-first,
    .k-rtl .k-progressbar-horizontal .k-last,
    .k-rtl .k-progressbar-horizontal.k-progressbar-reverse .k-last {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        border-left-width: 1px;
    }
    .k-progressbar-horizontal .k-last,
    .k-rtl .k-progressbar-horizontal .k-first {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    .k-progressbar-horizontal.k-progressbar-reverse .k-last,
    .k-rtl .k-progressbar-horizontal .k-first {
        border-right-width: 1px;
    }
    .k-progressbar-horizontal .k-last.k-state-selected {
        border-right-width: 1px;
    }
    .k-progressbar-vertical .k-item {
        width: 100%;
        border-style: solid;
        border-width: 1px 1px 0 1px;
        margin-top: -1px;
    }
    .k-progressbar-vertical .k-item.k-first {
        margin-top: 0;
    }
    .k-progressbar-vertical li.k-item.k-last {
        border-bottom-width: 0;
    }
    .k-progressbar-vertical .k-first {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }
    .k-progressbar-vertical .k-last {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        border-bottom-width: 1px;
    }
    .k-progressbar-vertical.k-progressbar-reverse .k-item {
        border-width: 0 1px 1px 1px;
    }
    .k-progressbar-vertical.k-progressbar-reverse .k-first {
        border-top-width: 1px;
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
    .k-progressbar-vertical.k-progressbar-reverse .k-progress-status {
        position: absolute;
        bottom: 0;
        left: 0;
    }
    .k-progressbar-vertical .k-progress-status {
        -webkit-transform: rotate(-90deg) translateX(-100%);
        -ms-transform: rotate(-90deg) translateX(-100%);
        transform: rotate(-90deg) translateX(-100%);
        -webkit-transform-origin: 0 0;
        -ms-transform-origin: 0 0;
        transform-origin: 0 0;
    }
    .k-progressbar-vertical.k-progressbar-reverse .k-progress-status {
        -webkit-transform: rotate(90deg) translateX(-100%);
        -ms-transform: rotate(90deg) translateX(-100%);
        transform: rotate(90deg) translateX(-100%);
        -webkit-transform-origin: 0 100%;
        -ms-transform-origin: 0 100%;
        transform-origin: 0 100%;
    }
    .k-ie8 .k-progressbar-vertical .k-progress-status {
        -webkit-writing-mode: bt-lr;
        -ms-writing-mode: bt-lr;
        writing-mode: bt-lr;
        padding: .5em 0;
    }
</style>