# PRD: Display Lab (디스플레이랩)

> **문서 버전**: v1.1
> **작성일**: 2026-02-20
> **작성자**: CEO Agent
> **상태**: ✅ 승인 완료

---

## 1. 제품 개요

### 1.1 제품명
- **한글**: 디스플레이랩
- **영문**: Display Lab
- **도메인**: Vercel 기본 도메인 사용 (추후 displaylab.app / displaylab.tools / displaylab.io 중 결정)

### 1.2 제품 설명
디스플레이 엔지니어와 연구자를 위한 웹 기반 디스플레이 분석 플랫폼. 고가의 데스크탑 전용 도구(Fluxim, CalMAN 등)와 단순한 무료 웹 계산기 사이의 빈 공간을 채우는 **"전문가급 무료 웹 도구"**를 지향합니다. 시야각 분석, 색역 비교, 색과학 계산 등 디스플레이 업계에서 필수적인 분석 기능을 코딩 없이 브라우저에서 즉시 사용할 수 있습니다.

### 1.3 배경 및 필요성
- **시야각 분석 웹 도구**: 전무 (블루오션)
- **측정 데이터 업로드 → 시각화**: 전무
- **통합 색과학 계산기** (SPD → 모든 파라미터): 분산된 단일 기능만 존재
- **색역 비교 올인원 웹앱**: 없음
- **유료 데스크탑 도구**(Fluxim, CalMAN, ColourSpace)만 존재하고 웹 기반 중간 지대가 완전히 비어있음
- 자사 ISCV 프로젝트의 기술 자산(D3.js CIE 다이어그램, 스펙트럼 파싱 등)을 재활용하여 빠른 개발 가능

### 1.4 핵심 가치
Fluxim/CalMAN 같은 수천만 원대 데스크탑 도구와 단순 무료 웹 계산기 사이의 빈 공간을 채우는 **"전문가급 무료 웹 도구"**.

### 1.5 목표
| 목표 | 측정 지표 | 목표치 (3개월) | 목표치 (6개월) |
|------|----------|---------------|---------------|
| 사용자 확보 | MAU | 100-200명 | 500-1,000명 |
| 활성 사용 | 월 세션 수 | 400-800 | 2,000-4,000 |
| 데이터 활용 | CSV 업로드 수 | 200-400 | 1,000-2,000 |
| 검색 유입 | SEO 유입 비율 | 30% | 50% |
| 수익화 | Premium 전환율 | - | 2-3% |

---

## 2. 타겟 사용자

### 2.1 주요 사용자
| 페르소나 | 설명 | 니즈 |
|----------|------|------|
| 디스플레이 엔지니어 | 삼성/LG 디스플레이 등 패널 제조사 | 시야각/색역 분석, 패널 비교 |
| OLED 재료 연구자 | 소재 회사, 대학 연구실 | 스펙트럼 → 색좌표 변환, 색역 커버리지 |
| 디스플레이 QC 팀 | 품질 관리 부서 | 측정 데이터 시각화, 보고서 |
| 학술 연구자 | 대학원생, 포스트닥 | 논문용 CIE 다이어그램, 계산 도구 |
| 디스플레이 리뷰어 | RTings, 모니터 리뷰 사이트 | 색역/시야각 비교 시각화 |

### 2.2 사용 시나리오
1. **시야각 분석**: 고니오미터 측정 CSV 업로드 → 극좌표 플롯 + 색차 히트맵 → 결과 다운로드/공유
2. **색역 비교**: 디스플레이 프라이머리 좌표 입력 → 표준 색역 대비 커버리지 확인 → 최대 4개 디스플레이 동시 비교
3. **색과학 계산**: CIE XYZ/xyY 변환, CCT 계산, ΔE 계산 등 빠른 참조 → 논문/보고서에 활용
4. **데모/학습**: 프리셋 데이터로 도구 기능 체험 → 실제 데이터 분석으로 전환

---

## 3. 핵심 기능 (Phase 1 - MVP)

