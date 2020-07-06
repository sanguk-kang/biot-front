function industryData(){
    var data = [
        {
            value: '5001',
            key: '복합시설'
        },
        {
            value: '5002',
            key: '판매시설'
        },
        {
            value: '5003',
            key: '교육시설'
        },
        {
            value: '5004',
            key: '숙박시설'
        },
        {
            value: '5005',
            key: '업무시설'
        },
        {
            value: '5006',
            key: '공공시설'
        },
        {
            value: '5007',
            key: '의료시설'
        }
    ];
    
    return data;
}

function industry(code){
    var data = [
        {
            value: '5001',
            key: '복합시설'
        },
        {
            value: '5002',
            key: '판매시설'
        },
        {
            value: '5003',
            key: '교육시설'
        },
        {
            value: '5004',
            key: '숙박시설'
        },
        {
            value: '5005',
            key: '업무시설'
        },
        {
            value: '5006',
            key: '공공시설'
        },
        {
            value: '5007',
            key: '의료시설'
        }
    ];
    
    var returnCode;

    for(var i in data){
        if(data[i].value==code){
            returnCode = data[i].key;
            break;
        }
    }

    return returnCode;
}

function userRoleCode(role){
    var data;
    switch (role) {
        case 'Multi Site Admin':
            data = 202;
            break;
        case 'Cloud Admin':
            data = 101;
            break;
        case 'Site Admin':
            data = 203;
            break;
        case 'Manager':
            data = 301;
            break;
        case 'Guest':
            data = 302;
            break;
        case 'Maintainer':
            data = 201;
            break;
        default:
    }
    return data;
}

function reasonData(){
    var data = [
        {
            value: '담당자 변경',
            key: '11G001'
        },
        {
            value: '전임사 퇴사',
            key: '11G002'
        },
        {
            value: '기타',
            key: '11G003'
        }
    ];
    
    return data;
}


function reason(code){
    var data = [
        {
            value: '담당자 변경',
            key: '11G001'
        },
        {
            value: '전임사 퇴사',
            key: '11G002'
        },
        {
            value: '기타',
            key: '11G003'
        }
    ];
    
    var returnCode;

    for(var i in data){
        if(data[i].value==code){
            returnCode = data[i].key;
            break;
        }
    }

    return returnCode;
}

function weekendsData(){
    var data = [
        {
            value: 'Sun',
            key: '일'
        },
        {
            value: 'Mon',
            key: '월'
        },
        {
            value: 'Tue',
            key: '화'
        },
        {
            value: 'Wed',
            key: '수'
        },
        {
            value: 'Thu',
            key: '목'
        },
        {
            value: 'Fri',
            key: '금'
        },
        {
            value: 'Sat',
            key: '토'
        }
    ];
    
    return data;
}

