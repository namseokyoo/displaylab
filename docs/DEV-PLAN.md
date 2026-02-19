# Display Lab 개발 실행 계획서

> **버전**: v1.0
> **작성일**: 2026-02-20
> **작성자**: Fullstack Developer (튜링)
> **PRD 참조**: `projects/displaylab/docs/PRD.md` v1.1
> **상태**: CEO 검토 대기

---

## 1. 개요

### 1.1 목적
PRD v1.1(DEC-056) 기반 Display Lab MVP 개발 실행 계획. ISCV 코드 자산을 재활용하여 2~3주(12~14일) 내 MVP-A/B 단계별 배포를 목표로 한다.

### 1.2 전략 요약

| 항목 | 내용 |
|------|------|
| **기술 스택** | React + Vite + TypeScript + D3.js + Tailwind CSS |
| **MVP 분리** | MVP-A (색역+계산기, Day 1~6) → MVP-B (시야각, Day 7~12) |
| **코드 재활용** | ISCV에서 fork 방식 (Phase 2에서 공유 라이브러리 추출) |
| **정확도 검증** | Sharma 33쌍, CIE 15:2004, colour-science 교차검증 |
| **호스팅** | Vercel (기본 도메인, 추후 커스텀 도메인 결정) |

### 1.3 배포 마일스톤

```
Day 0: 프로젝트 초기화
Day 1: ISCV 코드 이관 + 프로젝트 셋업
Day 2-3: 색역 분석기 (Color Gamut Analyzer)
Day 4-5: 색과학 계산기 + SEO + 랜딩 페이지
Day 6: QA-A + MVP-A 배포
--- MVP-A 배포 ---
Day 7-9: 시야각 분석기 (Viewing Angle Analyzer)
Day 10-11: 시야각 QA + 정확도 검증 테스트 스위트
Day 12: MVP-B 배포
--- MVP-B 배포 ---
Day 13-14: 버퍼 (예비일)
```

---

## 2. Day 0: 프로젝트 초기화

> Fullstack Dev SKILL.md Day 0 Checklist 준수

**담당**: Fullstack Developer
**예상 소요**: 2~3시간

### 2.1 Vite + React + TS 프로젝트 생성

```bash
cd projects/displaylab
npm create vite@latest . -- --template react-ts
npm install
```

### 2.2 필수 의존성 설치

```bash
# 핵심 라이브러리
npm install d3 react-router-dom react-helmet-async

# 타입
npm install -D @types/d3

# 스타일링
npm install -D tailwindcss @tailwindcss/vite

# 테스트
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# 개발 도구
npm install -D eslint prettier eslint-plugin-react-hooks eslint-plugin-react-refresh
```

### 2.3 설정 파일

| 파일 | 설정 내용 |
|------|----------|
| `tsconfig.json` | strict: true, paths alias (@/) |
| `vite.config.ts` | Tailwind 플러그인, vitest 설정, path alias |
| `tailwind.config.ts` | content 경로, 커스텀 컬러 토큰 |
| `.eslintrc.cjs` | React hooks 규칙, TypeScript 규칙 |
| `.prettierrc` | singleQuote, trailingComma |
| `.gitignore` | node_modules, dist, .env*, .DS_Store |
| `.env.local` | VITE_GA4_ID (빈 값, 추후 DevOps 설정) |

### 2.4 React Router 설정

```typescript
// 라우트 구조
/                    → Home (랜딩 페이지)
/gamut-analyzer      → GamutAnalyzer (색역 분석기)
/color-calculator    → ColorCalculator (색과학 계산기)
/viewing-angle       → ViewingAngle (시야각 분석기) — MVP-B
```

### 2.5 프로젝트 구조 스캐폴딩

