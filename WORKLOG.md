# 작업일지

이 파일은 프로젝트에 발생한 모든 변경 사항을 시간순으로 기록합니다.

---

## 2026-07-06 — 프로젝트 초기 분석

### 저장소 클론
- `https://github.com/chs2147/pdf-file-splitter` 를 현재 작업 디렉토리로 클론.
- 기존 `.claude` 설정 디렉토리는 유지한 채 병합.

### 프로젝트 개요
- **이름**: pdf-file-splitter (v0.1.0)
- **목적**: 업로드한 PDF를 여러 개의 PDF로 분할하는 웹 앱. 모든 처리는 브라우저 내에서
  수행되며 서버 전송 없음.
- **기술 스택**: React 18 + Vite 5 + TypeScript + Tailwind CSS, `pdf-lib`(PDF 처리),
  `JSZip`(ZIP 패키징), `lucide-react`(아이콘).
- **커밋 이력**: 단일 커밋 `4f184f2 Initial commit: PDF File Splitter` (총 3,809줄,
  20개 파일). 이후 추가 커밋 없음.

### 파일 구조
```
├── index.html
├── package.json / package-lock.json
├── postcss.config.js / tailwind.config.js
├── tsconfig.json / tsconfig.node.json / vite.config.ts
├── .claude/
│   ├── launch.json
│   └── settings.local.json
└── src/
    ├── main.tsx           # 엔트리 포인트
    ├── App.tsx            # 최상위 컴포넌트, 상태 관리
    ├── index.css          # Tailwind 진입 스타일
    ├── components/
    │   ├── FileDropzone.tsx   # 파일 드래그앤드롭/선택 UI
    │   ├── SplitOptions.tsx   # 분할 기준 선택 UI
    │   └── ResultList.tsx     # 분할 결과 목록 및 다운로드 UI
    └── lib/
        ├── pdfSplitter.ts     # 핵심 분할 로직 (pdf-lib 기반)
        ├── download.ts        # 개별/ZIP 다운로드 유틸
        └── format.ts          # 바이트 포맷팅, 페이지 범위 파싱
```

### 핵심 기능 (분할 기준 4종)
1. **용량 기준** (`size`) — 지정 용량(기본 20MB) 이하로 페이지를 순서대로 묶음.
   단일 페이지가 한도 초과 시 `oversize` 플래그로 별도 출력.
2. **N페이지마다** (`everyN`) — 지정 페이지 수 단위로 균등 분할.
3. **페이지 범위 지정** (`ranges`) — `1-3, 5, 8-10` 형식 파싱, 범위별 PDF 생성.
4. **페이지별 분할** (`individual`) — 전체 페이지를 개별 PDF로 분리.

결과물은 개별 다운로드 또는 전체 ZIP 다운로드(JSZip) 가능.

### 코드 품질 관찰
- 로직과 UI가 `lib/`와 `components/`로 명확히 분리되어 있음.
- `splitBySize`는 매 페이지마다 `PDFDocument.save()`를 호출해 용량을 확인하는 방식으로,
  페이지 수가 많은 대용량 문서에서는 성능 저하 가능성 있음(향후 최적화 후보).
- 에러 메시지가 모두 한국어로 일관되게 작성됨.
- 테스트 코드(unit test)는 현재 없음.

---

## 2026-07-06 — 사이트 디자인 변경 (Bugatti 컨셉 다크 테마)

### 배경
- `https://getdesign.md/bugatti/design-md` 를 참고 요청받음. 해당 페이지는 실제
  색상 hex·폰트·spacing 명세는 $249 유료 킷(`/bugatti/design-md/kit`) 또는
  `npx getdesign@latest add bugatti` 설치 뒤에만 제공되는 유료 상품 페이지였음.
  구체적 수치는 공개되어 있지 않고, 공개된 것은 컨셉 설명뿐:
  > "Hypercar brand. Cinema-black canvas, monochrome austerity, monumental
  > 288px ALL-CAPS display type."
- 사용자에게 (1) 컨셉만 참고해 자체 구현 vs (2) 유료 킷 설치 후 정확한 스펙 적용,
  두 가지 방식을 물었고 **(1) 컨셉 참고 자체 구현**으로 결정.

### 변경 내용
- **폰트**: `index.html`에 Google Fonts(`Bebas Neue` — 대형 올캡스 디스플레이용,
  `Inter` — 본문용) 추가. `tailwind.config.js`에 `font-display`(Bebas Neue),
  `font-sans`(Inter) 유틸리티 등록.
- **컬러 팔레트**: 기존 파란색 계열(`brand.primary #003087` 등)을 모노크롬
  팔레트로 교체 — `brand.black #050505`, `brand.charcoal #141414`,
  `brand.line #2a2a2a`, `brand.silver #9a9a9a`, `brand.white #f5f5f5`.
  단일 액센트는 흑백 반전(흰 배경+검정 텍스트) 버튼으로 대체.
