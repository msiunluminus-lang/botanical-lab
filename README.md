# 잎 표면 구조에 따른 미세먼지 흡착률 비교

정은우 · 유민수의 과학 연구 발표 웹사이트입니다. 내부 프로젝트명은 **3D Botanical Lab**입니다. 표지·목차·연구 목적·가설·표면 구조·식물 4종·실험·결과·해석·한계·후속 연구를 21개 장면으로 구성했습니다.

## 실행하기

처음 내려받는 경우 `git clone --branch work https://github.com/msiunluminus-lang/botanical-lab.git`을 실행하고 `cd botanical-lab`으로 이동하세요. 이미 저장소가 있으면 `git switch work` 후 `git pull --ff-only`로 최신 버전을 받습니다.

Node.js 20 이상이 필요합니다. 저장소 루트에서 실행하세요.

```bash
npm ci
npm run dev
```

브라우저에서 **http://localhost:8000** 을 엽니다. 실행 중에는 터미널을 열어 두고, 종료하려면 `Ctrl+C`를 누릅니다.

터미널에 표시된 포트(기본 8000)로 브라우저를 엽니다. 파일을 수정한 뒤 브라우저를 새로고침하면 개발 서버가 변경 사항을 다시 빌드합니다. 다른 포트는 `PORT=8001 npm run dev`로 지정합니다.

`index.html`은 빌드용 틀입니다. 이 파일을 직접 열거나 저장소 루트에 Python 서버를 실행하지 마세요. 정적 서버로 확인하려면 다음처럼 빌드 결과를 사용합니다.

```bash
npm run build
python3 -m http.server 8000 --directory dist
```

`dist/` 전체가 배포 파일입니다. 이 작업은 GitHub 브랜치에 코드를 저장하며 사이트나 클라우드 환경을 자동 게시하지 않습니다.

## 글과 수치를 수정하는 파일

**[src/data/presentation.js](src/data/presentation.js) 한 곳에서 편집합니다.** HTML, CSS, 3D 코드를 수정할 필요가 없습니다.

- 따옴표 안의 글을 바꾸고 쉼표와 중괄호를 유지합니다.
- 숫자는 따옴표 없이 입력합니다.
- 문장 안에 큰따옴표가 필요하면 `\"`처럼 씁니다.
- 저장한 뒤 개발 서버 페이지를 새로고침합니다.
- 정적 배포 파일은 `npm run build`로 갱신합니다.

| 수정할 내용 | 데이터 위치 |
| --- | --- |
| 공식 연구 제목 | `title` |
| 연구자 이름 | `researchers` |
| 표지 설명·시작 버튼 | `cover.introduction`, `cover.button` |
| 섹션 제목·핵심 문장 | `sections`의 `title`, `lead` |
| 본문·한계 설명 | `paragraphs`, `note` |
| 항목별 설명 | `items`의 `title`, `text` |
| 식물 이름·특징·설명 | `plants`의 `name`, `trait`, `description` |
| 앞면·뒷면 측정 면적 | `plants`의 `front`, `back` (cm²) |
| 보고서의 앞면 흡착률 | `plants`의 `rate` (%) |
| 사진 경로 | `plants.image`, `photos.*.src`, `cover.image` |
| 목차 | `navigation`의 `label`, `target` |

### 제목과 연구자

```js
title: "잎 표면 구조에 따른 미세먼지 흡착률 비교",
researchers: "정은우 · 유민수",
```

현재 공식 제목을 정확히 유지합니다. 나중에 제목을 편집하면 표지·브라우저 탭·공유 메타데이터에도 반영됩니다.

### 본문과 식물 설명

```js
{
  id: "motivation",
  type: "story",
  tone: "white",
  title: "같은 입자, 다른 잎",
  lead: "핵심 문장을 입력하세요.",
  paragraphs: [
    "첫 번째 문단입니다.",
    "두 번째 문단입니다."
  ],
  note: "함께 읽을 주의사항입니다."
}
```

식물 설명은 해당 식물의 `description`만 고치면 선택 화면에 반영됩니다. 긴 문장은 자동 줄바꿈되며, 짧은 문단 여러 개로 나누면 읽기 좋습니다.

### 실험 데이터와 그래프