```
projects/displaylab/
├── docs/
│   ├── PRD.md
│   └── DEV-PLAN.md
├── src/
│   ├── components/
│   │   ├── viewing-angle/        # MVP-B
│   │   ├── gamut-analyzer/       # MVP-A
│   │   ├── color-calculator/     # MVP-A
│   │   └── common/               # 공통
│   ├── lib/
│   │   ├── cie.ts
│   │   ├── delta-e.ts
│   │   ├── gamut.ts
│   │   ├── viewing-angle.ts      # MVP-B
│   │   ├── cct.ts
│   │   ├── color-convert.ts
│   │   └── csv-parser.ts
│   ├── data/
│   │   ├── cie1931.ts
│   │   ├── cie1976.ts
│   │   ├── gamut-primaries.ts
│   │   ├── planckian-locus.ts
│   │   └── presets/
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── GamutAnalyzer.tsx
│   │   ├── ColorCalculator.tsx
│   │   └── ViewingAngle.tsx      # MVP-B
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

### 2.6 Day 0 체크리스트

```
[ ] .gitignore 설정 (.env*, node_modules, dist 등)
[ ] .env.local 파일 생성 + .gitignore 등록 확인
[ ] README.md 초안 작성 (프로젝트명, 기술 스택, 실행 방법)
[ ] TypeScript strict 모드 활성화 (tsconfig.json)
[ ] ESLint + Prettier 설정
[ ] package.json scripts 정리 (dev, build, lint, type-check, test)
[ ] Tailwind CSS 설정 + 기본 스타일 확인
[ ] D3.js 설치 및 import 테스트
[ ] React Router 라우팅 동작 확인
[ ] 빌드 성공 확인 (npm run build)
[ ] 린트 통과 확인 (npm run lint)
```

**완료 기준**: `npm run dev`로 빈 페이지 라우팅 동작, `npm run build` 성공

---

## 3. ISCV 코드 이관 계획

> ISCV 소스: `projects/spectrum-visualizer/app/src/`
> 전략: MVP에서는 코드 복사(fork) 방식. Phase 2에서 공유 라이브러리 추출 검토.

### 3.1 그대로 복사할 파일 (변경 최소)

| ISCV 원본 경로 | Display Lab 대상 경로 | 변경 사항 |
|---------------|---------------------|----------|
| `data/cie1931.ts` | `data/cie1931.ts` | `CIE1931_OBSERVER`, `SPECTRAL_LOCUS_XY`, `COLOR_GAMUTS` 그대로 사용. NTSC 색역 데이터 추가 |
| `types/spectrum.ts` | `types/index.ts` | 기존 타입 유지 + Display Lab 전용 타입 추가 (`GamutData`, `ViewingAngleData`, `DeltaEResult` 등) |
| `lib/chromaticity.ts` | `lib/cie.ts` | `xyzToXY`, `xyzToUV`, `xyToUV`, `uvToXY`, `isInGamut` 그대로 사용 |
| `lib/color-convert.ts` | `lib/color-convert.ts` | `xyzToRGB`, `rgbToHex`, `xyzToHex` 그대로 사용 |
| `lib/interpolate.ts` | `lib/interpolate.ts` (필요 시) | 스펙트럼 보간 유틸, 시야각 데이터 보간에 재활용 |

### 3.2 확장/수정이 필요한 파일

| ISCV 원본 | Display Lab 대상 | 수정 내용 |
|----------|-----------------|----------|
| `lib/file-parser.ts` | `lib/csv-parser.ts` | Sentry 의존성 제거. 시야각 CSV 포맷 지원 추가 (angle, luminance, cieX, cieY 4열). 스펙트럼 파싱 외에 범용 CSV 파싱 기능 확장 |
| `components/CIEDiagram.tsx` | `components/common/CIEDiagram.tsx` | ISCV 전용 기능(스펙트럼 리지, 드래그, 줌) 제거하고 순수 CIE 다이어그램 렌더링으로 단순화. 색역 오버레이 + 포인트 마커 중심으로 리팩토링. 커스텀 프라이머리 삼각형 렌더링 추가 |
| `lib/spectrum-to-xyz.ts` | `lib/cie.ts`에 통합 | `spectrumToXYZ` 함수는 Phase 2 SPD 분석에서 사용 예정. MVP에서는 `interpolateObserver`만 CCT 계산에 활용 |

### 3.3 신규 작성 파일

| 파일 | 모듈 | 설명 |
|------|------|------|
| `lib/delta-e.ts` | 색과학 계산기 | CIE76, CIE94, CIEDE2000 구현. Sharma 33쌍 검증 필수 |
| `lib/cct.ts` | 색과학 계산기 | McCamy/Robertson CCT 계산, Ohno Duv 계산 |
| `lib/gamut.ts` | 색역 분석기 | 색역 면적 계산 (Shoelace formula), 커버리지 % 계산, 다중 디스플레이 비교 |
| `lib/viewing-angle.ts` | 시야각 분석기 (MVP-B) | CSV 데이터 처리, 기준각(0도) 대비 색차 계산, 명암비 계산 |
| `data/cie1976.ts` | 공통 | CIE 1976 u'v' 변환 유틸 (cie1931 데이터 기반 변환 테이블) |
| `data/gamut-primaries.ts` | 색역 분석기 | sRGB, DCI-P3, BT.2020, Adobe RGB, NTSC 표준 좌표 (기존 `COLOR_GAMUTS` 확장) |
| `data/planckian-locus.ts` | 색과학 계산기 | Planckian locus 좌표 데이터 (1000K~25000K) |
| `data/presets/` | 공통 | 데모 데이터셋 (시야각 OLED/LCD CSV, 색역 샘플 JSON) |
| `components/common/CSVUploader.tsx` | 공통 | 드래그앤드롭 CSV 업로드 + 템플릿 다운로드 |
| `components/common/DataTable.tsx` | 공통 | 범용 데이터 테이블 (정렬, 페이지네이션) |
| `components/common/Layout.tsx` | 공통 | 네비게이션, 헤더, 푸터 레이아웃 |
| `components/gamut-analyzer/GamutDiagram.tsx` | 색역 분석기 | CIEDiagram 래핑 + 커스텀 프라이머리 삼각형 |
| `components/gamut-analyzer/PrimaryInput.tsx` | 색역 분석기 | R/G/B 좌표 입력 폼 |
| `components/gamut-analyzer/CoverageTable.tsx` | 색역 분석기 | 표준 색역 대비 커버리지 % 테이블 |
| `components/gamut-analyzer/ComparisonPanel.tsx` | 색역 분석기 | 최대 4개 디스플레이 비교 UI |
| `components/color-calculator/CoordinateConverter.tsx` | 색과학 계산기 | XYZ ↔ xyY 양방향 변환 UI |
| `components/color-calculator/CCTCalculator.tsx` | 색과학 계산기 | CCT + Duv 계산 UI |
| `components/color-calculator/DeltaECalculator.tsx` | 색과학 계산기 | ΔE 3종 계산 UI |
| `components/viewing-angle/PolarPlot.tsx` | 시야각 분석기 (MVP-B) | D3.js 극좌표 플롯 |
| `components/viewing-angle/ColorShiftTrack.tsx` | 시야각 분석기 (MVP-B) | CIE 다이어그램 위 색좌표 궤적 |
| `components/viewing-angle/DeltaEHeatmap.tsx` | 시야각 분석기 (MVP-B) | 각도별 색차 히트맵 |

### 3.4 ISCV 코드 이관 시 주의사항

1. **Sentry 의존성 제거**: ISCV의 `file-parser.ts`에 Sentry import 존재. Display Lab에서는 제거하고 콘솔 로깅으로 대체 (Phase 2에서 에러 모니터링 별도 설정)
2. **타입 확장**: ISCV의 `spectrum.ts` 타입에 Display Lab 전용 타입을 추가하되, 기존 ISCV 타입(`SpectrumPoint`, `XYZColor`, `CIE1931Coordinates` 등)은 그대로 유지
3. **CIEDiagram 단순화**: ISCV의 CIEDiagram은 2000줄 이상의 복잡한 컴포넌트(스펙트럼 리지, 줌, 드래그 등). Display Lab에서는 핵심 렌더링(색역 locus + 색역 삼각형 + 포인트 마커)만 추출하여 500줄 이내로 단순화
4. **COLOR_GAMUTS 확장**: 기존 4개(sRGB, DCI-P3, BT.2020, AdobeRGB)에 NTSC 추가

---

## 4. MVP-A 상세 실행 계획 (Day 1~6)

### 4.1 Day 1: 프로젝트 초기화 + ISCV 코드 이관

**담당**: Fullstack Developer
**예상 소요**: 6~8시간

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| Day 0 체크리스트 실행 | Vite+React+TS 셋업, Tailwind, ESLint, Prettier, Vitest | `npm run build` 성공 |
| ISCV 코드 복사 | `cie1931.ts`, `chromaticity.ts`, `color-convert.ts`, `interpolate.ts`, `types/spectrum.ts` 복사 | import 에러 없음 |
| CIEDiagram 단순화 | ISCV CIEDiagram에서 색역 locus + 삼각형 + D65 렌더링만 추출 | CIE 1931/1976 전환 동작 |
| 타입 정의 확장 | `GamutData`, `StandardGamut`, `ViewingAngleData`, `DeltaEResult` 등 | 타입 에러 없음 |
| csv-parser 작성 | ISCV file-parser 기반 + Sentry 제거 + 시야각 CSV 포맷 지원 | 단위 테스트 통과 |
| 레이아웃 컴포넌트 | `Layout.tsx` (네비게이션 + 푸터), React Router 연결 | 4페이지 라우팅 동작 |
| gamut-primaries 데이터 | sRGB, DCI-P3, BT.2020, Adobe RGB, NTSC 좌표 정의 | 데이터 import 성공 |
| README.md 초안 | 프로젝트명, 기술 스택, 실행 방법 | 파일 존재 |

### 4.2 Day 2-3: 색역 분석기 (Color Gamut Analyzer)

**담당**: Fullstack Developer
**예상 소요**: 12~14시간 (2일)

#### Day 2: 코어 기능

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `GamutDiagram.tsx` | CIEDiagram 래핑, 커스텀 프라이머리 삼각형 렌더링, 표준 색역 오버레이 ON/OFF 토글 | CIE 1931/1976 전환 + 색역 토글 동작 |
| `PrimaryInput.tsx` | R/G/B CIE xy 좌표 입력 폼, 실시간 유효성 검증, 표준 색역 프리셋 드롭다운 | 좌표 입력 → 다이어그램 반영 |
| `lib/gamut.ts` | Shoelace formula 면적 계산, 색역 커버리지 % 계산 (교집합/표준 면적 비율) | 단위 테스트 통과 (sRGB 100% 기준) |
| `CoverageTable.tsx` | 표준 색역 대비 커버리지 % 테이블, 자동 계산 | 면적/커버리지 값 표시 |

#### Day 3: 비교 기능 + 프리셋

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `ComparisonPanel.tsx` | 최대 4개 디스플레이 비교, 탭 또는 색상 구분 | 4개 삼각형 동시 렌더링 |
| CIE 1931/1976 듀얼 지원 | GamutDiagram에서 모드 전환 시 좌표계 변환 | 1931↔1976 전환 정상 동작 |
| 프리셋 데이터 | `presets/gamut-samples.json` (Galaxy S24, iPhone 15, OLED TV 등 샘플) | 프리셋 선택 → 자동 입력 |
| 반응형 레이아웃 | 모바일: 다이어그램 위, 입력 아래. 데스크탑: 좌측 다이어그램, 우측 입력 | 모바일/데스크탑 레이아웃 확인 |
| GamutAnalyzer 페이지 통합 | `pages/GamutAnalyzer.tsx`에서 전체 조립 | `/gamut-analyzer` 라우트 동작 |

### 4.3 Day 4-5: 색과학 계산기 + SEO + 랜딩

**담당**: Fullstack Developer
**예상 소요**: 12~14시간 (2일)

#### Day 4: 색과학 계산기

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `lib/delta-e.ts` | ΔE76 (CIELab 유클리드 거리), ΔE94, CIEDE2000 구현. XYZ→Lab 변환 포함 | Sharma 33쌍 테스트 통과 (소수점 4자리) |
| `lib/cct.ts` | McCamy's approximation CCT 계산, Robertson's method CCT, Duv 계산 | CIE 15:2004 표준 예제 일치 (±1K) |
| `CoordinateConverter.tsx` | XYZ ↔ xyY 양방향 실시간 변환, 입력 필드 3개 (X,Y,Z 또는 x,y,Y) | 값 변경 시 즉시 결과 반영 |
| `CCTCalculator.tsx` | CIE xy 입력 → CCT + Duv 출력, 결과 설명 (warm/neutral/cool 표시) | CCT 계산 동작 |
| `DeltaECalculator.tsx` | 두 색(Lab 또는 XYZ) 입력 → ΔE76/94/2000 동시 출력, 차이 해석 가이드 | 3종 ΔE 동시 표시 |

#### Day 5: SEO + 랜딩 + 페이지 통합

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `Home.tsx` 랜딩 페이지 | 서비스 소개, 3개 도구 카드, CTA, 프라이버시 배지 | 랜딩 디자인 완성 |
| SEO 메타태그 | `react-helmet-async` 설정, 각 페이지별 title/description/keywords | 각 페이지 고유 메타태그 |
| JSON-LD 구조화 데이터 | WebApplication 스키마, SoftwareApplication 스키마 | Google Rich Results Test 통과 |
| sitemap.xml | 정적 sitemap 생성 (public/sitemap.xml) | /sitemap.xml 접근 가능 |
| robots.txt | 기본 robots.txt 설정 | /robots.txt 접근 가능 |
| OG 이미지 | 1200x630 PNG, 브랜드 디자인 | SNS 공유 미리보기 표시 |
| ColorCalculator 페이지 통합 | `pages/ColorCalculator.tsx`에서 전체 조립 | `/color-calculator` 라우트 동작 |
| 전체 빌드 검증 | `npm run build`, `npm run lint`, `npm run type-check` | 모두 통과 |

### 4.4 Day 6: QA-A + MVP-A 배포

**담당**: QA Engineer (테스트) + DevOps (배포) + Fullstack Developer (버그 수정)
**예상 소요**: 6~8시간

| 작업 | 담당 | 완료 기준 |
|------|------|----------|
| 색역 분석기 기능 QA | QA Engineer | 프라이머리 입력, 표준 색역 토글, CIE 1931/1976 전환, 면적 계산, 비교 기능 |
| 색과학 계산기 기능 QA | QA Engineer | XYZ↔xyY, CCT, ΔE 3종 계산 정확도 확인 |
| 반응형 QA | QA Engineer | 모바일 (375px), 태블릿 (768px), 데스크탑 (1280px) |
| SEO 검증 | QA Engineer | 메타태그, 구조화 데이터, sitemap, robots.txt |
| 버그 수정 | Fullstack Developer | QA 발견 이슈 수정 |
| Vercel 프로젝트 생성 | DevOps | 프로젝트 생성, 환경변수 설정, 빌드 설정 |
| GA4 연동 | DevOps | GA4 측정 ID 설정, 이벤트 트래킹 코드 삽입 |
| MVP-A 배포 | DevOps | QA 승인 후 Vercel 배포 |
| 배포 URL 검증 | DevOps | Vercel 대시보드에서 실제 URL 확인 → PROJECTS.md 업데이트 요청 |

---

## 5. MVP-B 상세 실행 계획 (Day 7~12)

### 5.1 Day 7-9: 시야각 분석기 (Viewing Angle Analyzer)

**담당**: Fullstack Developer
**예상 소요**: 18~20시간 (3일)

#### Day 7: CSV 파싱 + 데이터 모델

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| CSV 템플릿 정의 | `angle,luminance,cieX,cieY` 4열 포맷, 헤더 포함 | 템플릿 CSV 파일 생성 |
| `lib/viewing-angle.ts` | CSV 파싱 (csv-parser 확장), 기준각(0도) 대비 ΔE*ab/ΔE2000 자동 계산, 명암비 계산 | 단위 테스트 통과 |
| `CSVUploader.tsx` 확장 | 시야각 CSV 포맷 검증, 템플릿 다운로드 버튼, 드래그앤드롭 | CSV 업로드 → 데이터 파싱 성공 |
| 프리셋 데이터 | `presets/viewing-angle-oled.csv`, `viewing-angle-lcd.csv` 샘플 | 프리셋 로드 동작 |

#### Day 8: 시각화 컴포넌트

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `PolarPlot.tsx` | D3.js 극좌표 플롯, 각도별 휘도 분포 시각화, 반응형 | 극좌표 차트 렌더링 |
| `ColorShiftTrack.tsx` | CIEDiagram 위에 각도별 색좌표 변화 궤적 표시, 색 그라데이션으로 각도 표현 | CIE 다이어그램에 궤적 표시 |
| `DeltaEHeatmap.tsx` | 각도 vs ΔE 히트맵/바차트, 임계값(JND) 기준선 표시, ΔE*ab와 ΔE2000 토글 | 히트맵 렌더링 |

#### Day 9: 페이지 통합 + 인터랙션

| 작업 | 상세 | 완료 기준 |
|------|------|----------|
| `ViewingAngle.tsx` 페이지 | 전체 조립: CSV 업로드 → 데이터 테이블 → 시각화 3종 | `/viewing-angle` 라우트 동작 |
| 데이터 테이블 | 파싱된 데이터 + 계산된 ΔE 값 테이블 표시, CSV export | 데이터 테이블 렌더링 |
| 반응형 레이아웃 | 모바일: 세로 스택. 데스크탑: 2열 그리드 | 모바일/데스크탑 레이아웃 |
| 프리셋 비교 | OLED vs LCD 프리셋 비교 기능 | 두 데이터셋 동시 표시 |
| 결과 이미지 다운로드 (P1) | SVG → PNG 변환 다운로드 | 다운로드 동작 |
| 빌드 검증 | `npm run build`, `npm run lint` | 모두 통과 |

### 5.2 Day 10-11: 시야각 QA + 정확도 검증

**담당**: QA Engineer (기능 QA) + Fullstack Developer (정확도 테스트)
**예상 소요**: 12~14시간 (2일)

#### Day 10: 정확도 검증 테스트 스위트

| 작업 | 담당 | 완료 기준 |
|------|------|----------|
| Sharma 33쌍 ΔE2000 테스트 | Fullstack Developer | 33쌍 모두 소수점 4자리 일치 |
| CIE XYZ↔xyY 검증 | Fullstack Developer | CIE 15:2004 표준 예제 소수점 6자리 일치 |
| CCT 검증 | Fullstack Developer | Ohno 2014 테스트 데이터 ±1K 이내 |
| 색역 면적 교차검증 | Fullstack Developer | colour-science(Python) 결과와 ±0.1% 이내 |
| CIE 1931↔1976 변환 검증 | Fullstack Developer | CIE 표준 데이터 소수점 6자리 일치 |
| 총 테스트 케이스 ≥ 50 | Fullstack Developer | `npm run test` 전체 통과 |

#### Day 11: 기능 QA + 크로스 브라우저

| 작업 | 담당 | 완료 기준 |
|------|------|----------|
| 시야각 분석기 기능 QA | QA Engineer | CSV 업로드, 극좌표 플롯, 색좌표 궤적, ΔE 히트맵, 프리셋 |
| 전체 기능 통합 QA | QA Engineer | 3개 모듈 전체 + 랜딩 페이지 |
| 크로스 브라우저 테스트 | QA Engineer | Chrome, Firefox, Safari (최소 3개) |
| 반응형 테스트 | QA Engineer | 모바일 (375px), 태블릿 (768px), 데스크탑 (1280px, 1920px) |
| 성능 테스트 | QA Engineer | Lighthouse 80점 이상 |
| 버그 수정 | Fullstack Developer | QA 발견 이슈 수정 |

### 5.3 Day 12: MVP-B 배포

**담당**: DevOps (배포) + QA Engineer (배포 후 검증)
**예상 소요**: 4~6시간

| 작업 | 담당 | 완료 기준 |
|------|------|----------|
| MVP-B 배포 | DevOps | QA 승인 후 Vercel 배포 |
| 배포 후 스모크 테스트 | QA Engineer | 3개 모듈 전체 동작 확인 |
| GA4 이벤트 확인 | DevOps | 실시간 보고서에서 이벤트 확인 |
| 배포 URL 검증 | DevOps | 실제 URL 접속 확인 → CEO 보고 |
| 문서 업데이트 | Company Historian | PROJECTS.md, HISTORY.md 갱신 |

---

## 6. 정확도 검증 테스트 계획

### 6.1 테스트 데이터셋 목록

| 데이터셋 | 출처 | 테스트 수 | 대상 함수 |
|---------|------|----------|----------|
| Sharma et al. (2005) 33쌍 | 논문 Table 1 | 33 | `deltaE2000()` |
| CIE 15:2004 XYZ↔xyY 예제 | CIE 표준 | 5+ | `xyzToXY()`, `xyzToUV()` |
| CIE 15:2004 CCT 예제 | CIE 표준 | 5+ | `calculateCCT()` |
| Ohno (2014) CCT+Duv 예제 | 논문 | 5+ | `calculateCCT()` |
| CIE 1931↔1976 변환 예제 | CIE 표준 | 5+ | `xyToUV()`, `uvToXY()` |
| 색역 면적 검증 (sRGB, DCI-P3) | colour-science | 5+ | `calculateGamutArea()` |
| ΔE76/ΔE94 검증 | 교과서 예제 | 5+ | `deltaE76()`, `deltaE94()` |
| **합계** | | **≥ 50** | |

### 6.2 각 계산 함수별 검증 기준

| 함수 | 검증 기준 | 허용 오차 |
|------|----------|----------|
| `deltaE2000(lab1, lab2)` | Sharma 33쌍 일치 | 소수점 4자리 (±0.0001) |
| `deltaE76(lab1, lab2)` | 교과서 예제 일치 | 소수점 4자리 |
| `deltaE94(lab1, lab2)` | 교과서 예제 일치 | 소수점 4자리 |
| `xyzToXY(xyz)` | CIE 15:2004 일치 | 소수점 6자리 (±0.000001) |
| `xyzToUV(xyz)` | CIE 15:2004 일치 | 소수점 6자리 |
| `xyToUV(xy)` | CIE 표준 일치 | 소수점 6자리 |
| `uvToXY(uv)` | CIE 표준 일치 (역변환 일치) | 소수점 6자리 |
| `calculateCCT(x, y)` | CIE 15:2004 + Ohno 2014 일치 | ±1K |
| `calculateDuv(x, y)` | Ohno 2014 일치 | ±0.001 |
| `calculateGamutArea(primaries)` | colour-science 교차검증 | ±0.1% |
| `xyzToLab(xyz, wp)` | CIE 15:2004 일치 | 소수점 4자리 |

### 6.3 colour-science (Python) 교차검증 방법

```python
# verification/verify_calculations.py
import colour
import json