### 3.1 Viewing Angle Analyzer (시야각 분석기)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| CSV 데이터 업로드 | 고니오미터 측정 데이터 (각도, 휘도, CIE x, CIE y) | P0 |
| CSV 템플릿 제공 | 자체 정의 CSV 포맷 + 변환 가이드 | P0 |
| 극좌표(Polar) 플롯 | 각도별 휘도 분포 시각화 | P0 |
| 색좌표 변화 궤적 | CIE 1931 xy 다이어그램 위에 각도별 궤적 표시 | P0 |
| 색차 자동 계산 | ΔE*ab, ΔE2000 계산 및 히트맵 | P0 |
| 명암비 커브 | 각도별 Contrast Ratio 시각화 | P1 |
| 프리셋 데이터 | 학습/데모용 샘플 데이터 제공 | P0 |
| 데이터 export | 분석 결과 CSV/이미지 다운로드 | P1 |

**입력 데이터 구조**:
```typescript
interface ViewingAngleData {
  angle: number;          // 측정 각도 (0°~80°)
  luminance: number;      // 휘도 (cd/m²)
  cieX: number;           // CIE x 좌표
  cieY: number;           // CIE y 좌표
  // 파생 계산값
  deltaE_ab?: number;     // ΔE*ab (0° 대비)
  deltaE_2000?: number;   // CIEDE2000 (0° 대비)
  contrastRatio?: number; // 명암비
}
```

### 3.2 Color Gamut Analyzer (색역 분석기)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 커스텀 프라이머리 입력 | CIE xy 좌표 직접 입력 (R, G, B) | P0 |
| 표준 색역 오버레이 | sRGB, DCI-P3, BT.2020, Adobe RGB, NTSC 비교 | P0 |
| 듀얼 좌표계 지원 | CIE 1931 xy / CIE 1976 u'v' 모두 지원 | P0 |
| 색역 면적 계산 | % 커버리지 (면적 비율) 자동 계산 | P0 |
| 다중 디스플레이 비교 | 최대 4개 디스플레이 동시 비교 | P1 |
| 데이터 import/export | CSV/JSON 형식 지원 | P1 |
| 색역 토글 | 표준 색역 ON/OFF 토글 | P0 |

**데이터 구조**:
```typescript
interface GamutData {
  name: string;           // 디스플레이 이름
  primaries: {
    red: { x: number; y: number };
    green: { x: number; y: number };
    blue: { x: number; y: number };
  };
  whitePoint?: { x: number; y: number };
}

interface StandardGamut {
  name: string;           // sRGB, DCI-P3 등
  primaries: GamutData['primaries'];
  whitePoint: { x: number; y: number };
}
```

### 3.3 Color Science Quick Calculator (색과학 간이 계산기)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| CIE XYZ ↔ xyY 변환 | 양방향 좌표 변환 | P0 |
| CCT + Duv 계산 | 상관색온도 및 Duv 거리 | P0 |
| ΔE 계산 | CIE76, CIE94, CIEDE2000 세 가지 방식 | P0 |
| Planckian Locus 시각화 | CIE 다이어그램 위 흑체 궤적 표시 | P1 |
| 실시간 계산 | 입력값 변경 시 즉시 결과 반영 | P0 |

**계산 함수**:
```typescript
// CIE XYZ → xyY 변환
function xyzToXyy(X: number, Y: number, Z: number): { x: number; y: number; Y: number };

// CCT 계산 (McCamy's approximation 또는 Robertson's method)
function calculateCCT(x: number, y: number): { cct: number; duv: number };

// ΔE 계산
function deltaE76(lab1: Lab, lab2: Lab): number;
function deltaE94(lab1: Lab, lab2: Lab): number;
function deltaE2000(lab1: Lab, lab2: Lab): number;
```

---

## 4. 기술 스택

### 4.1 프론트엔드
| 기술 | 용도 | 비고 |
|------|------|------|
| React + Vite | UI + 빌드 | 계산 로직이 100% 클라이언트 사이드여서 SSR 불필요. ISCV와 동일 스택으로 코드 재활용 극대화. D3.js 개발에 빠른 HMR 유리. |
| TypeScript | 타입 안정성 | 정밀 계산 로직에 필수 |
| D3.js | 데이터 시각화 | CIE 다이어그램, 극좌표 플롯, 히트맵 |
| Tailwind CSS | 스타일링 | 유틸리티 기반 빠른 UI 개발 |

### 4.2 인프라
| 기술 | 용도 |
|------|------|
| Vercel | 호스팅 및 배포 |
| Google Analytics 4 | 사용자 분석 |
| 추후: Supabase | 인증, 데이터 저장 (Phase 2) |

### 4.3 개발 도구
| 도구 | 용도 |
|------|------|
| ESLint | 코드 품질 |
| Prettier | 코드 포맷팅 |
| Vitest | 단위 테스트 (Vite 네이티브) |

