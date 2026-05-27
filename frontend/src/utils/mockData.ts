import { DailyTask, WeatherData, DiagnosisResult, FarmLogEntry, FarmSettings, PestRisk } from '../types';

export const mockWeather: WeatherData = {
  temperature: 24,
  humidity: 72,
  condition: 'cloudy',
  conditionText: '구름 많음',
  windSpeed: 3.2,
  location: '논산시 부적면',
  date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }),
};

export const mockTasks: DailyTask[] = [
  {
    id: '1',
    title: '하우스 환기 실시',
    description: '오전 10시~12시 사이 환기창 개방. 내부 온도 22-25°C 유지 목표',
    priority: 'high',
    isCompleted: false,
    category: 'ventilation',
    timeEstimate: '30분',
  },
  {
    id: '2',
    title: '점적 관수 1회',
    description: '오늘 구름 많음으로 증산 감소. 표준 관수량의 70%로 조정 권장',
    priority: 'high',
    isCompleted: false,
    category: 'watering',
    timeEstimate: '15분',
  },
  {
    id: '3',
    title: '잿빛곰팡이 예방 점검',
    description: '습도 72% — 발병 주의 구간. 하단 잎 제거 및 통풍 확인 필수',
    priority: 'medium',
    isCompleted: false,
    category: 'inspection',
    timeEstimate: '45분',
  },
  {
    id: '4',
    title: '비료 EC 측정',
    description: '개화기 EC 1.5~2.0 dS/m 권장. 현재 생육 단계 맞춤 점검',
    priority: 'low',
    isCompleted: false,
    category: 'inspection',
    timeEstimate: '10분',
  },
];

export const mockPestRisk: PestRisk = {
  level: 3,
  description: '주의',
  mainThreat: '잿빛곰팡이병',
  preventionTip: '습도 70% 이상 지속 시 예방 약제 살포 권장',
};

export const mockDiagnosisResults: DiagnosisResult[] = [
  {
    id: 'd1',
    imageUrl: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=300&fit=crop',
    diseaseName: '잿빛곰팡이병 (Botrytis cinerea)',
    confidence: 94,
    severity: 'medium',
    description: '잎과 과실에 회색 곰팡이가 발생. 고습도 환경에서 급속 확산 위험이 있습니다.',
    treatment: '이환된 부위 즉시 제거 후 소각. 환기 강화로 습도 65% 이하 유지.',
    pesticide: '스위치 수화제 (사이프로디닐+플루디옥소닐)',
    concentration: '2,000배 희석',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'd2',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    diseaseName: '건강한 상태',
    confidence: 97,
    severity: 'low',
    description: '잎색과 생육 상태가 정상입니다. 지속적인 관리를 유지하세요.',
    treatment: '정기 점검 유지. 예방적 방제 일정 준수.',
    pesticide: '해당 없음',
    concentration: '-',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const mockFarmLog: FarmLogEntry[] = [
  {
    id: 'l1',
    imageUrl: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&h=300&fit=crop',
    cropStage: 'flowering',
    cropStageText: '개화기',
    weather: '맑음',
    temperature: 23,
    humidity: 65,
    notes: 'AI 진단 실시 — 잿빛곰팡이 초기 증상 발견. 예방 약제 살포 완료.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    diagnosisId: 'd1',
  },
  {
    id: 'l2',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    cropStage: 'flowering',
    cropStageText: '개화기',
    weather: '구름 많음',
    temperature: 21,
    humidity: 70,
    notes: '3화방 개화 확인. 착과율 양호. 지속 모니터링.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'l3',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop',
    cropStage: 'fruiting',
    cropStageText: '착과기',
    weather: '맑음',
    temperature: 25,
    humidity: 60,
    notes: '1화방 착과 진행 중. 기형과 5% 수준. 정상 범위.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

export const mockFarmSettings: FarmSettings = {
  farmerName: '김지훈',
  province: '충청남도',
  district: '논산시',
  cropTypes: ['strawberry', 'tomato'],
  cropVariety: '설향',
  plantingDate: '2024-09-15',
  greenhouseArea: 1000,
};

export const cropStageLabel: Record<string, string> = {
  seedling: '육묘기',
  vegetative: '영양생장기',
  flowering: '개화기',
  fruiting: '착과기',
  harvest: '수확기',
};