function countryData(){
    var data = [   
        {
            value: 'GH',
            key: '가나'
        },
        {
            value: 'GA',
            key: '가봉'
        },
        {
            value: 'GY',
            key: '가이아나'
        },
        {
            value: 'GM',
            key: '감비아'
        },
        {
            value: 'GG',
            key: '건지 섬'
        },
        {
            value: 'GP',
            key: '과들루프'
        },
        {
            value: 'GT',
            key: '과테말라'
        },
        {
            value: 'GU',
            key: '괌'
        },
        {
            value: 'GD',
            key: '그레나다'
        },
        {
            value: 'GE',
            key: '조지아'
        },
        {
            value: 'GR',
            key: '그리스'
        },
        {
            value: 'GL',
            key: '그린란드'
        },
        {
            value: 'GN',
            key: '기니'
        },
        {
            value: 'GW',
            key: '기니비사우'
        },
        {
            value: 'NA',
            key: '나미비아'
        },
        {
            value: 'NR',
            key: '나우루'
        },
        {
            value: 'NG',
            key: '나이지리아'
        },
        {
            value: 'AQ',
            key: '남극'
        },
        {
            value: 'ZA',
            key: '남아프리카 공화국'
        },
        {
            value: 'NL',
            key: '네덜란드'
        },
        {
            value: 'AN',
            key: '네덜란드령 안틸레스'
        },
        {
            value: 'NP',
            key: '네팔'
        },
        {
            value: 'NO',
            key: '노르웨이'
        },
        {
            value: 'NF',
            key: '노퍽 섬'
        },
        {
            value: 'NC',
            key: '누벨칼레도니'
        },
        {
            value: 'NZ',
            key: '뉴질랜드'
        },
        {
            value: 'NU',
            key: '니우에'
        },
        {
            value: 'NE',
            key: '니제르'
        },
        {
            value: 'NI',
            key: '니카라과'
        },
        {
            value: 'KR',
            key: '대한민국'
        },
        {
            value: 'DK',
            key: '덴마크'
        },
        {
            value: 'DM',
            key: '도미니카'
        },
        {
            value: 'DO',
            key: '도미니카 공화국'
        },
        {
            value: 'DE',
            key: '독일'
        },
        {
            value: 'TL',
            key: '동티모르'
        },
        {
            value: 'LA',
            key: '라오스'
        },
        {
            value: 'LR',
            key: '라이베리아'
        },
        {
            value: 'LV',
            key: '라트비아'
        },
        {
            value: 'RU',
            key: '러시아'
        },
        {
            value: 'LB',
            key: '레바논'
        },
        {
            value: 'LS',
            key: '레소토'
        },
        {
            value: 'RE',
            key: '레위니옹'
        },
        {
            value: 'RO',
            key: '루마니아'
        },
        {
            value: 'LU',
            key: '룩셈부르크'
        },
        {
            value: 'RW',
            key: '르완다'
        },
        {
            value: 'LY',
            key: '리비아'
        },
        {
            value: 'LT',
            key: '리투아니아'
        },
        {
            value: 'LI',
            key: '리히텐슈타인'
        },
        {
            value: 'MG',
            key: '마다가스카르'
        },
        {
            value: 'MQ',
            key: '마르티니크'
        },
        {
            value: 'MH',
            key: '마셜 제도'
        },
        {
            value: 'YT',
            key: '마요트'
        },
        {
            value: 'MO',
            key: '마카오'
        },
        {
            value: 'MK',
            key: '마케도니아 공화국'
        },
        {
            value: 'MW',
            key: '말라위'
        },
        {
            value: 'MY',
            key: '말레이시아'
        },
        {
            value: 'ML',
            key: '말리'
        },
        {
            value: 'IM',
            key: '맨 섬'
        },
        {
            value: 'MX',
            key: '멕시코'
        },
        {
            value: 'MC',
            key: '모나코'
        },
        {
            value: 'MA',
            key: '모로코'
        },
        {
            value: 'MU',
            key: '모리셔스'
        },
        {
            value: 'MR',
            key: '모리타니'
        },
        {
            value: 'MZ',
            key: '모잠비크'
        },
        {
            value: 'ME',
            key: '몬테네그로'
        },
        {
            value: 'MS',
            key: '몬트세랫'
        },
        {
            value: 'MD',
            key: '몰도바'
        },
        {
            value: 'MV',
            key: '몰디브'
        },
        {
            value: 'MT',
            key: '몰타'
        },
        {
            value: 'MN',
            key: '몽골'
        },
        {
            value: 'US',
            key: '미국'
        },
        {
            value: 'UM',
            key: '미국령 군소 제도'
        },
        {
            value: 'VI',
            key: '미국령 버진아일랜드'
        },
        {
            value: 'MM',
            key: '미얀마'
        },
        {
            value: 'FM',
            key: '미크로네시아 연방'
        },
        {
            value: 'VU',
            key: '바누아투'
        },
        {
            value: 'BH',
            key: '바레인'
        },
        {
            value: 'BB',
            key: '바베이도스'
        },
        {
            value: 'VA',
            key: '바티칸 시국'
        },
        {
            value: 'BS',
            key: '바하마'
        },
        {
            value: 'BD',
            key: '방글라데시'
        },
        {
            value: 'BM',
            key: '버뮤다'
        },
        {
            value: 'BJ',
            key: '베냉'
        },
        {
            value: 'VE',
            key: '베네수엘라'
        },
        {
            value: 'VN',
            key: '베트남'
        },
        {
            value: 'BE',
            key: '벨기에'
        },
        {
            value: 'BY',
            key: '벨라루스'
        },
        {
            value: 'BZ',
            key: '벨리즈'
        },
        {
            value: 'BA',
            key: '보스니아 헤르체고비나'
        },
        {
            value: 'BW',
            key: '보츠와나'
        },
        {
            value: 'BO',
            key: '볼리비아'
        },
        {
            value: 'BI',
            key: '부룬디'
        },
        {
            value: 'BF',
            key: '부르키나파소'
        },
        {
            value: 'BV',
            key: '부베 섬'
        },
        {
            value: 'BT',
            key: '부탄'
        },
        {
            value: 'MP',
            key: '북마리아나 제도'
        },
        {
            value: 'BG',
            key: '불가리아'
        },
        {
            value: 'BR',
            key: '브라질'
        },
        {
            value: 'BN',
            key: '브루나이'
        },
        {
            value: 'WS',
            key: '사모아'
        },
        {
            value: 'SA',
            key: '사우디아라비아'
        },
        // {
        //     value: '',
        //     key: '사우스조지아 사우스샌드위치 제GS'
        // },
        {
            value: 'SM',
            key: '산마리노'
        },
        {
            value: 'ST',
            key: '상투메 프린시페'
        },
        {
            value: 'PM',
            key: '생피에르 미클롱'
        },
        {
            value: 'EH',
            key: '서사하라'
        },
        {
            value: 'SN',
            key: '세네갈'
        },
        {
            value: 'RS',
            key: '세르비아'
        },
        {
            value: 'SC',
            key: '세이셸'
        },
        {
            value: 'LC',
            key: '세인트루시아'
        },
        {
            value: 'VC',
            key: '세인트빈센트 그레나딘'
        },
        {
            value: 'KN',
            key: '세인트키츠 네비스'
        },
        {
            value: 'SH',
            key: '세인트헬레나'
        },
        {
            value: 'SO',
            key: '소말리아'
        },
        {
            value: 'SB',
            key: '솔로몬 제도'
        },
        {
            value: 'SD',
            key: '수단'
        },
        {
            value: 'SR',
            key: '수리남'
        },
        {
            value: 'LK',
            key: '스리랑카'
        },
        {
            value: 'SJ',
            key: '스발바르 얀마옌'
        },
        {
            value: 'SZ',
            key: '스와질란드'
        },
        {
            value: 'SE',
            key: '스웨덴'
        },
        {
            value: 'CH',
            key: '스위스'
        },
        {
            value: 'ES',
            key: '스페인'
        },
        {
            value: 'SK',
            key: '슬로바키아'
        },
        {
            value: 'SI',
            key: '슬로베니아'
        },
        {
            value: 'SY',
            key: '시리아'
        },
        {
            value: 'SL',
            key: '시에라리온'
        },
        {
            value: 'SG',
            key: '싱가포르'
        },
        {
            value: 'AE',
            key: '아랍에미리트'
        },
        {
            value: 'AW',
            key: '아루바'
        },
        {
            value: 'AM',
            key: '아르메니아'
        },
        {
            value: 'AR',
            key: '아르헨티나'
        },
        {
            value: 'AS',
            key: '아메리칸사모아'
        },
        {
            value: 'IS',
            key: '아이슬란드'
        },
        {
            value: 'HT',
            key: '아이티'
        },
        {
            value: 'IE',
            key: '아일랜드'
        },
        {
            value: 'AZ',
            key: '아제르바이잔'
        },
        {
            value: 'AF',
            key: '아프가니스탄'
        },
        {
            value: 'AD',
            key: '안도라'
        },
        {
            value: 'AL',
            key: '알바니아'
        },
        {
            value: 'DZ',
            key: '알제리'
        },
        {
            value: 'AO',
            key: '앙골라'
        },
        {
            value: 'AG',
            key: '앤티가 바부다'
        },
        {
            value: 'AI',
            key: '앵귈라'
        },
        {
            value: 'ER',
            key: '에리트레아'
        },
        {
            value: 'EE',
            key: '에스토니아'
        },
        {
            value: 'EC',
            key: '에콰도르'
        },
        {
            value: 'ET',
            key: '에티오피아'
        },
        {
            value: 'SV',
            key: '엘살바도르'
        },
        {
            value: 'GB',
            key: '영국'
        },
        {
            value: 'VG',
            key: '영국령 버진아일랜드'
        },
        {
            value: 'IO',
            key: '영국령 인도양 지역'
        },
        {
            value: 'YE',
            key: '예멘'
        },
        {
            value: 'OM',
            key: '오만'
        },
        {
            value: 'AU',
            key: '오스트레일리아'
        },
        {
            value: 'AT',
            key: '오스트리아'
        },
        {
            value: 'HN',
            key: '온두라스'
        },
        {
            value: 'AX',
            key: '올란드 제도'
        },
        {
            value: 'JO',
            key: '요르단'
        },
        {
            value: 'UG',
            key: '우간다'
        },
        {
            value: 'UY',
            key: '우루과이'
        },
        {
            value: 'UZ',
            key: '우즈베키스탄'
        },
        {
            value: 'UA',
            key: '우크라이나'
        },
        {
            value: 'WF',
            key: '왈리스 퓌튀나'
        },
        {
            value: 'IQ',
            key: '이라크'
        },
        {
            value: 'IR',
            key: '이란'
        },
        {
            value: 'IL',
            key: '이스라엘'
        },
        {
            value: 'EG',
            key: '이집트'
        },
        {
            value: 'IT',
            key: '이탈리아'
        },
        {
            value: 'ID',
            key: '인도네시아'
        },
        {
            value: 'IN',
            key: '인도'
        },
        {
            value: 'JP',
            key: '일본'
        },
        {
            value: 'JM',
            key: '자메이카'
        },
        {
            value: 'ZM',
            key: '잠비아'
        },
        {
            value: 'JE',
            key: '저지 섬'
        },
        {
            value: 'GQ',
            key: '적도 기니'
        },
        {
            value: 'KP',
            key: '조선민주주의인민공화국'
        },
        {
            value: 'CF',
            key: '중앙아프리카 공화국'
        },
        {
            value: 'TW',
            key: '중화민국'
        },
        {
            value: 'CN',
            key: '중화인민공화국'
        },
        {
            value: 'DJ',
            key: '지부티'
        },
        {
            value: 'GI',
            key: '지브롤터'
        },
        {
            value: 'ZW',
            key: '짐바브웨'
        },
        {
            value: 'TD',
            key: '차드'
        },
        {
            value: 'CZ',
            key: '체코'
        },
        {
            value: 'CL',
            key: '칠레'
        },
        {
            value: 'CM',
            key: '카메룬'
        },
        {
            value: 'CV',
            key: '카보베르데'
        },
        {
            value: 'KZ',
            key: '카자흐스탄'
        },
        {
            value: 'QA',
            key: '카타르'
        },
        {
            value: 'KH',
            key: '캄보디아'
        },
        {
            value: 'CA',
            key: '캐나다'
        },
        {
            value: 'KE',
            key: '케냐'
        },
        {
            value: 'KY',
            key: '케이맨 제도'
        },
        {
            value: 'KM',
            key: '코모로'
        },
        {
            value: 'CR',
            key: '코스타리카'
        },
        {
            value: 'CC',
            key: '코코스 제도'
        },
        {
            value: 'CI',
            key: '코트디부아르'
        },
        {
            value: 'CO',
            key: '콜롬비아'
        },
        {
            value: 'CG',
            key: '콩고 공화국'
        },
        {
            value: 'CD',
            key: '콩고 민주 공화국'
        },
        {
            value: 'CU',
            key: '쿠바'
        },
        {
            value: 'KW',
            key: '쿠웨이트'
        },
        {
            value: 'CK',
            key: '쿡 제도'
        },
        {
            value: 'HR',
            key: '크로아티아'
        },
        {
            value: 'CX',
            key: '크리스마스 섬'
        },
        {
            value: 'KG',
            key: '키르기스스탄'
        },
        {
            value: 'KI',
            key: '키리바시'
        },
        {
            value: 'CY',
            key: '키프로스'
        },
        {
            value: 'TH',
            key: '타이'
        },
        {
            value: 'TJ',
            key: '타지키스탄'
        },
        {
            value: 'TZ',
            key: '탄자니아'
        },
        {
            value: 'TC',
            key: '터크스 케이커스 제도'
        },
        {
            value: 'TR',
            key: '터키'
        },
        {
            value: 'TG',
            key: '토고'
        },
        {
            value: 'TK',
            key: '토켈라우'
        },
        {
            value: 'TO',
            key: '통가'
        },
        {
            value: 'TM',
            key: '투르크메니스탄'
        },
        {
            value: 'TV',
            key: '투발루'
        },
        {
            value: 'TN',
            key: '튀니지'
        },
        {
            value: 'TT',
            key: '트리니다드 토바고'
        },
        {
            value: 'PA',
            key: '파나마'
        },
        {
            value: 'PY',
            key: '파라과이'
        },
        {
            value: 'PK',
            key: '파키스탄'
        },
        {
            value: 'PG',
            key: '파푸아 뉴기니'
        },
        {
            value: 'PW',
            key: '팔라우'
        },
        {
            value: 'PS',
            key: '팔레스타인'
        },
        {
            value: 'FO',
            key: '페로 제도'
        },
        {
            value: 'PE',
            key: '페루'
        },
        {
            value: 'PT',
            key: '포르투갈'
        },
        {
            value: 'FK',
            key: '포클랜드 제도'
        },
        {
            value: 'PL',
            key: '폴란드'
        },
        {
            value: 'PR',
            key: '푸에르토리코'
        },
        {
            value: 'FR',
            key: '프랑스'
        },
        {
            value: 'GF',
            key: '프랑스령 기아나'
        },
        {
            value: 'TF',
            key: '프랑스령 남부와 남극 지역'
        },
        {
            value: 'PF',
            key: '프랑스령 폴리네시아'
        },
        {
            value: 'FJ',
            key: '피지'
        },
        {
            value: 'FI',
            key: '핀란드'
        },
        {
            value: 'PH',
            key: '필리핀'
        },
        {
            value: 'PN',
            key: '핏케언 제도'
        },
        {
            value: 'HM',
            key: '허드 맥도널드 제도'
        },
        {
            value: 'HU',
            key: '헝가리'
        },
        {
            value: 'HK',
            key: '홍콩'
        }
     ];
    
    return data;
}


