---
name: build-react-screen
description: This skill should be used when building a React screen or component for ai-nongsa app. Triggers on "화면 만들기", "스크린 추가", "build screen", "create screen". Follows the project's TypeScript + Tailwind CSS conventions.
---

# ai-nongsa React Screen Builder

## 프로젝트 컨벤션

- **언어**: TypeScript (strict mode)
- **스타일**: Tailwind CSS (커스텀 컬러: green-500=#4CAF50, orange-500=#FF9800)
- **아이콘**: lucide-react
- **상태**: React useState/useContext (Zustand for global)
- **모든 텍스트**: 한국어
- **더미 데이터**: 김지훈 농부, 논산시 부적면, 설향 딸기

## 화면 생성 단계

1. `src/screens/<ScreenName>.tsx` 파일 생성
2. 컴포넌트 구조:
```tsx
import React from 'react';
// lucide-react imports
// local imports

interface Props {}

const ScreenName: React.FC<Props> = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Content */}
    </div>
  );
};

export default ScreenName;
```

3. **공통 디자인 패턴**:
   - 상단 헤더: `bg-green-500 text-white py-4 px-4`
   - 카드: `bg-white rounded-2xl shadow-sm p-4 mb-3`
   - 버튼 (주요): `bg-green-500 text-white rounded-full py-3 px-6`
   - 버튼 (위험): `bg-orange-500 text-white rounded-full py-2 px-4`
   - 터치 타겟: 최소 48px height

4. **바텀 탭바**: App.tsx의 BottomNav 컴포넌트 사용

## 성공 기준

- [ ] TypeScript 오류 없음 (`npx tsc --noEmit`)
- [ ] 모바일 뷰 (max-w-sm mx-auto) 적용
- [ ] 한국어 텍스트 사용
- [ ] lucide-react 아이콘 사용