# 1. ΔE2000 검증
lab1 = [50.0, 2.6772, -79.7751]
lab2 = [50.0, 0.0, -82.7485]
result = colour.delta_E(lab1, lab2, method='CIE 2000')
# Display Lab 결과와 비교

# 2. 색역 면적 검증
srgb_primaries = [[0.64, 0.33], [0.30, 0.60], [0.15, 0.06]]
area = colour.geometry.polygon_area(srgb_primaries)
# Display Lab 결과와 비교

# 3. CCT 검증
xy = [0.3127, 0.3290]  # D65
cct = colour.xy_to_CCT(xy)
# Display Lab 결과와 비교

# 결과 JSON 출력
results = {
    "deltaE2000": [...],
    "gamut_areas": {...},
    "cct_values": {...}
}
with open('verification_results.json', 'w') as f:
    json.dump(results, f, indent=2)
```

### 6.4 CI 테스트 설정

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    coverage: {
      include: ['src/lib/**'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

테스트 파일 구조:
```
src/lib/__tests__/
├── delta-e.test.ts          # Sharma 33쌍 + 교과서 예제
├── cct.test.ts              # CIE/Ohno 표준 예제
├── cie.test.ts              # XYZ↔xy↔u'v' 변환 검증
├── gamut.test.ts            # 색역 면적/커버리지 검증
├── color-convert.test.ts    # XYZ↔Lab, XYZ↔RGB 검증
├── csv-parser.test.ts       # CSV 파싱 검증
└── viewing-angle.test.ts    # 시야각 데이터 처리 검증
```

---

## 7. 공통 컴포넌트 설계

### 7.1 CIEDiagram.tsx

ISCV CIEDiagram(~2000줄)에서 핵심만 추출하여 범용 CIE 다이어그램 컴포넌트로 단순화.

```typescript
interface CIEDiagramProps {
  mode: 'CIE1931' | 'CIE1976';
  // 표준 색역 오버레이
  enabledGamuts: GamutType[];
  // 커스텀 프라이머리 (색역 분석기에서 사용)
  customPrimaries?: {
    name: string;
    primaries: { red: {x: number; y: number}; green: {x: number; y: number}; blue: {x: number; y: number} };
    color: string;
  }[];
  // 포인트 마커 (시야각 궤적 등)
  markers?: { x: number; y: number; color: string; label?: string }[];
  // 사이즈
  width?: number;
  height?: number;
  // 테마
  theme?: 'dark' | 'light';
}
```

**ISCV 대비 제거 항목**: 스펙트럼 리지, 드래그 인터랙션, 줌/팬, 축 범위 모달, 스냅샷
**ISCV 대비 추가 항목**: 다중 커스텀 프라이머리 렌더링, 마커 시스템

### 7.2 CSVUploader.tsx

```typescript
interface CSVUploaderProps {
  onDataLoaded: (data: Record<string, number>[]) => void;
  templateUrl?: string;       // 템플릿 다운로드 URL
  acceptedFormats?: string;   // '.csv,.txt'
  maxRows?: number;           // Free tier 제한 (1000행)
  columns?: {                 // 예상 열 정의
    name: string;
    type: 'number' | 'string';
    required: boolean;
  }[];
  presets?: {                 // 프리셋 데이터 목록
    name: string;
    description: string;
    url: string;
  }[];
}
```

### 7.3 DataTable.tsx

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    format?: (value: unknown) => string;
    sortable?: boolean;
  }[];
  exportable?: boolean;       // CSV export 버튼
  maxRows?: number;           // 표시 최대 행
}
```