---

## 5. 기술 자산 (ISCV에서 재활용)

### 5.1 재활용 자산 목록

자사 ISCV(Interactive Spectrum & Chromaticity Visualizer) 프로젝트에서 다음 자산을 재활용합니다:

| 자산 | 설명 | 재활용 범위 |
|------|------|------------|
| D3.js CIE 다이어그램 | CIE 1931/1976 다이어그램 렌더링 | 색역 분석기, 시야각 분석기 |
| 스펙트럼 데이터 파싱 | CSV, 클립보드 파싱 | CSV 업로드 전반 |
| 색역 토글 | sRGB, DCI-P3, BT.2020, Adobe RGB | 색역 분석기 |
| CIE Standard Observer | 1931 2° Observer 데이터 | 색과학 계산 전반 |
| Cubic Spline 보간 | 스펙트럼 데이터 보간 | 데이터 처리 |
| 반응형 모바일 UI | 모바일 최적화 레이아웃 | 전체 UI |

### 5.2 코드 재활용 전략

| 단계 | 전략 | 설명 |
|------|------|------|
| **MVP (Phase 1)** | 코드 복사(fork) | ISCV에서 필요한 모듈만 추출하여 Display Lab에 직접 포함 |
| **Phase 2** | 공유 라이브러리 추출 검토 | 공통 로직(CIE 계산, 색역, D3 다이어그램)을 `@sidequestlab/color-science`로 추출 |
| **기술 부채 인식** | Phase 2에서 해소 | 코드 복사로 인한 divergence를 기술 부채로 등록. Phase 2에서 라이브러리 통합 시 해소 예정 |

### 5.3 ISCV와의 전략적 포지셔닝
- **ISCV**: "스펙트럼 → 색좌표" 단일 기능의 교육/참조 도구 (완료, v1.2)
- **Display Lab**: "디스플레이 패널 분석" 종합 플랫폼 (시야각, 색역, 색과학)
- 두 프로젝트는 보완 관계이며 타겟 사용자가 겹치지만, 용도가 명확히 다름
- Phase 2에서 ISCV의 SPD 분석 기능을 Display Lab의 모듈로 통합 검토

---

## 6. 수익화 모델

### 6.1 3-Tier 수익 구조

| Tier | 가격 | 대상 | 포함 기능 |
|------|------|------|----------|
| **Free** | 무료 | 모든 사용자 | 모든 분석 도구 사용, CSV 업로드 (1,000행 제한), 이미지 다운로드 (워터마크 포함) |
| **Premium** | $9.99/월 | 전문가, 연구자 | 무제한 데이터 행, 워터마크 없음, PDF 리포트 자동 생성, 배치 분석, 데이터 클라우드 저장, API 접근 |
| **Enterprise** | 문의 | 기업 고객 | 화이트라벨, 커스텀 브랜딩 리포트, 팀 라이선스, 전용 지원 |

### 6.2 수익화 타임라인
| 단계 | 시기 | 내용 |
|------|------|------|
| Phase 1 | MVP 출시 | Free tier로 사용자 확보, 트래픽 기반 구축 |
| Phase 2 | +3개월 | Premium 구독 도입, PDF 리포트 기능 |
| Phase 3 | +6개월 | Enterprise 플랜, API 제공 |

---

## 7. MVP 범위

### 7.1 MVP-A (Phase 1-A): 색역 + 계산기 (ISCV 코드 재활용 극대화)
- [ ] **색역 분석기**: 커스텀 프라이머리, 표준 색역 오버레이, 면적 계산, CIE 1931/1976
- [ ] **색과학 계산기**: XYZ↔xyY, CCT+Duv, ΔE (3종)
- [ ] **프리셋 데이터**: 색역 샘플 데이터
- [ ] **반응형 디자인**: 모바일/태블릿/데스크탑
- [ ] **SEO 기반**: 영문 메타태그, 구조화 데이터
- [ ] **GA4 연동**: 사용자 분석
- [ ] **랜딩 페이지**: 서비스 소개 + 도구 목록

> MVP-A를 먼저 배포하여 빠른 피드백 확보

### 7.2 MVP-B (Phase 1-B): 시야각 분석기 (완전 신규 개발)
- [ ] **시야각 분석기**: CSV 업로드, 극좌표 플롯, 색좌표 궤적, 색차 히트맵
- [ ] **CSV 템플릿**: 자체 정의 CSV 포맷 + 변환 가이드
- [ ] **프리셋 데이터**: 시야각 샘플 데이터 (OLED, LCD)
- [ ] **정확도 검증**: CIE 표준 기반 검증 테스트 스위트