function country(code){
    var data = [   
        {
            value: 'GH',
            key: '가나'
        },
        {
            value: 'GA',
            key: '가봉'
        },
        {
            value: 'GY',
            key: '가이아나'
        },
        {
            value: 'GM',
            key: '감비아'
        },
        {
            value: 'GG',
            key: '건지 섬'
        },
        {
            value: 'GP',
            key: '과들루프'
        },
        {
            value: 'GT',
            key: '과테말라'
        },
        {
            value: 'GU',
            key: '괌'
        },
        {
            value: 'GD',
            key: '그레나다'
        },
        {
            value: 'GE',
            key: '조지아'
        },
        {
            value: 'GR',
            key: '그리스'
        },
        {
            value: 'GL',
            key: '그린란드'
        },
        {
            value: 'GN',
            key: '기니'
        },
        {
            value: 'GW',
            key: '기니비사우'
        },
        {
            value: 'NA',
            key: '나미비아'
        },
        {
            value: 'NR',
            key: '나우루'
        },
        {
            value: 'NG',
            key: '나이지리아'
        },
        {
            value: 'AQ',
            key: '남극'
        },
        {
            value: 'ZA',
            key: '남아프리카 공화국'
        },
        {
            value: 'NL',
            key: '네덜란드'
        },
        {
            value: 'AN',
            key: '네덜란드령 안틸레스'
        },
        {
            value: 'NP',
            key: '네팔'
        },
        {
            value: 'NO',
            key: '노르웨이'
        },
        {
            value: 'NF',
            key: '노퍽 섬'
        },
        {
            value: 'NC',
            key: '누벨칼레도니'
        },
        {
            value: 'NZ',
            key: '뉴질랜드'
        },
        {
            value: 'NU',
            key: '니우에'
        },
        {
            value: 'NE',
            key: '니제르'
        },
        {
            value: 'NI',
            key: '니카라과'
        },
        {
            value: 'KR',
            key: '대한민국'
        },
        {
            value: 'DK',
            key: '덴마크'
        },
        {
            value: 'DM',
            key: '도미니카'
        },
        {
            value: 'DO',
            key: '도미니카 공화국'
        },
        {
            value: 'DE',
            key: '독일'
        },
        {
            value: 'TL',
            key: '동티모르'
        },
        {
            value: 'LA',
            key: '라오스'
        },
        {
            value: 'LR',
            key: '라이베리아'
        },
        {
            value: 'LV',
            key: '라트비아'
        },
        {
            value: 'RU',
            key: '러시아'
        },
        {
            value: 'LB',
            key: '레바논'
        },
        {
            value: 'LS',
            key: '레소토'
        },
        {
            value: 'RE',
            key: '레위니옹'
        },
        {
            value: 'RO',
            key: '루마니아'
        },
        {
            value: 'LU',
            key: '룩셈부르크'
        },
        {
            value: 'RW',
            key: '르완다'
        },
        {
            value: 'LY',
            key: '리비아'
        },
        {
            value: 'LT',
            key: '리투아니아'
        },
        {
            value: 'LI',
            key: '리히텐슈타인'
        },
        {
            value: 'MG',
            key: '마다가스카르'
        },
        {
            value: 'MQ',
            key: '마르티니크'
        },
        {
            value: 'MH',
            key: '마셜 제도'
        },
        {
            value: 'YT',
            key: '마요트'
        },
        {
            value: 'MO',
            key: '마카오'
        },
        {
            value: 'MK',
            key: '마케도니아 공화국'
        },
        {
            value: 'MW',
            key: '말라위'
        },
        {
            value: 'MY',
            key: '말레이시아'
        },
        {
            value: 'ML',
            key: '말리'
        },
        {
            value: 'IM',
            key: '맨 섬'
        },
        {
            value: 'MX',
            key: '멕시코'
        },
        {
            value: 'MC',
            key: '모나코'
        },
        {
            value: 'MA',
            key: '모로코'
        },
        {
            value: 'MU',
            key: '모리셔스'
        },
        {
            value: 'MR',
            key: '모리타니'
        },
        {
            value: 'MZ',
            key: '모잠비크'
        },
        {
            value: 'ME',
            key: '몬테네그로'
        },
        {
            value: 'MS',
            key: '몬트세랫'
        },
        {
            value: 'MD',
            key: '몰도바'
        },
        {
            value: 'MV',
            key: '몰디브'
        },
        {
            value: 'MT',
            key: '몰타'
        },
        {
            value: 'MN',
            key: '몽골'
        },
        {
            value: 'US',
            key: '미국'
        },
        {
            value: 'UM',
            key: '미국령 군소 제도'
        },
        {
            value: 'VI',
            key: '미국령 버진아일랜드'
        },
        {
            value: 'MM',
            key: '미얀마'
        },
        {
            value: 'FM',
            key: '미크로네시아 연방'
        },
        {
            value: 'VU',
            key: '바누아투'
        },
        {
            value: 'BH',
            key: '바레인'
        },
        {
            value: 'BB',
            key: '바베이도스'
        },
        {
            value: 'VA',
            key: '바티칸 시국'
        },
        {
            value: 'BS',
            key: '바하마'
        },
        {
            value: 'BD',
            key: '방글라데시'
        },
        {
            value: 'BM',
            key: '버뮤다'
        },
        {
            value: 'BJ',
            key: '베냉'
        },
        {
            value: 'VE',
            key: '베네수엘라'
        },
        {
            value: 'VN',
            key: '베트남'
        },
        {
            value: 'BE',
            key: '벨기에'
        },
        {
            value: 'BY',
            key: '벨라루스'
        },
        {
            value: 'BZ',
            key: '벨리즈'
        },
        {
            value: 'BA',
            key: '보스니아 헤르체고비나'
        },
        {
            value: 'BW',
            key: '보츠와나'
        },
        {
            value: 'BO',
            key: '볼리비아'
        },
        {
            value: 'BI',
            key: '부룬디'
        },
        {
            value: 'BF',
            key: '부르키나파소'
        },
        {
            value: 'BV',
            key: '부베 섬'
        },
        {
            value: 'BT',
            key: '부탄'
        },
        {
            value: 'MP',
            key: '북마리아나 제도'
        },
        {
            value: 'BG',
            key: '불가리아'
        },
        {
            value: 'BR',
            key: '브라질'
        },
        {
            value: 'BN',
            key: '브루나이'
        },
        {
            value: 'WS',
            key: '사모아'
        },
        {
            value: 'SA',
            key: '사우디아라비아'
        },
        // {
        //     value: '',
        //     key: '사우스조지아 사우스샌드위치 제GS'
        // },
        {
            value: 'SM',
            key: '산마리노'
        },
        {
            value: 'ST',
            key: '상투메 프린시페'
        },
        {
            value: 'PM',
            key: '생피에르 미클롱'
        },
        {
            value: 'EH',
            key: '서사하라'
        },
        {
            value: 'SN',
            key: '세네갈'
        },
        {
            value: 'RS',
            key: '세르비아'
        },
        {
            value: 'SC',
            key: '세이셸'
        },
        {
            value: 'LC',
            key: '세인트루시아'
        },
        {
            value: 'VC',
            key: '세인트빈센트 그레나딘'
        },
        {
            value: 'KN',
            key: '세인트키츠 네비스'
        },
        {
            value: 'SH',
            key: '세인트헬레나'
        },
        {
            value: 'SO',
            key: '소말리아'
        },
        {
            value: 'SB',
            key: '솔로몬 제도'
        },
        {
            value: 'SD',
            key: '수단'
        },
        {
            value: 'SR',
            key: '수리남'
        },
        {
            value: 'LK',
            key: '스리랑카'
        },
        {
            value: 'SJ',
            key: '스발바르 얀마옌'
        },
        {
            value: 'SZ',
            key: '스와질란드'
        },
        {
            value: 'SE',
            key: '스웨덴'
        },
        {
            value: 'CH',
            key: '스위스'
        },
        {
            value: 'ES',
            key: '스페인'
        },
        {
            value: 'SK',
            key: '슬로바키아'
        },
        {
            value: 'SI',
            key: '슬로베니아'
        },
        {
            value: 'SY',
            key: '시리아'
        },
        {
            value: 'SL',
            key: '시에라리온'
        },
        {
            value: 'SG',
            key: '싱가포르'
        },
        {
            value: 'AE',
            key: '아랍에미리트'
        },
        {
            value: 'AW',
            key: '아루바'
        },
        {
            value: 'AM',
            key: '아르메니아'
        },
        {
            value: 'AR',
            key: '아르헨티나'
        },
        {
            value: 'AS',
            key: '아메리칸사모아'
        },
        {
            value: 'IS',
            key: '아이슬란드'
        },
        {
            value: 'HT',
            key: '아이티'
        },
        {
            value: 'IE',
            key: '아일랜드'
        },
        {
            value: 'AZ',
            key: '아제르바이잔'
        },
        {
            value: 'AF',
            key: '아프가니스탄'
        },
        {
            value: 'AD',
            key: '안도라'
        },
        {
            value: 'AL',
            key: '알바니아'
        },
        {
            value: 'DZ',
            key: '알제리'
        },
        {
            value: 'AO',
            key: '앙골라'
        },
        {
            value: 'AG',
            key: '앤티가 바부다'
        },
        {
            value: 'AI',
            key: '앵귈라'
        },
        {
            value: 'ER',
            key: '에리트레아'
        },
        {
            value: 'EE',
            key: '에스토니아'
        },
        {
            value: 'EC',
            key: '에콰도르'
        },
        {
            value: 'ET',
            key: '에티오피아'
        },
        {
            value: 'SV',
            key: '엘살바도르'
        },
        {
            value: 'GB',
            key: '영국'
        },
        {
            value: 'VG',
            key: '영국령 버진아일랜드'
        },
        {
            value: 'IO',
            key: '영국령 인도양 지역'
        },
        {
            value: 'YE',
            key: '예멘'
        },
        {
            value: 'OM',
            key: '오만'
        },
        {
            value: 'AU',
            key: '오스트레일리아'
        },
        {
            value: 'AT',
            key: '오스트리아'
        },
        {
            value: 'HN',
            key: '온두라스'
        },
        {
            value: 'AX',
            key: '올란드 제도'
        },
        {
            value: 'JO',
            key: '요르단'
        },
        {
            value: 'UG',
            key: '우간다'
        },
        {
            value: 'UY',
            key: '우루과이'
        },
        {
            value: 'UZ',
            key: '우즈베키스탄'
        },
        {
            value: 'UA',
            key: '우크라이나'
        },
        {
            value: 'WF',
            key: '왈리스 퓌튀나'
        },
        {
            value: 'IQ',
            key: '이라크'
        },
        {
            value: 'IR',
            key: '이란'
        },
        {
            value: 'IL',
            key: '이스라엘'
        },
        {
            value: 'EG',
            key: '이집트'
        },
        {
            value: 'IT',
            key: '이탈리아'
        },
        {
            value: 'ID',
            key: '인도네시아'
        },
        {
            value: 'IN',
            key: '인도'
        },
        {
            value: 'JP',
            key: '일본'
        },
        {
            value: 'JM',
            key: '자메이카'
        },
        {
            value: 'ZM',
            key: '잠비아'
        },
        {
            value: 'JE',
            key: '저지 섬'
        },
        {
            value: 'GQ',
            key: '적도 기니'
        },
        {
            value: 'KP',
            key: '조선민주주의인민공화국'
        },
        {
            value: 'CF',
            key: '중앙아프리카 공화국'
        },
        {
            value: 'TW',
            key: '중화민국'
        },
        {
            value: 'CN',
            key: '중화인민공화국'
        },
        {
            value: 'DJ',
            key: '지부티'
        },
        {
            value: 'GI',
            key: '지브롤터'
        },
        {
            value: 'ZW',
            key: '짐바브웨'
        },
        {
            value: 'TD',
            key: '차드'
        },
        {
            value: 'CZ',
            key: '체코'
        },
        {
            value: 'CL',
            key: '칠레'
        },
        {
            value: 'CM',
            key: '카메룬'
        },
        {
            value: 'CV',
            key: '카보베르데'
        },
        {
            value: 'KZ',
            key: '카자흐스탄'
        },
        {
            value: 'QA',
            key: '카타르'
        },
        {
            value: 'KH',
            key: '캄보디아'
        },
        {
            value: 'CA',
            key: '캐나다'
        },
        {
            value: 'KE',
            key: '케냐'
        },
        {
            value: 'KY',
            key: '케이맨 제도'
        },
        {
            value: 'KM',
            key: '코모로'
        },
        {
            value: 'CR',
            key: '코스타리카'
        },
        {
            value: 'CC',
            key: '코코스 제도'
        },
        {
            value: 'CI',
            key: '코트디부아르'
        },
        {
            value: 'CO',
            key: '콜롬비아'
        },
        {
            value: 'CG',
            key: '콩고 공화국'
        },
        {
            value: 'CD',
            key: '콩고 민주 공화국'
        },
        {
            value: 'CU',
            key: '쿠바'
        },
        {
            value: 'KW',
            key: '쿠웨이트'
        },
        {
            value: 'CK',
            key: '쿡 제도'
        },
        {
            value: 'HR',
            key: '크로아티아'
        },
        {
            value: 'CX',
            key: '크리스마스 섬'
        },
        {
            value: 'KG',
            key: '키르기스스탄'
        },
        {
            value: 'KI',
            key: '키리바시'
        },
        {
            value: 'CY',
            key: '키프로스'
        },
        {
            value: 'TH',
            key: '타이'
        },
        {
            value: 'TJ',
            key: '타지키스탄'
        },
        {
            value: 'TZ',
            key: '탄자니아'
        },
        {
            value: 'TC',
            key: '터크스 케이커스 제도'
        },
        {
            value: 'TR',
            key: '터키'
        },
        {
            value: 'TG',
            key: '토고'
        },
        {
            value: 'TK',
            key: '토켈라우'
        },
        {
            value: 'TO',
            key: '통가'
        },
        {
            value: 'TM',
            key: '투르크메니스탄'
        },
        {
            value: 'TV',
            key: '투발루'
        },
        {
            value: 'TN',
            key: '튀니지'
        },
        {
            value: 'TT',
            key: '트리니다드 토바고'
        },
        {
            value: 'PA',
            key: '파나마'
        },
        {
            value: 'PY',
            key: '파라과이'
        },
        {
            value: 'PK',
            key: '파키스탄'
        },
        {
            value: 'PG',
            key: '파푸아 뉴기니'
        },
        {
            value: 'PW',
            key: '팔라우'
        },
        {
            value: 'PS',
            key: '팔레스타인'
        },
        {
            value: 'FO',
            key: '페로 제도'
        },
        {
            value: 'PE',
            key: '페루'
        },
        {
            value: 'PT',
            key: '포르투갈'
        },
        {
            value: 'FK',
            key: '포클랜드 제도'
        },
        {
            value: 'PL',
            key: '폴란드'
        },
        {
            value: 'PR',
            key: '푸에르토리코'
        },
        {
            value: 'FR',
            key: '프랑스'
        },
        {
            value: 'GF',
            key: '프랑스령 기아나'
        },
        {
            value: 'TF',
            key: '프랑스령 남부와 남극 지역'
        },
        {
            value: 'PF',
            key: '프랑스령 폴리네시아'
        },
        {
            value: 'FJ',
            key: '피지'
        },
        {
            value: 'FI',
            key: '핀란드'
        },
        {
            value: 'PH',
            key: '필리핀'
        },
        {
            value: 'PN',
            key: '핏케언 제도'
        },
        {
            value: 'HM',
            key: '허드 맥도널드 제도'
        },
        {
            value: 'HU',
            key: '헝가리'
        },
        {
            value: 'HK',
            key: '홍콩'
        }
     ];
    
    var returnCode;

    for(var i in data){
        if(data[i].value==code){
            returnCode = data[i].key;
            break;
        }
    }

    return returnCode;
}

function menuIconData() {
    var data = [
        {
            key: '1',
            value: 'ic ic-dashboard',
            name: '대시보드'
        },
        {
            key: '2',
            value: 'ic ic-device',
            name: '디바이스'
        },
        {
            key: '5',
            value: 'ic ic-energysettings',
            name: '에너지'
        },
        {
            key: '8',
            value: 'ic ic-operation',
            name: '운영'
        },
        {
            key: '14',
            value: 'ic ic-history',
            name: '분석'
        },
        {
            key: '18',
            value: 'ic ic-controlareasettings',
            name: '유지보수' 
        },
        {
            key: '23',
            value: 'ic ic-systemsettings',
            name: '시스템설정' 
        },
        {
            key: '90',
            value: 'ic ic-hmi',
            name: '샘플'
        }
    ];
    return data;
}


export default {
    industryData,
    industry,
    countryData,
    country,
    reasonData,
    reason,
    userRoleCode,
    weekendsData,
    menuIconData
};