### 7.4 Layout.tsx

```typescript
// 네비게이션 + 푸터 공통 레이아웃
// 네비게이션: Logo + 도구 메뉴 (Gamut Analyzer, Color Calculator, Viewing Angle)
// 푸터: SidequestLab 크레딧, 프라이버시 배지, GitHub 링크
// 반응형: 모바일에서 햄버거 메뉴
```

---

## 8. SEO 실행 계획

### 8.1 메타태그 설정 (react-helmet-async)

| 페이지 | title | description |
|--------|-------|-------------|
| `/` | Display Lab - Professional Display Analysis Tools | Free web-based tools for display engineers: viewing angle analysis, color gamut comparison, and color science calculations. |
| `/gamut-analyzer` | Color Gamut Analyzer - Display Lab | Compare display color gamuts against sRGB, DCI-P3, BT.2020 standards. Calculate coverage percentage with CIE 1931 and 1976 diagrams. |
| `/color-calculator` | Color Science Calculator - Display Lab | Quick CIE color calculations: XYZ to xyY conversion, CCT & Duv, Delta E (CIE76, CIE94, CIEDE2000). |
| `/viewing-angle` | Viewing Angle Analyzer - Display Lab | Upload goniometer CSV data to visualize display viewing angle performance: polar plots, color shift tracking, and Delta E heatmaps. |

