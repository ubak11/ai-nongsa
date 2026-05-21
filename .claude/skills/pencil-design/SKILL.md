---
name: pencil-design
description: This skill should be used when designing UI screens with Pencil MCP, creating .pen design files, or when the user asks to "디자인 만들기", "UI 디자인", "pencil로 화면". Provides workflow for ai-nongsa app design.
---

# Pencil MCP Design Workflow for ai-nongsa

## 사전 조건

Pencil 데스크탑 앱이 실행 중이어야 합니다.

## 디자인 워크플로우

1. **에디터 상태 확인**:
```
mcp__pencil__get_editor_state(include_schema: true)
```

2. **캔버스 여유 공간 찾기**:
```
mcp__pencil__find_empty_space_on_canvas()
```

3. **화면 디자인 배치**:
- 프레임 크기: 390x844 (iPhone 14 Pro)
- 간격: 50px between frames

4. **ai-nongsa 컬러 시스템**:
   - Primary: #4CAF50 (Nature Green)
   - Warning: #FF9800 (Alert Orange)
   - Background: #F5F5F5
   - Text: #1A1A1A
   - Sub-text: #757575

5. **한국어 텍스트 사용** - 모든 레이블, 버튼, 플레이스홀더

6. **스크린샷 검증**:
```
mcp__pencil__get_screenshot()
```

## ai-nongsa 5개 화면 명세

1. **대시보드** - 오늘의 할 일 체크리스트, 날씨 요약, 병해충 위험도
2. **AI 진단** - 카메라 업로드, 진단 결과 카드
3. **영농 일지** - 타임라인 뷰, 사진+태그
4. **성장 보고서** - 차트, 예상 수확일
5. **농장 설정** - 위치, 작물, 정식일 입력폼