### 7.3 MVP 제외 (Phase 2+)
- [ ] SPD 업로드 → CIE, CCT, CRI 자동 계산
- [ ] PDF 리포트 자동 생성
- [ ] 사용자 계정 / 클라우드 저장 (Supabase)
- [ ] 프로젝트 관리 기능
- [ ] OLED 마이크로캐비티 간이 시뮬레이션
- [ ] Premium 구독 결제
- [ ] API 제공 (B2B)
- [ ] 측정기 데이터 직접 import (Konica Minolta, Photo Research 포맷)

---

## 8. 로드맵

### Phase 1 - MVP (현재)
| 기능 | 설명 |
|------|------|
| Color Gamut Analyzer | 색역 분석기 전체 (ISCV 확장) — MVP-A |
| Color Science Calculator | 색과학 간이 계산기 — MVP-A |
| Viewing Angle Analyzer | 시야각 분석기 전체 — MVP-B |
| 프리셋 데이터 | 데모/학습용 샘플 |
| SEO + Analytics | 영문 SEO, GA4 |

### Phase 2 - 확장 (+3개월)
| 기능 | 설명 |
|------|------|
| SPD 분석 | 분광분포 업로드 → CIE, CCT, CRI (Ra, R1~R15) |
| PDF 리포트 | 분석 결과 자동 PDF 생성 |
| Supabase 통합 | 사용자 계정, 데이터 클라우드 저장 |
| 프로젝트 관리 | 사용자별 프로젝트/데이터셋 관리 |
| OLED 시뮬레이션 | 마이크로캐비티 간이 시뮬레이션 |
| 공유 라이브러리 | `@sidequestlab/color-science` 추출 (ISCV 코드 divergence 해소) |

### Phase 3 - 수익화 (+6개월)
| 기능 | 설명 |
|------|------|
| Premium 구독 | $9.99/월, 리포트 커스텀, API, 팀 협업 |
| API 제공 | B2B REST API |
| 측정기 포맷 | Konica Minolta, Photo Research 직접 import |
| Enterprise 플랜 | 화이트라벨, 커스텀 통합 |

---

## 9. 성공 지표 (KPI)

### 9.1 사용자 지표
| 지표 | 정의 | 목표 (3개월) | 목표 (6개월) |
|------|------|-------------|-------------|
| MAU | 월간 활성 사용자 | 100-200명 | 500-1,000명 |
| 월 세션 수 | 총 세션 수 | 400-800 | 2,000-4,000 |
| CSV 업로드 | 데이터 업로드 횟수 | 200-400 | 1,000-2,000 |
| 세션 시간 | 평균 사용 시간 | 5분+ | 5분+ |

### 9.2 비즈니스 지표
| 지표 | 정의 | 목표 (3개월) | 목표 (6개월) |
|------|------|-------------|-------------|
| SEO 유입 | 검색 엔진 유입 비율 | 30% | 50% |
| Premium 전환율 | 유료 구독 전환 | - | 2-3% |
| 리텐션 | 월간 재방문율 | 25%+ | 35%+ |

### 9.3 KPI 산출 근거
- **타겟 모수**: 전 세계 디스플레이 엔지니어 + 연구자 + 리뷰어 약 10만~30만 명 추정
- **도달 가능 시장**: SEO + 커뮤니티 홍보로 접근 가능한 사용자 약 1-3%
- **엔빵 경험 반영**: 엔빵 Phase 1 MAU 기대치가 1,000→300명으로 현실 조정된 전례
- **니치 시장 특성**: 전문가 대상이므로 MAU는 낮지만 세션 시간과 리텐션이 높을 것으로 예상
- **보수적 추정 원칙**: 하한값 기준 계획, 상한값은 성장 시나리오

---

## 10. SEO 전략

### 10.1 기본 방침
- **영문 우선** (글로벌 시장 타겟)
- 기술 블로그를 통한 오가닉 트래픽 확보
- 구조화 데이터(Schema.org) 적용

