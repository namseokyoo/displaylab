# PRD: Display Lab Phase 2 - 고급 기능 확장

> **문서 버전**: v1.0
> **작성일**: 2026-02-20
> **작성자**: CEO Agent (노이만)
> **상태**: ✅ 회장님 승인 완료

---

## 1. 개요

### 1.1 Phase 2 배경
Display Lab MVP(Phase 1)가 성공적으로 완료되었습니다. 3개 모듈(Gamut Analyzer, Color Calculator, Viewing Angle Analyzer), 171개 테스트, 프로덕션 배포가 완료된 상태에서, Phase 2는 UX 고도화, 기능 확장, 플랫폼 통합, 수익화 기반 마련을 목표로 합니다.

### 1.2 MVP 성과 요약
| 항목 | 달성 내용 |
|------|----------|
| 모듈 | Gamut Analyzer, Color Calculator, Viewing Angle Analyzer (3개) |
| 테스트 | 171개 테스트 통과 (정확도 검증 포함) |
| 배포 | Vercel 프로덕션 배포 완료 |
| 정확도 | Sharma 33쌍 ΔE2000, CIE 표준, colour-science 교차검증 통과 |

### 1.3 Phase 2 목표
| 목표 | 설명 |
|------|------|
| UX 고도화 | 테마 전환, 사용자 설정 저장, 데이터 공유 링크 |
| 기능 확장 | Spectrum Visualizer 편입, Universal Color Space Converter, HDR Analyzer |
| 플랫폼 통합 | i18n (영어/한글), Panel Technology Comparator |
| 수익화 기반 | 카카오 애드핏 광고 삽입, API 제공 (장기) |

### 1.4 Phase 2 구조
| 서브페이즈 | 성격 | 항목 수 | 예상 기간 |
|-----------|------|---------|----------|
| **Phase 2-A** | 높은 임팩트, 빠른 구현 | 6개 | 2-3주 |
| **Phase 2-B** | 전략적 가치 | 5개 | 3-4주 |
| **Phase 2-C** | 장기 비전 | 3개 | 4-6주 |
| **총 예상** | | **14개** | **약 2-3개월** |

---

## 2. Phase 2-A: 높은 임팩트, 빠른 구현 (우선순위 1~6)

### 2-A-1. CIE 다이어그램 스무스 곡선

| 항목 | 내용 |
|------|------|
| **현재 상태** | Spectral locus가 직선으로 연결된 다각형 형태로 렌더링 |
| **목표** | ISCV(Spectrum Visualizer)처럼 부드러운 곡선으로 렌더링 |
| **구현 방안** | ISCV의 CIEDiagram 곡선 보간 로직 참조 (catmull-rom 또는 basis spline) |
| **적용 대상** | Gamut Analyzer CIE 다이어그램, Viewing Angle ColorShiftTrack의 CIE 다이어그램 |
| **우선순위** | P0 |

**요구사항**:
- Spectral locus 경계선을 catmull-rom 또는 basis spline 보간으로 부드럽게 렌더링
- CIE 1931 xy, CIE 1976 u'v' 모두 적용
- 기존 색역 삼각형/포인트 마커 렌더링에 영향 없어야 함
- ISCV 프로젝트의 CIEDiagram 곡선 보간 코드를 참조하여 구현

---

### 2-A-2. 테마 변경 (다크/라이트)

| 항목 | 내용 |
|------|------|
| **현재 상태** | 다크 테마 고정 |
| **목표** | 다크/라이트 테마 토글 기능 제공 |
| **구현 방안** | Tailwind CSS의 `dark:` 클래스 활용, ThemeProvider 컨텍스트 |
| **우선순위** | P0 |

**요구사항**:
- 네비게이션 바에 테마 토글 버튼 배치
- 토글 아이콘: 다크 모드 시 (월 아이콘), 라이트 모드 시 (해 아이콘)
- 사용자 선택한 테마를 localStorage에 저장 (2-A-3과 연계)
- 시스템 기본 테마 감지 (`prefers-color-scheme`)를 초기값으로 사용
- CIE 다이어그램, 차트 등 시각화 컴포넌트도 테마에 맞게 색상 조정
- 모든 페이지에서 테마 일관 적용

---

