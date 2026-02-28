# 법인 계좌개설 서류 판정 시스템 (Corporate Account Opening System)

본 프로젝트는 미래에셋증권 영업점 직원이 **법인/단체 고객의 계좌개설 시 필요한 서류를 정확하고 일관되게 안내할 수 있도록 지원하는 사내 룰 기반 판정 시스템**입니다. 직원 간 안내 편차를 줄이고, 복잡한 예외 상황(신설법인, 고위험국가, 다단계 지배구조 등)에서의 리스크를 사전에 차단하기 위해 개발되었습니다.

---

## 🏗 시스템 아키텍처

본 시스템은 서버리스 환경(Vercel) 배포를 위해 Next.js 풀스택(App Router + API Routes) 기반으로 구축되었습니다.

- **Frontend**: Next.js App Router, Tailwind CSS, React
- **Backend (API)**: Next.js API Routes (TypeScript)
- **Engine**: Rule Engine (상태 무상태 구조, JSON 기반 룰셋 평가)
- **Deployment**: Vercel (Root Directory: `frontend`)

> **[참고]** 최초 설계는 Python(FastAPI) + SQLite로 진행되었으나, Vercel 서버리스 환경 배포를 위해 백엔드 핵심 엔진을 TypeScript 및 Next.js API 라우트로 이관하였습니다. 원본 Python 코드는 `backend/` 폴더에 보존되어 있습니다.

---

## 🎯 핵심 기능

1. **다단계 룰 엔진 (Rule Engine)**
   - 하드코딩된 로직을 지양하고, DB 형태의 **JSON 조건식(Conditions)** 평가 기반으로 작동합니다.
   - `case_classifier`: 14가지 케이스 코드(C01~C14)와 태그 도출 (ex. `NEW_CORP`, `HIGH_RISK`)
   - `rule_engine`: 우선순위 기반으로 조건을 평가하여 필수/조건부 서류 도출 및 상태(차단/에스컬레이션) 판정
   - `document_resolver`: 대체 가능 서류 그룹(예: 주주명부 or 사원명부) 제공

2. **직원용 5-Step 판정 위자드 (Wizard UI)**
   - 사용자 친화적인 멀티 스텝 폼을 통해 고객 정보를 입력받습니다.
   - 판정 결과 화면에서 명확한 **상태 뱃지 (접수 차단 / 보완 필요 / 승인 대상 등)** 와 요구 서류를 렌더링합니다.

3. **관리자 대시보드 (Admin Dashboard)**
   - 45종의 마스터 서류 유형, 14종의 케이스 유형, 그리고 26개의 활성화된 룰 목록을 직관적으로 조회할 수 있습니다.

---

## 🛠 폴더 구조

```text
/
├── frontend/               # Next.js 애플리케이션 (배포 기준 폴더)
│   ├── src/app/
│   │   ├── page.tsx        # 메인 랜딩 페이지
│   │   ├── determination/  # 5-Step 판정 위자드 화면
│   │   ├── admin/          # 관리자 대시보드 화면
│   │   └── api/            # Next.js 백엔드 API Routes (/api/determine 등)
│   ├── src/lib/engine/     # TypeScript로 포팅된 핵심 룰 엔진 코어
│   └── globals.css         # UI 스타일 시트 (상세 테마/CI 지정)
├── backend/                # [Legacy] Python FastAPI 원본 소스
└── corp_account.md         # 프로젝트 초기 요구사항 명세서
```

---

## 🚀 로컬 실행 방법

이 프로젝트는 `frontend` 폴더를 루트로 하여 구동됩니다.

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. 패키지 설치
npm install

# 3. 로컬 개발 서버 실행 (localhost:3000)
npm run dev
```

브라우저에서 `http://localhost:3000` 에 접속하여 5-Step 판정 로직과 사이트 렌더링을 테스트하실 수 있습니다.

---

## ☁️ Vercel 배포 가이드

본 프로젝트는 Vercel에 최적화되어 있습니다. 아래 설정에 유의하여 배포를 진행하세요.

1. **Vercel 대시보드** 접속 -> `Add New Project`
2. 본 GitHub Repository(`corp_account_docs`) Import 클릭
3. **⭐ [중요] Configure Project (설정 화면)**:
   - **Root Directory**: 반드시 `frontend` 로 변경 후 Save
   - **Framework Preset**: `Next.js` (자동 선택됨)
   - 별도의 Environment Variables(환경변수) 설정은 현재 버전에서 요구되지 않습니다.
4. **Deploy** 버튼 클릭

---

## 📊 주요 업무 처리 시나리오 (예시)

- **C01 (일반 법인 내점)**: 가장 표준적인 법인 계좌개설 로직. 대표자가 직접 방문하며 필수 8종 서류만을 간소화하여 요구합니다.
- **E01 (폐업/휴업 법인)**: 나이스(NICE) 기업정보나 홈택스 등에서 폐업으로 확인된 경우, 즉시 `BLOCKED (접수 차단)` 판정을 내리고 사유를 안내합니다.
- **E05 (실제소유자 불명)**: 다단계 지배구조 등으로 실제소유자를 특정할 수 없는 경우, 지배구조도 및 사실상 지배자 소명자료를 추가 요구하며 `ESCALATION_REQUIRED (본부 승인 필요)` 상태로 전환합니다.

---

### 디자인 시스템
미래에셋증권 CI 가이드에 맞추어 주조색(Navy `#003DA5`, Orange `#FF6B00`)을 기반으로 금융권에 적합한 프리미엄 다크 테마 UI를 채택하였습니다.
