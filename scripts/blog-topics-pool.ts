// 인톡 파트너스 블로그 주제 풀 (보험 전문)
// 카테고리: 생명보험, 손해보험, 자동차보험, 건강보험, 보험 상식, 보험 트렌드, 보험 설계

export interface BlogTopic {
  prompt: string;
  keywords: string[];
  category: string;
}

export const BLOG_TOPICS_POOL: BlogTopic[] = [
  // === 생명보험 (15개) ===
  {
    prompt: "종신보험 vs 정기보험, 30대가 꼭 알아야 할 차이점과 선택 기준",
    keywords: ["종신보험", "정기보험", "생명보험", "보험 비교", "30대 보험"],
    category: "생명보험"
  },
  {
    prompt: "변액보험 수익률의 진실. 10년 유지했을 때 실제 수익은?",
    keywords: ["변액보험", "수익률", "투자형 보험", "보험 수익"],
    category: "생명보험"
  },
  {
    prompt: "종신보험 해지 시 손해 최소화하는 방법. 감액완납 vs 해약 비교",
    keywords: ["종신보험 해지", "감액완납", "해약환급금", "보험 해지"],
    category: "생명보험"
  },
  {
    prompt: "저축성 보험과 적금, 어디에 돈을 넣는 게 유리할까?",
    keywords: ["저축성 보험", "적금 비교", "보험 저축", "재테크"],
    category: "생명보험"
  },
  {
    prompt: "유병자도 가입 가능한 간편심사 보험 총정리. 조건과 보장 비교",
    keywords: ["간편심사 보험", "유병자 보험", "보험 가입 조건"],
    category: "생명보험"
  },
  {
    prompt: "보험금 청구 시 필요한 서류와 절차. 빠르게 받는 팁",
    keywords: ["보험금 청구", "보험금 서류", "보험금 절차", "보험금 수령"],
    category: "생명보험"
  },
  {
    prompt: "사망보험금 수익자 지정, 잘못하면 세금 폭탄? 상속세 절세 전략",
    keywords: ["사망보험금", "수익자 지정", "상속세", "보험 세금"],
    category: "생명보험"
  },
  {
    prompt: "CI보험(중대질병보험) 가입 전 꼭 확인해야 할 보장 범위",
    keywords: ["CI보험", "중대질병보험", "진단금", "보험 보장"],
    category: "생명보험"
  },
  {
    prompt: "연금보험 vs 연금저축보험, 세제 혜택과 수령 방식 차이",
    keywords: ["연금보험", "연금저축보험", "세제 혜택", "노후 준비"],
    category: "생명보험"
  },
  {
    prompt: "보험 가입 시 고지의무 위반하면 어떻게 될까? 실제 사례 분석",
    keywords: ["고지의무", "보험 가입", "고지의무 위반", "보험 사례"],
    category: "생명보험"
  },
  {
    prompt: "어린이 보험 가입 가이드. 태아보험부터 성인 전환까지",
    keywords: ["어린이 보험", "태아보험", "자녀 보험", "보험 가입"],
    category: "생명보험"
  },
  {
    prompt: "보험료 납입 면제 특약의 함정. 조건을 꼼꼼히 확인하세요",
    keywords: ["납입면제", "보험 특약", "보험료 면제", "보험 조건"],
    category: "생명보험"
  },
  {
    prompt: "50대 보험 리모델링 전략. 불필요한 보험 정리하고 필수 보장 강화",
    keywords: ["보험 리모델링", "50대 보험", "보험 정리", "보험 재설계"],
    category: "생명보험"
  },
  {
    prompt: "보험 설계사가 절대 말해주지 않는 보험 가입 꿀팁 5가지",
    keywords: ["보험 꿀팁", "보험 설계사", "보험 가입 팁"],
    category: "생명보험"
  },
  {
    prompt: "무해지환급형 보험의 장단점. 보험료는 싸지만 주의할 점",
    keywords: ["무해지환급형", "보험료", "보험 장단점", "해약환급금"],
    category: "생명보험"
  },

  // === 손해보험 (15개) ===
  {
    prompt: "실손보험 4세대 vs 3세대 차이점. 지금 갈아타야 할까?",
    keywords: ["실손보험", "4세대 실손", "실손보험 비교", "의료비 보험"],
    category: "손해보험"
  },
  {
    prompt: "화재보험 가입 전 체크리스트. 아파트, 주택, 상가별 보장 차이",
    keywords: ["화재보험", "주택 보험", "아파트 보험", "재산 보험"],
    category: "손해보험"
  },
  {
    prompt: "배상책임보험 총정리. 일상생활, 영업, 전문직별 가입 가이드",
    keywords: ["배상책임보험", "일상배상", "영업배상", "전문직 보험"],
    category: "손해보험"
  },
  {
    prompt: "여행자 보험 비교 가이드. 해외여행 시 꼭 필요한 보장 항목",
    keywords: ["여행자 보험", "해외여행 보험", "여행 보장", "보험 비교"],
    category: "손해보험"
  },
  {
    prompt: "펫 보험 가입 시 주의사항. 반려동물 보험 보장 범위와 면책 조항",
    keywords: ["펫 보험", "반려동물 보험", "펫 보장", "동물 보험"],
    category: "손해보험"
  },
  {
    prompt: "운전자 보험 vs 자동차 보험, 둘 다 필요할까? 보장 중복 확인",
    keywords: ["운전자 보험", "자동차 보험", "보장 중복", "운전자 보장"],
    category: "손해보험"
  },
  {
    prompt: "풍수해 보험 가입 방법. 태풍, 홍수 피해 대비 필수 보험",
    keywords: ["풍수해 보험", "자연재해 보험", "태풍 보험", "홍수 보험"],
    category: "손해보험"
  },
  {
    prompt: "상해보험 vs 질병보험, 보장 범위 차이와 가입 우선순위",
    keywords: ["상해보험", "질병보험", "보험 비교", "보장 범위"],
    category: "손해보험"
  },
  {
    prompt: "재물보험 가입 시 보험가액 산정 방법. 과보험과 부보험의 위험",
    keywords: ["재물보험", "보험가액", "과보험", "부보험"],
    category: "손해보험"
  },
  {
    prompt: "배달 라이더 전용 보험 비교. 산재보험 vs 민간보험",
    keywords: ["배달 라이더 보험", "라이더 산재", "배달 보험", "플랫폼 노동"],
    category: "손해보험"
  },
  {
    prompt: "골프 보험 홀인원 보장, 진짜 받을 수 있을까? 조건 총정리",
    keywords: ["골프 보험", "홀인원 보험", "레저 보험"],
    category: "손해보험"
  },
  {
    prompt: "전세보증보험 가입 필수인 이유. 전세 사기 예방 가이드",
    keywords: ["전세보증보험", "전세 사기", "전세 보험", "임대 보험"],
    category: "손해보험"
  },
  {
    prompt: "자영업자 필수 보험 5가지. 사업장 리스크 관리 가이드",
    keywords: ["자영업자 보험", "사업장 보험", "영업배상", "사업 리스크"],
    category: "손해보험"
  },
  {
    prompt: "보험 분쟁 해결 방법. 금감원 분쟁조정 절차와 신청 방법",
    keywords: ["보험 분쟁", "금감원", "분쟁조정", "보험 민원"],
    category: "손해보험"
  },
  {
    prompt: "해외 거주자 보험 가이드. 유학생, 주재원이 알아야 할 보험 상식",
    keywords: ["해외 거주자 보험", "유학생 보험", "주재원 보험"],
    category: "손해보험"
  },

  // === 자동차보험 (15개) ===
  {
    prompt: "자동차보험 할인 특약 총정리. 보험료 최대 30% 절약하는 방법",
    keywords: ["자동차보험 할인", "보험 특약", "보험료 절약", "자동차보험"],
    category: "자동차보험"
  },
  {
    prompt: "자동차보험 갱신 시 비교 견적 받는 법. 다이렉트 vs 대면 비교",
    keywords: ["자동차보험 갱신", "비교 견적", "다이렉트 보험", "보험 갱신"],
    category: "자동차보험"
  },
  {
    prompt: "교통사고 시 보험 처리 절차. 과실 비율 산정과 합의 가이드",
    keywords: ["교통사고 보험", "과실 비율", "보험 합의", "사고 처리"],
    category: "자동차보험"
  },
  {
    prompt: "전기차 보험료가 비싼 이유. 전기차 보험 가입 시 알아야 할 것",
    keywords: ["전기차 보험", "전기차 보험료", "EV 보험", "자동차보험"],
    category: "자동차보험"
  },
  {
    prompt: "자동차보험 자기부담금 설정 전략. 적정 금액은?",
    keywords: ["자기부담금", "자동차보험", "보험료 절약", "보험 설정"],
    category: "자동차보험"
  },
  {
    prompt: "블랙박스 할인, 마일리지 특약 등 자동차보험 숨은 할인 찾기",
    keywords: ["블랙박스 할인", "마일리지 특약", "자동차보험 할인"],
    category: "자동차보험"
  },
  {
    prompt: "렌트카 사고 시 보험 처리. 자차보험 vs 렌터카 보험 차이",
    keywords: ["렌트카 보험", "렌터카 사고", "자차보험", "렌트 보험"],
    category: "자동차보험"
  },
  {
    prompt: "초보 운전자 자동차보험 가입 팁. 할증 피하는 방법",
    keywords: ["초보 운전자", "자동차보험", "보험 할증", "보험 가입"],
    category: "자동차보험"
  },
  {
    prompt: "자동차보험 보상 범위 총정리. 대인, 대물, 자손, 무보험 해설",
    keywords: ["보상 범위", "대인배상", "대물배상", "자손사고"],
    category: "자동차보험"
  },
  {
    prompt: "이륜차(오토바이) 보험 가입 방법과 보장 내용 비교",
    keywords: ["이륜차 보험", "오토바이 보험", "바이크 보험"],
    category: "자동차보험"
  },
  {
    prompt: "자동차보험 등급 체계 이해하기. 할인할증 등급제 완벽 해설",
    keywords: ["보험 등급", "할인할증", "등급제", "자동차보험"],
    category: "자동차보험"
  },
  {
    prompt: "자동차 침수 피해 보험 처리. 자연재해 보상 받는 법",
    keywords: ["침수 보험", "자연재해 보상", "자동차 침수", "보험 처리"],
    category: "자동차보험"
  },
  {
    prompt: "법인 차량 보험 가입 가이드. 개인 vs 법인 보험료 차이",
    keywords: ["법인 차량 보험", "법인 보험", "업무용 차량", "보험료 비교"],
    category: "자동차보험"
  },
  {
    prompt: "자동차보험 온라인 가입 vs 설계사 가입, 어디가 더 유리할까?",
    keywords: ["온라인 보험", "다이렉트 보험", "설계사 보험", "보험 가입"],
    category: "자동차보험"
  },
  {
    prompt: "자율주행차 시대의 자동차보험. 어떻게 변할까?",
    keywords: ["자율주행차 보험", "미래 보험", "자동차보험 변화", "보험 트렌드"],
    category: "자동차보험"
  },

  // === 건강보험 & 의료비 (15개) ===
  {
    prompt: "암보험 가입 전 필수 체크리스트. 진단금, 수술금, 입원비 비교",
    keywords: ["암보험", "암 진단금", "암보험 비교", "암보험 가입"],
    category: "건강보험"
  },
  {
    prompt: "치아보험 가입 시기와 보장 범위. 임플란트, 크라운 보장 비교",
    keywords: ["치아보험", "임플란트 보험", "크라운 보장", "치과 보험"],
    category: "건강보험"
  },
  {
    prompt: "실비보험 자기부담금 체계 변경 정리. 비급여 본인부담 이해하기",
    keywords: ["실비보험", "자기부담금", "비급여", "실손보험 변경"],
    category: "건강보험"
  },
  {
    prompt: "3대 질병 보험(암, 뇌, 심장) 가입 우선순위와 적정 보장 금액",
    keywords: ["3대 질병", "암보험", "뇌혈관 보험", "심장질환 보험"],
    category: "건강보험"
  },
  {
    prompt: "간병보험 vs 치매보험 차이점. 노후 간병비 대비 전략",
    keywords: ["간병보험", "치매보험", "노후 간병", "장기요양"],
    category: "건강보험"
  },
  {
    prompt: "국민건강보험 본인부담 상한제 활용법. 의료비 환급받는 방법",
    keywords: ["본인부담 상한제", "의료비 환급", "국민건강보험", "의료비 절약"],
    category: "건강보험"
  },
  {
    prompt: "수술비 보험 특약 비교. 1~5종 수술 분류와 보장 금액 차이",
    keywords: ["수술비 보험", "수술 특약", "보험 보장", "수술 분류"],
    category: "건강보험"
  },
  {
    prompt: "정신건강 보험 보장 범위. 우울증, 불안장애 치료비 보장 가능할까?",
    keywords: ["정신건강 보험", "우울증 보험", "정신과 보장", "심리치료"],
    category: "건강보험"
  },
  {
    prompt: "여성 전용 보험 비교. 유방암, 자궁질환 특약 선택 가이드",
    keywords: ["여성 보험", "유방암 보험", "자궁질환", "여성 특약"],
    category: "건강보험"
  },
  {
    prompt: "입원비 보험 일당 얼마가 적정할까? 입원비 특약 설계 가이드",
    keywords: ["입원비 보험", "입원 일당", "입원 특약", "보험 설계"],
    category: "건강보험"
  },
  {
    prompt: "건강검진 결과에 따른 보험 가입 전략. 혈압, 혈당, 간수치별 대응",
    keywords: ["건강검진 보험", "보험 가입 조건", "혈압 보험", "건강검진"],
    category: "건강보험"
  },
  {
    prompt: "해외 의료비 보장 보험 비교. 해외 체류 시 의료비 대비",
    keywords: ["해외 의료비", "해외 보험", "의료비 보장", "글로벌 보험"],
    category: "건강보험"
  },
  {
    prompt: "통원치료비 특약의 중요성. 외래 진료비 부담 줄이는 보험 설계",
    keywords: ["통원치료비", "외래 진료", "통원 특약", "보험 설계"],
    category: "건강보험"
  },
  {
    prompt: "보험과 건강관리의 연결. 건강증진형 보험 할인 제도 총정리",
    keywords: ["건강증진형 보험", "건강관리 할인", "보험 할인", "헬스케어"],
    category: "건강보험"
  },
  {
    prompt: "백내장, 녹내장 수술 보험 보장 가능할까? 안과 질환 보험 가이드",
    keywords: ["백내장 보험", "녹내장 보험", "안과 보험", "눈 수술 보장"],
    category: "건강보험"
  },

  // === 보험 상식 & 절세 (15개) ===
  {
    prompt: "보험료 세액공제 받는 법. 연말정산 때 보험으로 절세하기",
    keywords: ["보험료 세액공제", "연말정산", "보험 절세", "세금 환급"],
    category: "보험 상식"
  },
  {
    prompt: "보험 약관 읽는 법. 꼭 확인해야 할 핵심 조항 5가지",
    keywords: ["보험 약관", "보험 조항", "보험 상식", "약관 해석"],
    category: "보험 상식"
  },
  {
    prompt: "보험 중복 가입 확인 방법. 내보험다보기 서비스 활용법",
    keywords: ["보험 중복", "내보험다보기", "보험 확인", "보험 정리"],
    category: "보험 상식"
  },
  {
    prompt: "보험 해지 전 꼭 알아야 할 5가지. 해약환급금과 대안",
    keywords: ["보험 해지", "해약환급금", "보험 대안", "보험 정리"],
    category: "보험 상식"
  },
  {
    prompt: "보장분석 서비스 활용법. 내 보험 포트폴리오 점검하기",
    keywords: ["보장분석", "보험 포트폴리오", "보험 점검", "보험 리뷰"],
    category: "보험 상식"
  },
  {
    prompt: "보험 갱신형 vs 비갱신형 차이. 장기적으로 어떤 게 유리할까?",
    keywords: ["갱신형", "비갱신형", "보험 비교", "보험료 변동"],
    category: "보험 상식"
  },
  {
    prompt: "보험 면책기간이란? 가입 후 바로 보장받을 수 없는 이유",
    keywords: ["면책기간", "보험 면책", "보험 보장 시작", "보험 상식"],
    category: "보험 상식"
  },
  {
    prompt: "보험 담보 vs 특약 차이. 주계약과 특약의 관계 이해하기",
    keywords: ["보험 담보", "보험 특약", "주계약", "보험 구조"],
    category: "보험 상식"
  },
  {
    prompt: "보험 민원 접수 방법. 보험사와 분쟁 시 대처 가이드",
    keywords: ["보험 민원", "보험 분쟁", "금감원 민원", "보험 대처"],
    category: "보험 상식"
  },
  {
    prompt: "보험금 지급 거절 사유 TOP 5. 거절당했을 때 대응 방법",
    keywords: ["보험금 거절", "보험금 지급", "보험 거절 사유", "보험 대응"],
    category: "보험 상식"
  },
  {
    prompt: "보험 승환계약이란? 기존 보험 해지 후 신규 가입의 위험성",
    keywords: ["승환계약", "보험 갈아타기", "보험 해지", "보험 주의"],
    category: "보험 상식"
  },
  {
    prompt: "보험 수혜자(수익자) 변경 방법과 주의사항. 이혼, 재혼 시 대처",
    keywords: ["보험 수익자", "수혜자 변경", "이혼 보험", "보험 변경"],
    category: "보험 상식"
  },
  {
    prompt: "실효된 보험 부활시키는 방법. 보험 실효와 부활 절차",
    keywords: ["보험 실효", "보험 부활", "보험 복원", "보험 절차"],
    category: "보험 상식"
  },
  {
    prompt: "보험 청약 철회와 품질보증 해지 차이. 가입 후 취소하는 법",
    keywords: ["청약 철회", "품질보증 해지", "보험 취소", "보험 철회"],
    category: "보험 상식"
  },
  {
    prompt: "보험과 세금의 관계. 보험금에 세금이 붙는 경우와 비과세 조건",
    keywords: ["보험 세금", "보험금 비과세", "보험 과세", "절세"],
    category: "보험 상식"
  },

  // === 보험 트렌드 & 디지털 (10개) ===
  {
    prompt: "인슈어테크 트렌드 2026. AI가 바꾸는 보험 산업의 미래",
    keywords: ["인슈어테크", "보험 AI", "보험 트렌드", "디지털 보험"],
    category: "보험 트렌드"
  },
  {
    prompt: "디지털 보험 vs 전통 보험. 온라인 가입의 장단점 솔직 비교",
    keywords: ["디지털 보험", "온라인 보험", "보험 가입", "보험 비교"],
    category: "보험 트렌드"
  },
  {
    prompt: "MZ세대 보험 가입 트렌드. 미니보험과 구독형 보험의 부상",
    keywords: ["MZ세대 보험", "미니보험", "구독형 보험", "보험 트렌드"],
    category: "보험 트렌드"
  },
  {
    prompt: "ESG와 보험. 환경·사회·거버넌스가 보험 상품에 미치는 영향",
    keywords: ["ESG 보험", "친환경 보험", "사회적 책임", "보험 변화"],
    category: "보험 트렌드"
  },
  {
    prompt: "빅데이터 기반 맞춤형 보험료 산정. 개인별 위험률 적용 시대",
    keywords: ["빅데이터 보험", "맞춤형 보험", "보험료 산정", "위험률"],
    category: "보험 트렌드"
  },
  {
    prompt: "블록체인과 보험 청구 자동화. 스마트 계약의 보험 적용 사례",
    keywords: ["블록체인 보험", "스마트 계약", "보험 자동화", "보험 혁신"],
    category: "보험 트렌드"
  },
  {
    prompt: "해외 보험 시장 동향. 미국, 일본, 유럽의 보험 트렌드 비교",
    keywords: ["해외 보험", "글로벌 보험", "보험 시장", "보험 동향"],
    category: "보험 트렌드"
  },
  {
    prompt: "건강 데이터 연동 보험. 웨어러블 기기와 보험료 할인 제도",
    keywords: ["웨어러블 보험", "건강 데이터", "보험 할인", "헬스케어 보험"],
    category: "보험 트렌드"
  },
  {
    prompt: "보험업법 개정 핵심 정리. 소비자에게 달라지는 점",
    keywords: ["보험업법", "법 개정", "소비자 보호", "보험 규제"],
    category: "보험 트렌드"
  },
  {
    prompt: "임베디드 보험이란? 구매 시점에 자동 가입되는 보험의 확산",
    keywords: ["임베디드 보험", "자동 가입", "보험 혁신", "보험 트렌드"],
    category: "보험 트렌드"
  },

  // === 보험 설계 & 라이프 스테이지 (15개) ===
  {
    prompt: "신혼부부 보험 설계 가이드. 결혼 후 꼭 정비해야 할 보험",
    keywords: ["신혼부부 보험", "결혼 보험", "보험 설계", "부부 보험"],
    category: "보험 설계"
  },
  {
    prompt: "1인 가구 필수 보험 3가지. 최소 비용으로 핵심 보장 확보",
    keywords: ["1인 가구 보험", "싱글 보험", "필수 보험", "보험 추천"],
    category: "보험 설계"
  },
  {
    prompt: "맞벌이 부부의 보험 설계 전략. 소득 비율에 따른 보장 배분",
    keywords: ["맞벌이 보험", "부부 보험", "보험 설계", "소득 보장"],
    category: "보험 설계"
  },
  {
    prompt: "프리랜서·자영업자 보험 설계. 4대 보험 없이 스스로 보장 만들기",
    keywords: ["프리랜서 보험", "자영업자 보험", "소득 보장", "보험 설계"],
    category: "보험 설계"
  },
  {
    prompt: "은퇴 전 보험 포트폴리오 재정비. 60대를 위한 보험 정리 가이드",
    keywords: ["은퇴 보험", "60대 보험", "보험 정리", "노후 보장"],
    category: "보험 설계"
  },
  {
    prompt: "월 보험료 얼마가 적정할까? 소득 대비 보험료 황금 비율",
    keywords: ["보험료 적정", "보험료 비율", "보험 예산", "보험 설계"],
    category: "보험 설계"
  },
  {
    prompt: "사회초년생 보험 가입 우선순위. 월 5만원으로 시작하는 보험",
    keywords: ["사회초년생 보험", "20대 보험", "보험 시작", "보험 추천"],
    category: "보험 설계"
  },
  {
    prompt: "아이 출산 전후 필요한 보험 총정리. 태아보험부터 산모 보장까지",
    keywords: ["출산 보험", "태아보험", "산모 보험", "육아 보험"],
    category: "보험 설계"
  },
  {
    prompt: "40대 보험 재점검 체크리스트. 가족 보장과 은퇴 준비 동시에",
    keywords: ["40대 보험", "보험 재점검", "가족 보장", "은퇴 준비"],
    category: "보험 설계"
  },
  {
    prompt: "보험 포트폴리오 구성 원칙. 3-3-3 보험 설계 프레임워크",
    keywords: ["보험 포트폴리오", "보험 설계", "보험 원칙", "보험 프레임"],
    category: "보험 설계"
  },
  {
    prompt: "부모님 보험 가입 가이드. 70대 부모를 위한 현실적 보험 선택",
    keywords: ["부모님 보험", "70대 보험", "실버 보험", "부모 보장"],
    category: "보험 설계"
  },
  {
    prompt: "고소득자를 위한 보험 설계. 절세와 자산 보호 동시에",
    keywords: ["고소득자 보험", "절세 보험", "자산 보호", "보험 설계"],
    category: "보험 설계"
  },
  {
    prompt: "직장인 단체보험 활용법. 회사 보험으로 개인 보험 절약하기",
    keywords: ["단체보험", "직장인 보험", "회사 보험", "보험 절약"],
    category: "보험 설계"
  },
  {
    prompt: "보험 리모델링 실전 사례. 월 40만원에서 25만원으로 줄인 비결",
    keywords: ["보험 리모델링", "보험료 절약", "보험 정리", "보험 사례"],
    category: "보험 설계"
  },
  {
    prompt: "다자녀 가정 보험 설계. 자녀가 많을수록 효율적인 보험 전략",
    keywords: ["다자녀 보험", "자녀 보험", "가족 보험", "보험 전략"],
    category: "보험 설계"
  },
];

