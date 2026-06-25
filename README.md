# PDF File Splitter

업로드한 PDF 파일을 여러 개의 PDF로 분할하는 웹 애플리케이션입니다. 모든 처리는
브라우저 안에서 이루어지며 파일이 서버로 전송되지 않습니다.

## 분할 기준

- **용량 기준** — 각 분할 파일이 지정한 용량(기본 20MB) 이하가 되도록 페이지
  순서대로 묶습니다. 단일 페이지가 한도를 넘으면 해당 페이지만 따로 출력하고
  "용량 초과"로 표시합니다.
- **N페이지마다** — 지정한 페이지 수 단위로 분할합니다.
- **페이지 범위 지정** — `1-3, 5, 8-10` 처럼 입력한 각 범위를 하나의 PDF로
  만듭니다.
- **페이지별 분할** — 모든 페이지를 개별 PDF로 분리합니다.

분할 후 각 파일을 개별 다운로드하거나 전체를 ZIP으로 받을 수 있습니다.

## 기술 스택

React + Vite + TypeScript + Tailwind CSS, [pdf-lib](https://pdf-lib.js.org/)
(PDF 처리), [JSZip](https://stuk.github.io/jszip/) (ZIP 패키징).

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
```