```js
{
  id: "rubber",
  name: "고무나무",
  model: "rubber",
  trait: "두껍고 광택 있는 잎",
  description: "식물에 대한 설명입니다.",
  image: "",
  front: 0.802,
  back: 0.103,
  rate: 26.7,
  color: "#C9E2CB"
}
```

표와 앞·뒷면 비교 그래프는 `front`/`back`, 흡착률 그래프는 `rate`를 직접 사용합니다. 식물 이름과 그래프 순서도 자동으로 갱신됩니다. 흡착률 막대의 축은 0–100%입니다. 면적과 흡착률은 서로 환산하지 않습니다.

## 사진 교체

실제 촬영 자료는 아직 제공되지 않아 9개 안내 슬롯을 준비했습니다. 설명용 3D 모델과 일러스트는 실험 사진과 구분합니다.

1. 이미지를 `public/images/photos/`에 넣습니다.
2. 데이터 파일에서 해당 경로를 입력합니다.
3. 저장 후 개발 화면을 새로고침합니다. 배포할 때 다시 빌드합니다.

```js
// 식물 사진
image: "images/photos/rubber.jpg",

// 실험 과정 사진
chamber: {
  src: "images/photos/chamber.jpg",
  alt: "실제 제작한 챔버와 잎의 배치",
  ratio: "4:3"
},
```

경로에는 `public/`을 붙이지 않습니다. 영문 파일명과 JPG·PNG·WebP 사용을 권장합니다. 공란 `""`은 사진을 요청하지 않고 안내를 표시합니다. 잘못된 경로는 안내 화면으로 복구됩니다(브라우저에는 요청 실패가 기록될 수 있음).

| 내용 | 권장 파일명 | 권장 비율 |
| --- | --- | --- |
| 식물 4종 | rubber.jpg, pothos.jpg, peace.jpg, lambs.jpg | 4:3 |
| DIY 실험 챔버 | chamber.jpg | 4:3 |
| 활성탄 분산 | dispersion.jpg | 4:3 |
| 자연 침강 | settling.jpg | 4:3 |
| 테이프 전사 | transfer.jpg | 4:3 |
| Python·OpenCV 화면 | analysis.jpg | 16:10 |

표지는 기본적으로 실제 3D 정원입니다. `cover.image`에 경로를 입력하면 지정한 이미지로 교체할 수 있습니다. 원본 1단계 그래픽은 `assets/images/hero-plant.png`에 보존했지만 새 배포본에서는 사용하지 않습니다. 재사용하려면 `public/images/`로 복사하고 경로를 지정하세요.

## 새로운 섹션 추가하기

`sections` 배열의 원하는 위치에 다음 객체를 추가합니다. 고유한 영문 소문자 `id`를 사용하세요.

```js
{
  id: "additional-observation",
  type: "story",
  tone: "mint",
  visual: "contact",
  title: "추가 관찰",
  lead: "이 섹션의 핵심 내용",
  paragraphs: ["관찰 내용을 입력하세요."],
  note: "필요한 설명을 입력하세요."
},
```

섹션 개수, 이전/다음 이동, 진행 표시가 자동으로 늘어납니다. 목차에도 넣으려면 `navigation`에 `{ label: "추가 관찰", target: "additional-observation" }`를 추가합니다.

- 배경 `tone`: `white`, `cream`, `mint`, `pink`, `blue`, `lavender`
- 일반 설명 `type: "story"`; 항목형은 `type: "conclusion"`과 `items` 사용
- 실험은 `type: "experiment"`, `visual`, `photo`를 지정
- 일러스트 `visual`: `contact`, `chamber`, `dispersion`, `settling`, `tape`, `analysis`
- 새 식물 종의 입체 형상을 만들려면 3D 코드 수정이 필요합니다. 기존 `model` 값은 `rubber`, `pothos`, `peace`, `lambs`입니다.

## 3D 모델과 발표 조작

표지는 네 식물을 중앙에 크게 배치한 전시형 구성입니다. 잎은 앞·뒷면과 테두리가 연결된 입체 형상이며, 고무나무 잎에는 더 두꺼운 단면을 사용합니다. 목적·결론·한계·후속 연구의 설명 그림은 데이터 파일의 `itemIcons`에서 바꿉니다(`leaf`, `compare`, `measure`, `particles`, `repeat`, `tape`).