### 8.2 구조화 데이터 (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Display Lab",
  "description": "Professional display analysis tools for engineers and researchers",
  "url": "[PROJECTS.md 공식 URL 참조]",
  "applicationCategory": "ScienceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "SidequestLab"
  }
}
```

### 8.3 sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>[BASE_URL]/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>[BASE_URL]/gamut-analyzer</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>[BASE_URL]/color-calculator</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>[BASE_URL]/viewing-angle</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

> BASE_URL은 배포 후 DevOps가 확인한 실제 URL을 사용 (PROJECTS.md SSOT 원칙)

### 8.4 robots.txt

```
User-agent: *
Allow: /

Sitemap: [BASE_URL]/sitemap.xml
```

### 8.5 OG 이미지

- 크기: 1200 x 630 px
- 포맷: PNG
- 위치: `public/og-image.png`
- 디자인: CIE 다이어그램 배경 + "Display Lab" 타이틀 + 서브타이틀

---

## 9. 배포 계획

### 9.1 Vercel 프로젝트 생성

**담당**: DevOps Engineer

| 항목 | 설정 |
|------|------|
| 프로젝트명 | displaylab |
| 프레임워크 | Vite |
| 빌드 커맨드 | `npm run build` |
| 출력 디렉토리 | `dist` |
| 루트 디렉토리 | `projects/displaylab` (모노레포인 경우) |
| Node 버전 | 20.x |

### 9.2 환경변수 설정

| 환경변수 | 용도 | 담당 |
|---------|------|------|
| `VITE_GA4_ID` | Google Analytics 4 측정 ID | DevOps |

### 9.3 GA4 연동

```typescript
// src/lib/analytics.ts
export const GA_TRACKING_ID = import.meta.env.VITE_GA4_ID;

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 추적할 이벤트:
// - tool_select: 도구 선택 (gamut/calculator/viewing-angle)
// - csv_upload: CSV 업로드
// - preset_load: 프리셋 데이터 로드
// - calculation_run: 계산 실행
// - diagram_mode_switch: CIE 모드 전환
// - gamut_toggle: 색역 토글
// - result_export: 결과 다운로드
```

### 9.4 도메인

- MVP 단계: Vercel 기본 도메인 사용
- 추후: `displaylab.app` / `displaylab.tools` / `displaylab.io` 중 결정 (CEO 의사결정 필요)

---

## 10. QA 체크리스트

### 10.1 MVP-A QA 체크리스트

```
## 색역 분석기 (Color Gamut Analyzer)
- [ ] 커스텀 프라이머리 R/G/B 좌표 입력 → 다이어그램 반영
- [ ] 좌표 유효성 검증 (0~1 범위)
- [ ] 표준 색역 오버레이 ON/OFF 토글 (sRGB, DCI-P3, BT.2020, Adobe RGB, NTSC)
- [ ] CIE 1931 xy ↔ CIE 1976 u'v' 모드 전환
- [ ] 색역 면적 % 자동 계산
- [ ] 커버리지 테이블 표시
- [ ] 최대 4개 디스플레이 비교 기능
- [ ] 프리셋 데이터 로드