- **레이아웃/컴포넌트 스타일**: 전체 배경을 칠흑(`#050505`)으로 변경, 카드/입력/
  버튼의 둥근 모서리(`rounded-xl`)와 그림자를 제거하고 얇은 헤어라인 보더
  (`border-brand-line`)로 대체. `App.tsx` 헤더 타이틀을 Bebas Neue 대문자
  대형 타이포(`text-4xl uppercase tracking-[0.08em]`)로 변경.
  분할 기준 섹션 라벨, 결과 개수 타이틀 등도 트래킹 넓은 올캡스로 통일.
- **수정 파일**: `index.html`, `tailwind.config.js`, `src/index.css`,
  `src/App.tsx`, `src/components/FileDropzone.tsx`,
  `src/components/SplitOptions.tsx`, `src/components/ResultList.tsx`.

### 검증
- `npm install` 후 Vite 개발 서버(포트 5173)를 미리보기로 실행.
- 초기 화면(업로드 전), PDF 업로드 후 분할 옵션 화면, 분할 실행 후 결과
  리스트·ZIP 다운로드 버튼·경고 배너까지 스크린샷으로 확인. 기본 분할 기준
  ("용량 기준")이 정상적으로 활성화되고 각 옵션 전환·입력 필드가 정상 동작함을
  확인.
- 기능 로직(`pdfSplitter.ts`, `download.ts` 등)은 변경하지 않았으며 클래스명
  (스타일)만 교체함.

---

## 2026-07-06 — 헤더 정리 및 파비콘/썸네일 추가

### 요청 사항
1. 앱 타이틀 하단의 부제 설명 제거
2. 앱 아이콘을 감싸던 박스(테두리) 제거
3. 파비콘 및 웹사이트 썸네일(og:image) 적용

### 변경 내용
- **`src/App.tsx`**: 헤더에서 부제(`<p>PDF를 용량 또는...</p>`)를 제거하고,
  아이콘을 감싸던 `border` 박스 `<div>`를 없애고 `Scissors` 아이콘을 타이틀
  옆에 바로 배치(아이콘 크기 22→32로 확대해 균형 조정).
- **파비콘**: `public/favicon.svg`(24x24, 검정 배경 + 흰색 가위 모노크롬
  아이콘) 신규 생성. 구형 브라우저 호환을 위해 `public/favicon-512.png`
  (동일 디자인 래스터화)도 함께 생성하고 `apple-touch-icon`으로도 연결.
- **썸네일(og:image)**: `public/og-image.png`(1200x630, 검정 배경 + 가위
  아이콘 + "PDF FILE SPLITTER" 타이틀 + 부제 + 하단 헤어라인)를 생성.
  SVG를 스크래치패드에서 `@resvg/resvg-js`(임시 설치, 프로젝트
  `package.json`에는 미포함)로 래스터화해 제작.
- **`index.html`**: `<link rel="icon">`(svg/png), `apple-touch-icon`,
  `meta name="description"`, `og:title`/`og:description`/`og:image`,
  `twitter:card`/`twitter:image` 메타 태그 추가.

### 검증
- Vite 개발 서버 미리보기에서 헤더가 박스 없이 아이콘+타이틀만 남고 부제가
  사라진 것을 스크린샷으로 확인.
- `/favicon.svg`, `/favicon-512.png`, `/og-image.png` 세 리소스 모두
  `fetch` 상태 200으로 정상 서빙되는 것을 확인.

---

## 2026-07-06 — Vercel 신규 프로젝트 배포

### 배경
- 배포처로 GitHub Pages와 Vercel을 비교. 이 프로젝트가 서버 없는 순수
  클라이언트 사이드 Vite/React 앱이라 둘 다 가능하지만, GitHub Pages는
  `vite.config.ts`의 `base` 경로 수정과 별도 배포 워크플로우 구성이
  필요한 반면 Vercel은 저장소 연결만으로 프레임워크 자동 감지·빌드가
  되고 PR 프리뷰 배포도 제공되어 Vercel로 결정.

### 변경 내용
- Vercel CLI(`npx vercel deploy --prod --yes`)로 신규 프로젝트 생성 및
  배포. GitHub 저장소(`chs2147/pdf-file-splitter`)와 자동 연동되어 이후
  `main` 브랜치 push 시 자동 재배포됨.
- 프로젝트: `leslie-jins-projects/pdf-file-splitter`
- Production URL: https://pdf-file-splitter.vercel.app

### 검증
- `curl`로 프로덕션 URL과 `/favicon.svg` 응답 코드가 각각 200임을 확인.

---

## 작성 규칙
- 이후 모든 코드 변경, 기능 추가/수정, 버그 수정은 이 파일 하단에 날짜별로 追記한다.
- 각 항목은 `## YYYY-MM-DD — 제목` 형식으로 구분하고, 변경 배경(왜)과 변경 내용(무엇)을
  간단히 기록한다.