### 10.2 타겟 키워드
| 키워드 | 검색 의도 | 우선순위 |
|--------|----------|----------|
| viewing angle analyzer | 시야각 분석 도구 검색 | P0 |
| display color gamut tool | 색역 분석 도구 검색 | P0 |
| CIE gamut coverage calculator | 색역 커버리지 계산 | P0 |
| delta E calculator online | ΔE 온라인 계산 | P0 |
| display measurement visualization | 디스플레이 측정 시각화 | P1 |
| CIE 1931 chromaticity diagram tool | CIE 다이어그램 도구 | P1 |
| OLED viewing angle analysis | OLED 시야각 분석 | P1 |

### 10.3 콘텐츠 전략
| 콘텐츠 | 목적 |
|--------|------|
| 시야각 분석 가이드 | 도구 사용법 + 시야각 이론 교육 |
| 색역 비교 방법론 | CIE 1931 vs 1976, 면적 계산 방법 |
| ΔE 이해하기 | 색차 기준별 차이, 산업 기준 설명 |
| 디스플레이 측정 기초 | 고니오미터, 스펙트로미터 이해 |

### 10.4 SPA SEO 대응
React + Vite(SPA) 선택에 따른 SEO 전략:
- 랜딩 페이지는 정적 HTML로 사전 렌더링 (vite-plugin-ssr 또는 prerender.io)
- 각 도구별 독립 URL 제공 (/viewing-angle, /gamut-analyzer, /color-calculator)
- react-helmet-async로 동적 메타태그 관리
- 구조화 데이터(JSON-LD)를 각 페이지별 삽입
- sitemap.xml 정적 생성
- SPA의 장점: 데이터 업로드/분석 시 페이지 이동 없는 부드러운 UX

---

## 11. 경쟁 분석

| 경쟁사 | 유형 | 가격 | 강점 | 약점 | 우리의 차별점 |
|--------|------|------|------|------|-------------|
| Fluxim Setfos | 데스크탑 SW | 수천만 원 | OLED 시뮬레이션 전문 | 고가, 설치 필요 | 무료 웹 기반, 즉시 사용 |
| CalMAN | 데스크탑 SW | $$$$ | 캘리브레이션 표준 | 고가, 학습 곡선 | 무료, 데이터 업로드만으로 분석 |
| ColourSpace | 데스크탑 SW | $$$$ | 3D LUT 생성 | 고가, 전문가 전용 | 접근성 높은 웹 도구 |
| colour-science (Python) | 라이브러리 | 무료 | 완벽한 색과학 구현 | 코딩 필요 | 코딩 불필요, 즉시 시각화 |
| ISCV (자사) | 웹앱 | 무료 | 스펙트럼 시각화 | 스펙트럼 특화 | ISCV 확장, 더 전문적 분석 |
| Bruce Lindbloom | 웹 참조 | 무료 | 정확한 수학 참조 | 시각화 없음, 구형 UI | 현대적 UI, 인터랙티브 시각화 |
| colorjs.io | 웹 도구 | 무료 | 색공간 변환 | 시야각/색역 분석 없음 | 디스플레이 특화 분석 + 시야각 |
| Academo.org CIE | 웹 데모 | 무료 | CIE 다이어그램 | 분석 기능 없음, 교육용 | 전문가급 분석 + 데이터 업로드 |

---

## 12. 정확도 검증 전략

### 12.1 검증 원칙
디스플레이 전문가가 주 타겟이므로, 계산 정확도는 프로젝트의 **생존 조건**입니다.
"Validated against CIE standards" 배지를 사이트에 표시하여 신뢰도를 확보합니다.

### 12.2 검증 방법
| 대상 | 검증 데이터 | 기준 |
|------|-----------|------|
| ΔE2000 | Sharma et al. (2005) 테스트 데이터 33쌍 | 소수점 4자리 일치 |
| CIE XYZ↔xyY | CIE 15:2004 표준 예제 | 소수점 6자리 일치 |
| CCT 계산 | CIE 15:2004 + Ohno (2014) 테스트 데이터 | ±1K 이내 |
| 색역 면적 | colour-science (Python) 교차검증 | ±0.1% 이내 |
| CIE 1931/1976 변환 | CIE 표준 데이터 | 소수점 6자리 일치 |

### 12.3 검증 구현
- Vitest 단위 테스트로 검증 테스트 스위트 구축 (최소 50개 테스트 케이스)
- colour-science (Python) 결과와 교차검증
- 검증 결과를 사이트 About 페이지에 공개
- CI/CD에 정확도 테스트 포함 (regression 방지)

