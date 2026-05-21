---
name: create-skill
description: This skill should be used when you need to create a new Claude Code skill, when no existing skill matches the task, or when the user asks to "make a skill", "create a skill for X", "add a skill". Creates properly structured SKILL.md files with correct frontmatter and content.
---

# Create Skill (Meta-Skill)

새로운 스킬을 만들어야 할 때 이 스킬을 사용합니다. `$ARGUMENTS`에 스킬 이름과 목적을 적습니다.

## 스킬 생성 단계

1. **스킬 분류 결정**
   - 사용자 호출 가능: `disable-model-invocation: false` (기본값)
   - Claude만 자동 호출: `user-invocable: false`
   - 사용자만 호출: `disable-model-invocation: true`

2. **디렉토리 생성**: `.claude/skills/<skill-name>/`

3. **SKILL.md 구조**:
```yaml
---
name: <kebab-case-name>
description: This skill should be used when... [구체적인 트리거 조건]
---

# <스킬 이름>

## 목적
[이 스킬이 하는 일]

## 사용 시점
[언제 이 스킬을 호출해야 하는가]

## 실행 단계
1. [단계 1]
2. [단계 2]
3. [단계 3]

## 성공 기준
- [ ] [확인 항목 1]
- [ ] [확인 항목 2]
```

4. **description 필드 작성 팁**:
   - 구체적인 한국어 트리거 문구 포함
   - 예: `"make a skill"`, `"create component"`, `"AI 진단 기능"` 등

5. **검증**: 스킬 생성 후 `/create-skill`로 테스트 호출

## 예시 - React 컴포넌트 스킬

```markdown
---
name: new-component
description: React 컴포넌트를 만들어야 할 때 사용. "create component", "새 컴포넌트", "화면 추가" 트리거.
---
Create React component: $ARGUMENTS
1. TypeScript + Tailwind CSS 사용
2. 한국어 텍스트
3. src/components/ 또는 src/screens/에 저장
```