## 색과학 계산기 (Color Science Calculator)
- [ ] XYZ → xyY 변환 (실시간)
- [ ] xyY → XYZ 변환 (실시간)
- [ ] CCT + Duv 계산
- [ ] ΔE76 계산
- [ ] ΔE94 계산
- [ ] CIEDE2000 계산
- [ ] 입력값 변경 시 즉시 결과 반영

## 공통
- [ ] 랜딩 페이지 렌더링
- [ ] 네비게이션 동작 (4페이지)
- [ ] 빌드 성공 (npm run build)
- [ ] 린트 통과 (npm run lint)
- [ ] 타입 체크 통과 (npm run type-check)
- [ ] SEO 메타태그 확인
- [ ] 구조화 데이터 확인
- [ ] sitemap.xml 접근 가능
- [ ] robots.txt 접근 가능
```

### 10.2 MVP-B QA 체크리스트

```
## 시야각 분석기 (Viewing Angle Analyzer)
- [ ] CSV 업로드 (드래그앤드롭)
- [ ] CSV 포맷 검증 + 에러 메시지
- [ ] 템플릿 CSV 다운로드
- [ ] 극좌표 플롯 렌더링
- [ ] CIE 다이어그램 색좌표 궤적
- [ ] ΔE 히트맵 렌더링
- [ ] ΔE*ab / ΔE2000 토글
- [ ] 데이터 테이블 표시
- [ ] OLED/LCD 프리셋 데이터 로드
- [ ] 결과 이미지 다운로드

