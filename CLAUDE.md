# ai 농사 - AI 농업 액션 코치

## 프로젝트 개요

스마트폰 기반 AI 농업 보조 앱. 딸기 재배 농부(김지훈, 논산시 부적면)를 위한 일일 액션 가이드, 병해충 AI 진단, 영농 일지, 성장 보고서 제공.

## 기술 스택

- **프레임워크**: React 18 + TypeScript (strict mode)
- **빌드**: Vite 5
- **스타일**: Tailwind CSS 3
- **아이콘**: lucide-react 0.441
- **상태 관리**: React useState (로컬), Zustand (글로벌 — 추후)
- **폰트**: Pretendard (CDN)

## 프로젝트 구조

```
frontend/
  src/
    App.tsx               # 라우팅 (탭 기반, 5개 화면)
    main.tsx              # 엔트리포인트
    index.css             # 전역 스타일
    screens/
      Dashboard.tsx       # 홈: 날씨, 병해충 위험도, 오늘의 할 일
      Diagnosis.tsx       # AI 병해충 진단 (이미지 업로드 + 결과)
      FarmLog.tsx         # 영농 일지 타임라인
      Report.tsx          # 성장 보고서 (재배 일수, 생육 단계, 차트)
      Settings.tsx        # 농장 설정 (폼, 알림 토글)
    components/
      BottomNav.tsx       # 하단 탭 네비게이션 (5탭)
    types/
      index.ts            # 공유 TypeScript 인터페이스
    utils/
      mockData.ts         # 목업 데이터 (실제 API 연동 전 사용)
```

## 개발 명령어

```bash
cd frontend
npm install       # 의존성 설치
npm run dev       # 개발 서버 (localhost:3000)
npm run build     # 프로덕션 빌드
npm run typecheck # TypeScript 타입 검사만
```

## 5개 화면 요약

| 화면 | 탭 ID | 파일 | 주요 기능 |
|------|-------|------|----------|
| 홈 (대시보드) | `home` | Dashboard.tsx | 날씨, 병해충 위험도, 할 일 체크리스트 |
| AI 진단 | `diagnosis` | Diagnosis.tsx | 사진 업로드 → AI 분석 → 결과 카드 |
| 영농 일지 | `log` | FarmLog.tsx | 타임라인, 필터, 사진+태그 |
| 성장 보고서 | `report` | Report.tsx | 재배 일수, 생육 단계, 주간 차트, AI 코멘트 |
| 농장 설정 | `settings` | Settings.tsx | 농장 정보 폼, 알림 토글, 저장 |

## 디자인 시스템

```
색상:
  Primary Green:  #4CAF50  (bg-green-500/600)
  Warning Orange: #FF9800  (bg-orange-500)
  Background:     #F5F5F5  (bg-gray-50)
  Card:           #FFFFFF  (bg-white)
  Text:           #1A1A1A  (text-gray-800)
  Sub-text:       #757575  (text-gray-500)

컴포넌트 패턴:
  헤더:  bg-green-600 text-white px-4 pt-10 pb-5
  카드:  bg-white rounded-xl/2xl shadow-sm p-4
  버튼:  bg-green-500 text-white rounded-xl py-3 (주요)
  토스트: fixed top-4 left-1/2 -translate-x-1/2 rounded-full

모바일 기준: 390×844 (iPhone 14 Pro) — max-w-[430px]
```

## 타입 정의 (types/index.ts)

- `DailyTask` — 할 일 항목 (우선순위, 카테고리, 완료 여부)
- `WeatherData` — 날씨 정보
- `DiagnosisResult` — AI 진단 결과
- `FarmLogEntry` — 영농 일지 항목
- `FarmSettings` — 농장 설정
- `PestRisk` — 병해충 위험도

## 목업 데이터 (utils/mockData.ts)

실제 API 미연동 상태. 모든 화면이 이 파일의 상수를 사용.

- `mockWeather`, `mockTasks`, `mockPestRisk` — Dashboard
- `mockDiagnosisResults` — Diagnosis
- `mockFarmLog` — FarmLog, Report
- `mockFarmSettings` — Report, Settings

## 스킬 (.claude/skills/)

| 스킬 | 트리거 | 기능 |
|------|--------|------|
| `build-react-screen` | "화면 만들기", "스크린 추가" | 새 화면 TypeScript 컴포넌트 생성 |
| `pencil-design` | "디자인 만들기", "UI 디자인" | Pencil MCP로 .pen 디자인 파일 작성 |
| `create-skill` | "make a skill", "스킬 만들기" | 새 SKILL.md 스킬 파일 생성 |

## 주의 사항

- Pencil MCP 사용 시 데스크탑 앱이 먼저 실행되어 있어야 함
- 모든 UI 텍스트는 한국어
- 외부 차트 라이브러리 사용 금지 — 순수 CSS/Tailwind로 구현
- `npx tsc --noEmit` 반드시 0 오류 유지