// Helper functions
export function getRandomTopics(count: number): BlogTopic[] {
  const shuffled = [...BLOG_TOPICS_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getTopicsByCategory(category: string, count?: number): BlogTopic[] {
  const filtered = BLOG_TOPICS_POOL.filter(topic => topic.category === category);
  if (!count) return filtered;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(BLOG_TOPICS_POOL.map(topic => topic.category)));
}

/**
 * 카테고리 균형 맞춘 랜덤 토픽 선택
 * 7개 카테고리에서 골고루 선택
 */
export function getWeightedRandomTopics(
  totalCount: number,
  excludePrompts: string[] = []
): BlogTopic[] {
  const categories = getAllCategories();

  // Filter out excluded prompts
  const availableTopics = BLOG_TOPICS_POOL.filter(
    topic => !excludePrompts.includes(topic.prompt)
  );

  const selectedTopics: BlogTopic[] = [];
  const perCategory = Math.max(1, Math.floor(totalCount / categories.length));
  let remaining = totalCount;

  // 각 카테고리에서 균등하게 선택
  for (const category of categories) {
    if (remaining <= 0) break;
    const categoryTopics = availableTopics.filter(t => t.category === category);
    const count = Math.min(perCategory, remaining, categoryTopics.length);
    selectedTopics.push(...getRandomFromArray(categoryTopics, count));
    remaining -= count;
  }

  // 남은 수만큼 전체에서 추가 선택
  if (remaining > 0) {
    const alreadySelected = new Set(selectedTopics.map(t => t.prompt));
    const leftover = availableTopics.filter(t => !alreadySelected.has(t.prompt));
    selectedTopics.push(...getRandomFromArray(leftover, remaining));
  }

  // Shuffle to avoid predictable order
  return selectedTopics.sort(() => Math.random() - 0.5);
}

// Helper function to get random items from array
function getRandomFromArray<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}