### 12.4 참조 문헌
- CIE 15:2004 - Colorimetry
- Sharma, G., Wu, W., Dalal, E.N. (2005) - The CIEDE2000 color-difference formula
- Ohno, Y. (2014) - Practical Use and Calculation of CCT and Duv
- Robertson, A.R. (1968) - Computation of Correlated Color Temperature

---

## 13. 데이터 프라이버시

### 13.1 핵심 원칙
**"Your data never leaves your browser"**
모든 CSV 파싱과 계산은 클라이언트 사이드(브라우저)에서 수행됩니다. 사용자의 측정 데이터는 서버로 전송되지 않습니다.

### 13.2 구현
- 모든 파일 파싱: JavaScript FileReader API (로컬 처리)
- 모든 계산: 브라우저 내 JavaScript/TypeScript 실행
- 서버 전송 데이터: 없음 (GA4 이벤트 제외)
- Phase 2 클라우드 저장: 사용자 명시적 동의 후에만 활성화

### 13.3 표시
- 랜딩 페이지 + 각 도구 페이지에 프라이버시 배지 표시
- "Your data stays in your browser. Nothing is uploaded to our servers."

---

## 14. 리스크 및 대응

| 리스크 | 영향 | 확률 | 대응 방안 |
|--------|------|------|----------|
| 니치 시장으로 MAU 한계 | 수익화 지연 | 중 | 영문 글로벌 타겟, SEO 집중, 학술 커뮤니티 홍보 |
| 전문가 정확도 요구 높음 | 신뢰도 이슈 | 중 | 표준 데이터셋 검증, 학술 참조 명시, colour-science와 교차 검증 |
| ISCV와 중복 인식 | 사용자 혼란 | 낮 | 명확한 포지셔닝 차별화 (ISCV=스펙트럼 특화, DisplayLab=디스플레이 종합 분석) |
| D3.js 성능 한계 | 대용량 데이터 느림 | 낮 | Canvas 폴백, 데이터 샘플링, Web Worker 활용 |
| 브라우저 호환성 | 렌더링 차이 | 낮 | 주요 브라우저 테스트, Progressive Enhancement |
| 고니오미터 CSV 포맷 파편화 | 사용자 진입 장벽 | 높 | MVP: 자체 CSV 템플릿 + 변환 가이드 제공, Phase 2: 주요 제조사 포맷 자동 감지 |

---

## 15. 일정 계획

### 15.1 마일스톤
| 단계 | 기간 | 내용 |
|------|------|------|
| 설계 | 1일 | PRD 확정, 디자인 시스템, 기술 설계 |
| MVP-A | 5일 | 색역 분석기 + 색과학 계산기 + SEO + 랜딩 |
| MVP-A QA + 배포 | 1일 | QA + Vercel 배포 |
| MVP-B | 3일 | 시야각 분석기 (CSV 파싱, 극좌표 플롯, 색차 히트맵) |
| MVP-B QA + 배포 | 2일 | 시야각 QA + 정확도 검증 + 배포 |
| 버퍼 | 2일 | 예비일 |
| **총 예상** | **2-3주 (12-14일)** | |

### 15.2 상세 일정
| 일차 | 작업 | 상세 |
|------|------|------|
| Day 1 | 프로젝트 초기화 | Vite+React+TS 셋업, ISCV 코드 이관, 라우팅 |
| Day 2-3 | 색역 분석기 | 프라이머리 입력, 색역 오버레이, 면적 계산, 비교 UI (ISCV 확장) |
| Day 4-5 | 색과학 계산기 + SEO + 랜딩 | XYZ↔xyY, CCT, ΔE 계산기, 메타태그, 구조화 데이터, 랜딩 페이지 |
| Day 6 | QA-A + MVP-A 배포 | 색역/계산기 QA, Vercel 배포, GA4 연동 |
| | **--- MVP-A 배포 ---** | |
| Day 7-9 | 시야각 분석기 | CSV 파싱, 극좌표 플롯, CIE 궤적, ΔE 히트맵 |
| Day 10-11 | 시야각 QA + 정확도 검증 | CIE 표준 기반 정확도 테스트, 크로스 브라우저, 반응형 테스트 |
| Day 12 | MVP-B 배포 | Vercel 배포, 최종 점검 |
| | **--- MVP-B 배포 ---** | |
| Day 13-14 | 버퍼 | 예비일 (버그 수정, 피드백 반영) |

---

## 16. 프로젝트 구조