## 정확도 검증
- [ ] Sharma 33쌍 ΔE2000 테스트 통과
- [ ] CIE XYZ↔xyY 표준 예제 통과
- [ ] CCT ±1K 이내
- [ ] 색역 면적 ±0.1% 이내
- [ ] CIE 1931↔1976 변환 검증 통과
- [ ] 전체 테스트 50개+ 통과

## 크로스 브라우저
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)

## 반응형
- [ ] 모바일 375px
- [ ] 태블릿 768px
- [ ] 데스크탑 1280px
- [ ] 데스크탑 1920px

## 성능
- [ ] Lighthouse Performance ≥ 80
- [ ] LCP < 3초
- [ ] D3.js 차트 렌더링 < 1초
```

---

## 11. 리스크 및 대응

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|-------|----------|----------|
| **ISCV CIEDiagram 단순화 난이도** | 중 | 중 | 2000줄 → 500줄 추출 시 예상보다 시간 소요 가능. Day 1에 프로토타입 완성 못 하면 Day 2로 이월, Day 3 색역 기능 병합 |
| **ΔE2000 구현 정확도** | 높 | 중 | 알고리즘 복잡도 높음 (가중 함수, 회전 항). Sharma 33쌍 테스트를 TDD 방식으로 구현. 실패 시 colour-science 참조 구현 |
| **D3.js 극좌표 플롯 성능** | 중 | 낮 | 대용량 CSV(10,000행+) 시 렌더링 지연 가능. 데이터 샘플링(매 n번째 포인트), requestAnimationFrame 활용 |
| **고니오미터 CSV 포맷 파편화** | 중 | 높 | 제조사별 CSV 포맷 상이. MVP에서는 자체 표준 포맷 + 변환 가이드 제공. Phase 2에서 주요 포맷 자동 감지 |
| **일정 지연 (14일 초과)** | 중 | 중 | Day 13-14 버퍼 2일 확보. P1 기능(명암비 커브, 데이터 export) 우선 삭제하여 P0만 배포 |
| **Vercel 빌드 이슈** | 낮 | 낮 | 모노레포 루트 디렉토리 설정, Node 버전 불일치 등. DevOps가 사전 빌드 테스트 |

---

## 12. 담당자 및 역할

### 12.1 역할 분담

| 담당자 | 역할 | 주요 작업 |
|--------|------|----------|
| **Fullstack Developer (튜링)** | 개발 전체 | ISCV 코드 이관, 3개 모듈 개발, 정확도 테스트 작성, 버그 수정 |
| **QA Engineer (해밀턴)** | 품질 검증 | MVP-A/B 기능 QA, 크로스 브라우저 테스트, 반응형 테스트, 성능 테스트 |
| **DevOps Engineer (토발즈)** | 배포/인프라 | Vercel 프로젝트 생성, 환경변수 설정, GA4 연동, MVP-A/B 배포, URL 검증 |
| **CEO Agent (노이만)** | 조율/의사결정 | 일정 조율, 의사결정, QA 결과 검토, 배포 승인 |
| **Company Historian (헤로도토스)** | 문서 기록 | PROJECTS.md 갱신, DECISIONS.md 등록, 세션 로그 작성 |

### 12.2 작업 흐름

```
Fullstack Dev 개발 완료
    ↓