Three.js 0.180.0만 런타임 의존성으로 사용합니다. 라이브러리를 배포 파일에 포함하므로 CDN이나 외부 폰트가 필요 없습니다.

- 고무나무: 두꺼운 타원형 잎, 뾰족한 끝, 광택·주맥
- 스킨답서스: 잎 밑부분이 오목한 하트형 잎, 연결된 잎자루·덩굴
- 스파티필름: 길고 휘어진 잎, 주맥·측맥, 밑에서 올라오는 잎
- 램스이어: 길쭉한 잎과 인스턴싱으로 배치한 가는 입체 잔털
- 표면 모형: 매끄러운 면·왁스층·잔털 선택, 드래그 회전, 확대/축소

한 개의 WebGL 렌더러를 공유해 화면에 보이는 모형만 그립니다. 모바일은 픽셀 비율과 털 개수를 줄이고 자동 움직임을 중지합니다. 숨겨진 탭에서도 렌더링을 중지하며 OS의 동작 줄이기 설정을 존중합니다. WebGL이 없으면 벡터 그림으로 설명을 유지합니다.

목차, 하단 이전/다음 버튼, 방향키, 전체 화면 버튼을 사용할 수 있습니다. 입력란·버튼·사진 안내·3D 모형 조작 중에는 발표 방향키가 개입하지 않습니다. 3D 캔버스에 초점을 두면 방향키는 모형을 회전하고 `+`/`-`는 확대·축소합니다.

## 구조

```text
src/data/presentation.js  # 사용자가 편집하는 모든 연구 내용·수치·이미지 경로
src/render.js             # 데이터 → HTML, 검증
src/visuals.js            # 설명용 벡터 일러스트와 3D 대체 그림
src/models.js             # 네 식물과 세 표면의 실제 입체 형상
scripts/main.js           # 발표 제어·선택·사진 오류 복구
scripts/build.mjs         # 정적 HTML과 로컬 3D 라이브러리 빌드
scripts/dev.mjs           # 저장 후 새로고침하면 다시 빌드하는 개발 서버
scripts/check.mjs         # JS 문법 검사
styles/main.css           # 파스텔 디자인과 반응형 레이아웃
public/images/            # 새 이미지와 실제 촬영 자료
tests/presentation.cjs     # 실제 Chromium 회귀 테스트
index.html                # 빌드용 HTML 틀
dist/                     # 생성되는 배포 파일 (직접 편집하지 않음)
```

빌드는 데이터에서 본문·표·그래프·벡터 그림을 HTML로 미리 만듭니다. JavaScript를 사용할 수 없어도 본문, 기본 목차 링크, 식물 설명과 연구 데이터를 읽을 수 있습니다. 빌드 결과에는 독립 SVG 자료도 `dist/images/models/`에 포함됩니다.

## 검사와 테스트

```bash
npm run check
npm run build
npm test
```

브라우저 테스트에는 Playwright와 Chromium이 필요합니다. 현재 클라우드 환경에는 준비되어 있습니다. 별도 환경에서는 아래 명령으로 테스트 도구를 추가할 수 있습니다(사이트 빌드에는 필요 없음).

```bash
npm install --no-save --package-lock=false playwright@1.62.1
npx playwright install chromium
```

시스템 `/usr/bin/chromium`을 자동 감지하며 다른 경로는 `CHROMIUM_PATH=/path/to/chromium npm test`로 지정합니다. 테스트는 임시 서버를 시작·종료합니다. 데이터 편집 테스트는 별도 임시 복사본에서 수행해 원자료를 바꾸지 않습니다. 스크린샷은 `test-results/`에 저장하며 Git에는 포함하지 않습니다.

## 해석의 범위

원자료(cm²)와 보고서 흡착률(%)을 별도 지표로 유지합니다. 측정 영역 크기, 흡착률 계산식, 이미지 보정값·임계값, 반복 실험 자료는 제공되지 않았습니다. 임의 환산이나 새로운 측정값을 추가하지 않았습니다. 램스이어의 털 사이 입자가 테이프로 옮겨지지 않을 가능성을 유지합니다. 활성탄 실험만으로 실제 미세먼지 제거·공기 정화 성능을 단정하지 않습니다.