```
projects/displaylab/
├── docs/
│   └── PRD.md
├── src/
│   ├── components/
│   │   ├── viewing-angle/        # 시야각 분석기
│   │   │   ├── PolarPlot.tsx
│   │   │   ├── ColorShiftTrack.tsx
│   │   │   ├── DeltaEHeatmap.tsx
│   │   │   └── ContrastRatioCurve.tsx
│   │   ├── gamut-analyzer/       # 색역 분석기
│   │   │   ├── GamutDiagram.tsx
│   │   │   ├── PrimaryInput.tsx
│   │   │   ├── CoverageTable.tsx
│   │   │   └── ComparisonPanel.tsx
│   │   ├── color-calculator/     # 색과학 계산기
│   │   │   ├── CoordinateConverter.tsx
│   │   │   ├── CCTCalculator.tsx
│   │   │   ├── DeltaECalculator.tsx
│   │   │   └── PlanckianLocus.tsx
│   │   └── common/               # 공통 컴포넌트
│   │       ├── CIEDiagram.tsx
│   │       ├── CSVUploader.tsx
│   │       ├── DataTable.tsx
│   │       └── Layout.tsx
│   ├── lib/
│   │   ├── cie.ts                # CIE 색좌표 계산 (ISCV 재활용)
│   │   ├── delta-e.ts            # ΔE 계산 (CIE76, CIE94, CIEDE2000)
│   │   ├── gamut.ts              # 색역 계산 (면적, 커버리지)
│   │   ├── viewing-angle.ts      # 시야각 분석 로직
│   │   ├── cct.ts                # CCT, Duv 계산
│   │   ├── color-convert.ts      # 색공간 변환 (XYZ↔xyY↔Lab 등)
│   │   └── csv-parser.ts         # CSV 데이터 파싱
│   ├── data/
│   │   ├── cie1931.ts            # CIE 1931 2° Standard Observer (ISCV 재활용)
│   │   ├── cie1976.ts            # CIE 1976 u'v' 변환 데이터
│   │   ├── gamut-primaries.ts    # 표준 색역 좌표 (sRGB, DCI-P3, BT.2020 등)
│   │   ├── planckian-locus.ts    # Planckian Locus 데이터
│   │   └── presets/              # 데모 데이터셋
│   │       ├── viewing-angle-oled.csv
│   │       ├── viewing-angle-lcd.csv
│   │       └── gamut-samples.json
│   ├── pages/                    # 페이지 라우팅
│   │   ├── Home.tsx
│   │   ├── ViewingAngle.tsx
│   │   ├── GamutAnalyzer.tsx
│   │   └── ColorCalculator.tsx
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

---

## 17. 승인

| 역할 | 담당 | 승인 | 날짜 |
|------|------|------|------|
| PRD 작성 | CEO Agent | ✅ | 2026-02-20 |
| Board Advisor 검토 | Gemini | ✅ (조건부 승인, 피드백 반영) | 2026-02-20 |
| 회장님 승인 | NAMSEOK | ✅ | 2026-02-20 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-02-20 | 초안 작성 (워크샵 결과 기반) | CEO Agent |
| v1.1 | 2026-02-20 | Board Advisor 피드백 반영 (MF1-3, RF1-5) | CEO Agent |

### v1.1 변경 상세

**Board Advisor 검토 결과 반영**:

1. **필수 수정 (3건, 모두 적용)**:
   - MF1: ISCV 코드 재활용 전략 명확화 (MVP: fork, Phase 2: 공유 라이브러리)
   - MF2: KPI 현실 하향 조정 + 산출 근거 추가 (MAU 500→100-200, 엔빵 경험 반영)
   - MF3: 정확도 검증 전략 신규 섹션 추가 (Sharma 33쌍, CIE 표준, colour-science 교차검증)

2. **권장 수정 (5건, 모두 적용)**:
   - RF1: MVP 2단계 분리 (MVP-A: 색역+계산기, MVP-B: 시야각)
   - RF2: CSV 포맷 표준화 리스크 추가
   - RF3: SPA SEO 전략 보강
   - RF4: Free/Premium 차별화 강화 (행 제한, 워터마크)
   - RF5: 데이터 프라이버시 섹션 추가

3. **추가 수정**:
   - 경쟁 분석에 웹 기반 경쟁자 2건 추가
   - ISCV 전략적 포지셔닝 명확화
   - 일정: 10일 → 12-14일 (2-3주)