QA Engineer 독립 검증
    ↓ [통과]             ↓ [실패]
DevOps 배포          Fullstack Dev 버그 수정
    ↓                     ↓
QA 배포 후 검증      QA 재검증
    ↓
CEO 보고
    ↓
Historian 문서 갱신
```

### 12.3 일별 예상 소요 요약

| 일차 | 주요 작업 | Fullstack Dev | QA | DevOps |
|------|----------|:---:|:---:|:---:|
| Day 0 | 프로젝트 초기화 | 2-3h | - | - |
| Day 1 | ISCV 코드 이관 + 셋업 | 6-8h | - | - |
| Day 2 | 색역 분석기 코어 | 6-7h | - | - |
| Day 3 | 색역 분석기 비교/프리셋 | 6-7h | - | - |
| Day 4 | 색과학 계산기 | 6-7h | - | - |
| Day 5 | SEO + 랜딩 + 통합 | 6-7h | - | - |
| Day 6 | MVP-A QA + 배포 | 3-4h | 4-5h | 3-4h |
| Day 7 | 시야각 CSV + 데이터 | 6-7h | - | - |
| Day 8 | 시야각 시각화 | 6-7h | - | - |
| Day 9 | 시야각 통합 + 인터랙션 | 6-7h | - | - |
| Day 10 | 정확도 테스트 스위트 | 6-7h | - | - |
| Day 11 | QA + 크로스 브라우저 | 3-4h | 6-7h | - |
| Day 12 | MVP-B 배포 | 1-2h | 2-3h | 3-4h |
| **합계** | | **~70h** | **~15h** | **~10h** |

---

## 13. 승인

| 역할 | 담당 | 승인 | 날짜 |
|------|------|------|------|
| 계획서 작성 | Fullstack Developer (튜링) | ✅ | 2026-02-20 |
| CEO 검토 | CEO Agent (노이만) | ⏳ | - |
| 회장님 승인 | NAMSEOK | ⏳ | - |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-02-20 | 초안 작성 | Fullstack Developer (튜링) |