### 2-A-3. 사용자 설정값 브라우저 저장 (localStorage)

| 항목 | 내용 |
|------|------|
| **현재 상태** | 매 접속 시 기본값으로 시작 |
| **목표** | 사용자가 입력/설정한 값을 localStorage에 저장하고, 재접속 시 복원 |
| **구현 방안** | `useLocalStorage` 커스텀 훅 자체 구현 |
| **우선순위** | P0 |

**저장 대상**:

| 모듈 | 저장 항목 |
|------|----------|
| Gamut Analyzer | 커스텀 프라이머리 좌표, 선택된 표준 색역, CIE 모드 (1931/1976) |
| Color Calculator | 마지막 입력값 (XYZ, Lab, CIE xy 등) |
| Viewing Angle | 마지막 로드한 데이터, ΔE 모드 (CIE76/CIEDE2000) |
| 전역 | 테마 설정 (2-A-2), 언어 설정 (2-B-1) |

**추가 요구사항**:
- 설정 초기화 버튼 제공 (모든 저장값을 기본값으로 리셋)
- localStorage 키 네이밍 컨벤션 통일 (`displaylab::{module}::{key}`)
- 저장/복원 시 데이터 유효성 검증 (손상된 데이터 대응)

---

### 2-A-4. Spectrum Visualizer Display Lab 편입

| 항목 | 내용 |
|------|------|
| **현재 상태** | 별도 프로젝트로 존재 (`projects/spectrum-visualizer/`) |
| **목표** | Display Lab의 새 섹션으로 통합 |
| **라우트** | `/spectrum-analyzer` |
| **우선순위** | P0 |

**기능 요구사항**:
- SPD(Spectral Power Distribution) 파일 업로드 및 시각화
- 스펙트럼 → XYZ → xy 변환 + CIE 다이어그램 표시
- 색온도(CCT), 지배 파장(Dominant Wavelength), 순도(Excitation Purity) 자동 계산
- 피크 파장(Peak Wavelength) 분석
- 네비게이션에 "Spectrum" 탭 추가

**구현 방안**:
- ISCV 코드 재활용 (CIEDiagram은 이미 공유, 스펙트럼 차트 컴포넌트 이관)
- ISCV 전용 기능(Sentry 등)은 제거하고 Display Lab 스타일에 맞게 통합
- 기존 Display Lab의 CIEDiagram, CSVUploader 등 공통 컴포넌트 활용

**ISCV와의 관계**:
- ISCV 프로젝트는 독립적으로 유지 (교육/참조 용도)
- Display Lab의 Spectrum Analyzer는 ISCV의 핵심 기능을 포함하되, Display Lab 플랫폼에 통합된 형태

---

### 2-A-5. 색공간 전체 변환 (Universal Color Space Converter)

| 항목 | 내용 |
|------|------|
| **현재 상태** | XYZ ↔ xyY만 지원 |
| **목표** | 모든 주요 색공간 간 양방향 변환 지원 |
| **우선순위** | P0 |

**지원 색공간**:

| 색공간 | 설명 |
|--------|------|
| CIE XYZ | 기본 색공간 |
| CIE 1931 xy (xyY) | 색도 좌표 |
| CIE 1976 u'v' (u'v'Y) | 균등 색공간 |
| CIE Lab (L\*a\*b\*) | 지각 균등 색공간 |
| CIE LCh (L\*C\*h) | 원통형 Lab |
| sRGB (0-255) | 표준 디스플레이 색공간 |
| Linear RGB | 감마 보정 전 RGB |
| HSL / HSV | 색상, 채도, 밝기/명도 |
| CMYK | 인쇄용 (근사값) |
| Hex (#RRGGBB) | 웹 색상 코드 |

**UI 요구사항**:
- 드롭다운으로 소스/타깃 색공간 선택
- 실시간 변환 (입력 즉시 결과 반영)
- 색상 미리보기 패치 (변환된 색의 시각적 표현)
- 기존 CoordinateConverter를 확장하거나 별도 "Universal Converter" 컴포넌트로 구현

---

### 2-A-6. 데이터 공유 링크

| 항목 | 내용 |
|------|------|
| **현재 상태** | 분석 결과를 다른 사용자와 공유할 방법 없음 |
| **목표** | URL 파라미터에 분석 상태를 인코딩하여 링크로 공유 |
| **우선순위** | P1 |

**구현 방안**:

| 모듈 | URL 파라미터 인코딩 대상 |
|------|------------------------|
| Gamut Analyzer | 프라이머리 좌표 (R, G, B) + CIE 모드 |
| Color Calculator | 입력값 (색공간, 좌표값) |

**URL 예시**:
```
https://displaylab.vercel.app/gamut-analyzer?r=0.64,0.33&g=0.30,0.60&b=0.15,0.06&mode=CIE1931
```

**요구사항**:
- 각 모듈에 "Share" 버튼 추가
- 클릭 시 현재 분석 상태가 인코딩된 URL을 클립보드에 복사
- 링크 접속 시 URL 파라미터에서 상태 자동 복원
- URL 파라미터가 유효하지 않은 경우 기본값으로 폴백
- 복사 완료 시 토스트 알림 표시

---

## 3. Phase 2-B: 전략적 가치 (우선순위 7~11)

### 2-B-1. 영어/한글 i18n

| 항목 | 내용 |
|------|------|
| **현재 상태** | 영어 단일 언어 |
| **목표** | 영어/한글 듀얼 언어 지원 |
| **구현 방안** | react-i18next 또는 자체 i18n 시스템 |
| **우선순위** | P1 |

**요구사항**:
- 기본 언어: 영어 (현재 유지)
- 추가 언어: 한글
- 범위: 모든 UI 텍스트, 버튼, 라벨, 설명, 에러 메시지
- 전문 용어 처리: 영어 병기 (예: "색역 분석기 (Color Gamut Analyzer)")
- 언어 토글: 네비게이션 바에 EN/KR 스위치
- localStorage에 언어 설정 저장 (2-A-3과 연계)
- 브라우저 언어 감지를 초기값으로 사용

---

### 2-B-2. HDR Analyzer (새 섹션)

| 항목 | 내용 |
|------|------|
| **현재 상태** | HDR 관련 분석 기능 없음 |
| **목표** | HDR 디스플레이 분석 전용 모듈 제공 |
| **라우트** | `/hdr-analyzer` |
| **우선순위** | P1 |

**기능 요구사항**:

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| PQ EOTF 커브 시각화 | Perceptual Quantizer 전달함수 커브 렌더링 | P0 |
| HLG EOTF 커브 시각화 | Hybrid Log-Gamma 전달함수 커브 렌더링 | P0 |
| HDR10 메타데이터 입력 | MaxCLL, MaxFALL, Master Display Info 입력 | P0 |
| 톤 매핑 시뮬레이션 | HDR → SDR 변환 시뮬레이션 | P1 |
| 피크 밝기 분석 | 디스플레이 피크 밝기 성능 분석 | P1 |
| BT.2100 관련 계산 | BT.2100 표준 기반 계산 기능 | P1 |

---

### 2-B-3. SPD 분석 - CRI/TLCI (Spectrum Analyzer 확장)

| 항목 | 내용 |
|------|------|
| **현재 상태** | Phase 2-A-4에서 기본 SPD 분석 기능 편입 예정 |
| **목표** | 광원 품질 분석 기능 확장 (CRI, TLCI, TM-30) |
| **전제조건** | Phase 2-A-4 (Spectrum Visualizer 편입) 완료 후 확장 |
| **우선순위** | P1 |

**기능 요구사항**:

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| CRI (Ra) 자동 계산 | Color Rendering Index R1-R14 계산 | P0 |
| TLCI 계산 | Television Lighting Consistency Index | P1 |
| IES TM-30 Rf/Rg | Fidelity Index (Rf), Gamut Index (Rg) 계산 | P1 |
| 색재현 벡터 그래프 | 기준 광원 대비 색재현 벡터 시각화 | P1 |

---

### 2-B-4. Panel Technology Comparator (새 섹션)

| 항목 | 내용 |
|------|------|
| **현재 상태** | 패널 기술 비교 기능 없음 |
| **목표** | 주요 디스플레이 패널 기술 인터랙티브 비교 |
| **라우트** | `/panel-comparison` |
| **우선순위** | P2 |

**비교 대상 패널 기술**:
- IPS (In-Plane Switching)
- VA (Vertical Alignment)
- OLED (Organic Light-Emitting Diode)
- Mini-LED
- QD-OLED (Quantum Dot OLED)

**기능 요구사항**:

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 인터랙티브 비교 차트 | 시야각, 명암비, 응답속도, 색재현율, 수명, 소비전력 비교 | P0 |
| 패널별 장단점 요약 카드 | 각 기술의 핵심 장단점 시각적 요약 | P0 |
| 사용 사례별 추천 | 게이밍, 영상편집, 사무용 등 용도별 패널 추천 | P1 |
| 교육적 콘텐츠 | 각 패널 기술의 원리와 특성 설명 | P1 |

**비고**:
- SEO 킬러 콘텐츠로 활용 (검색 유입 극대화)
- 데이터 기반 비교 + 교육적 설명 병행

---

### 2-B-5. 카카오 애드핏 광고 삽입

| 항목 | 내용 |
|------|------|
| **현재 상태** | 광고 수익 없음 |
| **목표** | 카카오 애드핏(AdFit) SDK 연동으로 광고 수익 시작 |
| **우선순위** | P2 |

**광고 배치 전략**:

| 디바이스 | 위치 | 형태 |
|---------|------|------|
| 데스크탑 | 사이드바 또는 도구 간 영역 | 배너 광고 |
| 모바일 | 하단 배너 | 고정 배너 |

**요구사항**:
- 사용자 경험을 해치지 않는 범위에서 비침투적 배치
- 분석 도구 사용 중 시야를 방해하지 않는 위치
- AdBlocker 감지 시 대체 메시지 표시 (선택적)
- GDPR/개인정보 고지 추가
- 기존 nbbang 프로젝트의 카카오 애드핏 연동 경험 참조

---

## 4. Phase 2-C: 장기 비전 (우선순위 12~14)

### 2-C-1. 디스플레이 데이터베이스

| 항목 | 내용 |
|------|------|
| **현재 상태** | 디스플레이 스펙 데이터 없음 |
| **목표** | 주요 디스플레이 스펙 DB 구축 및 검색/필터 기능 제공 |
| **라우트** | `/database` |
| **우선순위** | P2 |

**기능 요구사항**:

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 디스플레이 스펙 DB | TV, 모니터, 스마트폰, 태블릿 스펙 데이터 | P0 |
| 검색/필터 | 해상도, 패널 타입, 색역, HDR 지원 등으로 필터링 | P0 |
| 상세 페이지 | 각 디스플레이 상세 정보 + Display Lab 도구 연동 | P1 |
| 커뮤니티 기여 | 사용자가 측정 데이터 제출 (Phase 3) | P2 |

**데이터 저장**:
- 초기: 정적 JSON 파일 (빠른 구현)
- 확장: Supabase (PostgreSQL) 마이그레이션

---

### 2-C-2. Display Measurement Report Generator

| 항목 | 내용 |
|------|------|
| **현재 상태** | 분석 결과를 PDF 리포트로 출력 불가 |
| **목표** | 종합 측정 리포트 PDF 자동 생성 |
| **우선순위** | P2 |

**리포트 포함 항목**:
- 색역 커버리지 (sRGB, DCI-P3, BT.2020 대비 %)
- CCT/Duv 분석
- ΔE 분석 결과
- 시야각 성능 (극좌표 플롯, 색차 히트맵)
- 균일성 분석 (데이터 있는 경우)

**기능 요구사항**:

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| PDF 자동 생성 | 분석 결과 기반 종합 리포트 생성 | P0 |
| 리포트 템플릿 | 전문가용 (상세) / 간이용 (요약) 2종 | P1 |
| 브랜딩 커스터마이즈 | 로고, 회사명 커스터마이즈 | P2 |

**구현 방안**: `@react-pdf/renderer` 또는 `html2pdf` 라이브러리 활용

---

### 2-C-3. API 제공

| 항목 | 내용 |
|------|------|
| **현재 상태** | 모든 계산이 클라이언트 사이드 전용 |
| **목표** | 핵심 계산 함수를 REST API로 공개 |
| **우선순위** | P2 |

**엔드포인트 설계**:

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/delta-e` | ΔE 계산 (CIE76, CIE94, CIEDE2000) |
| POST | `/api/cct` | CCT/Duv 계산 |
| POST | `/api/gamut-coverage` | 색역 커버리지 계산 |
| POST | `/api/color-convert` | 색공간 변환 |

**가격 정책**:

| Tier | 호출 수/일 | 가격 |
|------|-----------|------|
| Free | 100 calls/day | 무료 |
| Pro | 10,000 calls/day | 유료 (가격 추후 결정) |

**기술 요구사항**:
- API 키 인증
- Swagger/OpenAPI 문서 자동 생성
- Rate Limiting 적용
- 구현: Vercel Serverless Functions 또는 별도 백엔드

---

## 5. 기술 스택 확장 (Phase 2)

### 5.1 기존 스택 (Phase 1)
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 프레임워크 |
| Vite | 7 | 빌드 도구 |
| TypeScript | 5.9 | 타입 안정성 |
| D3.js | 7 | 데이터 시각화 |
| Tailwind CSS | 4 | 스타일링 |

### 5.2 Phase 2 추가 예정
| 기술 | 용도 | 도입 시점 |
|------|------|----------|
| `useLocalStorage` 커스텀 훅 | 사용자 설정 저장 | Phase 2-A |
| react-i18next | 다국어 지원 (영어/한글) | Phase 2-B |
| @react-pdf/renderer 또는 html2pdf | PDF 리포트 생성 | Phase 2-C |
| Supabase | 디스플레이 DB 저장 | Phase 2-C |
| Vercel Serverless Functions | REST API 제공 | Phase 2-C |

---

## 6. 라우트 구조 (Phase 2 완료 시)

| 라우트 | 모듈 | 도입 시점 |
|--------|------|----------|
| `/` | Home (랜딩 페이지) | Phase 1 |
| `/gamut-analyzer` | Color Gamut Analyzer | Phase 1 |
| `/color-calculator` | Color Science Calculator | Phase 1 |
| `/viewing-angle` | Viewing Angle Analyzer | Phase 1 |
| `/spectrum-analyzer` | Spectrum Analyzer (ISCV 편입) | Phase 2-A |
| `/hdr-analyzer` | HDR Analyzer | Phase 2-B |
| `/panel-comparison` | Panel Technology Comparator | Phase 2-B |
| `/database` | Display Database | Phase 2-C |

---

## 7. 일정 예상

### 7.1 서브페이즈별 일정

| 서브페이즈 | 항목 | 예상 기간 |
|-----------|------|----------|
| Phase 2-A | CIE 스무스 곡선, 테마 변경, localStorage, Spectrum 편입, Universal Converter, 공유 링크 | 2-3주 |
| Phase 2-B | i18n, HDR Analyzer, CRI/TLCI, Panel Comparator, 카카오 애드핏 | 3-4주 |
| Phase 2-C | 디스플레이 DB, PDF 리포트, API 제공 | 4-6주 |
| **총 예상** | **14개 항목** | **약 2-3개월** |

### 7.2 항목별 예상 소요

| # | 항목 | 예상 소요 | 서브페이즈 |
|---|------|----------|-----------|
| 1 | CIE 다이어그램 스무스 곡선 | 1-2일 | 2-A |
| 2 | 테마 변경 (다크/라이트) | 2-3일 | 2-A |
| 3 | 사용자 설정값 localStorage | 2-3일 | 2-A |
| 4 | Spectrum Visualizer 편입 | 3-5일 | 2-A |
| 5 | Universal Color Space Converter | 3-4일 | 2-A |
| 6 | 데이터 공유 링크 | 1-2일 | 2-A |
| 7 | 영어/한글 i18n | 3-5일 | 2-B |
| 8 | HDR Analyzer | 5-7일 | 2-B |
| 9 | SPD 분석 - CRI/TLCI | 3-5일 | 2-B |
| 10 | Panel Technology Comparator | 3-4일 | 2-B |
| 11 | 카카오 애드핏 광고 삽입 | 1-2일 | 2-B |
| 12 | 디스플레이 데이터베이스 | 7-10일 | 2-C |
| 13 | Display Measurement Report Generator | 5-7일 | 2-C |
| 14 | API 제공 | 5-7일 | 2-C |

---

## 8. 성공 지표

### 8.1 Phase 2-A 완료 시
| 지표 | 목표 |
|------|------|
| 도구 수 | 4-5개 (현재 3개 + Spectrum Analyzer) |
| localStorage 지원 | 전 모듈 사용자 설정 저장/복원 |
| 테마 토글 | 다크/라이트 전환 |
| 색공간 변환 | 10개 색공간 양방향 변환 |
| 데이터 공유 | URL 파라미터 기반 공유 링크 |

### 8.2 Phase 2-B 완료 시
| 지표 | 목표 |
|------|------|
| 도구 수 | 7개+ (HDR Analyzer, Panel Comparator 추가) |
| i18n | 영어/한글 듀얼 언어 |
| 광고 수익 | 카카오 애드핏 수익 시작 |
| 광원 분석 | CRI, TLCI 자동 계산 |

### 8.3 Phase 2-C 완료 시
| 지표 | 목표 |
|------|------|
| 디스플레이 DB | 주요 디스플레이 100개+ 등록 |
| PDF 리포트 | 전문가용/간이용 리포트 생성 |
| API 수익 | REST API 운영, Free/Pro 티어 |
| 플랫폼화 | 도구 → 플랫폼으로 포지셔닝 전환 |

### 8.4 사용자 지표 목표 (Phase 2 전체)
| 지표 | Phase 1 현재 | Phase 2 목표 |
|------|-------------|-------------|
| MAU | 측정 중 | 500-1,000명 |
| 월 세션 수 | 측정 중 | 2,000-4,000 |
| 평균 세션 시간 | 측정 중 | 7분+ |
| SEO 유입 비율 | 측정 중 | 50%+ |

---

## 9. 리스크 및 대응

| 리스크 | 영향 | 확률 | 대응 방안 |
|--------|------|------|----------|
| ISCV Spectrum Visualizer 편입 범위 초과 | Phase 2-A 일정 지연 | 중 | 핵심 기능만 우선 편입, 고급 기능은 2-B-3에서 확장 |
| i18n 번역 범위 과다 | Phase 2-B 일정 지연 | 중 | 주요 UI 텍스트 우선, 설명 텍스트는 점진적 번역 |
| HDR Analyzer 표준 복잡도 | 구현 난이도 높음 | 중 | PQ/HLG EOTF 커브 시각화만 우선, 고급 기능 후순위화 |
| 카카오 애드핏 UX 저해 | 사용자 이탈 | 낮 | 비침투적 배치 원칙, A/B 테스트로 최적 위치 결정 |
| Supabase 통합 복잡도 | Phase 2-C 지연 | 중 | 초기 정적 JSON으로 시작, 점진적 DB 마이그레이션 |
| API Rate Limiting 구현 | 보안 이슈 | 낮 | Vercel Edge Middleware 활용, 검증된 패턴 적용 |

---

## 10. 데이터 프라이버시 (Phase 2)

### 10.1 기존 원칙 유지
Phase 1의 "Your data never leaves your browser" 원칙을 Phase 2에서도 유지합니다.

### 10.2 Phase 2 변경 사항
| 기능 | 데이터 처리 방식 |
|------|----------------|
| localStorage 저장 | 브라우저 로컬 저장, 서버 미전송 |
| 공유 링크 | URL 파라미터로 인코딩, 서버 미저장 |
| 카카오 애드핏 | 광고 SDK만 로드, 분석 데이터 미공유 |
| 디스플레이 DB (2-C) | 공개 스펙 데이터만 저장, 사용자 측정 데이터는 명시적 동의 후에만 |
| API (2-C) | API 호출 데이터는 처리 후 즉시 폐기, 로그 미보관 |

---

## 11. 승인

| 역할 | 담당 | 승인 | 날짜 |
|------|------|------|------|
| PRD 작성 | CEO Agent (노이만) | ✅ | 2026-02-20 |
| Board Advisor 검토 | Codex (오펜하이머) | ⏳ 추후 | - |
| 회장님 승인 | NAMSEOK | ✅ 승인 | 2026-02-20 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-02-20 | 초안 작성 (CEO 지시 기반) | CEO Agent (노이만) |
